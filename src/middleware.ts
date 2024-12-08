import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthToken } from '@/utils/api/getAuthToken';

export async function middleware(request: NextRequest) {
    let token: string | undefined;
    try {
        token = await getAuthToken();
    } catch (error) {
        token = undefined;
    }

    const isPublicRoute = ['/', '/landing', '/signup', '/signin'].some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (!isPublicRoute && !token) {
        return NextResponse.redirect(new URL('/signin', request.url));
    }

    return NextResponse.next();
}
