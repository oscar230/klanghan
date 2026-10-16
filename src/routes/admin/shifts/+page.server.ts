import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { shifts, users, roles } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { DAYS, HOURS, QUARTERS, parseOffset } from '$lib/time';
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
        
        const getVal = (name: string) => data.get(name)?.toString() || '00';
        const getDayVal = (name: string) => parseInt(data.get(name)?.toString() || '0', 10);

        const userId = data.get('userId')?.toString();
        const roleId = data.get('roleId')?.toString();
        
        if (!userId || !roleId) {
            return fail(400, { error: 'Volontär och roll krävs' });
        }

        if (
            !HOURS.includes(getVal('startHour')) || !HOURS.includes(getVal('endHour')) ||
            !QUARTERS.includes(getVal('startMinute')) || !QUARTERS.includes(getVal('endMinute'))
        ) {
            return fail(400, { error: 'Ogiltig tid' });
        }

        // Parse start and end times
        const startTime = `${getVal('startHour')}:${getVal('startMinute')}`;
        const endTime = `${getVal('endHour')}:${getVal('endMinute')}`;
        
        const startDay = getDayVal('startDay');
        const endDay = getDayVal('endDay');
        const validDay = (d: number) => Number.isInteger(d) && d >= 0 && d < DAYS.length;
        if (!validDay(startDay) || !validDay(endDay)) {
            return fail(400, { error: 'Ogiltig dag' });
        }

        const startOffset = parseOffset(startDay, startTime);
        const endOffset = parseOffset(endDay, endTime);
        if (!Number.isFinite(startOffset) || !Number.isFinite(endOffset)) {
            return fail(400, { error: 'Ogiltig tid' });
        }

        if (endOffset <= startOffset) {
             return fail(400, { error: 'Sluttid måste vara efter starttid' });
        }
        
        try {
            await db.insert(shifts).values({
                userId,
                roleId,
                startOffset,
                endOffset
            });
        } catch (e: any) {
            if (e?.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
                return fail(400, { error: 'Volontären eller rollen finns inte' });
            }
            console.error('Failed to add shift', e);
            return fail(500, { error: 'Misslyckades att spara arbetspasset' });
        }
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
        
        try {
            await db.update(shifts).set({ userId }).where(eq(shifts.id, shiftId));
        } catch (e: any) {
            if (e?.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
                return fail(400, { error: 'Volontären finns inte' });
            }
            throw e;
        }
    }
};
