/** One person and all of their (overlapping) shifts. */
export interface PersonShifts<T> {
	userId: string;
	userName: string;
	imageUrl: string | null;
	shifts: T[];
}

/** Groups shifts by volunteer, in the order each volunteer first appears. */
export function groupByPerson<T extends { userId: string; userName: string; imageUrl: string | null }>(
	shifts: T[]
): PersonShifts<T>[] {
	const people = new Map<string, PersonShifts<T>>();
	for (const shift of shifts) {
		const person = people.get(shift.userId);
		if (person) person.shifts.push(shift);
		else people.set(shift.userId, { userId: shift.userId, userName: shift.userName, imageUrl: shift.imageUrl, shifts: [shift] });
	}
	return [...people.values()];
}
