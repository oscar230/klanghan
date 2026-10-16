import { fail } from '@sveltejs/kit';
import { getRepo } from '$lib/server/data';
import { addUser, deleteUser, setUserImage } from '$lib/server/operations';
import { failFrom } from '$lib/server/actions';
import { deleteImageFile, saveImage } from '$lib/server/uploads';
import { usersWithShiftCount } from '$lib/server/views';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { users: usersWithShiftCount(await getRepo().get()) };
};

export const actions: Actions = {
	addUser: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString().trim();
		if (!name) return fail(400, { error: 'Namn krävs' });

		const { store, update } = getRepo();
		let imageUrl: string | null = null;
		try {
			imageUrl = await saveImage(store, data.get('imageFile'));
			await update((s) => addUser(s, name, imageUrl));
		} catch (e) {
			await deleteImageFile(store, imageUrl); // don't leave an orphan behind
			return failFrom(e);
		}
	},

	updateUser: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID krävs' });

		const { store, update } = getRepo();
		let imageUrl: string | null = null;
		try {
			imageUrl = await saveImage(store, data.get('imageFile'));
			if (!imageUrl) return; // nothing was uploaded
			const previous = await update((s) => setUserImage(s, id, imageUrl));
			await deleteImageFile(store, previous);
		} catch (e) {
			await deleteImageFile(store, imageUrl);
			return failFrom(e);
		}
	},

	removeImage: async ({ request }) => {
		const id = (await request.formData()).get('id')?.toString();
		if (!id) return fail(400, { error: 'ID krävs' });

		const { store, update } = getRepo();
		try {
			const previous = await update((s) => setUserImage(s, id, null));
			await deleteImageFile(store, previous);
		} catch (e) {
			return failFrom(e);
		}
	},

	deleteUser: async ({ request }) => {
		const id = (await request.formData()).get('id')?.toString();
		if (!id) return fail(400, { error: 'ID krävs' });

		const { store, update } = getRepo();
		try {
			const imageUrl = await update((s) => deleteUser(s, id));
			await deleteImageFile(store, imageUrl);
		} catch (e) {
			return failFrom(e);
		}
	}
};
