import { fail } from '@sveltejs/kit';
import { getRepo } from '$lib/server/data';
import { addStage, deleteStage, updateStage } from '$lib/server/operations';
import { failFrom } from '$lib/server/actions';
import { stagesWithPerformanceCount } from '$lib/server/views';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { stages: stagesWithPerformanceCount(await getRepo().get()) };
};

const field = (data: FormData, name: string) => data.get(name)?.toString().trim();

export const actions: Actions = {
	addStage: async ({ request }) => {
		const name = field(await request.formData(), 'name');
		if (!name) return fail(400, { error: 'Scenens namn krävs' });

		try {
			await getRepo().update((s) => addStage(s, name));
		} catch (e) {
			return failFrom(e);
		}
	},

	updateStage: async ({ request }) => {
		const data = await request.formData();
		const id = field(data, 'id');
		const name = field(data, 'name');
		if (!id || !name) return fail(400, { error: 'ID och namn krävs' });

		try {
			await getRepo().update((s) => updateStage(s, id, name));
		} catch (e) {
			return failFrom(e);
		}
	},

	deleteStage: async ({ request }) => {
		const id = field(await request.formData(), 'id');
		if (!id) return fail(400, { error: 'ID krävs' });

		try {
			await getRepo().update((s) => deleteStage(s, id));
		} catch (e) {
			return failFrom(e);
		}
	}
};
