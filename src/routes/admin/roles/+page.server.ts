import { fail } from '@sveltejs/kit';
import { getRepo } from '$lib/server/data';
import { addRole, deleteRole, updateRole } from '$lib/server/operations';
import { failFrom } from '$lib/server/actions';
import { rolesWithShiftCount } from '$lib/server/views';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { roles: rolesWithShiftCount(await getRepo().get()) };
};

const field = (data: FormData, name: string) => data.get(name)?.toString().trim();

export const actions: Actions = {
	addRole: async ({ request }) => {
		const data = await request.formData();
		const name = field(data, 'name');
		const description = field(data, 'description') || null;
		if (!name) return fail(400, { error: 'Rollnamn krävs' });

		try {
			await getRepo().update((s) => addRole(s, name, description));
		} catch (e) {
			return failFrom(e);
		}
	},

	deleteRole: async ({ request }) => {
		const id = field(await request.formData(), 'id');
		if (!id) return fail(400, { error: 'ID krävs' });

		try {
			await getRepo().update((s) => deleteRole(s, id));
		} catch (e) {
			return failFrom(e);
		}
	},

	updateRole: async ({ request }) => {
		const data = await request.formData();
		const id = field(data, 'id');
		const name = field(data, 'name');
		const description = field(data, 'description') || null;
		if (!id || !name) return fail(400, { error: 'ID och namn krävs' });

		try {
			await getRepo().update((s) => updateRole(s, id, name, description));
		} catch (e) {
			return failFrom(e);
		}
	}
};
