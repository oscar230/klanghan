export interface User {
	id: string;
	name: string;
	imageUrl: string | null;
}

export interface Role {
	id: string;
	name: string;
	description: string | null;
	/**
	 * A supervisor role leads other roles and can only be held by one person at a time.
	 * Ordinary roles can have any number of people.
	 */
	isSupervisor: boolean;
	/**
	 * The supervisor role that leads this one, e.g. "Säkerhetsansvarig" for "Trygghetsvärd".
	 * Must be a supervisor role, and a supervisor role cannot itself have one.
	 */
	supervisorRoleId: string | null;
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
	const stored: Array<Partial<Role> & Pick<Role, 'id'>> = Array.isArray(r.roles) ? r.roles : [];
	const ids = new Set(stored.map((role) => role.id));
	const led = new Set(stored.map((role) => role.supervisorRoleId).filter((id) => id && ids.has(id)));

	const roles: Role[] = stored.map((role) => {
		// Links saved before roles had the flag: whatever is led by a role makes it a supervisor role
		const isSupervisor = role.isSupervisor ?? led.has(role.id);
		// Keep the rules true for hand-edited data too: the leading role must exist, and a supervisor role is not led
		const supervisorRoleId = !isSupervisor && role.supervisorRoleId && ids.has(role.supervisorRoleId) ? role.supervisorRoleId : null;
		return { name: '', description: null, ...role, isSupervisor, supervisorRoleId };
	});

	return {
		version: 1,
		users: Array.isArray(r.users) ? r.users : [],
		roles,
		shifts: Array.isArray(r.shifts) ? r.shifts : []
	};
}
