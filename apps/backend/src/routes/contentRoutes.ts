import { Router, Request, Response } from 'express';
import {
  Page,
  PageSection,
  Service,
  Testimonial,
  BlogPost,
  BlogCategory,
  Faq,
  NavigationMenu,
  WebsiteSettings,
} from '../models';
import {
  AuthenticatedRequest,
  requireAuth,
  requirePermission,
} from '../middleware/auth';
import { sanitizeSlug } from '../validators/schemas';
import { logActivity } from '../services/activityService';

export const pagesRouter = Router();
export const servicesRouter = Router();
export const testimonialsRouter = Router();
export const blogRouter = Router();
export const faqsRouter = Router();
export const navigationRouter = Router();
export const settingsRouter = Router();

// ============================================================================
// PAGES & PAGE SECTIONS (CMS Page Builder)
// ============================================================================

// GET /api/pages - Public or Admin list of pages
pagesRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const isAdmin = req.query.admin === 'true';
  const locale = (req.query.locale as string) || 'en';
  const filter: Record<string, any> = { isDeleted: false };
  if (!isAdmin) {
    filter.status = 'published';
  }
  if (req.query.locale) {
    filter.locale = locale;
  }

  const pages = await Page.find(filter).sort({ createdAt: 1 });
  res.json({ success: true, data: pages });
});

// GET /api/pages/:slug - Get single page with its ordered sections
pagesRouter.get('/:slug', async (req: Request, res: Response): Promise<void> => {
  const isPreview = req.query.preview === 'true';
  const slug = String(req.params.slug).toLowerCase();

  const pageFilter: Record<string, any> = { slug, isDeleted: false };
  if (!isPreview) {
    pageFilter.status = 'published';
  }

  const page = await Page.findOne(pageFilter);
  if (!page) {
    res.status(404).json({ success: false, message: 'Page not found' });
    return;
  }

  const sectionFilter: Record<string, any> = { pageSlug: slug };
  if (!isPreview) {
    sectionFilter.isEnabled = true;
  }

  const sections = await PageSection.find(sectionFilter).sort({ order: 1 });

  res.json({
    success: true,
    data: {
      page,
      sections,
    },
  });
});

