import type { PermissionKey } from '@vision/shared';
import {
  all,
  countRows,
  findById,
  first,
  insertRow,
  newId,
  nowIso,
  run,
  slugify,
  updateRow,
} from './db';
import { getMediaBucket } from './env';
import {
  authenticateRequest,
  findUserByEmail,
  hasPermission,
  hashPassword,
  loadAuthUser,
  signToken,
  verifyPassword,
  type AuthUser,
} from './auth';
import { ensureSeeded } from './seed';
import { getPublicBundle, getSitemapData } from './queries';

type HandlerResult = {
  status: number;
  body: any;
  cookie?: { name: string; value: string; clear?: boolean };
};

const ok = (data: any, extra: Record<string, any> = {}, status = 200): HandlerResult => ({
  status,
  body: { success: true, data, ...extra },
});
const fail = (message: string, status = 400): HandlerResult => ({
  status,
  body: { success: false, message },
});

async function requireUser(request: Request, ...perms: PermissionKey[]): Promise<AuthUser | HandlerResult> {
  const user = await authenticateRequest(request);
  if (!user) {
    return fail('Authentication required. Please log in to access the administration panel.', 401);
  }
  if (perms.length && !hasPermission(user, ...perms)) {
    return fail(
      `Access denied. Required permission: ${perms.join(' or ')} (Current role: ${user.roleName})`,
      403
    );
  }
  return user;
}

function isAuthUser(value: AuthUser | HandlerResult): value is AuthUser {
  return 'permissions' in value && 'roleName' in value;
}

async function logActivity(input: {
  user?: AuthUser | null;
  userName?: string;
  userRole?: string;
  action: string;
  module: string;
  entityId?: string;
  entityTitle?: string;
  details?: string;
}) {
  try {
    await insertRow('activity_logs', {
      userId: input.user?.id || null,
      userName: input.userName || input.user?.name || 'System',
      userRole: input.userRole || input.user?.roleName || 'Admin',
      action: input.action,
      module: input.module,
      entityId: input.entityId || '',
      entityTitle: input.entityTitle || '',
      details: input.details || '',
    });
  } catch (err) {
    console.error('activity log failed', err);
  }
}

function searchLike(q: string) {
  return `%${q.toLowerCase()}%`;
}

export async function handleApi(
  request: Request,
  path: string[],
  url: URL
): Promise<HandlerResult> {
  await ensureSeeded();
  const method = request.method.toUpperCase();
  const [res, id, extra] = path;
  const query = url.searchParams;
  let body: any = {};
  if (!['GET', 'HEAD'].includes(method)) {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await request.json().catch(() => ({}));
    }
  }

  if (res === 'health') {
    return ok({ service: 'Vision Tech Solutions Backend API', timestamp: nowIso() });
  }

  if (res === 'auth') return handleAuth(request, method, id, body);
  if (res === 'users') return handleUsers(request, method, id, extra, body, query);
  if (res === 'pages') return handlePages(request, method, path, body, query);
  if (res === 'services') return handleCrud(request, method, 'services', id, body, query, ['services:read', 'services:write']);
  if (res === 'projects') return handleCrud(request, method, 'projects', id, body, query, ['projects:read', 'projects:write']);
  if (res === 'gallery') return handleCrud(request, method, 'gallery_albums', id, body, query, ['gallery:read', 'gallery:write']);
  if (res === 'media') return handleMedia(request, method, path, body, query);
  if (res === 'testimonials') return handleCrud(request, method, 'testimonials', id, body, query, ['testimonials:read', 'testimonials:write']);
  if (res === 'blog') return handleCrud(request, method, 'blog_posts', id, body, query, ['blog:read', 'blog:write']);
  if (res === 'faqs') return handleCrud(request, method, 'faqs', id, body, query, ['pages:read', 'pages:write']);
  if (res === 'navigation') return handleNavigation(request, method, body);
  if (res === 'settings') return handleSettings(request, method, body);
  if (res === 'enquiries') return handleEnquiries(request, method, id, body, query);
  if (res === 'dashboard') return handleDashboard(request, method, id, query);

  return fail('Not found', 404);
}

