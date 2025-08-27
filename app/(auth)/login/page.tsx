"use client"
import { signIn } from 'next-auth/react'
import { FormEvent, useState } from 'react'

export default function LoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)

	async function onSubmit(e: FormEvent) {
		e.preventDefault()
		setLoading(true)
		await signIn('credentials', { email, password, callbackUrl: '/' })
		setLoading(false)
	}

	return (
		<main className="max-w-md mx-auto p-6">
			<h1 className="text-2xl font-semibold mb-4">Sign in</h1>
			<form onSubmit={onSubmit} className="space-y-3">
				<input className="border w-full p-2 rounded" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
				<input className="border w-full p-2 rounded" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
				<button className="bg-black text-white px-4 py-2 rounded w-full" disabled={loading}>
					{loading ? 'Signing in...' : 'Sign in'}
				</button>
			</form>
			<div className="mt-4">
				<button onClick={() => signIn('google', { callbackUrl: '/' })} className="border w-full p-2 rounded">Continue with Google</button>
			</div>
		</main>
	)
}