import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const auth = cookies.get('admin_auth');
	if (!auth && url.pathname !== '/admin/login') {
		throw redirect(303, '/admin/login');
	}
	return {
		authenticated: !!auth
	};
};
