import { Router, Request, Response } from 'express';
import multer from 'multer';
import {
  Project,
  ProjectImage,
  GalleryAlbum,
  MediaAsset,
} from '../models';
import {
  AuthenticatedRequest,
  requireAuth,
  requirePermission,
} from '../middleware/auth';
import { sanitizeSlug } from '../validators/schemas';
import { uploadMediaBuffer, deleteCloudinaryAsset } from '../config/cloudinary';
import { logActivity } from '../services/activityService';

export const projectsRouter = Router();
export const galleryRouter = Router();
export const mediaRouter = Router();

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max for high-res photos & short videos
    files: 60, // Support uploading 5, 20, 50+ images in bulk
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: JPG, PNG, WebP, AVIF, MP4, WebM.`));
    }
  },
});

// ============================================================================
// PROJECTS PORTFOLIO MODULE
// ============================================================================

projectsRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const isAdmin = req.query.admin === 'true';
  const filter: Record<string, any> = { isDeleted: false };
  if (!isAdmin) {
    filter.status = 'published';
  }

  if (req.query.category && req.query.category !== 'All') {
    filter.category = req.query.category;
  }
  if (req.query.projectType && req.query.projectType !== 'All') {
    filter.projectType = req.query.projectType;
  }
  if (req.query.location && req.query.location !== 'All') {
    filter.location = { $regex: String(req.query.location), $options: 'i' };
  }
  if (req.query.featured === 'true') {
    filter.isFeatured = true;
  }
  if (req.query.search) {
    const q = String(req.query.search);
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { location: { $regex: q, $options: 'i' } },
      { category: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
  }

  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '24'), 10)));
  const skip = (page - 1) * limit;

  const [projects, total, distinctLocations] = await Promise.all([
    Project.find(filter)
      .sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Project.countDocuments(filter),
    Project.distinct('location', { isDeleted: false, status: 'published' }),
  ]);

  res.json({
    success: true,
    data: {
      projects,
      locations: distinctLocations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

projectsRouter.get('/:slug', async (req: Request, res: Response): Promise<void> => {
  const isPreview = req.query.preview === 'true';
  const filter: Record<string, any> = {
    slug: String(req.params.slug).toLowerCase(),
    isDeleted: false,
  };
  if (!isPreview) {
    filter.status = 'published';
  }

  const project = await Project.findOne(filter);
  if (!project) {
    res.status(404).json({ success: false, message: 'Project not found' });
    return;
  }

  const relatedProjects = await Project.find({
    _id: { $ne: project._id },
    status: 'published',
    isDeleted: false,
    $or: [{ category: project.category }, { projectType: project.projectType }],
  })
    .sort({ isFeatured: -1, displayOrder: 1 })
    .limit(3);

  res.json({
    success: true,
    data: {
      project,
      relatedProjects,
    },
  });
});

projectsRouter.post(
  '/',
  requireAuth,
  requirePermission('projects:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const slug = sanitizeSlug(req.body.slug || req.body.title);
      const count = await Project.countDocuments({ isDeleted: false });
      const project = await Project.create({
        ...req.body,
        slug,
        displayOrder: req.body.displayOrder ?? count + 1,
        seo: {
          metaTitle:
            req.body.seo?.metaTitle ||
            `${req.body.title} – ${req.body.category} Interior Design | Vision Tech Solutions`,
          metaDescription:
            req.body.seo?.metaDescription || req.body.shortSummary || req.body.description?.slice(0, 155) || '',
          slug,
          ...req.body.seo,
        },
        createdBy: req.user!.id as any,
      });

      if (Array.isArray(project.images) && project.images.length > 0) {
        await Promise.all(
          project.images.map((img, idx) =>
            ProjectImage.create({
              project: project._id,
              url: img.url,
              thumbnailUrl: img.thumbnailUrl || img.url,
              caption: img.caption || '',
              altText: img.altText || project.title,
              order: img.order ?? idx + 1,
            })
          )
        );
      }

      await logActivity({
        req,
        action: 'Created project',
        module: 'Project Management',
        entityId: String(project._id),
        entityTitle: project.title,
      });

      res.status(201).json({ success: true, data: project });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

projectsRouter.put(
  '/:id',
  requireAuth,
  requirePermission('projects:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const project = await Project.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            ...req.body,
            updatedBy: req.user!.id,
          },
        },
        { new: true }
      );
      if (!project) {
        res.status(404).json({ success: false, message: 'Project not found' });
        return;
      }

      await logActivity({
        req,
        action: 'Updated project',
        module: 'Project Management',
        entityId: String(project._id),
        entityTitle: project.title,
      });

      res.json({ success: true, data: project });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

projectsRouter.delete(
  '/:id',
  requireAuth,
  requirePermission('projects:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    project.isDeleted = true;
    await project.save();

    await logActivity({
      req,
      action: 'Deleted project',
      module: 'Project Management',
      entityId: String(project._id),
      entityTitle: project.title,
    });

    res.json({ success: true, message: 'Project deleted successfully' });
  }
);

// ============================================================================
// GALLERY MANAGEMENT MODULE
// ============================================================================

galleryRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const isAdmin = req.query.admin === 'true';
  const filter: Record<string, any> = { isDeleted: false };
  if (!isAdmin) {
    filter.status = 'published';
  }
  if (req.query.category && req.query.category !== 'All') {
    filter.category = req.query.category;
  }

  const albums = await GalleryAlbum.find(filter)
    .populate('associatedProject', 'title slug category location')
    .sort({ displayOrder: 1, createdAt: -1 });

  // Also flatten items for masonry gallery view with optional category filter
  const flatItems: any[] = [];
  for (const album of albums) {
    for (const item of album.items || []) {
      if (
        !req.query.category ||
        req.query.category === 'All' ||
        item.category === req.query.category ||
        album.category === req.query.category
      ) {
        flatItems.push({
          ...(typeof (item as any).toObject === 'function' ? (item as any).toObject() : item),
          albumTitle: album.title,
          albumSlug: album.slug,
          albumId: album._id,
          associatedProject: album.associatedProject,
        });
      }
    }
  }

  res.json({
    success: true,
    data: {
      albums,
      items: flatItems,
    },
  });
});

galleryRouter.post(
  '/',
  requireAuth,
  requirePermission('gallery:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const slug = sanitizeSlug(req.body.slug || req.body.title);
      const count = await GalleryAlbum.countDocuments({ isDeleted: false });
      const album = await GalleryAlbum.create({
        ...req.body,
        slug,
        displayOrder: req.body.displayOrder ?? count + 1,
        createdBy: req.user!.id as any,
      });

      await logActivity({
        req,
        action: 'Created gallery album',
        module: 'Gallery Management',
        entityId: String(album._id),
        entityTitle: album.title,
      });

      res.status(201).json({ success: true, data: album });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

galleryRouter.put(
  '/:id',
  requireAuth,
  requirePermission('gallery:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const album = await GalleryAlbum.findByIdAndUpdate(
      req.params.id,
      { $set: { ...req.body, updatedBy: req.user!.id } },
      { new: true }
    );
    if (!album) {
      res.status(404).json({ success: false, message: 'Gallery album not found' });
      return;
    }

    await logActivity({
      req,
      action: 'Updated gallery album',
      module: 'Gallery Management',
      entityId: String(album._id),
      entityTitle: album.title,
    });

    res.json({ success: true, data: album });
  }
);

galleryRouter.delete(
  '/:id',
  requireAuth,
  requirePermission('gallery:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const album = await GalleryAlbum.findById(req.params.id);
    if (!album) {
      res.status(404).json({ success: false, message: 'Gallery album not found' });
      return;
    }
    album.isDeleted = true;
    await album.save();

    await logActivity({
      req,
      action: 'Deleted gallery album',
      module: 'Gallery Management',
      entityTitle: album.title,
    });

    res.json({ success: true, message: 'Gallery album deleted' });
  }
);

// ============================================================================
// MEDIA ASSET LIBRARY & BULK UPLOAD MODULE (Cloudinary + Local CDN)
// ============================================================================

mediaRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const filter: Record<string, any> = { isDeleted: false };
  if (req.query.category && req.query.category !== 'All') {
    filter.category = req.query.category;
  }
  if (req.query.resourceType) {
    filter.resourceType = req.query.resourceType;
  }
  if (req.query.search) {
    const q = String(req.query.search);
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { caption: { $regex: q, $options: 'i' } },
      { altText: { $regex: q, $options: 'i' } },
      { category: { $regex: q, $options: 'i' } },
    ];
  }

  const assets = await MediaAsset.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json({ success: true, data: assets });
});

// POST /api/media/upload - Bulk or single file upload to Cloudinary / CDN
mediaRouter.post(
  '/upload',
  requireAuth,
  requirePermission('media:write', 'gallery:write', 'projects:write', 'pages:write'),
  upload.array('files', 60),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Please select at least one image or video file to upload.',
        });
        return;
      }

      const category = req.body.category || 'Interior Portfolio';
      const createdAssets = [];

      for (const file of files) {
        const uploaded = await uploadMediaBuffer(
          file.buffer,
          file.originalname,
          file.mimetype
        );

        const cleanTitle = file.originalname
          .replace(/\.[^.]+$/, '')
          .replace(/[-_]/g, ' ');

        const asset = await MediaAsset.create({
          title: req.body.title || cleanTitle,
          caption: req.body.caption || cleanTitle,
          altText: req.body.altText || `${cleanTitle} – Vision Tech Solutions`,
          category,
          publicId: uploaded.publicId,
          url: uploaded.url,
          secureUrl: uploaded.secureUrl,
          thumbnailUrl: uploaded.thumbnailUrl,
          responsiveUrls: uploaded.responsiveUrls,
          resourceType: uploaded.resourceType,
          format: uploaded.format,
          bytes: uploaded.bytes,
          width: uploaded.width,
          height: uploaded.height,
          tags: [category.toLowerCase()],
          createdBy: req.user!.id as any,
        });

        createdAssets.push(asset);
      }

      await logActivity({
        req,
        action: `Uploaded ${createdAssets.length} media file(s)`,
        module: 'Media Library',
        details: createdAssets.map((a) => a.title).join(', '),
      });

      res.status(201).json({
        success: true,
        message: `Successfully uploaded ${createdAssets.length} asset(s).`,
        data: createdAssets,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Media upload failed',
      });
    }
  }
);

// POST /api/media/register-url - Register an external/reused URL in the Media Library without duplicating storage
mediaRouter.post(
  '/register-url',
  requireAuth,
  requirePermission('media:write', 'gallery:write', 'projects:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { title, caption, altText, category, url, resourceType } = req.body;
    if (!url) {
      res.status(400).json({ success: false, message: 'Media URL is required' });
      return;
    }

    // Check if URL already exists in MediaAsset to prevent unnecessary duplication
    let existing = await MediaAsset.findOne({ secureUrl: url, isDeleted: false });
    if (existing) {
      res.json({
        success: true,
        message: 'Reused existing media asset from library without duplicating storage.',
        data: existing,
      });
      return;
    }

    const asset = await MediaAsset.create({
      title: title || 'Architectural Photography',
      caption: caption || '',
      altText: altText || title || 'Vision Tech Solutions Interior Design',
      category: category || 'Interior Portfolio',
      publicId: `external/${Date.now()}`,
      url,
      secureUrl: url,
      thumbnailUrl: url,
      responsiveUrls: { sm: url, md: url, lg: url, xl: url },
      resourceType: resourceType || 'image',
      format: 'jpg',
      bytes: 0,
      createdBy: req.user!.id as any,
    });

    res.status(201).json({ success: true, data: asset });
  }
);

mediaRouter.put(
  '/:id',
  requireAuth,
  requirePermission('media:write', 'gallery:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const asset = await MediaAsset.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title: req.body.title,
          caption: req.body.caption,
          altText: req.body.altText,
          category: req.body.category,
          updatedBy: req.user!.id,
        },
      },
      { new: true }
    );
    if (!asset) {
      res.status(404).json({ success: false, message: 'Media asset not found' });
      return;
    }
    res.json({ success: true, data: asset });
  }
);

mediaRouter.delete(
  '/:id',
  requireAuth,
  requirePermission('media:write', 'gallery:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const asset = await MediaAsset.findById(req.params.id);
    if (!asset) {
      res.status(404).json({ success: false, message: 'Media asset not found' });
      return;
    }
    asset.isDeleted = true;
    await asset.save();
    await deleteCloudinaryAsset(asset.publicId, asset.resourceType);

    await logActivity({
      req,
      action: 'Deleted media asset',
      module: 'Media Library',
      entityTitle: asset.title,
    });

    res.json({ success: true, message: 'Media asset deleted' });
  }
);
