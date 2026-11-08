import { DAYS } from './time';

const MINUTES_PER_DAY = 24 * 60;

/** What the calendar shows about a shift (a subset of the shift read model). */
export interface CalendarShift {
	id: string;
	userId: string;
	userName: string;
	roleName: string;
	imageUrl: string | null;
	startOffset: number;
	endOffset: number;
}

interface Timed {
	startOffset: number;
	endOffset: number;
}

/** One shift as drawn in one day column. A shift that crosses midnight has one segment per day. */
export interface Segment<T extends Timed> {
	shift: T;
	/** Minutes from midnight of that day. */
	start: number;
	end: number;
	continuesFromPreviousDay: boolean;
	continuesIntoNextDay: boolean;
	/** Side-by-side placement among shifts that overlap in time: this is column `lane` of `lanes`. */
	lane: number;
	lanes: number;
}

/**
 * Lays out the shifts of one festival day the way a calendar does: shifts that
 * overlap in time are placed side by side, sharing the width of the day.
 */
export function layoutDay<T extends Timed>(shifts: T[], dayIndex: number): Segment<T>[] {
	const dayStart = dayIndex * MINUTES_PER_DAY;
	const dayEnd = dayStart + MINUTES_PER_DAY;

	const segments: Segment<T>[] = shifts
		.filter((s) => s.startOffset < dayEnd && s.endOffset > dayStart)
		.map((shift) => ({
			shift,
			start: Math.max(shift.startOffset, dayStart) - dayStart,
			end: Math.min(shift.endOffset, dayEnd) - dayStart,
			continuesFromPreviousDay: shift.startOffset < dayStart,
			continuesIntoNextDay: shift.endOffset > dayEnd,
			lane: 0,
			lanes: 1
		}))
		.sort((a, b) => a.start - b.start || b.end - a.end);

	// A cluster is a run of shifts connected by overlaps; its members share the same lane count.
	let cluster: Segment<T>[] = [];
	let laneEnds: number[] = [];
	let clusterEnd = 0;

	const closeCluster = () => {
		for (const segment of cluster) segment.lanes = laneEnds.length;
		cluster = [];
		laneEnds = [];
	};

	for (const segment of segments) {
		if (cluster.length > 0 && segment.start >= clusterEnd) closeCluster();

		let lane = laneEnds.findIndex((end) => end <= segment.start);
		if (lane === -1) lane = laneEnds.length;
		laneEnds[lane] = segment.end;

		segment.lane = lane;
		cluster.push(segment);
		clusterEnd = Math.max(clusterEnd, segment.end);
	}
	closeCluster();

	return segments;
}

/** All festival days with their laid out shifts. */
export function layoutDays<T extends Timed>(shifts: T[]) {
	return DAYS.map((name, dayIndex) => ({ name, segments: layoutDay(shifts, dayIndex) }));
}
