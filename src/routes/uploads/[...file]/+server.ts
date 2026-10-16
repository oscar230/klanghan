import { error } from '@sveltejs/kit';
import fs from 'node:fs';
import path from 'node:path';
import { UPLOAD_DIR, mimeForFile } from '$lib/server/uploads';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	if (!params.file) throw error(400, 'Saknar filnamn');

	// Security: Prevent directory traversal
	const safeFileName = path.basename(params.file);
	const contentType = mimeForFile(safeFileName);
	if (!contentType) throw error(404, 'Filen hittades inte');

	try {
		const fileBuffer = await fs.promises.readFile(path.join(UPLOAD_DIR, safeFileName));
		return new Response(new Uint8Array(fileBuffer), {
			headers: {
				'Content-Type': contentType,
				'X-Content-Type-Options': 'nosniff',
				'Content-Security-Policy': "default-src 'none'; sandbox",
				'Cache-Control': 'public, max-age=31536000, immutable'
			}
		});
	} catch (e: any) {
		if (e?.code === 'ENOENT') throw error(404, 'Filen hittades inte');
		console.error('Failed to read upload', e);
		throw error(500, 'Fel vid läsning av fil');
	}
};
