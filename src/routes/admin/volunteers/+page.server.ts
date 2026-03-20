import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

import { sql } from 'drizzle-orm';
import { shifts } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	const allUsers = await db
		.select({
			id: users.id,
			name: users.name,
			imageUrl: users.imageUrl,
			shiftCount: sql<number>`count(${shifts.id})`
		})
		.from(users)
		.leftJoin(shifts, eq(users.id, shifts.userId))
		.groupBy(users.id)
		.orderBy(users.name);
		
	return { users: allUsers };
};

export const actions: Actions = {
	addUser: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString();
        const imageUrl = data.get('imageUrl')?.toString() || null;
		if (!name) return fail(400, { error: 'Namn krävs' });
		
		try {
			await db.insert(users).values({ name, imageUrl });
		} catch (e: any) {
            if (e.message && e.message.includes('UNIQUE constraint failed')) {
                return fail(400, { error: 'En volontär med det namnet finns redan' });
            }
			return fail(400, { error: 'Misslyckades att lägga till volontär' });
		}
	},
	updateUser: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const imageUrl = data.get('imageUrl')?.toString() || null;
		
		if (!id) return fail(400, { error: 'ID krävs' });
		
		await db.update(users).set({ imageUrl }).where(eq(users.id, id));
	},
	deleteUser: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID krävs' });
		
		// Protection: Check if user has shifts
		const userShifts = await db.select().from(shifts).where(eq(shifts.userId, id)).limit(1);
		if (userShifts.length > 0) {
			return fail(400, { error: 'Kan inte ta bort en volontär som har inbokade arbetspass' });
		}
		
		await db.delete(users).where(eq(users.id, id));
	}
};
