import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
	const session = (await getServerSession(authOptions as any)) as any
	if (!session || session.user?.role !== 'ADMIN') redirect('/')
	return (
		<main className="p-6">
			<h1 className="text-2xl font-semibold">Admin Dashboard</h1>
			<p>Welcome, {session.user?.name || session.user?.email}</p>
		</main>
	)
}