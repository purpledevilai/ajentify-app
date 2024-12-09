import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
//import { getAuthToken } from '@/utils/api/getAuthToken';

//const puplicRoutes = ['/', '/landing', '/signup', '/signin'];

export async function middleware(request: NextRequest) {
    // let token: string | undefined;
    // try {
    //     token = await getAuthToken();
    // } catch (error) {
    //     console.error('Failed to get auth token', error);
    //     token = undefined;
    // }

    // const isPublicRoute = puplicRoutes.includes(request.nextUrl.pathname);
    // console.log("request url", request.nextUrl.origin);
    // if (!isPublicRoute && token === undefined) {
        
    //     return NextResponse.redirect(new URL('http://localhost:3000/signin'));
    //     //return NextResponse.redirect('/signin');
    //     //return NextResponse.rewrite(new URL('/signin', request.url))
    //     console.log('Redirecting to signin');
    // }

    return NextResponse.next();
}
