/** The parts of a shift needed to tell whether it can actually be worked. */
export interface ConflictCheckShift {
	id: string;
	userId: string;
	roleId: string;
	roleName: string;
	roleIsSupervisor: boolean;
	startOffset: number;
	endOffset: number;
}

export type ConflictReason = 'double-booked' | 'supervisor-taken';

const overlaps = (a: ConflictCheckShift, b: ConflictCheckShift) =>
	a.startOffset < b.endOffset && a.endOffset > b.startOffset;

/**
 * Finds the shifts that are impossible as scheduled:
 * - the volunteer is booked on another shift at the same time, or
 * - the shift is in a supervisor role, which only one person can hold at a time,
 *   and someone else holds it during the same time.
 * Returns the reasons per shift id; shifts without a problem are not in the map.
 */
export function findConflicts(shifts: ConflictCheckShift[]): Map<string, ConflictReason[]> {
	const found = new Map<string, ConflictReason[]>();
	const add = (id: string, reason: ConflictReason) => found.set(id, [...(found.get(id) ?? []), reason]);

	for (const shift of shifts) {
		const others = shifts.filter((other) => other.id !== shift.id && overlaps(shift, other));
		if (others.some((other) => other.userId === shift.userId)) add(shift.id, 'double-booked');
		if (shift.roleIsSupervisor && others.some((other) => other.roleId === shift.roleId && other.userId !== shift.userId)) {
			add(shift.id, 'supervisor-taken');
		}
	}
	return found;
}

/** Plain-language explanations (Swedish) of the reasons for one shift. */
export function describeConflicts(reasons: ConflictReason[], roleName: string): string[] {
	return reasons.map((reason) =>
		reason === 'double-booked'
			? 'Volontären är bokad på ett annat pass samtidigt.'
			: `${roleName} är en ledande roll som bara kan innehas av en person åt gången, men någon annan har den samtidigt.`
	);
}
