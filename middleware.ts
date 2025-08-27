import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl
	if (pathname.startsWith('/admin') || pathname.startsWith('/seller')) {
		const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
		if (!token) {
			const signInUrl = new URL('/api/auth/signin', req.nextUrl.origin)
			return NextResponse.redirect(signInUrl)
		}
		if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
			return NextResponse.redirect(new URL('/', req.nextUrl.origin))
		}
		if (pathname.startsWith('/seller') && token.role !== 'SELLER' && token.role !== 'ADMIN') {
			return NextResponse.redirect(new URL('/', req.nextUrl.origin))
		}
	}
	return NextResponse.next()
}

export const config = {
	matcher: ['/admin/:path*', '/seller/:path*'],
}