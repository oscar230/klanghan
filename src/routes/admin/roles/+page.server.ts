import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { roles } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allRoles = await db.select().from(roles).orderBy(roles.name);
	return { roles: allRoles };
};

export const actions: Actions = {
	addRole: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString();
		if (!name) return fail(400, { error: 'Rollnamn krävs' });
		
		try {
			await db.insert(roles).values({ name });
		} catch (e: any) {
            if (e.message && e.message.includes('UNIQUE constraint failed')) {
                return fail(400, { error: 'En roll med det namnet finns redan' });
            }
			return fail(400, { error: 'Misslyckades att lägga till roll' });
		}
	},
	deleteRole: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID krävs' });
		await db.delete(roles).where(eq(roles.id, id));
	}
};
