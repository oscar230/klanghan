export interface User {
	id: string;
	name: string;
	imageUrl: string | null;
}

export interface Role {
	id: string;
	name: string;
	description: string | null;
}

export interface Shift {
	id: string;
	userId: string;
	roleId: string;
	startOffset: number;
	endOffset: number;
}

/** The whole dataset. It is stored as a single JSON document. */
export interface Schedule {
	version: 1;
	users: User[];
	roles: Role[];
	shifts: Shift[];
}

export const emptySchedule = (): Schedule => ({ version: 1, users: [], roles: [], shifts: [] });

/** Thrown by Store.writeSchedule when the document changed since it was read. */
export class ConflictError extends Error {
	constructor() {
		super('The schedule was modified by someone else');
	}
}

export interface StoredImage {
	data: Uint8Array;
	contentType: string;
}

export interface Store {
	/** etag is null when no schedule has been stored yet. */
	readSchedule(): Promise<{ schedule: Schedule; etag: string | null }>;
	/**
	 * Writes the schedule only if it is still at `etag` (null = must not exist yet).
	 * Throws ConflictError otherwise. Returns the new etag.
	 */
	writeSchedule(schedule: Schedule, etag: string | null): Promise<string>;
	putImage(fileName: string, data: Uint8Array, contentType: string): Promise<void>;
	getImage(fileName: string): Promise<StoredImage | null>;
	deleteImage(fileName: string): Promise<void>;
}

/** Fills in anything missing so older or hand-edited documents still load. */
export function normalizeSchedule(raw: unknown): Schedule {
	const r = (raw ?? {}) as Partial<Schedule>;
	return {
		version: 1,
		users: Array.isArray(r.users) ? r.users : [],
		roles: Array.isArray(r.roles) ? r.roles : [],
		shifts: Array.isArray(r.shifts) ? r.shifts : []
	};
}
