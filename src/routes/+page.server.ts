import { getRepo } from '$lib/server/data';
import { performanceDetails, shiftDetails, sortedUsers } from '$lib/server/views';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const schedule = await getRepo().get();

	return {
		users: sortedUsers(schedule),
		shifts: shiftDetails(schedule),
		performances: performanceDetails(schedule)
	};
};
