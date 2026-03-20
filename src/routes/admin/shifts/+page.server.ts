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
            userId: shifts.userId,
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
        const startHour = data.get('startHour')?.toString() || '00';
        const startMinute = data.get('startMinute')?.toString() || '00';
        const startTime = `${startHour}:${startMinute}`;

        const endDay = parseInt(data.get('endDay')?.toString() || '0');
        const endHour = data.get('endHour')?.toString() || '00';
        const endMinute = data.get('endMinute')?.toString() || '00';
        const endTime = `${endHour}:${endMinute}`;
        
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
        
        if (!id) return fail(400, { error: 'Ogiltigt ID' });
        
        await db.delete(shifts).where(eq(shifts.id, id));
    },
    
    updateShiftUser: async ({ request }) => {
        const data = await request.formData();
        const shiftId = data.get('shiftId')?.toString();
        const userId = data.get('userId')?.toString();
        
        if (!shiftId || !userId) {
            return fail(400, { error: 'Ogiltig förfrågan' });
        }
        
        await db.update(shifts).set({ userId }).where(eq(shifts.id, shiftId));
    }
};
