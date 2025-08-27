import * as mongooseNS from 'mongoose'

const mongoose = mongooseNS
const { Schema } = mongoose

const UserSchema = new Schema(
	{
		email: { type: String, required: true, unique: true, index: true },
		name: { type: String },
		image: { type: String },
		role: { type: String, enum: ['ADMIN', 'SELLER', 'BUYER'], default: 'BUYER', index: true },
		provider: { type: String, enum: ['credentials', 'google'], default: 'credentials' },
		passwordHash: { type: String },
		createdAt: { type: Date, default: Date.now },
		updatedAt: { type: Date, default: Date.now },
	},
	{ timestamps: true }
)

export type UserDoc = mongooseNS.InferSchemaType<typeof UserSchema>

export default (mongoose.models.User as mongooseNS.Model<UserDoc>) || mongoose.model<UserDoc>('User', UserSchema)