import { NextResponse } from 'next/server'
import { connectMongo } from '@/lib/mongoose'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
	const { email, password, name, role } = await req.json()
	if (!email || !password) return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
	await connectMongo()
	const existing = await User.findOne({ email })
	if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
	const passwordHash = await bcrypt.hash(password, 10)
	const user = await User.create({ email, name, passwordHash, role: role === 'SELLER' ? 'SELLER' : 'BUYER', provider: 'credentials' })
	return NextResponse.json({ id: (user as any)._id.toString(), email: user.email, role: user.role })
}