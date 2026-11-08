import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatClock, formatOffset, formatShiftTime, groupByStartDay, parseClockTime } from '../src/lib/time';
import { parseWhen } from '../src/lib/server/forms';

const form = (fields: Record<string, string>) => {
	const data = new FormData();
	for (const [key, value] of Object.entries(fields)) data.set(key, value);
	return data;
};
const when = (extra: Record<string, string> = {}) =>
	form({ startDay: '0', startHour: '10', startMinute: '00', endDay: '0', endHour: '12', endMinute: '30', ...extra });

test('times are shown with a 24-hour clock and the right day, also at the festival end', () => {
	assert.equal(formatClock(22 * 60 + 5), '22:05');
	assert.equal(formatOffset(0), 'Fredag 00:00');
	assert.equal(formatOffset(2 * 1440 + 22 * 60), 'Söndag 22:00');
	assert.equal(formatOffset(3 * 1440), 'Måndag 00:00');
	assert.equal(formatShiftTime(600, 750), 'Fredag 10:00 - 12:30 (2h 30m)');
	assert.equal(formatShiftTime(2 * 1440 + 22 * 60, 3 * 1440), 'Söndag 22:00 - Måndag 00:00 (2h)');
});

test('parseClockTime only accepts HH:MM', () => {
	assert.equal(parseClockTime('09:30'), 570);
	for (const bad of ['', '9:30', '24:00', '12:60', '12:5', ' 12:00', '12:00:00', 'ab:cd']) assert.equal(parseClockTime(bad), null, bad);
});

test('parseWhen turns day and clock fields into offsets', () => {
	assert.deepEqual(parseWhen(when({ endDay: '3', endHour: '00', endMinute: '00' })), { startOffset: 600, endOffset: 3 * 1440 });
	assert.deepEqual(parseWhen(when({ startDay: '2' })), { startOffset: 2 * 1440 + 600, endOffset: 750 });
});

test('parseWhen rejects loose or missing input instead of guessing', () => {
	const badDays: Array<Record<string, string>> = [{ startDay: '1abc' }, { startDay: '1.5' }, { startDay: '' }, { startDay: '3' }, { startDay: '-1' }, { endDay: '4' }];
	for (const bad of badDays) {
		assert.deepEqual(parseWhen(when(bad)), { error: 'Ogiltig dag' }, JSON.stringify(bad));
	}
	const missing = when();
	missing.delete('endDay');
	assert.deepEqual(parseWhen(missing), { error: 'Ogiltig dag' });
	const badTimes: Array<Record<string, string>> = [{ startHour: '24' }, { endMinute: '60' }, { startHour: '' }, { endMinute: '5' }];
	for (const bad of badTimes) {
		assert.deepEqual(parseWhen(when(bad)), { error: 'Ogiltig tid' }, JSON.stringify(bad));
	}
});

test('groupByStartDay keeps only days that have items', () => {
	const days = groupByStartDay([{ startOffset: 2 * 1440 + 5 }, { startOffset: 10 }, { startOffset: 20 }]);
	assert.deepEqual(days.map((d) => [d.name, d.items.length]), [['Fredag', 2], ['Söndag', 1]]);
});
