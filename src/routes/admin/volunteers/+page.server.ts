import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import { sql } from 'drizzle-orm';
import { shifts } from '$lib/server/db/schema';

const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
	fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

async function saveImage(file: File): Promise<string | null> {
	if (!file || file.size === 0 || !(file instanceof File)) return null;

	const ext = path.extname(file.name) || '.png';
	const fileName = `${randomUUID()}${ext}`;
	const filePath = path.join(UPLOAD_DIR, fileName);

	const arrayBuffer = await file.arrayBuffer();
	fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

	return `/uploads/${fileName}`;
}

function deleteImageFile(imageUrl: string | null) {
	if (!imageUrl || !imageUrl.startsWith('/uploads/')) return;

	const fileName = path.basename(imageUrl);
	const filePath = path.join(UPLOAD_DIR, fileName);

	try {
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
	} catch (e) {
		console.error(`Failed to delete image file: ${filePath}`, e);
	}
}

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
		const imageFile = data.get('imageFile') as File;

		if (!name) return fail(400, { error: 'Namn krävs' });

		const imageUrl = await saveImage(imageFile);

		try {
			await db.insert(users).values({ name, imageUrl });
		} catch (e: any) {
			if (e.message && e.message.includes('UNIQUE constraint failed')) {
				return fail(400, { error: 'En volontär med det namnet finns redan' });
			}
			return fail(400, { error: 'Misslyckades att lägga till volontär' });
		}
	},
	updateUser: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const imageFile = data.get('imageFile') as File;

		if (!id) return fail(400, { error: 'ID krävs' });

		// Fetch current user to get old image URL
		const currentUser = await db.select().from(users).where(eq(users.id, id)).get();
		const oldImageUrl = currentUser?.imageUrl || null;

		const imageUrl = await saveImage(imageFile);

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

