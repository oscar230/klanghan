import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { roles, shifts, users } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { DAYS } from '$lib/time';

export const load: PageServerLoad = async ({ params }) => {
	const roleId = params.id;

	const role = await db.select().from(roles).where(eq(roles.id, roleId)).get();
	if (!role) throw error(404, 'Roll hittades inte');

	const allShifts = await db
		.select({
			id: shifts.id,
			userId: shifts.userId,
			userName: users.name,
			userImageUrl: users.imageUrl,
			startOffset: shifts.startOffset,
			endOffset: shifts.endOffset
		})
		.from(shifts)
		.innerJoin(users, eq(shifts.userId, users.id))
		.where(eq(shifts.roleId, roleId))
		.orderBy(shifts.startOffset);

    // Group shifts and detect gaps
    // We'll process each day separately
    const daysData = DAYS.map((dayName, dayIndex) => {
        const dayStart = dayIndex * 24 * 60;
        const dayEnd = (dayIndex + 1) * 24 * 60;

        const dayShifts = allShifts.filter(s => 
            s.startOffset >= dayStart && s.startOffset < dayEnd
        );

        if (dayShifts.length === 0) return { dayName, items: [] };

        const items: any[] = [];
        let lastEnd = -1;

        // Sort by startOffset just in case, though the query orders them
        const sortedShifts = [...dayShifts].sort((a, b) => a.startOffset - b.startOffset);

        for (const shift of sortedShifts) {
            // If this is the first shift or there's a gap
            if (lastEnd !== -1 && shift.startOffset > lastEnd) {
                items.push({
                    type: 'gap',
                    startOffset: lastEnd,
                    endOffset: shift.startOffset
                });
            }
            
            items.push({
                type: 'shift',
                ...shift
            });

            lastEnd = Math.max(lastEnd, shift.endOffset);
        }

        return { dayName, items };
    });

	return {
		role,
		days: daysData.filter(d => d.items.length > 0)
	};
};
