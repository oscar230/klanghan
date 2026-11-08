import { DAYS, MINUTES_PER_DAY } from '../time';
import type { Performance, Schedule, Shift } from './store/types';

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, 'sv');
const byStart = (a: Shift, b: Shift) => a.startOffset - b.startOffset || a.endOffset - b.endOffset;

export function sortedUsers(s: Schedule) {
	return [...s.users].sort(byName);
}

export function sortedRoles(s: Schedule) {
	return [...s.roles].sort(byName);
}

/** Shifts joined with the user and role they refer to, in start order. */
export function shiftDetails(s: Schedule) {
	const users = new Map(s.users.map((u) => [u.id, u]));
	const roles = new Map(s.roles.map((r) => [r.id, r]));

	return [...s.shifts].sort(byStart).flatMap((shift) => {
		const user = users.get(shift.userId);
		const role = roles.get(shift.roleId);
		if (!user || !role) return [];
		return [
			{
				id: shift.id,
				userId: user.id,
				userName: user.name,
				roleId: role.id,
				imageUrl: user.imageUrl,
				roleName: role.name,
				roleDescription: role.description,
				roleIsSupervisor: role.isSupervisor,
				supervisorRoleId: role.supervisorRoleId,
				supervisorRoleName: roles.get(role.supervisorRoleId ?? '')?.name ?? null,
				startOffset: shift.startOffset,
				endOffset: shift.endOffset
			}
		];
	});
}

export function usersWithShiftCount(s: Schedule) {
	return sortedUsers(s).map((u) => ({
		...u,
		shiftCount: s.shifts.filter((sh) => sh.userId === u.id).length
	}));
}

export function rolesWithShiftCount(s: Schedule) {
	return sortedRoles(s).map((r) => ({
		...r,
		shiftCount: s.shifts.filter((sh) => sh.roleId === r.id).length,
		supervisorName: s.roles.find((x) => x.id === r.supervisorRoleId)?.name ?? null,
		/** The roles this one leads; while there are any, the role cannot be deleted. */
		subordinateNames: s.roles.filter((x) => x.supervisorRoleId === r.id).map((x) => x.name).sort((a, b) => a.localeCompare(b, 'sv'))
	}));
}

export function sortedStages(s: Schedule) {
	return [...s.stages].sort(byName);
}

export function stagesWithPerformanceCount(s: Schedule) {
	return sortedStages(s).map((st) => ({
		...st,
		performanceCount: s.performances.filter((p) => p.stageId === st.id).length
	}));
}

const byPerformanceStart = (a: Performance, b: Performance) => a.startOffset - b.startOffset || a.endOffset - b.endOffset;

/** Performances joined with their stage, in start order. */
export function performanceDetails(s: Schedule) {
	const stages = new Map(s.stages.map((st) => [st.id, st]));

	return [...s.performances].sort(byPerformanceStart).flatMap((p) => {
		const stage = stages.get(p.stageId);
		if (!stage) return [];
		return [{ ...p, stageName: stage.name }];
	});
}

export type TimelineItem =
	| { type: 'gap'; startOffset: number; endOffset: number }
	| ({ type: 'shift'; isOverlap: boolean } & ReturnType<typeof shiftDetails>[number]);

/** One role's shifts grouped by festival day, with gaps in coverage marked. */
export function roleTimeline(s: Schedule, roleId: string) {
	const shifts = shiftDetails(s).filter((sh) => sh.roleId === roleId);

	return DAYS.map((dayName, dayIndex) => {
		const dayStart = dayIndex * MINUTES_PER_DAY;
		const dayEnd = dayStart + MINUTES_PER_DAY;
		const items: TimelineItem[] = [];
		// A shift from an earlier day that runs into this day covers (and overlaps) the start of it
		const spill = Math.max(-1, ...shifts.filter((x) => x.startOffset < dayStart).map((x) => x.endOffset));
		let lastEnd = spill > dayStart ? spill : -1;

		for (const shift of shifts.filter((x) => x.startOffset >= dayStart && x.startOffset < dayEnd)) {
			// Only a gap when nothing at all covers the time between shifts
			if (lastEnd !== -1 && shift.startOffset > lastEnd) {
				items.push({ type: 'gap', startOffset: lastEnd, endOffset: shift.startOffset });
			}
			items.push({ type: 'shift', isOverlap: lastEnd !== -1 && shift.startOffset < lastEnd, ...shift });
			lastEnd = Math.max(lastEnd, shift.endOffset);
		}

		return { dayName, items };
	}).filter((day) => day.items.length > 0);
}
