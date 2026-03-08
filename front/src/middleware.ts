import { NextRequest, NextResponse } from 'next/server';

// Зарезервированные пути — не могут быть username пользователя
const RESERVED_PATHS = new Set([
  'admin',
  'api',
  'auth',
  'offer',
  'disclaimer',
  'profile',
  'feed',
  'pricing',
  'health',
  'static',
  'id',
  'tools',
  '_next',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];

  if (!first) return NextResponse.next(); // корень /

  // Системные пути — пропускаем как есть
  if (RESERVED_PATHS.has(first)) {
    return NextResponse.next();
  }

  // Профиль по @username (/@ivan → /user-profile/@ivan)
  if (first.startsWith('@')) {
    const username = first.slice(1);
    return NextResponse.rewrite(
      new URL(`/user-profile/${username}${pathname.slice(first.length + 1)}`, request.url),
    );
  }

  // Профиль по числовому ID (/id765878785 → /user-profile/id765878785)
  if (/^id\d+$/.test(first)) {
    return NextResponse.rewrite(
      new URL(`/user-profile/${first}${pathname.slice(first.length + 1)}`, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
