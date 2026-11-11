declare global {
  interface D1PreparedStatement {
    bind(...values: unknown[]): D1PreparedStatement;
    first<T = Record<string, unknown>>(): Promise<T | null>;
    all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
    run(): Promise<unknown>;
  }

  interface D1Database {
    prepare(query: string): D1PreparedStatement;
    batch<T = unknown>(statements: D1PreparedStatement[]): Promise<T[]>;
  }

  interface R2ObjectBody {
    body: ReadableStream;
    httpMetadata?: { contentType?: string };
  }

  interface R2Bucket {
    put(
      key: string,
      value: ArrayBuffer | ArrayBufferView | ReadableStream | string,
      options?: { httpMetadata?: { contentType?: string } }
    ): Promise<unknown>;
    get(key: string): Promise<R2ObjectBody | null>;
  }

  interface CloudflareEnv {
    DB: D1Database;
    MEDIA?: R2Bucket;
    JWT_SECRET: string;
    ADMIN_EMAIL?: string;
    ADMIN_PASSWORD?: string;
    NEXT_PUBLIC_SITE_URL?: string;
  }

  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET?: string;
      ADMIN_EMAIL?: string;
      ADMIN_PASSWORD?: string;
      NEXT_PUBLIC_API_URL?: string;
      NEXT_PUBLIC_SITE_URL?: string;
    }
  }
}

export {};
