import { randomUUID } from 'node:crypto';
import type { Store } from './store/types';

// Lambda caps a request at 6 MB including base64 overhead, which leaves about 4.5 MB of
// file. The admin UI downscales photos in the browser, so this is only a backstop.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export class UploadError extends Error {}

type ImageType = { ext: string; mime: string };

/** Identifies an image by its magic bytes; the client-supplied name and type are not trusted. */
function sniffImage(b: Buffer): ImageType | null {
	if (b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
		return { ext: '.png', mime: 'image/png' };
	}
	if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
		return { ext: '.jpg', mime: 'image/jpeg' };
	}
	if (b.length >= 6 && ['GIF87a', 'GIF89a'].includes(b.subarray(0, 6).toString('ascii'))) {
		return { ext: '.gif', mime: 'image/gif' };
	}
	if (
		b.length >= 12 &&
		b.subarray(0, 4).toString('ascii') === 'RIFF' &&
		b.subarray(8, 12).toString('ascii') === 'WEBP'
	) {
		return { ext: '.webp', mime: 'image/webp' };
	}
	return null;
}

/**
 * Stores an uploaded image and returns its public URL, or null when no file
 * was submitted. Throws UploadError for files that are too large or not images.
 */
export async function saveImage(
	store: Store,
	file: FormDataEntryValue | null
): Promise<string | null> {
	if (!(file instanceof File) || file.size === 0) return null;
	if (file.size > MAX_UPLOAD_BYTES) {
		throw new UploadError('Bilden är för stor (max 4 MB)');
	}

	const buffer = Buffer.from(await file.arrayBuffer());
	const type = sniffImage(buffer);
	if (!type) {
		throw new UploadError('Filen måste vara en bild (PNG, JPEG, GIF eller WebP)');
	}

	const fileName = `${randomUUID()}${type.ext}`;
	await store.putImage(fileName, buffer, type.mime);
	return `/uploads/${fileName}`;
}

/** Best effort: a leftover file is harmless, a failed request is not. */
export async function deleteImageFile(store: Store, imageUrl: string | null | undefined) {
	if (!imageUrl?.startsWith('/uploads/')) return;
	try {
		await store.deleteImage(imageUrl.slice('/uploads/'.length));
	} catch (e) {
		console.error(`Failed to delete image ${imageUrl}`, e);
	}
}
