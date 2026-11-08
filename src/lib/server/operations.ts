import { randomUUID } from 'node:crypto';
import { DAYS } from '../time';
import type { Role, Schedule, Shift, User } from './store/types';

/** A user-facing validation problem. `status` is the HTTP status to answer with. */
export class DomainError extends Error {
	constructor(
		message: string,
		readonly status = 400
	) {
		super(message);
	}
}

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
const MINUTES_PER_DAY = 24 * 60;

export function addUser(s: Schedule, name: string, imageUrl: string | null): User {
	if (s.users.some((u) => sameName(u.name, name))) {
		throw new DomainError('En volontär med det namnet finns redan');
	}
	const user: User = { id: randomUUID(), name, imageUrl };
	s.users.push(user);
	return user;
}

function findUser(s: Schedule, id: string): User {
	const user = s.users.find((u) => u.id === id);
	if (!user) throw new DomainError('Volontären hittades inte', 404);
	return user;
}

/** Sets (or clears, with null) a user's image. Returns the previous image URL. */
export function setUserImage(s: Schedule, id: string, imageUrl: string | null): string | null {
	const user = findUser(s, id);
	const previous = user.imageUrl;
	user.imageUrl = imageUrl;
	return previous;
}

/** Returns the removed user's image URL so the caller can delete the file. */
export function deleteUser(s: Schedule, id: string): string | null {
	const user = findUser(s, id);
	if (s.shifts.some((sh) => sh.userId === id)) {
		throw new DomainError('Kan inte ta bort en volontär som har inbokade arbetspass');
	}
	s.users = s.users.filter((u) => u.id !== id);
	return user.imageUrl;
}

/** A role may be led by one other role. Rejects unknown roles and links that would make roles lead each other. */
function checkSupervisor(s: Schedule, roleId: string, supervisorRoleId: string | null) {
	if (!supervisorRoleId) return;
	if (supervisorRoleId === roleId) throw new DomainError('En roll kan inte vara sin egen överordnade');

	const byId = new Map(s.roles.map((r) => [r.id, r]));
	if (!byId.has(supervisorRoleId)) throw new DomainError('Den överordnade rollen finns inte');

	// Walking up from the supervisor must never reach the role itself
	const seen = new Set<string>();
	for (let id: string | null = supervisorRoleId; id && !seen.has(id); id = byId.get(id)?.supervisorRoleId ?? null) {
		if (id === roleId) throw new DomainError('Rollerna skulle leda varandra i en cirkel');
		seen.add(id);
	}
}

export function addRole(
	s: Schedule,
	name: string,
	description: string | null,
	supervisorRoleId: string | null = null
): Role {
	if (s.roles.some((r) => sameName(r.name, name))) {
		throw new DomainError('En roll med det namnet finns redan');
	}
	const role: Role = { id: randomUUID(), name, description, supervisorRoleId };
	checkSupervisor(s, role.id, supervisorRoleId);
	s.roles.push(role);
	return role;
}

export function updateRole(
	s: Schedule,
	id: string,
	name: string,
	description: string | null,
	supervisorRoleId: string | null
) {
	const role = s.roles.find((r) => r.id === id);
	if (!role) throw new DomainError('Rollen hittades inte', 404);
	if (s.roles.some((r) => r.id !== id && sameName(r.name, name))) {
		throw new DomainError('En roll med det namnet finns redan');
	}
	checkSupervisor(s, id, supervisorRoleId);
	role.name = name;
	role.description = description;
	role.supervisorRoleId = supervisorRoleId;
}

export function deleteRole(s: Schedule, id: string) {
	if (s.shifts.some((sh) => sh.roleId === id)) {
		throw new DomainError('Kan inte ta bort en roll som har inbokade arbetspass');
	}
	if (s.roles.some((r) => r.supervisorRoleId === id)) {
		throw new DomainError('Kan inte ta bort en roll som leder andra roller. Ta bort kopplingen först.');
	}
	s.roles = s.roles.filter((r) => r.id !== id);
}

type ShiftInput = Omit<Shift, 'id'>;

function checkShift(s: Schedule, { userId, roleId, startOffset, endOffset }: ShiftInput) {
	if (!s.users.some((u) => u.id === userId) || !s.roles.some((r) => r.id === roleId)) {
		throw new DomainError('Volontären eller rollen finns inte');
	}
	if (!Number.isInteger(startOffset) || !Number.isInteger(endOffset) || startOffset < 0) {
		throw new DomainError('Ogiltig tid');
	}
	if (endOffset > DAYS.length * MINUTES_PER_DAY) throw new DomainError('Ogiltig tid');
	if (endOffset <= startOffset) throw new DomainError('Sluttid måste vara efter starttid');
}

export function addShift(s: Schedule, input: ShiftInput): Shift {
	checkShift(s, input);
	const shift: Shift = { id: randomUUID(), ...input };
	s.shifts.push(shift);
	return shift;
}

/** Replaces every attribute of a shift (volunteer, role and times). */
export function updateShift(s: Schedule, id: string, input: ShiftInput) {
	const shift = s.shifts.find((sh) => sh.id === id);
	if (!shift) throw new DomainError('Arbetspasset hittades inte', 404);
	checkShift(s, input);
	Object.assign(shift, input);
}

export function deleteShift(s: Schedule, id: string) {
	s.shifts = s.shifts.filter((sh) => sh.id !== id);
}
