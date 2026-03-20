import { db } from '$lib/server/db';
import { users, shifts } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const allUsers = await db.select().from(users).orderBy(users.name);
    
    // Join shifts with users to get names mapped natively
    const allShifts = await db
        .select({
            id: shifts.id,
            userId: shifts.userId,
            userName: users.name,
            role: shifts.role,
            startTime: shifts.startTime,
            endTime: shifts.endTime
        })
        .from(shifts)
        .innerJoin(users, eq(shifts.userId, users.id))
        .orderBy(shifts.startTime);
        
    return {
        users: allUsers,
        shifts: allShifts
    };
};
