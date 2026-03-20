import { db } from '$lib/server/db';
import { shifts, users, roles } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const allUsers = await db.select().from(users).orderBy(users.name);
    
    // Join shifts mapping textual tables locally
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
        shifts: allShifts
    };
};