async function handleAuth(request: Request, method: string, action: string, body: any): Promise<HandlerResult> {
  if (action === 'login' && method === 'POST') {
    const email = String(body.email || '').trim();
    const password = String(body.password || '');
    if (!email || password.length < 6) return fail('Invalid credentials format');
    const user = await findUserByEmail(email);
    if (!user || !user.isActive) return fail('Invalid email or password.', 401);
    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
      return fail('Account temporarily locked due to multiple failed login attempts.', 429);
    }
    const match = await verifyPassword(password, user.passwordHash);
    if (!match) {
      const attempts = Number(user.failedLoginAttempts || 0) + 1;
      await updateRow('users', user._id, {
        failedLoginAttempts: attempts,
        lockUntil: attempts >= 6 ? new Date(Date.now() + 10 * 60 * 1000).toISOString() : null,
      });
      return fail('Invalid email or password.', 401);
    }
    await updateRow('users', user._id, { failedLoginAttempts: 0, lockUntil: null, lastLoginAt: nowIso() });
    const authUser = await loadAuthUser(user._id);
    if (!authUser) return fail('User account is inactive or no longer exists.', 401);
    const token = await signToken({ id: authUser.id, email: authUser.email, roleName: authUser.roleName });
    await logActivity({ user: authUser, action: 'Logged in to Admin CMS', module: 'Authentication', entityId: authUser.id, entityTitle: authUser.email });
    return {
      status: 200,
      cookie: { name: 'vts_token', value: token },
      body: {
        success: true,
        data: {
          token,
          user: {
            id: authUser.id,
            name: authUser.name,
            email: authUser.email,
            designation: authUser.designation,
            avatar: authUser.avatar,
            roleName: authUser.roleName,
            permissions: authUser.permissions,
          },
        },
      },
    };
  }

  if (action === 'logout' && method === 'POST') {
    return { status: 200, cookie: { name: 'vts_token', value: '', clear: true }, body: { success: true, message: 'Logged out successfully' } };
  }

  if (action === 'me' && method === 'GET') {
    const user = await requireUser(request);
    if (!isAuthUser(user)) return user;
    return ok({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleName: user.roleName,
        permissions: user.permissions,
        designation: user.designation || '',
        avatar: user.avatar || '',
      },
    });
  }

  if (action === 'forgot-password' && method === 'POST') {
    return { status: 200, body: { success: true, message: 'If an account with that email exists, password reset instructions have been generated.' } };
  }

  if (action === 'change-password' && method === 'POST') {
    const user = await requireUser(request);
    if (!isAuthUser(user)) return user;
    if (!body.currentPassword || !body.newPassword || String(body.newPassword).length < 6) {
      return fail('Provide current password and a new password of at least 6 characters.');
    }
    const dbUser = await findById<any>('users', user.id);
    if (!dbUser) return fail('User not found', 404);
    const valid = await verifyPassword(body.currentPassword, dbUser.passwordHash);
    if (!valid) return fail('Current password is incorrect');
    await updateRow('users', user.id, { passwordHash: await hashPassword(body.newPassword) });
    return { status: 200, body: { success: true, message: 'Password updated successfully' } };
  }

  return fail('Not found', 404);
}

