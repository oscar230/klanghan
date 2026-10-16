import { error } from '@sveltejs/kit';
import { getRepo } from '$lib/server/data';
import { roleTimeline } from '$lib/server/views';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const schedule = await getRepo().get();

	const role = schedule.roles.find((r) => r.id === params.id);
	if (!role) throw error(404, 'Roll hittades inte');

	return { role, days: roleTimeline(schedule, role.id) };
};
