import { DAYS } from './time';

const MINUTES_PER_DAY = 24 * 60;

/** What the calendar draws: a work shift or an artist's performance. */
export interface CalendarEvent {
	id: string;
	kind: 'shift' | 'performance';
	/** The volunteer's or the artist's name. */
	title: string;
	/** The role, or the stage and genre. */
	subtitle: string;
	/** Volunteer photo; performances have none. */
	imageUrl: string | null;
	/** The volunteer a shift belongs to, so their shifts can be highlighted. */
	userId: string | null;
	startOffset: number;
	endOffset: number;
}

export const shiftEvent = (s: {
	id: string;
	userId: string;
	userName: string;
	roleName: string;
	imageUrl: string | null;
	startOffset: number;
	endOffset: number;
}): CalendarEvent => ({
	id: s.id,
	kind: 'shift',
	title: s.userName,
	subtitle: s.roleName,
	imageUrl: s.imageUrl,
	userId: s.userId,
	startOffset: s.startOffset,
	endOffset: s.endOffset
});

export const performanceEvent = (p: {
	id: string;
	artist: string;
	genre: string;
	stageName: string;
	startOffset: number;
	endOffset: number;
}): CalendarEvent => ({
	id: p.id,
	kind: 'performance',
	title: p.artist,
	subtitle: `${p.stageName} · ${p.genre}`,
	imageUrl: null,
	userId: null,
	startOffset: p.startOffset,
	endOffset: p.endOffset
});

interface Timed {
	startOffset: number;
	endOffset: number;
}

/** One event as drawn in one day column. An event that crosses midnight has one segment per day. */
export interface Segment<T extends Timed> {
	item: T;
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
		.map((item) => ({
			item,
			start: Math.max(item.startOffset, dayStart) - dayStart,
			end: Math.min(item.endOffset, dayEnd) - dayStart,
			continuesFromPreviousDay: item.startOffset < dayStart,
			continuesIntoNextDay: item.endOffset > dayEnd,
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
