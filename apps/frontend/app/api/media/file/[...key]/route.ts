import { NextRequest, NextResponse } from 'next/server';
import { getMediaBucket } from '@/lib/cms/env';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_request: NextRequest, context: { params: { key: string[] } }) {
  const key = (context.params.key || []).join('/');
  if (!key) {
    return NextResponse.json({ success: false, message: 'Missing media key' }, { status: 400 });
  }
  const bucket = await getMediaBucket();
  if (!bucket) {
    return NextResponse.json({ success: false, message: 'Media storage is not configured' }, { status: 503 });
  }
  const object = await bucket.get(key);
  if (!object) {
    return NextResponse.json({ success: false, message: 'File not found' }, { status: 404 });
  }
  const headers = new Headers();
  headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return new NextResponse(object.body as any, { headers });
}
