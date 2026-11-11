export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Vision Tech Solutions – Luxury Interior Design Website & CMS API',
    version: '1.0.0',
    description:
      'Production REST API powering the Vision Tech Solutions public website and Role-Based Administration CMS.',
    contact: {
      name: 'Vision Tech Solutions Engineering',
      email: 'info@visiontechsolutions.co.in',
    },
  },
  servers: [
    {
      url: 'https://visiontechsolutions.co.in',
      description: 'Production Server',
    },
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate admin or staff user and obtain JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@visiontechsolutions.co.in' },
                  password: { type: 'string', example: 'Admin@123456' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Authenticated successfully' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current logged-in administrator profile & permissions',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Current user profile' } },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users & RBAC'],
        summary: 'List all CMS users, roles, and granular permissions',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Users, roles, and permissions list' } },
      },
      post: {
        tags: ['Users & RBAC'],
        summary: 'Create a new CMS user with assigned role',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Created user' } },
      },
    },
    '/api/pages': {
      get: {
        tags: ['Pages & Page Builder'],
        summary: 'List dynamic CMS pages',
        responses: { '200': { description: 'Pages list' } },
      },
      post: {
        tags: ['Pages & Page Builder'],
        summary: 'Create a new dynamic page with reusable content blocks',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Created page' } },
      },
    },
    '/api/pages/{slug}': {
      get: {
        tags: ['Pages & Page Builder'],
        summary: 'Get a page and its ordered content sections by slug',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Page and sections' } },
      },
    },
    '/api/services': {
      get: {
        tags: ['Services'],
        summary: 'List all interior design & contracting services',
        responses: { '200': { description: 'Services list' } },
      },
      post: {
        tags: ['Services'],
        summary: 'Create a new interior design service page',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Service created' } },
      },
    },
    '/api/projects': {
      get: {
        tags: ['Projects Portfolio'],
        summary: 'List portfolio projects with category, location, type, and search filters',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'projectType', in: 'query', schema: { type: 'string' } },
          { name: 'location', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Filtered projects with pagination' } },
      },
      post: {
        tags: ['Projects Portfolio'],
        summary: 'Create a new interior design project',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Project created' } },
      },
    },
    '/api/gallery': {
      get: {
        tags: ['Gallery'],
        summary: 'Get gallery albums and masonry items',
        responses: { '200': { description: 'Gallery albums and items' } },
      },
    },
    '/api/media/upload': {
      post: {
        tags: ['Media Library (Cloudinary)'],
        summary: 'Bulk upload high-resolution images or videos to Cloudinary / CDN',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Uploaded media assets' } },
      },
    },
    '/api/testimonials': {
      get: {
        tags: ['Testimonials'],
        summary: 'List client testimonials',
        responses: { '200': { description: 'Testimonials list' } },
      },
    },
    '/api/blog': {
      get: {
        tags: ['Blog & Insights'],
        summary: 'List published blog articles and categories',
        responses: { '200': { description: 'Blog posts and categories' } },
      },
    },
    '/api/enquiries': {
      post: {
        tags: ['Enquiries & Leads'],
        summary: 'Submit a public consultation enquiry (triggers DB storage + email notification)',
        responses: { '201': { description: 'Enquiry saved' } },
      },
      get: {
        tags: ['Enquiries & Leads'],
        summary: 'List and filter enquiries in Admin CMS',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Enquiries list' } },
      },
    },
    '/api/enquiries/export/csv': {
      get: {
        tags: ['Enquiries & Leads'],
        summary: 'Export enquiries to CSV',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'CSV file download' } },
      },
    },
    '/api/settings': {
      get: {
        tags: ['Global Website Settings'],
        summary: 'Get global company contact, branding, SEO, and announcement settings',
        responses: { '200': { description: 'Website settings' } },
      },
      put: {
        tags: ['Global Website Settings'],
        summary: 'Update global website settings',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Updated settings' } },
      },
    },
    '/api/dashboard': {
      get: {
        tags: ['Admin Dashboard'],
        summary: 'Get CMS dashboard metrics, recent activities, and latest enquiries',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Dashboard summary' } },
      },
    },
  },
};
