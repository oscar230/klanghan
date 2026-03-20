import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { shifts, users, roles } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { parseOffset } from '$lib/time';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const allUsers = await db.select().from(users).orderBy(users.name);
    const allRoles = await db.select().from(roles).orderBy(roles.name);
    
    // Join shifts
    const allShifts = await db
        .select({
            id: shifts.id,
            userName: users.name,
            roleName: roles.name,
            startOffset: shifts.startOffset,
            endOffset: shifts.endOffset
        })
        .from(shifts)
        .innerJoin(users, eq(shifts.userId, users.id))
        .innerJoin(roles, eq(shifts.roleId, roles.id))
        .orderBy(shifts.startOffset);
        
    return {
        users: allUsers,
        roles: allRoles,
        shifts: allShifts
    };
};

export const actions: Actions = {
    addShift: async ({ request }) => {
        const data = await request.formData();
        const userId = data.get('userId')?.toString();
        const roleId = data.get('roleId')?.toString();
        const startDay = parseInt(data.get('startDay')?.toString() || '0');
        const startTime = data.get('startTime')?.toString();
        const endDay = parseInt(data.get('endDay')?.toString() || '0');
        const endTime = data.get('endTime')?.toString();
        
        if (!userId || !roleId || !startTime || !endTime) {
            return fail(400, { error: 'Alla fält krävs' });
        }
        
        const startOffset = parseOffset(startDay, startTime);
        const endOffset = parseOffset(endDay, endTime);
        
        if (endOffset <= startOffset) {
             return fail(400, { error: 'Sluttid måste vara efter starttid' });
        }
        
        await db.insert(shifts).values({
            userId,
            roleId,
            startOffset,
            endOffset
        });
    },
    
    deleteShift: async ({ request }) => {
        const data = await request.formData();
        const id = data.get('id')?.toString();
        
        if (!id) return fail(400, { error: 'ID krävs' });
        await db.delete(shifts).where(eq(shifts.id, id));
    }
};