// POST /api/pages - Create a new dynamic page
pagesRouter.post(
  '/',
  requireAuth,
  requirePermission('pages:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const {
        title,
        slug: rawSlug,
        description,
        bannerImage,
        bannerSubtitle,
        status,
        scheduledPublishAt,
        locale,
        seo,
        sections,
      } = req.body;

      if (!title) {
        res.status(400).json({ success: false, message: 'Page title is required' });
        return;
      }

      const slug = sanitizeSlug(rawSlug || title);
      const existing = await Page.findOne({ slug, isDeleted: false });
      if (existing) {
        res.status(409).json({ success: false, message: 'A page with this slug already exists' });
        return;
      }

      const page = await Page.create({
        title,
        slug,
        description: description || '',
        bannerImage: bannerImage || '',
        bannerSubtitle: bannerSubtitle || '',
        status: status || 'published',
        scheduledPublishAt: scheduledPublishAt || undefined,
        publishedAt: status === 'published' ? new Date() : undefined,
        locale: locale || 'en',
        seo: {
          metaTitle: seo?.metaTitle || `${title} | Vision Tech Solutions`,
          metaDescription: seo?.metaDescription || description || '',
          slug,
          ...seo,
        },
        isSystemPage: false,
        createdBy: req.user!.id as any,
      });

      if (Array.isArray(sections) && sections.length > 0) {
        const createdSections = await Promise.all(
          sections.map((sec: any, idx: number) =>
            PageSection.create({
              pageSlug: slug,
              sectionKey: sec.sectionKey || `${slug}-sec-${idx + 1}`,
              blockType: sec.blockType || 'text',
              title: sec.title || 'Section Title',
              eyebrow: sec.eyebrow || '',
              subtitle: sec.subtitle || '',
              content: sec.content || '',
              mediaUrl: sec.mediaUrl || '',
              videoUrl: sec.videoUrl || '',
              ctaPrimaryText: sec.ctaPrimaryText || '',
              ctaPrimaryLink: sec.ctaPrimaryLink || '',
              order: sec.order ?? idx + 1,
              isEnabled: sec.isEnabled !== false,
              data: sec.data || {},
            })
          )
        );
        page.sections = createdSections.map((s) => s._id as any);
        await page.save();
      }

      await logActivity({
        req,
        action: 'Created page',
        module: 'Page Management',
        entityId: String(page._id),
        entityTitle: page.title,
      });

      res.status(201).json({ success: true, data: page });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// PUT /api/pages/:id - Update page metadata, status, SEO
pagesRouter.put(
  '/:id',
  requireAuth,
  requirePermission('pages:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const page = await Page.findById(req.params.id);
      if (!page || page.isDeleted) {
        res.status(404).json({ success: false, message: 'Page not found' });
        return;
      }

      const {
        title,
        description,
        bannerImage,
        bannerSubtitle,
        status,
        scheduledPublishAt,
        seo,
        translations,
      } = req.body;

      if (title !== undefined) page.title = title;
      if (description !== undefined) page.description = description;
      if (bannerImage !== undefined) page.bannerImage = bannerImage;
      if (bannerSubtitle !== undefined) page.bannerSubtitle = bannerSubtitle;
      if (status !== undefined) {
        page.status = status;
        if (status === 'published') page.publishedAt = new Date();
      }
      if (scheduledPublishAt !== undefined) page.scheduledPublishAt = scheduledPublishAt;
      if (seo !== undefined) page.seo = { ...page.seo, ...seo };
      if (translations !== undefined) page.translations = translations;
      page.updatedBy = req.user!.id as any;

      await page.save();

      await logActivity({
        req,
        action: `Updated page (${page.status})`,
        module: 'Page Management',
        entityId: String(page._id),
        entityTitle: page.title,
      });

      res.json({ success: true, data: page });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// DELETE /api/pages/:id
pagesRouter.delete(
  '/:id',
  requireAuth,
  requirePermission('pages:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const page = await Page.findById(req.params.id);
    if (!page) {
      res.status(404).json({ success: false, message: 'Page not found' });
      return;
    }
    if (page.slug === 'home') {
      res.status(400).json({ success: false, message: 'The primary Home page cannot be deleted.' });
      return;
    }

    page.isDeleted = true;
    await page.save();

    await logActivity({
      req,
      action: 'Deleted page',
      module: 'Page Management',
      entityId: String(page._id),
      entityTitle: page.title,
    });

    res.json({ success: true, message: 'Page deleted successfully' });
  }
);

// POST /api/pages/:slug/sections - Add a section block to a page
pagesRouter.post(
  '/:slug/sections',
  requireAuth,
  requirePermission('pages:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const slug = String(req.params.slug).toLowerCase();
    const count = await PageSection.countDocuments({ pageSlug: slug });
    const section = await PageSection.create({
      pageSlug: slug,
      sectionKey: req.body.sectionKey || `${slug}-block-${Date.now()}`,
      blockType: req.body.blockType || 'text',
      title: req.body.title || 'New Content Section',
      eyebrow: req.body.eyebrow || '',
      subtitle: req.body.subtitle || '',
      content: req.body.content || '',
      mediaUrl: req.body.mediaUrl || '',
      videoUrl: req.body.videoUrl || '',
      ctaPrimaryText: req.body.ctaPrimaryText || '',
      ctaPrimaryLink: req.body.ctaPrimaryLink || '',
      ctaSecondaryText: req.body.ctaSecondaryText || '',
      ctaSecondaryLink: req.body.ctaSecondaryLink || '',
      order: req.body.order ?? count + 1,
      isEnabled: req.body.isEnabled !== false,
      data: req.body.data || {},
      updatedBy: req.user!.id as any,
    });

    await logActivity({
      req,
      action: 'Added page section block',
      module: 'Page Management',
      entityId: String(section._id),
      entityTitle: `${slug}: ${section.title}`,
    });

    res.status(201).json({ success: true, data: section });
  }
);

// PUT /api/pages/sections/:sectionId - Update individual page section
pagesRouter.put(
  '/sections/:sectionId',
  requireAuth,
  requirePermission('pages:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const section = await PageSection.findByIdAndUpdate(
      req.params.sectionId,
      {
        $set: {
          ...req.body,
          updatedBy: req.user!.id,
        },
      },
      { new: true }
    );

    if (!section) {
      res.status(404).json({ success: false, message: 'Section not found' });
      return;
    }

    await logActivity({
      req,
      action: 'Updated page section',
      module: 'Page Management',
      entityId: String(section._id),
      entityTitle: `${section.pageSlug}: ${section.title}`,
    });

    res.json({ success: true, data: section });
  }
);

// PUT /api/pages/:slug/reorder-sections - Reorder and toggle sections
pagesRouter.put(
  '/:slug/reorder-sections',
  requireAuth,
  requirePermission('pages:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { orderedIds } = req.body; // Array of { id, order, isEnabled }
    if (!Array.isArray(orderedIds)) {
      res.status(400).json({ success: false, message: 'orderedIds array is required' });
      return;
    }

    await Promise.all(
      orderedIds.map((item: { id: string; order: number; isEnabled?: boolean }, idx: number) =>
        PageSection.findByIdAndUpdate(item.id, {
          $set: {
            order: item.order ?? idx + 1,
            ...(typeof item.isEnabled === 'boolean' ? { isEnabled: item.isEnabled } : {}),
          },
        })
      )
    );

    const updated = await PageSection.find({ pageSlug: String(req.params.slug).toLowerCase() }).sort({
      order: 1,
    });

    await logActivity({
      req,
      action: 'Reordered page sections',
      module: 'Page Management',
      entityTitle: String(req.params.slug),
    });

    res.json({ success: true, data: updated });
  }
);

// DELETE /api/pages/sections/:sectionId
pagesRouter.delete(
  '/sections/:sectionId',
  requireAuth,
  requirePermission('pages:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const section = await PageSection.findByIdAndDelete(req.params.sectionId);
    if (!section) {
      res.status(404).json({ success: false, message: 'Section not found' });
      return;
    }

    await logActivity({
      req,
      action: 'Deleted page section',
      module: 'Page Management',
      entityTitle: section.title,
    });

    res.json({ success: true, message: 'Section deleted' });
  }
);

// ============================================================================
// SERVICES MANAGEMENT
// ============================================================================

servicesRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const isAdmin = req.query.admin === 'true';
  const filter: Record<string, any> = { isDeleted: false };
  if (!isAdmin) {
    filter.status = 'published';
  }
  if (req.query.categoryType) {
    filter.categoryType = req.query.categoryType;
  }

  const services = await Service.find(filter)
    .populate('relatedProjects', 'title slug category location coverImage')
    .sort({ displayOrder: 1, createdAt: 1 });

  res.json({ success: true, data: services });
});

