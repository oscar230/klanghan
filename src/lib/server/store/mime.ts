const MIME_BY_EXT: Record<string, string> = {
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.webp': 'image/webp'
};

/** Only the raster image types we accept for upload; anything else is not served. */
export function mimeForFileName(fileName: string): string | undefined {
	const dot = fileName.lastIndexOf('.');
	return dot === -1 ? undefined : MIME_BY_EXT[fileName.slice(dot).toLowerCase()];
}
