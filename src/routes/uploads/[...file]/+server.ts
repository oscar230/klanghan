import { error } from '@sveltejs/kit';
import { getRepo } from '$lib/server/data';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	// Files are stored flat; anything with a path separator is not one of ours.
	const fileName = params.file;
	if (!fileName || fileName.includes('/') || fileName.includes('\\')) {
		throw error(404, 'Filen hittades inte');
	}

	const image = await getRepo().store.getImage(fileName);
	if (!image) throw error(404, 'Filen hittades inte');

	return new Response(new Uint8Array(image.data), {
		headers: {
			'Content-Type': image.contentType,
			'X-Content-Type-Options': 'nosniff',
			'Content-Security-Policy': "default-src 'none'; sandbox",
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
};