servicesRouter.get('/:slug', async (req: Request, res: Response): Promise<void> => {
  const isPreview = req.query.preview === 'true';
  const filter: Record<string, any> = {
    slug: String(req.params.slug).toLowerCase(),
    isDeleted: false,
  };
  if (!isPreview) {
    filter.status = 'published';
  }

  const service = await Service.findOne(filter).populate(
    'relatedProjects',
    'title slug category projectType location coverImage completionDate shortSummary'
  );

  if (!service) {
    res.status(404).json({ success: false, message: 'Service not found' });
    return;
  }

  res.json({ success: true, data: service });
});

servicesRouter.post(
  '/',
  requireAuth,
  requirePermission('services:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const slug = sanitizeSlug(req.body.slug || req.body.title);
      const count = await Service.countDocuments({ isDeleted: false });
      const service = await Service.create({
        ...req.body,
        slug,
        displayOrder: req.body.displayOrder ?? count + 1,
        seo: {
          metaTitle: req.body.seo?.metaTitle || `${req.body.title} | Vision Tech Solutions`,
          metaDescription: req.body.seo?.metaDescription || req.body.shortDescription || '',
          slug,
          ...req.body.seo,
        },
        createdBy: req.user!.id as any,
      });

      await logActivity({
        req,
        action: 'Created service',
        module: 'Services Management',
        entityId: String(service._id),
        entityTitle: service.title,
      });

      res.status(201).json({ success: true, data: service });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

servicesRouter.put(
  '/:id',
  requireAuth,
  requirePermission('services:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const service = await Service.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            ...req.body,
            updatedBy: req.user!.id,
          },
        },
        { new: true }
      );
      if (!service) {
        res.status(404).json({ success: false, message: 'Service not found' });
        return;
      }

      await logActivity({
        req,
        action: 'Updated service',
        module: 'Services Management',
        entityId: String(service._id),
        entityTitle: service.title,
      });

      res.json({ success: true, data: service });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

servicesRouter.delete(
  '/:id',
  requireAuth,
  requirePermission('services:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const service = await Service.findById(req.params.id);
    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }
    service.isDeleted = true;
    await service.save();

    await logActivity({
      req,
      action: 'Deleted service',
      module: 'Services Management',
      entityId: String(service._id),
      entityTitle: service.title,
    });

    res.json({ success: true, message: 'Service deleted successfully' });
  }
);

