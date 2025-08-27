import './globals.css'
import type { ReactNode } from 'react'
import Link from 'next/link'
import AuthProvider from '@/components/AuthProvider'

export const metadata = {
	title: 'Ecommerce Platform',
	description: 'Shop, sell, and manage with ease.'
}

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body className="min-h-screen bg-white text-gray-900">
				<AuthProvider>
					<header className="border-b p-4 flex items-center gap-4">
						<Link href="/">Home</Link>
						<Link href="/api/auth/signin">Login</Link>
						<Link href="/api/auth/signout">Logout</Link>
						<Link href="/seller">Seller</Link>
						<Link href="/admin">Admin</Link>
					</header>
					{children}
				</AuthProvider>
			</body>
		</html>
	)
}
