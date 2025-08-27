import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI as string | undefined

let cached = (global as any)._mongo as { client: MongoClient | null; promise: Promise<MongoClient> | null } | undefined
if (!cached) {
	cached = (global as any)._mongo = { client: null, promise: null }
}

export async function getMongoClient(): Promise<MongoClient> {
	if (!uri) throw new Error('MONGODB_URI is not set')
	if (cached!.client) return cached!.client
	if (!cached!.promise) {
		cached!.promise = new MongoClient(uri).connect()
	}
	cached!.client = await cached!.promise
	return cached!.client
}

export async function getDb(dbName = 'ecommerce') {
	const client = await getMongoClient()
	return client.db(dbName)
}