async function handleUsers(request: Request, method: string, id: string, extra: string, body: any, query: URLSearchParams): Promise<HandlerResult> {
  if (method === 'GET' && !id) {
    const user = await requireUser(request, 'users:read');
    if (!isAuthUser(user)) return user;
    const users = await all('users', 'SELECT * FROM users WHERE isDeleted = 0 ORDER BY createdAt ASC');
    const roles = await all('roles', 'SELECT * FROM roles');
    const permissions = await all('permissions', 'SELECT * FROM permissions');
    return ok({
      users: users.map((u: any) => {
        const { passwordHash, ...rest } = u;
        return rest;
      }),
      roles,
      permissions,
    });
  }

  if (method === 'POST' && !id) {
    const user = await requireUser(request, 'users:write');
    if (!isAuthUser(user)) return user;
    if (!body.email || !body.name || !body.password) return fail('Name, email and password are required');
    const existing = await findUserByEmail(body.email);
    if (existing) return fail('A user with this email already exists', 409);
    const role = body.role ? await findById<any>('roles', body.role) : await first<any>('roles', 'SELECT * FROM roles WHERE name = ?', [body.roleName || 'Content Manager']);
    const created = await insertRow('users', {
      name: body.name,
      email: String(body.email).toLowerCase(),
      passwordHash: await hashPassword(body.password),
      designation: body.designation || '',
      avatar: body.avatar || '',
      role: role?._id || '',
      roleName: role?.name || body.roleName || 'Content Manager',
      customPermissions: body.customPermissions || [],
      isActive: body.isActive !== false,
      createdBy: user.id,
    });
    const { passwordHash, ...safe } = created;
    return ok(safe, {}, 201);
  }

  if (id && method === 'PUT') {
    const user = await requireUser(request, extra === 'permissions' ? 'roles:manage' : 'users:write');
    if (!isAuthUser(user)) return user;
    const patch: Record<string, any> = { ...body, updatedBy: user.id };
    delete patch.password;
    if (body.password) patch.passwordHash = await hashPassword(body.password);
    const updated = await updateRow('users', id, patch);
    if (!updated) return fail('User not found', 404);
    const { passwordHash, ...safe } = updated;
    return ok(safe);
  }

  if (id && method === 'DELETE') {
    const user = await requireUser(request, 'users:write');
    if (!isAuthUser(user)) return user;
    if (id === user.id) return fail('You cannot delete your own account');
    await updateRow('users', id, { isDeleted: true, isActive: false });
    return { status: 200, body: { success: true, message: 'User deleted' } };
  }

  return fail('Not found', 404);
}

