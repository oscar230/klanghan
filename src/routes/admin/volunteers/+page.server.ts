import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { shifts, users } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { UploadError, deleteImageFile, saveImage } from '$lib/server/uploads';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allUsers = await db
		.select({
			id: users.id,
			name: users.name,
			imageUrl: users.imageUrl,
			shiftCount: sql<number>`count(${shifts.id})`
		})
		.from(users)
		.leftJoin(shifts, eq(users.id, shifts.userId))
		.groupBy(users.id)
		.orderBy(users.name);

	return { users: allUsers };
};

export const actions: Actions = {
	addUser: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString();

		if (!name?.trim()) return fail(400, { error: 'Namn krävs' });

		let imageUrl: string | null;
		try {
			imageUrl = await saveImage(data.get('imageFile'));
		} catch (e) {
			if (e instanceof UploadError) return fail(400, { error: e.message });
			throw e;
		}

		try {
			await db.insert(users).values({ name: name.trim(), imageUrl });
		} catch (e: any) {
			deleteImageFile(imageUrl);
			if (e.message && e.message.includes('UNIQUE constraint failed')) {
				return fail(400, { error: 'En volontär med det namnet finns redan' });
			}
			return fail(400, { error: 'Misslyckades att lägga till volontär' });
		}
	},
	updateUser: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) return fail(400, { error: 'ID krävs' });

		// Fetch current user to get old image URL
		const currentUser = await db.select().from(users).where(eq(users.id, id)).get();
		if (!currentUser) return fail(404, { error: 'Volontären hittades inte' });
		const oldImageUrl = currentUser.imageUrl || null;

		let imageUrl: string | null;
		try {
			imageUrl = await saveImage(data.get('imageFile'));
		} catch (e) {
			if (e instanceof UploadError) return fail(400, { error: e.message });
			throw e;
		}

		if (imageUrl) {
			await db.update(users).set({ imageUrl }).where(eq(users.id, id));
			// Cleanup the old file if it was replaced
			deleteImageFile(oldImageUrl);
		}
	},
	removeImage: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID krävs' });

		const currentUser = await db.select().from(users).where(eq(users.id, id)).get();
		const oldImageUrl = currentUser?.imageUrl || null;

		await db.update(users).set({ imageUrl: null }).where(eq(users.id, id));
		deleteImageFile(oldImageUrl);
	},
	deleteUser: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID krävs' });

		// Protection: Check if user has shifts
		const userShifts = await db.select().from(shifts).where(eq(shifts.userId, id)).limit(1);
		if (userShifts.length > 0) {
			return fail(400, { error: 'Kan inte ta bort en volontär som har inbokade arbetspass' });
		}

		// Get image URL before deleting database record
		const currentUser = await db.select().from(users).where(eq(users.id, id)).get();
		const imageUrl = currentUser?.imageUrl || null;

		await db.delete(users).where(eq(users.id, id));

		// Cleanup the file
		deleteImageFile(imageUrl);
	}
};

