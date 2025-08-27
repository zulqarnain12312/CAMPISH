export type UserRole = 'ADMIN' | 'SELLER' | 'BUYER'

export const RolePriority: Record<UserRole, number> = {
	ADMIN: 3,
	SELLER: 2,
	BUYER: 1,
}

export function isAtLeastRole(actual: UserRole, required: UserRole): boolean {
	return RolePriority[actual] >= RolePriority[required]
}