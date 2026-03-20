import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    // Monolithic index redirects to specialized modules
	throw redirect(303, '/admin/volunteers');
};
