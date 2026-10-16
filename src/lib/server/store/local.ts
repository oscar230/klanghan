import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import {
	ConflictError,
	emptySchedule,
	normalizeSchedule,
	type Schedule,
	type Store,
	type StoredImage
} from './types';
import { mimeForFileName } from './mime';

/** Stores everything under a local directory. Used for development, demos and tests. */
export class LocalStore implements Store {
	private readonly scheduleFile: string;
	private readonly uploadDir: string;

	constructor(dataDir: string) {
		this.scheduleFile = path.join(dataDir, 'schedule.json');
		this.uploadDir = path.join(dataDir, 'uploads');
		fs.mkdirSync(this.uploadDir, { recursive: true });
	}

	private readRaw(): { text: string; etag: string } | null {
		try {
			const text = fs.readFileSync(this.scheduleFile, 'utf8');
			return { text, etag: createHash('sha1').update(text).digest('hex') };
		} catch (e: any) {
			if (e?.code === 'ENOENT') return null;
			throw e;
		}
	}

	async readSchedule(): Promise<{ schedule: Schedule; etag: string | null }> {
		const raw = this.readRaw();
		if (!raw) return { schedule: emptySchedule(), etag: null };
		return { schedule: normalizeSchedule(JSON.parse(raw.text)), etag: raw.etag };
	}

	// The read-compare-write below is synchronous, so it is atomic within one process.
	async writeSchedule(schedule: Schedule, etag: string | null): Promise<string> {
		const current = this.readRaw();
		if ((current?.etag ?? null) !== etag) throw new ConflictError();

		const text = JSON.stringify(schedule, null, 2);
		const tmp = `${this.scheduleFile}.${randomUUID()}.tmp`;
		fs.writeFileSync(tmp, text);
		fs.renameSync(tmp, this.scheduleFile);
		return createHash('sha1').update(text).digest('hex');
	}

	private imagePath(fileName: string) {
		return path.join(this.uploadDir, path.basename(fileName));
	}

	async putImage(fileName: string, data: Uint8Array): Promise<void> {
		await fs.promises.writeFile(this.imagePath(fileName), data);
	}

	async getImage(fileName: string): Promise<StoredImage | null> {
		const contentType = mimeForFileName(fileName);
		if (!contentType) return null;
		try {
			return { data: await fs.promises.readFile(this.imagePath(fileName)), contentType };
		} catch (e: any) {
			if (e?.code === 'ENOENT') return null;
			throw e;
		}
	}

	async deleteImage(fileName: string): Promise<void> {
		await fs.promises.rm(this.imagePath(fileName), { force: true });
	}
}
