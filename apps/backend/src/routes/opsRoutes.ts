import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import {
  Enquiry,
  Project,
  Service,
  GalleryAlbum,
  MediaAsset,
  Page,
  BlogPost,
  ActivityLog,
  Testimonial,
  WebsiteSettings,
  NavigationMenu,
  PageSection,
  Faq,
} from '../models';
import {
  AuthenticatedRequest,
  requireAuth,
  requirePermission,
} from '../middleware/auth';
import { enquirySubmissionSchema } from '../validators/schemas';
import { sendEnquiryNotificationEmail } from '../services/emailService';
import { logActivity } from '../services/activityService';

export const enquiriesRouter = Router();
export const dashboardRouter = Router();

// ============================================================================
// ENQUIRY & LEAD MANAGEMENT MODULE
// ============================================================================

// POST /api/enquiries - Public consultation form submission
enquiriesRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // Honeypot spam protection check
    if (req.body.website_url_honeypot) {
      res.status(200).json({
        success: true,
        message: 'Thank you! Your consultation request has been received.',
      });
      return;
    }

    const parsed = enquirySubmissionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || 'Please check the form fields.',
        errors: parsed.error.issues,
      });
      return;
    }

    const data = parsed.data;
    const ipHash = crypto
      .createHash('sha256')
      .update(`${req.ip || '127.0.0.1'}-${data.phone}-${data.serviceInterestedIn}`)
      .digest('hex');

    // Duplicate submission prevention (within last 2 minutes for same phone + service)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const duplicate = await Enquiry.findOne({
      phone: data.phone,
      serviceInterestedIn: data.serviceInterestedIn,
      createdAt: { $gte: twoMinutesAgo },
      isDeleted: false,
    });

    if (duplicate) {
      res.status(429).json({
        success: false,
        message:
          'We have already received your consultation request moments ago. Our design team will contact you shortly.',
      });
      return;
    }

    const enquiry = await Enquiry.create({
      name: data.name,
      email: data.email || '',
      phone: data.phone,
      location: data.location || 'Bangalore',
      serviceInterestedIn: data.serviceInterestedIn,
      budgetRange: data.budgetRange || 'Consultation Request',
      projectDetails: data.projectDetails || '',
      sourcePage: data.sourcePage || 'Home Page',
      status: 'New',
      ipHash,
      internalNotes: [
        {
          note: `Enquiry received via ${data.sourcePage || 'Website Consultation Form'}.`,
          addedBy: 'System',
          addedAt: new Date(),
        },
      ],
    });

    // Send email notification asynchronously
    sendEnquiryNotificationEmail({
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone,
      location: enquiry.location,
      serviceInterestedIn: enquiry.serviceInterestedIn,
      budgetRange: enquiry.budgetRange,
      projectDetails: enquiry.projectDetails,
    }).catch(() => {});

    await logActivity({
      userName: enquiry.name,
      userRole: 'Website Visitor',
      action: 'Submitted consultation enquiry',
      module: 'Enquiries',
      entityId: String(enquiry._id),
      entityTitle: `${enquiry.name} – ${enquiry.serviceInterestedIn}`,
    });

    res.status(201).json({
      success: true,
      message:
        'Thank you! Your free design consultation request has been submitted. Our senior architect will reach out within 24 hours.',
      data: enquiry,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Unable to submit enquiry at this time.',
    });
  }
});

// GET /api/enquiries - Admin list with filters
enquiriesRouter.get(
  '/',
  requireAuth,
  requirePermission('enquiries:read'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const filter: Record<string, any> = { isDeleted: false };

    if (req.query.status && req.query.status !== 'All') {
      filter.status = req.query.status;
    }
    if (req.query.service && req.query.service !== 'All') {
      filter.serviceInterestedIn = { $regex: String(req.query.service), $options: 'i' };
    }
    if (req.query.fromDate || req.query.toDate) {
      filter.createdAt = {};
      if (req.query.fromDate) {
        filter.createdAt.$gte = new Date(String(req.query.fromDate));
      }
      if (req.query.toDate) {
        const end = new Date(String(req.query.toDate));
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
    if (req.query.search) {
      const q = String(req.query.search);
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { serviceInterestedIn: { $regex: q, $options: 'i' } },
      ];
    }

    const enquiries = await Enquiry.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: enquiries });
  }
);