// ============================================================================
// TESTIMONIALS MANAGEMENT
// ============================================================================

testimonialsRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const isAdmin = req.query.admin === 'true';
  const filter: Record<string, any> = { isDeleted: false };
  if (!isAdmin) {
    filter.status = 'published';
  }
  const items = await Testimonial.find(filter).sort({ displayOrder: 1, createdAt: -1 });
  res.json({ success: true, data: items });
});

testimonialsRouter.post(
  '/',
  requireAuth,
  requirePermission('testimonials:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const count = await Testimonial.countDocuments({ isDeleted: false });
    const item = await Testimonial.create({
      ...req.body,
      displayOrder: req.body.displayOrder ?? count + 1,
      createdBy: req.user!.id as any,
    });

    await logActivity({
      req,
      action: 'Added client testimonial',
      module: 'Testimonials',
      entityId: String(item._id),
      entityTitle: item.customerName,
    });

    res.status(201).json({ success: true, data: item });
  }
);

testimonialsRouter.put(
  '/:id',
  requireAuth,
  requirePermission('testimonials:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const item = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { $set: { ...req.body, updatedBy: req.user!.id } },
      { new: true }
    );
    if (!item) {
      res.status(404).json({ success: false, message: 'Testimonial not found' });
      return;
    }

    await logActivity({
      req,
      action: 'Updated client testimonial',
      module: 'Testimonials',
      entityId: String(item._id),
      entityTitle: item.customerName,
    });

    res.json({ success: true, data: item });
  }
);

testimonialsRouter.delete(
  '/:id',
  requireAuth,
  requirePermission('testimonials:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const item = await Testimonial.findById(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Testimonial not found' });
      return;
    }
    item.isDeleted = true;
    await item.save();

    await logActivity({
      req,
      action: 'Deleted testimonial',
      module: 'Testimonials',
      entityTitle: item.customerName,
    });

    res.json({ success: true, message: 'Testimonial deleted' });
  }
);

// ============================================================================
// BLOG & INSIGHTS MANAGEMENT
// ============================================================================

blogRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const isAdmin = req.query.admin === 'true';
  const filter: Record<string, any> = { isDeleted: false };
  if (!isAdmin) {
    filter.status = 'published';
  }
  if (req.query.category && req.query.category !== 'All') {
    filter.category = req.query.category;
  }
  if (req.query.tag) {
    filter.tags = req.query.tag;
  }
  if (req.query.search) {
    const q = String(req.query.search);
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { excerpt: { $regex: q, $options: 'i' } },
      { category: { $regex: q, $options: 'i' } },
    ];
  }

  const [posts, categories] = await Promise.all([
    BlogPost.find(filter).sort({ publishedAt: -1, createdAt: -1 }),
    BlogCategory.find().sort({ name: 1 }),
  ]);

  res.json({ success: true, data: { posts, categories } });
});

blogRouter.get('/:slug', async (req: Request, res: Response): Promise<void> => {
  const isPreview = req.query.preview === 'true';
  const filter: Record<string, any> = {
    slug: String(req.params.slug).toLowerCase(),
    isDeleted: false,
  };
  if (!isPreview) {
    filter.status = 'published';
  }

  const post = await BlogPost.findOne(filter).populate(
    'relatedPosts',
    'title slug excerpt featuredImage category publishedAt readTimeMinutes'
  );

  if (!post) {
    res.status(404).json({ success: false, message: 'Blog article not found' });
    return;
  }

  const related = await BlogPost.find({
    _id: { $ne: post._id },
    status: 'published',
    isDeleted: false,
  })
    .limit(3)
    .select('title slug excerpt featuredImage category publishedAt readTimeMinutes');

  res.json({
    success: true,
    data: {
      post,
      relatedPosts: post.relatedPosts?.length ? post.relatedPosts : related,
    },
  });
});

