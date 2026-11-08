import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// /admin itself has no content; the volunteers page is the first tab
	throw redirect(303, '/admin/volunteers');
};
