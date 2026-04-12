import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { roles, shifts } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allRoles = await db
        .select({
            id: roles.id,
            name: roles.name,
            description: roles.description,
            shiftCount: sql<number>`count(${shifts.id})`
        })
        .from(roles)
        .leftJoin(shifts, eq(roles.id, shifts.roleId))
        .groupBy(roles.id)
        .orderBy(roles.name);

	return { roles: allRoles };
};

export const actions: Actions = {
	addRole: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString();
        const description = data.get('description')?.toString() || null;
		if (!name) return fail(400, { error: 'Rollnamn krävs' });
		
		try {
			await db.insert(roles).values({ name, description });
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

        // Protection: Check if role is in use
        const roleShifts = await db.select().from(shifts).where(eq(shifts.roleId, id)).limit(1);
        if (roleShifts.length > 0) {
            return fail(400, { error: 'Kan inte ta bort en roll som har inbokade arbetspass' });
        }

		await db.delete(roles).where(eq(roles.id, id));
	},

    updateRole: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
        const name = data.get('name')?.toString();
        const description = data.get('description')?.toString() || null;
        
		if (!id || !name) return fail(400, { error: 'ID och namn krävs' });
		
        try {
            await db.update(roles)
                .set({ name, description })
                .where(eq(roles.id, id));
        } catch (e: any) {
            if (e.message && e.message.includes('UNIQUE constraint failed')) {
                return fail(400, { error: 'En roll med det namnet finns redan' });
            }
			return fail(400, { error: 'Misslyckades att uppdatera roll' });
        }
    }
};
