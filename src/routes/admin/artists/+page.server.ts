import { fail } from '@sveltejs/kit';
import { getRepo } from '$lib/server/data';
import { addPerformance, deletePerformance, updatePerformance } from '$lib/server/operations';
import { failFrom } from '$lib/server/actions';
import { parseWhen } from '$lib/server/forms';
import { performanceDetails, sortedStages } from '$lib/server/views';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const schedule = await getRepo().get();

	return {
		stages: sortedStages(schedule),
		performances: performanceDetails(schedule)
	};
};

/** Reads the performance form. Returns an error message instead when it is invalid. */
function parsePerformanceForm(data: FormData) {
	const text = (name: string) => data.get(name)?.toString().trim() ?? '';
	const stageId = text('stageId');
	const artist = text('artist');
	const genre = text('genre');
	if (!artist) return { error: 'Artistens namn krävs' };
	if (!genre) return { error: 'Genre krävs' };
	if (!stageId) return { error: 'Scen krävs' };

	const when = parseWhen(data);
	if ('error' in when) return when;

	return { performance: { stageId, artist, genre, ...when } };
}

export const actions: Actions = {
	addPerformance: async ({ request }) => {
		const parsed = parsePerformanceForm(await request.formData());
		if ('error' in parsed) return fail(400, { error: parsed.error });
		const { performance } = parsed;

		try {
			await getRepo().update((s) => addPerformance(s, performance));
		} catch (e) {
			return failFrom(e);
		}
	},

	updatePerformance: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { error: 'Ogiltigt ID' });

		const parsed = parsePerformanceForm(data);
		if ('error' in parsed) return fail(400, { error: parsed.error });
		const { performance } = parsed;

		try {
			await getRepo().update((s) => updatePerformance(s, id, performance));
		} catch (e) {
			return failFrom(e);
		}
	},

	deletePerformance: async ({ request }) => {
		const id = (await request.formData()).get('id')?.toString();
		if (!id) return fail(400, { error: 'Ogiltigt ID' });

		try {
			await getRepo().update((s) => deletePerformance(s, id));
		} catch (e) {
			return failFrom(e);
		}
	}
};
