import NextAuth, { type DefaultSession } from 'next-auth'

declare module 'next-auth' {
	interface Session {
		user: DefaultSession['user'] & { id: string; role: 'ADMIN' | 'SELLER' | 'BUYER' }
	}
	interface User {
		role: 'ADMIN' | 'SELLER' | 'BUYER'
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		role?: 'ADMIN' | 'SELLER' | 'BUYER'
	}
}