async function handlePages(request: Request, method: string, path: string[], body: any, query: URLSearchParams): Promise<HandlerResult> {
  const [, a, b] = path;
  const isAdmin = query.get('admin') === 'true';
  const isPreview = query.get('preview') === 'true';

  if (a === 'sections' && b && method === 'PUT') {
    const user = await requireUser(request, 'pages:write');
    if (!isAuthUser(user)) return user;
    const updated = await updateRow('page_sections', b, { ...body, updatedBy: user.id });
    if (!updated) return fail('Section not found', 404);
    return ok(updated);
  }
  if (a === 'sections' && b && method === 'DELETE') {
    const user = await requireUser(request, 'pages:write');
    if (!isAuthUser(user)) return user;
    await run('DELETE FROM page_sections WHERE id = ?', [b]);
    return { status: 200, body: { success: true, message: 'Section deleted' } };
  }

  if (!a && method === 'GET') {
    const where = isAdmin ? 'isDeleted = 0' : `isDeleted = 0 AND status = 'published'`;
    const pages = await all('pages', `SELECT * FROM pages WHERE ${where} ORDER BY createdAt ASC`);
    return ok(pages);
  }

  if (!a && method === 'POST') {
    const user = await requireUser(request, 'pages:write');
    if (!isAuthUser(user)) return user;
    if (!body.title) return fail('Page title is required');
    const slug = slugify(body.slug || body.title);
    const existing = await first('pages', 'SELECT * FROM pages WHERE slug = ? AND isDeleted = 0', [slug]);
    if (existing) return fail('A page with this slug already exists', 409);
    const page = await insertRow('pages', {
      title: body.title,
      slug,
      description: body.description || '',
      bannerImage: body.bannerImage || '',
      bannerSubtitle: body.bannerSubtitle || '',
      status: body.status || 'published',
      publishedAt: nowIso(),
      locale: body.locale || 'en',
      seo: { metaTitle: body.seo?.metaTitle || `${body.title} | Vision Tech Solutions`, slug, ...(body.seo || {}) },
      isSystemPage: false,
      sections: [],
      createdBy: user.id,
    });
    return ok(page, {}, 201);
  }

  if (a && b === 'sections' && method === 'POST') {
    const user = await requireUser(request, 'pages:write');
    if (!isAuthUser(user)) return user;
    const created = await insertRow('page_sections', {
      pageSlug: a,
      sectionKey: body.sectionKey || `${a}-sec-${newId().slice(0, 6)}`,
      blockType: body.blockType || 'text',
      title: body.title || 'Section Title',
      eyebrow: body.eyebrow || '',
      subtitle: body.subtitle || '',
      content: body.content || '',
      mediaUrl: body.mediaUrl || '',
      videoUrl: body.videoUrl || '',
      ctaPrimaryText: body.ctaPrimaryText || '',
      ctaPrimaryLink: body.ctaPrimaryLink || '',
      order: body.order ?? 99,
      isEnabled: body.isEnabled !== false,
      data: body.data || {},
      updatedBy: user.id,
    });
    return ok(created, {}, 201);
  }

  if (a && b === 'reorder-sections' && method === 'PUT') {
    const user = await requireUser(request, 'pages:write');
    if (!isAuthUser(user)) return user;
    const order = Array.isArray(body.order) ? body.order : [];
    for (let i = 0; i < order.length; i++) {
      await updateRow('page_sections', order[i], { order: i + 1, updatedBy: user.id });
    }
    const sections = await all('page_sections', `SELECT * FROM page_sections WHERE pageSlug = ? ORDER BY "order" ASC`, [a]);
    return ok(sections);
  }

  if (a && method === 'GET') {
    const page =
      (await first('pages', `SELECT * FROM pages WHERE slug = ? AND isDeleted = 0 LIMIT 1`, [a])) ||
      (await findById('pages', a));
    if (!page || (page as any).isDeleted) return fail('Page not found', 404);
    if (!isPreview && (page as any).status !== 'published') return fail('Page not found', 404);
    const sectionSql = isPreview
      ? `SELECT * FROM page_sections WHERE pageSlug = ? ORDER BY "order" ASC`
      : `SELECT * FROM page_sections WHERE pageSlug = ? AND isEnabled = 1 ORDER BY "order" ASC`;
    const sections = await all('page_sections', sectionSql, [(page as any).slug]);
    return ok({ page, sections });
  }

  if (a && method === 'PUT') {
    const user = await requireUser(request, 'pages:write');
    if (!isAuthUser(user)) return user;
    const updated = await updateRow('pages', a, { ...body, updatedBy: user.id });
    if (!updated) return fail('Page not found', 404);
    return ok(updated);
  }

  if (a && method === 'DELETE') {
    const user = await requireUser(request, 'pages:write');
    if (!isAuthUser(user)) return user;
    const page = await findById<any>('pages', a);
    if (!page) return fail('Page not found', 404);
    if (page.slug === 'home') return fail('The primary Home page cannot be deleted.');
    await updateRow('pages', a, { isDeleted: true });
    return { status: 200, body: { success: true, message: 'Page deleted' } };
  }

  return fail('Not found', 404);
}

