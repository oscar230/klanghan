/**
 * Downscale an image in the browser before upload so it stays well under the
 * request payload limit. Output is WebP (keeps transparency). Never throws:
 * on any problem the original file is returned unchanged.
 */

const SMALL_FILE_BYTES = 300 * 1024;

type Decoded = {
    source: CanvasImageSource;
    width: number;
    height: number;
    close: () => void;
};

const decode = async (file: File): Promise<Decoded> => {
    if (typeof createImageBitmap === "function") {
        try {
            const bitmap = await createImageBitmap(file, {
                imageOrientation: "from-image",
            });
            return {
                source: bitmap,
                width: bitmap.width,
                height: bitmap.height,
                close: () => bitmap.close(),
            };
        } catch {
            // fall through to <img>
        }
    }

    const url = URL.createObjectURL(file);
    try {
        const img = new Image();
        img.decoding = "async";
        img.src = url;
        await img.decode();
        return {
            source: img,
            width: img.naturalWidth,
            height: img.naturalHeight,
            close: () => URL.revokeObjectURL(url),
        };
    } catch (err) {
        URL.revokeObjectURL(url);
        throw err;
    }
};

const toBlob = async (
    width: number,
    height: number,
    draw: (ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D) => void,
    quality: number,
): Promise<Blob | null> => {
    if (typeof OffscreenCanvas !== "undefined") {
        try {
            const canvas = new OffscreenCanvas(width, height);
            const ctx = canvas.getContext("2d");
            if (ctx) {
                draw(ctx);
                const blob = await canvas.convertToBlob({
                    type: "image/webp",
                    quality,
                });
                if (blob.type === "image/webp") return blob;
            }
        } catch {
            // fall through to document canvas
        }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    draw(ctx);
    const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", quality),
    );
    return blob && blob.type === "image/webp" ? blob : null;
};

export async function downscaleImage(
    file: File,
    maxEdge = 512,
    quality = 0.85,
): Promise<File> {
    try {
        if (!file.type.startsWith("image/") || file.type === "image/gif") {
            return file;
        }

        const decoded = await decode(file);
        try {
            const { source, width, height } = decoded;
            if (!width || !height) return file;

            const scale = Math.min(1, maxEdge / Math.max(width, height));
            if (scale === 1 && file.size < SMALL_FILE_BYTES) return file;

            const w = Math.max(1, Math.round(width * scale));
            const h = Math.max(1, Math.round(height * scale));

            const blob = await toBlob(
                w,
                h,
                (ctx) => {
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = "high";
                    ctx.drawImage(source, 0, 0, w, h);
                },
                quality,
            );
            if (!blob) return file;
            // Never make things worse for an image that was not resized.
            if (scale === 1 && blob.size >= file.size) return file;

            const baseName = file.name.replace(/\.[^./\\]+$/, "") || "image";
            return new File([blob], `${baseName}.webp`, { type: "image/webp" });
        } finally {
            decoded.close();
        }
    } catch {
        return file;
    }
}
