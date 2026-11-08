import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findConflicts, type ConflictCheckShift } from '../src/lib/conflicts';

let n = 0;
const shift = (userId: string, roleId: string, start: number, end: number, roleIsSupervisor = false): ConflictCheckShift => ({
	id: `s${++n}`,
	userId,
	roleId,
	roleName: roleId,
	roleIsSupervisor,
	startOffset: start,
	endOffset: end
});

test('conflicts: a volunteer booked twice at the same time conflicts on both shifts', () => {
	const a = shift('u1', 'bar', 600, 720);
	const b = shift('u1', 'kök', 660, 780);
	const c = shift('u1', 'bar', 780, 840); // starts when b ends: fine
	const found = findConflicts([a, b, c]);
	assert.deepEqual(found.get(a.id), ['double-booked']);
	assert.deepEqual(found.get(b.id), ['double-booked']);
	assert.equal(found.has(c.id), false);
});

test('conflicts: ordinary roles can have many people at once', () => {
	const found = findConflicts([shift('u1', 'bar', 600, 720), shift('u2', 'bar', 600, 720), shift('u3', 'bar', 630, 700)]);
	assert.equal(found.size, 0);
});

test('conflicts: a supervisor role can only be held by one person at a time', () => {
	const a = shift('u1', 'chef', 600, 720, true);
	const b = shift('u2', 'chef', 700, 800, true);
	const later = shift('u3', 'chef', 800, 900, true);
	const found = findConflicts([a, b, later]);
	assert.deepEqual(found.get(a.id), ['supervisor-taken']);
	assert.deepEqual(found.get(b.id), ['supervisor-taken']);
	assert.equal(found.has(later.id), false);
});

test('conflicts: both reasons can apply to one shift', () => {
	const a = shift('u1', 'chef', 600, 720, true);
	const b = shift('u2', 'chef', 600, 720, true);
	const c = shift('u1', 'bar', 600, 720);
	const found = findConflicts([a, b, c]);
	assert.deepEqual(found.get(a.id), ['double-booked', 'supervisor-taken']);
	assert.deepEqual(found.get(c.id), ['double-booked']);
});
