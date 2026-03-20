import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allUsers = await db.select().from(users).orderBy(users.name);
	return { users: allUsers };
};

export const actions: Actions = {
	addUser: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString();
		if (!name) return fail(400, { error: 'Namn krävs' });
		
		try {
			await db.insert(users).values({ name });
		} catch (e: any) {
            if (e.message && e.message.includes('UNIQUE constraint failed')) {
                return fail(400, { error: 'En volontär med det namnet finns redan' });
            }
			return fail(400, { error: 'Misslyckades att lägga till volontär' });
		}
	},
	deleteUser: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID krävs' });
		await db.delete(users).where(eq(users.id, id));
	}
};
