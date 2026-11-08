import { fail } from '@sveltejs/kit';
import { getRepo } from '$lib/server/data';
import { addShift, deleteShift, updateShift } from '$lib/server/operations';
import { failFrom } from '$lib/server/actions';
import { performanceDetails, shiftDetails, sortedRoles, sortedUsers } from '$lib/server/views';
import { parseWhen } from '$lib/server/forms';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const schedule = await getRepo().get();

	return {
		users: sortedUsers(schedule),
		roles: sortedRoles(schedule),
		shifts: shiftDetails(schedule),
		performances: performanceDetails(schedule)
	};
};

/** Reads the shift form (volunteer, role, start and end). Returns an error message instead when it is invalid. */
function parseShiftForm(data: FormData) {
	const userId = data.get('userId')?.toString() ?? '';
	const roleId = data.get('roleId')?.toString() ?? '';
	if (!userId || !roleId) return { error: 'Volontär och roll krävs' };

	const when = parseWhen(data);
	if ('error' in when) return when;

	return { shift: { userId, roleId, ...when } };
}

export const actions: Actions = {
	addShift: async ({ request }) => {
		const parsed = parseShiftForm(await request.formData());
		if ('error' in parsed) return fail(400, { error: parsed.error });
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
		if ('error' in parsed) return fail(400, { error: parsed.error });
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
