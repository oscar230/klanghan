import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layoutDay } from '../src/lib/calendar';

const shift = (id: string, startOffset: number, endOffset: number) => ({ id, startOffset, endOffset });
const placement = (shifts: ReturnType<typeof shift>[], day = 0) =>
	layoutDay(shifts, day).map((s) => `${s.shift.id}:${s.lane}/${s.lanes}`);

test('calendar: shifts that do not overlap use the full width', () => {
	// Touching shifts (one ends when the next starts) do not overlap
	assert.deepEqual(placement([shift('a', 60, 120), shift('b', 120, 180)]), ['a:0/1', 'b:0/1']);
});

test('calendar: overlapping shifts are placed side by side', () => {
	assert.deepEqual(placement([shift('a', 60, 180), shift('b', 120, 240)]), ['a:0/2', 'b:1/2']);
});

test('calendar: a chain of overlaps shares one lane count and reuses free lanes', () => {
	// a-b and b-c overlap but a and c do not, so c can go back to lane 0
	assert.deepEqual(
		placement([shift('a', 0, 60), shift('b', 30, 90), shift('c', 60, 120)]),
		['a:0/2', 'b:1/2', 'c:0/2']
	);
});

test('calendar: separate clusters are sized independently', () => {
	assert.deepEqual(
		placement([shift('a', 0, 60), shift('b', 0, 60), shift('c', 300, 360)]),
		['a:0/2', 'b:1/2', 'c:0/1']
	);
});

test('calendar: a shift across midnight is split over both days', () => {
	const night = shift('n', 22 * 60, 26 * 60); // Friday 22:00 - Saturday 02:00
	const [friday] = layoutDay([night], 0);
	const [saturday] = layoutDay([night], 1);
	assert.deepEqual([friday.start, friday.end, friday.continuesIntoNextDay, friday.continuesFromPreviousDay], [1320, 1440, true, false]);
	assert.deepEqual([saturday.start, saturday.end, saturday.continuesIntoNextDay, saturday.continuesFromPreviousDay], [0, 120, false, true]);
	assert.equal(layoutDay([night], 2).length, 0);
});