async function handleCrud(
  request: Request,
  method: string,
  table: string,
  id: string,
  body: any,
  query: URLSearchParams,
  perms: [PermissionKey, PermissionKey]
): Promise<HandlerResult> {
  const isAdmin = query.get('admin') === 'true';
  if (method === 'GET' && !id) {
    const where = isAdmin ? 'isDeleted = 0' : `isDeleted = 0 AND status = 'published'`;
    const order = table === 'projects' ? 'isFeatured DESC, displayOrder ASC' : 'displayOrder ASC, createdAt DESC';
    let sql = `SELECT * FROM ${table} WHERE ${where}`;
    const params: unknown[] = [];
    if (query.get('category') && query.get('category') !== 'All') {
      sql += ' AND category = ?';
      params.push(query.get('category'));
    }
    if (query.get('projectType') && query.get('projectType') !== 'All') {
      sql += ' AND projectType = ?';
      params.push(query.get('projectType'));
    }
    if (query.get('location') && query.get('location') !== 'All') {
      sql += ' AND lower(location) LIKE ?';
      params.push(`%${String(query.get('location')).toLowerCase()}%`);
    }
    if (query.get('featured') === 'true') {
      sql += ' AND isFeatured = 1';
    }
    if (query.get('search')) {
      const like = `%${String(query.get('search')).toLowerCase()}%`;
      sql += ' AND (lower(title) LIKE ? OR lower(location) LIKE ? OR lower(category) LIKE ? OR lower(description) LIKE ?)';
      params.push(like, like, like, like);
    }
    sql += ` ORDER BY ${order}`;
    if (query.get('limit')) sql += ` LIMIT ${Number(query.get('limit')) || 100}`;
    const rows = await all(table, sql, params);

    if (table === 'projects') {
      const locRows = await all(
        'projects',
        `SELECT DISTINCT location FROM projects WHERE isDeleted = 0 AND status = 'published'`
      );
      return ok({
        projects: rows,
        locations: locRows.map((r: any) => r.location).filter(Boolean),
        pagination: { page: 1, limit: rows.length, total: rows.length, totalPages: 1 },
      });
    }
    if (table === 'gallery_albums') {
      const items: any[] = [];
      for (const album of rows) {
        for (const item of album.items || []) {
          items.push({
            ...item,
            albumTitle: album.title,
            albumSlug: album.slug,
            albumId: album._id,
            associatedProject: album.associatedProject,
          });
        }
      }
      return ok({ albums: rows, items });
    }
    if (table === 'blog_posts') {
      const categories = Array.from(new Set(rows.map((r: any) => r.category).filter(Boolean)));
      return ok({ posts: rows, categories });
    }
    return ok(rows);
  }

  if (method === 'GET' && id) {
    const row =
      (await first(table, `SELECT * FROM ${table} WHERE slug = ? AND isDeleted = 0 LIMIT 1`, [id])) ||
      (await findById(table, id));
    if (!row || (row as any).isDeleted) return fail('Not found', 404);
    return ok(row);
  }

  if (method === 'POST') {
    const user = await requireUser(request, perms[1]);
    if (!isAuthUser(user)) return user;
    const slug = body.slug ? slugify(body.slug) : body.title ? slugify(body.title) : undefined;
    const created = await insertRow(table, { ...body, slug, status: body.status || 'published', createdBy: user.id });
    await logActivity({ user, action: `Created ${table} item`, module: table, entityId: created._id, entityTitle: created.title || created.customerName });
    return ok(created, {}, 201);
  }

  if (method === 'PUT' && id) {
    const user = await requireUser(request, perms[1]);
    if (!isAuthUser(user)) return user;
    const updated = await updateRow(table, id, { ...body, updatedBy: user.id });
    if (!updated) return fail('Not found', 404);
    return ok(updated);
  }

  if (method === 'DELETE' && id) {
    const user = await requireUser(request, perms[1]);
    if (!isAuthUser(user)) return user;
    await updateRow(table, id, { isDeleted: true });
    return { status: 200, body: { success: true, message: 'Deleted' } };
  }

  return fail('Not found', 404);
}

