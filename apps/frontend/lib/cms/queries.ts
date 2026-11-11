import { all, first } from './db';
import { ensureSeeded } from './seed';

export async function getPublicBundle() {
  await ensureSeeded();
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
    first('website_settings', 'SELECT * FROM website_settings LIMIT 1'),
    all('navigation_menus', 'SELECT * FROM navigation_menus'),
    first('pages', `SELECT * FROM pages WHERE slug = 'home' AND isDeleted = 0 LIMIT 1`),
    all(
      'page_sections',
      `SELECT * FROM page_sections WHERE pageSlug = 'home' AND isEnabled = 1 ORDER BY "order" ASC`
    ),
    all(
      'services',
      `SELECT * FROM services WHERE isDeleted = 0 AND status = 'published' ORDER BY displayOrder ASC`
    ),
    all(
      'projects',
      `SELECT * FROM projects WHERE isDeleted = 0 AND status = 'published' ORDER BY isFeatured DESC, displayOrder ASC`
    ),
    all(
      'testimonials',
      `SELECT * FROM testimonials WHERE isDeleted = 0 AND status = 'published' ORDER BY displayOrder ASC`
    ),
    all(
      'blog_posts',
      `SELECT * FROM blog_posts WHERE isDeleted = 0 AND status = 'published' ORDER BY publishedAt DESC LIMIT 6`
    ),
    all(
      'faqs',
      `SELECT * FROM faqs WHERE isDeleted = 0 AND status = 'published' ORDER BY displayOrder ASC`
    ),
    all(
      'gallery_albums',
      `SELECT * FROM gallery_albums WHERE isDeleted = 0 AND status = 'published' ORDER BY displayOrder ASC`
    ),
  ]);

  return {
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
  };
}

export async function getSitemapData() {
  await ensureSeeded();
  const [pages, services, projects, blogPosts] = await Promise.all([
    all('pages', `SELECT slug, updatedAt, seo FROM pages WHERE isDeleted = 0 AND status = 'published'`),
    all('services', `SELECT slug, updatedAt, seo FROM services WHERE isDeleted = 0 AND status = 'published'`),
    all('projects', `SELECT slug, updatedAt, seo FROM projects WHERE isDeleted = 0 AND status = 'published'`),
    all('blog_posts', `SELECT slug, updatedAt, seo FROM blog_posts WHERE isDeleted = 0 AND status = 'published'`),
  ]);
  return { pages, services, projects, blogPosts };
}
