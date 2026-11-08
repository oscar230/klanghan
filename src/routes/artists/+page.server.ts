import { getRepo } from '$lib/server/data';
import { performanceDetails, shiftDetails, sortedStages, sortedUsers } from '$lib/server/views';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const schedule = await getRepo().get();

	return {
		stages: sortedStages(schedule),
		performances: performanceDetails(schedule),
		// The calendar can show the work shifts too
		shifts: shiftDetails(schedule),
		users: sortedUsers(schedule),
		// The calendar needs more room than the list
		wide: url.searchParams.get('view') === 'calendar'
	};
};