// GET /api/enquiries/export/csv - Export enquiries to CSV
enquiriesRouter.get(
  '/export/csv',
  requireAuth,
  requirePermission('enquiries:read'),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    const enquiries = await Enquiry.find({ isDeleted: false }).sort({ createdAt: -1 });

    const escapeCsv = (val: any) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = [
      'Date',
      'Client Name',
      'Phone',
      'Email',
      'Location',
      'Service Interested In',
      'Budget Range',
      'Status',
      'Assigned To',
      'Project Details',
    ];

    const rows = enquiries.map((e) => [
      escapeCsv((e as any).createdAt ? new Date((e as any).createdAt).toISOString().split('T')[0] : ''),
      escapeCsv(e.name),
      escapeCsv(e.phone),
      escapeCsv(e.email),
      escapeCsv(e.location),
      escapeCsv(e.serviceInterestedIn),
      escapeCsv(e.budgetRange),
      escapeCsv(e.status),
      escapeCsv(e.assignedToName || 'Unassigned'),
      escapeCsv(e.projectDetails),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="vision-tech-enquiries-${new Date().toISOString().slice(0, 10)}.csv"`
    );
    res.send(csvContent);
  }
);

// PUT /api/enquiries/:id - Update status, assign team member, or append internal note
enquiriesRouter.put(
  '/:id',
  requireAuth,
  requirePermission('enquiries:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry || enquiry.isDeleted) {
      res.status(404).json({ success: false, message: 'Enquiry not found' });
      return;
    }

    if (req.body.status) {
      enquiry.status = req.body.status;
    }
    if (req.body.assignedToName !== undefined) {
      enquiry.assignedToName = req.body.assignedToName;
    }
    if (req.body.assignedTo !== undefined) {
      enquiry.assignedTo = req.body.assignedTo || undefined;
    }
    if (req.body.newNote && String(req.body.newNote).trim()) {
      enquiry.internalNotes.push({
        note: String(req.body.newNote).trim(),
        addedBy: req.user!.name,
        addedAt: new Date(),
      });
    }

    await enquiry.save();

    await logActivity({
      req,
      action: `Updated enquiry (${enquiry.status})`,
      module: 'Enquiries',
      entityId: String(enquiry._id),
      entityTitle: enquiry.name,
    });

    res.json({ success: true, data: enquiry });
  }
);

// DELETE /api/enquiries/:id
enquiriesRouter.delete(
  '/:id',
  requireAuth,
  requirePermission('enquiries:write'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      res.status(404).json({ success: false, message: 'Enquiry not found' });
      return;
    }
    enquiry.isDeleted = true;
    await enquiry.save();

    await logActivity({
      req,
      action: 'Deleted enquiry',
      module: 'Enquiries',
      entityTitle: enquiry.name,
    });

    res.json({ success: true, message: 'Enquiry deleted successfully' });
  }
);

// ============================================================================
// DASHBOARD, AGGREGATE BUNDLE, GLOBAL SEARCH & SEO SITEMAP
// ============================================================================

// GET /api/dashboard - Complete Admin CMS Overview Metrics
dashboardRouter.get(
  '/',
  requireAuth,
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    const [
      totalProjects,
      totalServices,
      totalMediaAssets,
      albums,
      totalEnquiries,
      newEnquiries,
      publishedPages,
      draftPages,
      totalBlogPosts,
      totalTestimonials,
      recentActivities,
      latestEnquiries,
    ] = await Promise.all([
      Project.countDocuments({ isDeleted: false }),
      Service.countDocuments({ isDeleted: false }),
      MediaAsset.countDocuments({ isDeleted: false }),
      GalleryAlbum.find({ isDeleted: false }).select('items'),
      Enquiry.countDocuments({ isDeleted: false }),
      Enquiry.countDocuments({ isDeleted: false, status: 'New' }),
      Page.countDocuments({ isDeleted: false, status: 'published' }),
      Page.countDocuments({ isDeleted: false, status: { $ne: 'published' } }),
      BlogPost.countDocuments({ isDeleted: false }),
      Testimonial.countDocuments({ isDeleted: false }),
      ActivityLog.find().sort({ createdAt: -1 }).limit(12),
      Enquiry.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(8),
    ]);

    const albumItemCount = albums.reduce((acc, a) => acc + (a.items?.length || 0), 0);
    const totalGalleryImages = Math.max(totalMediaAssets, albumItemCount);

    res.json({
      success: true,
      data: {
        stats: {
          totalProjects,
          totalServices,
          totalGalleryImages,
          totalEnquiries,
          newEnquiries,
          publishedPages,
          draftPages,
          totalBlogPosts,
          totalTestimonials,
        },
        recentActivities,
        latestEnquiries,
      },
    });
  }
);

// GET /api/dashboard/public-bundle - Single high-speed endpoint for public website initial render & SSR
dashboardRouter.get('/public-bundle', async (_req: Request, res: Response): Promise<void> => {
  const [
    settings,
    menus,
    homePage,
    homeSections,
    services,
    projects,
    testimonials,
    blogPosts,
    faqs,
    galleryAlbums,
  ] = await Promise.all([
    WebsiteSettings.findOne(),
    NavigationMenu.find(),
    Page.findOne({ slug: 'home', isDeleted: false }),
    PageSection.find({ pageSlug: 'home', isEnabled: true }).sort({ order: 1 }),
    Service.find({ isDeleted: false, status: 'published' }).sort({ displayOrder: 1 }),
    Project.find({ isDeleted: false, status: 'published' }).sort({
      isFeatured: -1,
      displayOrder: 1,
    }),
    Testimonial.find({ isDeleted: false, status: 'published' }).sort({ displayOrder: 1 }),
    BlogPost.find({ isDeleted: false, status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(6),
    Faq.find({ isDeleted: false, status: 'published' }).sort({ displayOrder: 1 }),
    GalleryAlbum.find({ isDeleted: false, status: 'published' }).sort({ displayOrder: 1 }),
  ]);

  res.json({
    success: true,
    data: {
      settings,
      menus,
      homePage,
      homeSections,
      services,
      projects,
      testimonials,
      blogPosts,
      faqs,
      galleryAlbums,
    },
  });
});

// GET /api/dashboard/search - Public search across projects, services, blog, and pages
dashboardRouter.get('/search', async (req: Request, res: Response): Promise<void> => {
  const q = String(req.query.q || '').trim();
  if (!q) {
    res.json({
      success: true,
      data: { projects: [], services: [], blogPosts: [], pages: [] },
    });
    return;
  }

  const regex = { $regex: q, $options: 'i' };

  const [projects, services, blogPosts, pages] = await Promise.all([
    Project.find({
      isDeleted: false,
      status: 'published',
      $or: [{ title: regex }, { category: regex }, { location: regex }, { description: regex }],
    }).limit(10),
    Service.find({
      isDeleted: false,
      status: 'published',
      $or: [{ title: regex }, { shortDescription: regex }, { detailedDescription: regex }],
    }).limit(10),
    BlogPost.find({
      isDeleted: false,
      status: 'published',
      $or: [{ title: regex }, { excerpt: regex }, { category: regex }],
    }).limit(10),
    Page.find({
      isDeleted: false,
      status: 'published',
      $or: [{ title: regex }, { description: regex }],
    }).limit(10),
  ]);

  res.json({
    success: true,
    data: {
      query: q,
      projects,
      services,
      blogPosts,
      pages,
    },
  });
});

// GET /api/dashboard/sitemap - Dynamic SEO XML Sitemap data
dashboardRouter.get('/sitemap', async (_req: Request, res: Response): Promise<void> => {
  const [pages, services, projects, blogPosts] = await Promise.all([
    Page.find({ isDeleted: false, status: 'published' }).select('slug updatedAt seo'),
    Service.find({ isDeleted: false, status: 'published' }).select('slug updatedAt seo'),
    Project.find({ isDeleted: false, status: 'published' }).select('slug updatedAt seo'),
    BlogPost.find({ isDeleted: false, status: 'published' }).select('slug updatedAt seo'),
  ]);

  res.json({
    success: true,
    data: {
      pages,
      services,
      projects,
      blogPosts,
    },
  });
});
