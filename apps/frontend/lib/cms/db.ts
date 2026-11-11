import { getDb } from './env';

export function newId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 24);
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const JSON_FIELDS: Record<string, string[]> = {
  roles: ['permissions'],
  users: ['customPermissions'],
  media_assets: ['responsiveUrls', 'tags'],
  pages: ['sections', 'translations', 'seo'],
  page_sections: ['data'],
  services: [
    'ourApproach',
    'keyFeatures',
    'designSolutions',
    'benefits',
    'galleryImages',
    'faqs',
    'relatedProjects',
    'seo',
  ],
  projects: ['images', 'beforeAfterImages', 'videos', 'seo'],
  gallery_albums: ['items'],
  blog_posts: ['tags', 'relatedPosts', 'seo'],
  enquiries: ['internalNotes'],
  website_settings: [
    'socialLinks',
    'announcementBar',
    'defaultSeo',
    'notificationEmails',
    'supportedLanguages',
  ],
  navigation_menus: ['items'],
};

const BOOL_FIELDS: Record<string, string[]> = {
  roles: ['isSystem'],
  users: ['isActive', 'isDeleted'],
  media_assets: ['isDeleted'],
  pages: ['isSystemPage', 'isDeleted'],
  page_sections: ['isEnabled'],
  services: ['isFeatured', 'isDeleted'],
  projects: ['isFeatured', 'isDeleted'],
  gallery_albums: ['isDeleted'],
  testimonials: ['isDeleted'],
  blog_posts: ['isDeleted'],
  enquiries: ['isDeleted'],
  faqs: ['isDeleted'],
};

function quoteIdent(col: string): string {
  return col === 'order' ? '"order"' : col;
}

export function parseRow(table: string, row: Record<string, unknown> | null | undefined): any {
  if (!row) return null;
  const doc: Record<string, any> = { ...row, _id: row.id };
  for (const field of JSON_FIELDS[table] || []) {
    const value = doc[field];
    if (typeof value === 'string') {
      try {
        doc[field] = JSON.parse(value);
      } catch {
        doc[field] = value;
      }
    }
  }
  for (const field of BOOL_FIELDS[table] || []) {
    if (doc[field] !== undefined && doc[field] !== null) {
      doc[field] = Boolean(Number(doc[field]));
    }
  }
  return doc;
}

function bindable(value: unknown): unknown {
  return value === undefined ? null : value;
}

export function serializeDoc(table: string, doc: Record<string, any>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...doc };
  if (out._id && !out.id) out.id = out._id;
  delete out._id;
  for (const field of JSON_FIELDS[table] || []) {
    if (out[field] !== undefined && typeof out[field] !== 'string') {
      out[field] = JSON.stringify(out[field] ?? (field.endsWith('s') && field !== 'seo' ? [] : {}));
    }
  }
  for (const field of BOOL_FIELDS[table] || []) {
    if (out[field] !== undefined) {
      out[field] = out[field] ? 1 : 0;
    }
  }
  for (const key of Object.keys(out)) {
    if (out[key] === undefined) out[key] = null;
  }
  return out;
}

export async function all<T = any>(
  table: string,
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const db = await getDb();
  const result = await db
    .prepare(sql)
    .bind(...params.map(bindable))
    .all();
  return (result.results || []).map((row: Record<string, unknown>) => parseRow(table, row)) as T[];
}

export async function first<T = any>(
  table: string,
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const db = await getDb();
  const row = await db
    .prepare(sql)
    .bind(...params.map(bindable))
    .first();
  return parseRow(table, row as Record<string, unknown> | null) as T | null;
}

export async function run(sql: string, params: unknown[] = []): Promise<void> {
  const db = await getDb();
  await db
    .prepare(sql)
    .bind(...params.map(bindable))
    .run();
}

export async function findById<T = any>(table: string, id: string): Promise<T | null> {
  return first<T>(table, `SELECT * FROM ${table} WHERE id = ? LIMIT 1`, [id]);
}

export async function insertRow(table: string, doc: Record<string, any>): Promise<any> {
  const payload = serializeDoc(table, {
    id: doc.id || doc._id || newId(),
    createdAt: doc.createdAt || nowIso(),
    updatedAt: doc.updatedAt || nowIso(),
    ...doc,
  });
  const keys = Object.keys(payload);
  const cols = keys.map(quoteIdent).join(', ');
  const placeholders = keys.map(() => '?').join(', ');
  await run(
    `INSERT INTO ${table} (${cols}) VALUES (${placeholders})`,
    keys.map((k) => payload[k])
  );
  return parseRow(table, payload as Record<string, unknown>);
}

export async function updateRow(table: string, id: string, patch: Record<string, any>): Promise<any | null> {
  const existing = await findById(table, id);
  if (!existing) return null;
  const merged = serializeDoc(table, {
    ...existing,
    ...patch,
    id,
    updatedAt: nowIso(),
  });
  const keys = Object.keys(merged).filter((k) => k !== 'id');
  const assignments = keys.map((k) => `${quoteIdent(k)} = ?`).join(', ');
  await run(
    `UPDATE ${table} SET ${assignments} WHERE id = ?`,
    [...keys.map((k) => merged[k]), id]
  );
  return parseRow(table, merged as Record<string, unknown>);
}

export async function countRows(sql: string, params: unknown[] = []): Promise<number> {
  const db = await getDb();
  const row = await db
    .prepare(sql)
    .bind(...params.map(bindable))
    .first<{ n: number }>();
  return Number(row?.n || 0);
}

export async function batchInsert(table: string, docs: Record<string, any>[]): Promise<any[]> {
  if (!docs.length) return [];
  const db = await getDb();
  const created: any[] = [];
  const chunkSize = 20;
  for (let i = 0; i < docs.length; i += chunkSize) {
    const chunk = docs.slice(i, i + chunkSize);
    const statements = chunk.map((doc) => {
      const payload = serializeDoc(table, {
        id: doc.id || doc._id || newId(),
        createdAt: doc.createdAt || nowIso(),
        updatedAt: doc.updatedAt || nowIso(),
        ...doc,
      });
      const keys = Object.keys(payload);
      created.push(parseRow(table, payload as Record<string, unknown>));
      return db
        .prepare(
          `INSERT INTO ${table} (${keys.map(quoteIdent).join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`
        )
        .bind(...keys.map((k) => bindable(payload[k])));
    });
    await db.batch(statements);
  }
  return created;
}
