import { DAYS, parseClockTime, parseOffset } from '../time';

/**
 * Reads the start and end fields of `WhenFields` (`startDay`, `startHour`, `startMinute` and the same for
 * `end`) into minute offsets. Returns an error message instead when they are invalid.
 */
export function parseWhen(data: FormData): { startOffset: number; endOffset: number } | { error: string } {
	const text = (name: string) => data.get(name)?.toString() ?? '';
	// Digits only: parseInt would accept "1abc" or "1.5", and a missing day must not silently become Friday
	const day = (name: string) => (/^\d{1,2}$/.test(text(name)) ? Number(text(name)) : NaN);

	const startDay = day('startDay');
	const endDay = day('endDay');
	// Something may end at 00:00 after the last day (the festival's end), so the end day can be one past DAYS
	const validDay = (d: number, last: number) => Number.isInteger(d) && d >= 0 && d <= last;
	if (!validDay(startDay, DAYS.length - 1) || !validDay(endDay, DAYS.length)) return { error: 'Ogiltig dag' };

	const clock = (prefix: string) => parseClockTime(`${text(`${prefix}Hour`)}:${text(`${prefix}Minute`)}`);
	const startTime = clock('start');
	const endTime = clock('end');
	if (startTime === null || endTime === null) return { error: 'Ogiltig tid' };

	return { startOffset: parseOffset(startDay, startTime), endOffset: parseOffset(endDay, endTime) };
}
