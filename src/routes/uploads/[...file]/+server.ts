import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'node:fs';
import path from 'node:path';

export const GET: RequestHandler = async ({ params }) => {
    const fileName = params.file;
    if (!fileName) throw error(400, 'Saknar filnamn');

    // Security: Prevent directory traversal
    const safeFileName = path.basename(fileName);
    const filePath = path.join(process.cwd(), 'data', 'uploads', safeFileName);

    if (!fs.existsSync(filePath)) {
        throw error(404, 'Filen hittades inte');
    }

    try {
        const fileBuffer = fs.readFileSync(filePath);
        
        // Determine mime type based on extension
        const ext = path.extname(safeFileName).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.png') contentType = 'image/png';
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        if (ext === '.gif') contentType = 'image/gif';
        if (ext === '.webp') contentType = 'image/webp';
        if (ext === '.svg') contentType = 'image/svg+xml';

        return new Response(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable'
            }
        });
    } catch (e) {
        throw error(500, 'Fel vid läsning av fil');
    }
};
