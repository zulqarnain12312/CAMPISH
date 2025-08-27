import type { NextAuthOptions } from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
// Adapter is optional for JWT sessions; we'll persist users via Mongoose callbacks
import { connectMongo } from '@/lib/mongoose'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
	session: { strategy: 'jwt' },
	pages: { signIn: '/login' },
	providers: [
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			allowDangerousEmailAccountLinking: true,
		}),
		Credentials({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials.password) return null
				await connectMongo()
				const user = await User.findOne({ email: credentials.email })
				if (!user || !user.passwordHash) return null
				const ok = await bcrypt.compare(credentials.password, user.passwordHash)
				if (!ok) return null
				return { id: (user as any)._id.toString(), email: user.email, name: user.name || undefined, role: user.role }
			},
		}),
	],
	callbacks: {
		async signIn({ user, account }) {
			if (account?.provider === 'google') {
				await connectMongo()
				const existing = await User.findOne({ email: user.email })
				if (!existing) {
					await User.create({ email: user.email, name: user.name, image: user.image, provider: 'google', role: 'BUYER' })
				}
			}
			return true
		},
		async jwt({ token, user }) {
			if (user) {
				await connectMongo()
				const dbUser = await User.findOne({ email: user.email })
				token.role = dbUser?.role || 'BUYER'
				token.sub = (dbUser?._id || token.sub)?.toString()
			}
			return token
		},
		async session({ session, token }) {
			if (session.user) {
				(session.user as any).id = token.sub
				;(session.user as any).role = token.role
			}
			return session
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
}