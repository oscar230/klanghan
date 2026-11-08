import { fail } from '@sveltejs/kit';
import { getRepo } from '$lib/server/data';
import { addShift, deleteShift, updateShift } from '$lib/server/operations';
import { failFrom } from '$lib/server/actions';
import { shiftDetails, sortedRoles, sortedUsers } from '$lib/server/views';
import { DAYS, parseClockTime, parseOffset } from '$lib/time';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const schedule = await getRepo().get();

	return {
		users: sortedUsers(schedule),
		roles: sortedRoles(schedule),
		shifts: shiftDetails(schedule),
		// The calendar needs more room than the list
		wide: url.searchParams.get('view') === 'calendar'
	};
};

/** Reads the shift form (volunteer, role, start and end). Returns an error message instead when it is invalid. */
function parseShiftForm(data: FormData) {
	const text = (name: string, fallback = '') => data.get(name)?.toString() || fallback;
	const day = (name: string) => parseInt(text(name, '0'), 10);

	const userId = text('userId');
	const roleId = text('roleId');
	if (!userId || !roleId) return { error: 'Volontär och roll krävs' };

	const startDay = day('startDay');
	const endDay = day('endDay');
	// A shift may end at 00:00 after the last day (the festival's end), so the end day can be one past DAYS
	const validDay = (d: number, last: number) => Number.isInteger(d) && d >= 0 && d <= last;
	if (!validDay(startDay, DAYS.length - 1) || !validDay(endDay, DAYS.length)) return { error: 'Ogiltig dag' };

	const clock = (prefix: string) => parseClockTime(`${text(`${prefix}Hour`)}:${text(`${prefix}Minute`)}`);
	const startTime = clock('start');
	const endTime = clock('end');
	if (startTime === null || endTime === null) return { error: 'Ogiltig tid' };

	return {
		shift: {
			userId,
			roleId,
			startOffset: parseOffset(startDay, startTime),
			endOffset: parseOffset(endDay, endTime)
		}
	};
}

export const actions: Actions = {
	addShift: async ({ request }) => {
		const parsed = parseShiftForm(await request.formData());
		if (!parsed.shift) return fail(400, { error: parsed.error });
		const { shift } = parsed;

		try {
			await getRepo().update((s) => addShift(s, shift));
		} catch (e) {
			return failFrom(e);
		}
	},

	updateShift: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { error: 'Ogiltigt ID' });

		const parsed = parseShiftForm(data);
		if (!parsed.shift) return fail(400, { error: parsed.error });
		const { shift } = parsed;

		try {
			await getRepo().update((s) => updateShift(s, id, shift));
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
	}
};
