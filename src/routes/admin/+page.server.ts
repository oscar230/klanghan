import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users, shifts } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allUsers = await db.select().from(users).orderBy(users.name);
	const allShifts = await db.select().from(shifts).orderBy(shifts.startTime);
	
	return {
		users: allUsers,
		shifts: allShifts
	};
};

export const actions: Actions = {
	addUser: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString();
		
		if (!name) return fail(400, { error: 'Name is required' });
		
		try {
			await db.insert(users).values({ name });
		} catch (e) {
			return fail(400, { error: 'Failed to add user (might exist)' });
		}
	},
	
	deleteUser: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		
		if (!id) return fail(400, { error: 'ID is required' });
		await db.delete(users).where(eq(users.id, id));
	},
	
	addShift: async ({ request }) => {
		const data = await request.formData();
		const userId = data.get('userId')?.toString();
		const role = data.get('role')?.toString();
		const startTime = data.get('startTime')?.toString();
		const endTime = data.get('endTime')?.toString();
		
		if (!userId || !role || !startTime || !endTime) {
			return fail(400, { error: 'All fields are required' });
		}
		
		await db.insert(shifts).values({
			userId,
			role,
			startTime: new Date(startTime),
			endTime: new Date(endTime)
		});
	},
	
	deleteShift: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		
		if (!id) return fail(400, { error: 'ID is required' });
		await db.delete(shifts).where(eq(shifts.id, id));
	}
};
