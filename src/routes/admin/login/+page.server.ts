import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const password = data.get('password');
		
		if (password === env.ADMIN_PASSWORD) {
			cookies.set('admin_auth', 'true', {
				path: '/',
				httpOnly: true,
				secure: import.meta.env.PROD,
				maxAge: 60 * 60 * 24 * 7 // 1 week
			});
			throw redirect(303, '/admin');
		}

		return fail(401, { error: 'Invalid password' });
	}
};
