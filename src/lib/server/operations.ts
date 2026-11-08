import { randomUUID } from 'node:crypto';
import { DAYS } from '../time';
import type { Performance, Role, Schedule, Shift, Stage, User } from './store/types';

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

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;

/**
 * Cleans up text typed by an admin: Unicode NFC (so "é" typed two ways is the same name), invisible
 * zero-width characters removed, trimmed, and limited in length. `what` names the field in error messages.
 */
function cleanText(value: string, what: string, max = MAX_NAME_LENGTH): string {
	const cleaned = value.normalize('NFC').replace(/[\u200B-\u200D\u2060\uFEFF]/g, '').trim();
	if (!cleaned) throw new DomainError(`${what} krävs`);
	if (cleaned.length > max) throw new DomainError(`${what} får vara högst ${max} tecken`);
	return cleaned;
}

const cleanDescription = (value: string | null) =>
	value === null || !value.trim() ? null : cleanText(value, 'Beskrivningen', MAX_DESCRIPTION_LENGTH);
const MINUTES_PER_DAY = 24 * 60;

export function addUser(s: Schedule, rawName: string, imageUrl: string | null): User {
	const name = cleanText(rawName, 'Namn');
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

export interface RoleInput {
	name: string;
	description: string | null;
	isSupervisor: boolean;
	supervisorRoleId: string | null;
}

/**
 * Supervisor rules: only a supervisor role can lead other roles (any number of them), a role has at
 * most one supervisor, and a supervisor role cannot itself be led. So there are never chains or loops.
 */
function checkSupervisor(s: Schedule, id: string, { isSupervisor, supervisorRoleId }: RoleInput) {
	if (supervisorRoleId) {
		if (supervisorRoleId === id) throw new DomainError('En roll kan inte vara sin egen ledare');
		if (isSupervisor) throw new DomainError('En ledande roll kan inte ledas av en annan roll');
		const leader = s.roles.find((r) => r.id === supervisorRoleId);
		if (!leader) throw new DomainError('Den ledande rollen finns inte');
		if (!leader.isSupervisor) throw new DomainError('Rollen som leder måste vara markerad som ledande roll');
	}
	if (!isSupervisor && s.roles.some((r) => r.supervisorRoleId === id)) {
		throw new DomainError('Rollen leder andra roller och måste vara en ledande roll. Ta bort kopplingarna först.');
	}
}

export function addRole(s: Schedule, raw: RoleInput): Role {
	const input = { ...raw, name: cleanText(raw.name, 'Rollnamn'), description: cleanDescription(raw.description) };
	if (s.roles.some((r) => sameName(r.name, input.name))) {
		throw new DomainError('En roll med det namnet finns redan');
	}
	const role: Role = { id: randomUUID(), ...input };
	checkSupervisor(s, role.id, input);
	s.roles.push(role);
	return role;
}

export function updateRole(s: Schedule, id: string, raw: RoleInput) {
	const role = s.roles.find((r) => r.id === id);
	if (!role) throw new DomainError('Rollen hittades inte', 404);
	const input = { ...raw, name: cleanText(raw.name, 'Rollnamn'), description: cleanDescription(raw.description) };
	if (s.roles.some((r) => r.id !== id && sameName(r.name, input.name))) {
		throw new DomainError('En roll med det namnet finns redan');
	}
	checkSupervisor(s, id, input);
	Object.assign(role, input);
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

function checkTimes(startOffset: number, endOffset: number) {
	if (!Number.isInteger(startOffset) || !Number.isInteger(endOffset) || startOffset < 0) {
		throw new DomainError('Ogiltig tid');
	}
	if (endOffset > DAYS.length * MINUTES_PER_DAY) throw new DomainError('Ogiltig tid');
	if (endOffset <= startOffset) throw new DomainError('Sluttid måste vara efter starttid');
}

function checkShift(s: Schedule, { userId, roleId, startOffset, endOffset }: ShiftInput) {
	if (!s.users.some((u) => u.id === userId) || !s.roles.some((r) => r.id === roleId)) {
		throw new DomainError('Volontären eller rollen finns inte');
	}
	checkTimes(startOffset, endOffset);
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

export function addStage(s: Schedule, rawName: string): Stage {
	const name = cleanText(rawName, 'Scenens namn');
	if (s.stages.some((st) => sameName(st.name, name))) throw new DomainError('En scen med det namnet finns redan');
	const stage: Stage = { id: randomUUID(), name };
	s.stages.push(stage);
	return stage;
}

export function updateStage(s: Schedule, id: string, rawName: string) {
	const stage = s.stages.find((st) => st.id === id);
	if (!stage) throw new DomainError('Scenen hittades inte', 404);
	const name = cleanText(rawName, 'Scenens namn');
	if (s.stages.some((st) => st.id !== id && sameName(st.name, name))) {
		throw new DomainError('En scen med det namnet finns redan');
	}
	stage.name = name;
}

export function deleteStage(s: Schedule, id: string) {
	if (s.performances.some((p) => p.stageId === id)) {
		throw new DomainError('Kan inte ta bort en scen som har inbokade artister');
	}
	s.stages = s.stages.filter((st) => st.id !== id);
}

export type PerformanceInput = Omit<Performance, 'id'>;

/** Checks a performance and returns it with the texts cleaned up. */
function checkPerformance(s: Schedule, input: PerformanceInput): PerformanceInput {
	if (!s.stages.some((st) => st.id === input.stageId)) throw new DomainError('Scenen finns inte');
	const artist = cleanText(input.artist, 'Artistens namn');
	const genre = cleanText(input.genre, 'Genre');
	checkTimes(input.startOffset, input.endOffset);
	return { ...input, artist, genre };
}

export function addPerformance(s: Schedule, input: PerformanceInput): Performance {
	const performance: Performance = { id: randomUUID(), ...checkPerformance(s, input) };
	s.performances.push(performance);
	return performance;
}

export function updatePerformance(s: Schedule, id: string, input: PerformanceInput) {
	const performance = s.performances.find((p) => p.id === id);
	if (!performance) throw new DomainError('Spelningen hittades inte', 404);
	Object.assign(performance, checkPerformance(s, input));
}

export function deletePerformance(s: Schedule, id: string) {
	s.performances = s.performances.filter((p) => p.id !== id);
}