blogRouter.post(
  '/',
  requireAuth,
  requirePermission('blog:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const slug = sanitizeSlug(req.body.slug || req.body.title);
      const post = await BlogPost.create({
        ...req.body,
        slug,
        publishedAt: req.body.status === 'published' ? new Date() : undefined,
        seo: {
          metaTitle: req.body.seo?.metaTitle || `${req.body.title} | Vision Tech Solutions Journal`,
          metaDescription: req.body.seo?.metaDescription || req.body.excerpt || '',
          slug,
          ...req.body.seo,
        },
        createdBy: req.user!.id as any,
      });

      await logActivity({
        req,
        action: 'Published blog article',
        module: 'Blog Management',
        entityId: String(post._id),
        entityTitle: post.title,
      });

      res.status(201).json({ success: true, data: post });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

blogRouter.put(
  '/:id',
  requireAuth,
  requirePermission('blog:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { $set: { ...req.body, updatedBy: req.user!.id } },
      { new: true }
    );
    if (!post) {
      res.status(404).json({ success: false, message: 'Blog article not found' });
      return;
    }

    await logActivity({
      req,
      action: 'Updated blog article',
      module: 'Blog Management',
      entityId: String(post._id),
      entityTitle: post.title,
    });

    res.json({ success: true, data: post });
  }
);

blogRouter.delete(
  '/:id',
  requireAuth,
  requirePermission('blog:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }
    post.isDeleted = true;
    await post.save();

    await logActivity({
      req,
      action: 'Deleted blog article',
      module: 'Blog Management',
      entityTitle: post.title,
    });

    res.json({ success: true, message: 'Blog article deleted' });
  }
);

// ============================================================================
// FAQS, NAVIGATION MENUS & GLOBAL WEBSITE SETTINGS
// ============================================================================

faqsRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const isAdmin = req.query.admin === 'true';
  const filter: Record<string, any> = { isDeleted: false };
  if (!isAdmin) filter.status = 'published';
  if (req.query.category) filter.category = req.query.category;

  const faqs = await Faq.find(filter).sort({ displayOrder: 1, createdAt: 1 });
  res.json({ success: true, data: faqs });
});

faqsRouter.post(
  '/',
  requireAuth,
  requirePermission('pages:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const faq = await Faq.create(req.body);
    res.status(201).json({ success: true, data: faq });
  }
);

faqsRouter.put(
  '/:id',
  requireAuth,
  requirePermission('pages:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const faq = await Faq.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json({ success: true, data: faq });
  }
);

faqsRouter.delete(
  '/:id',
  requireAuth,
  requirePermission('pages:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    await Faq.findByIdAndUpdate(req.params.id, { $set: { isDeleted: true } });
    res.json({ success: true, message: 'FAQ deleted' });
  }
);

navigationRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  const menus = await NavigationMenu.find();
  res.json({ success: true, data: menus });
});

navigationRouter.put(
  '/:location',
  requireAuth,
  requirePermission('settings:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const menu = await NavigationMenu.findOneAndUpdate(
      { location: req.params.location as any },
      {
        $set: {
          title: req.body.title || req.params.location,
          items: req.body.items || [],
          updatedBy: req.user!.id,
        },
      },
      { new: true, upsert: true }
    );

    await logActivity({
      req,
      action: `Updated ${req.params.location} navigation menu`,
      module: 'Navigation',
    });

    res.json({ success: true, data: menu });
  }
);

settingsRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  let settings = await WebsiteSettings.findOne();
  if (!settings) {
    settings = await WebsiteSettings.create({});
  }
  res.json({ success: true, data: settings });
});

settingsRouter.put(
  '/',
  requireAuth,
  requirePermission('settings:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    let settings = await WebsiteSettings.findOne();
    if (!settings) {
      settings = await WebsiteSettings.create({ ...req.body, updatedBy: req.user!.id });
    } else {
      Object.assign(settings, req.body);
      settings.updatedBy = req.user!.id as any;
      await settings.save();
    }

    await logActivity({
      req,
      action: 'Updated global website settings',
      module: 'Website Settings',
    });

    res.json({ success: true, data: settings });
  }
);