async function handleMedia(request: Request, method: string, path: string[], body: any, query: URLSearchParams): Promise<HandlerResult> {
  const [, action, ...rest] = path;
  if (method === 'GET' && !action) {
    let sql = `SELECT * FROM media_assets WHERE isDeleted = 0`;
    const params: unknown[] = [];
    if (query.get('category') && query.get('category') !== 'All') {
      sql += ' AND category = ?';
      params.push(query.get('category'));
    }
    sql += ' ORDER BY createdAt DESC LIMIT 200';
    return ok(await all('media_assets', sql, params));
  }

  if (action === 'register-url' && method === 'POST') {
    const user = await requireUser(request, 'media:write', 'gallery:write', 'projects:write');
    if (!isAuthUser(user)) return user;
    if (!body.url) return fail('Media URL is required');
    const existing = await first('media_assets', 'SELECT * FROM media_assets WHERE secureUrl = ? AND isDeleted = 0 LIMIT 1', [body.url]);
    if (existing) return ok(existing, { message: 'Reused existing media asset from library without duplicating storage.' });
    const created = await insertRow('media_assets', {
      title: body.title || 'Architectural Photography',
      caption: body.caption || '',
      altText: body.altText || body.title || 'Vision Tech Solutions Interior Design',
      category: body.category || 'Interior Portfolio',
      publicId: `external/${Date.now()}`,
      url: body.url,
      secureUrl: body.url,
      thumbnailUrl: body.url,
      responsiveUrls: { sm: body.url, md: body.url, lg: body.url, xl: body.url },
      resourceType: body.resourceType || 'image',
      format: 'jpg',
      bytes: 0,
      tags: [],
      createdBy: user.id,
    });
    return ok(created, {}, 201);
  }

  if (action === 'upload' && method === 'POST') {
    const user = await requireUser(request, 'media:write', 'gallery:write', 'projects:write', 'pages:write');
    if (!isAuthUser(user)) return user;
    const form = await request.formData();
    const files = form.getAll('files').filter((f): f is File => f instanceof File);
    if (!files.length) return fail('Please select at least one image or video file to upload.');
    const category = String(form.get('category') || 'Interior Portfolio');
    const bucket = await getMediaBucket();
    if (!bucket) {
      return fail('Media storage is not enabled on this Cloudflare account. Enable R2, then redeploy.', 503);
    }
    const createdAssets = [];
    for (const file of files) {
      const id = newId();
      const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
      const key = `${id}/${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const buffer = await file.arrayBuffer();
      await bucket.put(key, buffer, { httpMetadata: { contentType: file.type || 'application/octet-stream' } });
      const publicUrl = `/api/media/file/${key}`;
      const cleanTitle = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      createdAssets.push(
        await insertRow('media_assets', {
          title: String(form.get('title') || cleanTitle),
          caption: String(form.get('caption') || cleanTitle),
          altText: `${cleanTitle} – Vision Tech Solutions`,
          category,
          publicId: key,
          url: publicUrl,
          secureUrl: publicUrl,
          thumbnailUrl: publicUrl,
          responsiveUrls: { sm: publicUrl, md: publicUrl, lg: publicUrl, xl: publicUrl },
          resourceType: file.type.startsWith('video/') ? 'video' : 'image',
          format: ext,
          bytes: file.size,
          tags: [category.toLowerCase()],
          createdBy: user.id,
        })
      );
    }
    return ok(createdAssets, { message: `Successfully uploaded ${createdAssets.length} asset(s).` }, 201);
  }

  if (action === 'file' && rest.length) {
    return fail('Use the dedicated media file route', 404);
  }

  if (action && method === 'PUT') {
    const user = await requireUser(request, 'media:write', 'gallery:write');
    if (!isAuthUser(user)) return user;
    const updated = await updateRow('media_assets', action, { title: body.title, caption: body.caption, altText: body.altText, category: body.category, updatedBy: user.id });
    if (!updated) return fail('Media asset not found', 404);
    return ok(updated);
  }

  if (action && method === 'DELETE') {
    const user = await requireUser(request, 'media:write');
    if (!isAuthUser(user)) return user;
    await updateRow('media_assets', action, { isDeleted: true });
    return { status: 200, body: { success: true, message: 'Media deleted' } };
  }

  return fail('Not found', 404);
}

async function handleNavigation(request: Request, method: string, body: any): Promise<HandlerResult> {
  if (method === 'GET') return ok(await all('navigation_menus', 'SELECT * FROM navigation_menus'));
  if (method === 'PUT') {
    const user = await requireUser(request, 'settings:write');
    if (!isAuthUser(user)) return user;
    const items = Array.isArray(body) ? body : body.menus || [];
    for (const menu of items) {
      if (menu._id || menu.id) await updateRow('navigation_menus', menu._id || menu.id, { ...menu, updatedBy: user.id });
    }
    return ok(await all('navigation_menus', 'SELECT * FROM navigation_menus'));
  }
  return fail('Not found', 404);
}

async function handleSettings(request: Request, method: string, body: any): Promise<HandlerResult> {
  const settings = await first('website_settings', 'SELECT * FROM website_settings LIMIT 1');
  if (method === 'GET') return ok(settings);
  if (method === 'PUT') {
    const user = await requireUser(request, 'settings:write');
    if (!isAuthUser(user)) return user;
    if (!settings) return fail('Settings not found', 404);
    const updated = await updateRow('website_settings', (settings as any)._id, { ...body, updatedBy: user.id });
    return ok(updated);
  }
  return fail('Not found', 404);
}

async function handleEnquiries(request: Request, method: string, id: string, body: any, query: URLSearchParams): Promise<HandlerResult> {
  if (method === 'POST' && !id) {
    if (body.website_url_honeypot) {
      return { status: 200, body: { success: true, message: 'Thank you! Your consultation request has been received.' } };
    }
    if (!body.name || !body.phone || !body.serviceInterestedIn) {
      return fail('Please check the form fields.');
    }
    const created = await insertRow('enquiries', {
      name: body.name,
      email: body.email || '',
      phone: body.phone,
      location: body.location || 'Hyderabad',
      serviceInterestedIn: body.serviceInterestedIn,
      budgetRange: body.budgetRange || 'Consultation Request',
      projectDetails: body.projectDetails || '',
      sourcePage: body.sourcePage || 'Home Page',
      status: 'New',
      internalNotes: [{ note: `Enquiry received via ${body.sourcePage || 'Website Consultation Form'}.`, addedBy: 'System', addedAt: nowIso() }],
    });
    await logActivity({ userName: created.name, userRole: 'Website Visitor', action: 'Submitted consultation enquiry', module: 'Enquiries', entityId: created._id, entityTitle: `${created.name} – ${created.serviceInterestedIn}` });
    return {
      status: 201,
      body: {
        success: true,
        message: 'Thank you! Your free design consultation request has been submitted. Our senior architect will reach out within 24 hours.',
        data: created,
      },
    };
  }

  if (method === 'GET' && !id) {
    const user = await requireUser(request, 'enquiries:read');
    if (!isAuthUser(user)) return user;
    let sql = `SELECT * FROM enquiries WHERE isDeleted = 0`;
    const params: unknown[] = [];
    if (query.get('status') && query.get('status') !== 'All') {
      sql += ' AND status = ?';
      params.push(query.get('status'));
    }
    sql += ' ORDER BY createdAt DESC';
    return ok(await all('enquiries', sql, params));
  }

  if (id && method === 'PUT') {
    const user = await requireUser(request, 'enquiries:write');
    if (!isAuthUser(user)) return user;
    const existing = await findById<any>('enquiries', id);
    if (!existing) return fail('Enquiry not found', 404);
    const patch: Record<string, any> = { ...body };
    if (body.note) {
      patch.internalNotes = [
        ...(existing.internalNotes || []),
        { note: body.note, addedBy: user.name, addedAt: nowIso() },
      ];
      delete patch.note;
    }
    return ok(await updateRow('enquiries', id, patch));
  }

  if (id && method === 'DELETE') {
    const user = await requireUser(request, 'enquiries:write');
    if (!isAuthUser(user)) return user;
    await updateRow('enquiries', id, { isDeleted: true });
    return { status: 200, body: { success: true, message: 'Enquiry deleted' } };
  }

  return fail('Not found', 404);
}

async function handleDashboard(request: Request, method: string, action: string, query: URLSearchParams): Promise<HandlerResult> {
  if (method !== 'GET') return fail('Not found', 404);
  if (!action) {
    const user = await requireUser(request);
    if (!isAuthUser(user)) return user;
    const [
      totalProjects,
      totalServices,
      totalMediaAssets,
      totalEnquiries,
      newEnquiries,
      publishedPages,
      draftPages,
      totalBlogPosts,
      totalTestimonials,
      recentActivities,
      latestEnquiries,
    ] = await Promise.all([
      countRows(`SELECT COUNT(*) as n FROM projects WHERE isDeleted = 0`),
      countRows(`SELECT COUNT(*) as n FROM services WHERE isDeleted = 0`),
      countRows(`SELECT COUNT(*) as n FROM media_assets WHERE isDeleted = 0`),
      countRows(`SELECT COUNT(*) as n FROM enquiries WHERE isDeleted = 0`),
      countRows(`SELECT COUNT(*) as n FROM enquiries WHERE isDeleted = 0 AND status = 'New'`),
      countRows(`SELECT COUNT(*) as n FROM pages WHERE isDeleted = 0 AND status = 'published'`),
      countRows(`SELECT COUNT(*) as n FROM pages WHERE isDeleted = 0 AND status != 'published'`),
      countRows(`SELECT COUNT(*) as n FROM blog_posts WHERE isDeleted = 0`),
      countRows(`SELECT COUNT(*) as n FROM testimonials WHERE isDeleted = 0`),
      all('activity_logs', `SELECT * FROM activity_logs ORDER BY createdAt DESC LIMIT 12`),
      all('enquiries', `SELECT * FROM enquiries WHERE isDeleted = 0 ORDER BY createdAt DESC LIMIT 8`),
    ]);
    return ok({
      stats: {
        totalProjects,
        totalServices,
        totalGalleryImages: totalMediaAssets,
        totalEnquiries,
        newEnquiries,
        publishedPages,
        draftPages,
        totalBlogPosts,
        totalTestimonials,
      },
      recentActivities,
      latestEnquiries,
    });
  }

  if (action === 'public-bundle') return ok(await getPublicBundle());
  if (action === 'sitemap') return ok(await getSitemapData());
  if (action === 'search') {
    const q = (query.get('q') || '').trim();
    if (!q) return ok({ projects: [], services: [], blogPosts: [], pages: [], query: q });
    const like = searchLike(q);
    const [projects, services, blogPosts, pages] = await Promise.all([
      all('projects', `SELECT * FROM projects WHERE isDeleted = 0 AND status = 'published' AND (lower(title) LIKE ? OR lower(category) LIKE ? OR lower(location) LIKE ?) LIMIT 10`, [like, like, like]),
      all('services', `SELECT * FROM services WHERE isDeleted = 0 AND status = 'published' AND (lower(title) LIKE ? OR lower(shortDescription) LIKE ?) LIMIT 10`, [like, like]),
      all('blog_posts', `SELECT * FROM blog_posts WHERE isDeleted = 0 AND status = 'published' AND (lower(title) LIKE ? OR lower(excerpt) LIKE ?) LIMIT 10`, [like, like]),
      all('pages', `SELECT * FROM pages WHERE isDeleted = 0 AND status = 'published' AND (lower(title) LIKE ? OR lower(description) LIKE ?) LIMIT 10`, [like, like]),
    ]);
    return ok({ query: q, projects, services, blogPosts, pages });
  }
  return fail('Not found', 404);
}
