import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/cms/handlers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function dispatch(request: NextRequest, context: { params: { path: string[] } }) {
  const path = context.params.path || [];
  try {
    const result = await handleApi(request, path, new URL(request.url));
    const response = NextResponse.json(result.body, { status: result.status });
    if (result.cookie) {
      if (result.cookie.clear) {
        response.cookies.set(result.cookie.name, '', { httpOnly: true, path: '/', maxAge: 0 });
      } else {
        response.cookies.set(result.cookie.name, result.cookie.value, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 8 * 60 * 60,
        });
      }
    }
    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const GET = dispatch;
export const POST = dispatch;
export const PUT = dispatch;
export const PATCH = dispatch;
export const DELETE = dispatch;
