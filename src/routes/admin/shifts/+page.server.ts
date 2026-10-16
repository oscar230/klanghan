import { fail } from '@sveltejs/kit';
import { getRepo } from '$lib/server/data';
import { addShift, deleteShift, reassignShift } from '$lib/server/operations';
import { failFrom } from '$lib/server/actions';
import { shiftDetails, sortedRoles, sortedUsers } from '$lib/server/views';
import { DAYS, HOURS, QUARTERS, parseOffset } from '$lib/time';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const schedule = await getRepo().get();

	return {
		users: sortedUsers(schedule),
		roles: sortedRoles(schedule),
		shifts: shiftDetails(schedule)
	};
};

export const actions: Actions = {
	addShift: async ({ request }) => {
		const data = await request.formData();

		const text = (name: string, fallback = '') => data.get(name)?.toString() || fallback;
		const day = (name: string) => parseInt(text(name, '0'), 10);

		const userId = text('userId');
		const roleId = text('roleId');
		if (!userId || !roleId) return fail(400, { error: 'Volontär och roll krävs' });

		const startDay = day('startDay');
		const endDay = day('endDay');
		const validDay = (d: number) => Number.isInteger(d) && d >= 0 && d < DAYS.length;
		if (!validDay(startDay) || !validDay(endDay)) return fail(400, { error: 'Ogiltig dag' });

		const [startHour, startMinute] = [text('startHour', '00'), text('startMinute', '00')];
		const [endHour, endMinute] = [text('endHour', '00'), text('endMinute', '00')];
		if (
			!HOURS.includes(startHour) || !HOURS.includes(endHour) ||
			!QUARTERS.includes(startMinute) || !QUARTERS.includes(endMinute)
		) {
			return fail(400, { error: 'Ogiltig tid' });
		}

		try {
			await getRepo().update((s) =>
				addShift(s, {
					userId,
					roleId,
					startOffset: parseOffset(startDay, `${startHour}:${startMinute}`),
					endOffset: parseOffset(endDay, `${endHour}:${endMinute}`)
				})
			);
		} catch (e) {
			return failFrom(e);
		}
	},

	deleteShift: async ({ request }) => {
		const id = (await request.formData()).get('id')?.toString();
		if (!id) return fail(400, { error: 'Ogiltigt ID' });

		try {
			await getRepo().update((s) => deleteShift(s, id));
		} catch (e) {
			return failFrom(e);
		}
	},

	updateShiftUser: async ({ request }) => {
		const data = await request.formData();
		const shiftId = data.get('shiftId')?.toString();
		const userId = data.get('userId')?.toString();
		if (!shiftId || !userId) return fail(400, { error: 'Ogiltig förfrågan' });

		try {
			await getRepo().update((s) => reassignShift(s, shiftId, userId));
		} catch (e) {
			return failFrom(e);
		}
	}
};
