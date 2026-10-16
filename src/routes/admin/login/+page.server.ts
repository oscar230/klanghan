import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import {
	SESSION_COOKIE,
	SESSION_MAX_AGE,
	checkPassword,
	clearAttempts,
	createSessionToken,
	isRateLimited,
	recordFailedAttempt
} from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.isAdmin) throw redirect(303, '/admin');
};

export const actions: Actions = {
	default: async ({ request, cookies, getClientAddress }) => {
		if (!env.ADMIN_PASSWORD) {
			return fail(500, { error: 'Server misconfigured: ADMIN_PASSWORD not set' });
		}

		const client = getClientAddress();
		if (isRateLimited(client)) {
			return fail(429, { error: 'För många försök. Försök igen senare.' });
		}

		const data = await request.formData();
		const password = data.get('password')?.toString() ?? '';

		if (!checkPassword(password)) {
			recordFailedAttempt(client);
			return fail(401, { error: 'Ogiltigt lösenord' });
		}

		clearAttempts(client);
		cookies.set(SESSION_COOKIE, createSessionToken(), {
			path: '/',
			httpOnly: true,
			secure: !import.meta.env.DEV,
			sameSite: 'lax',
			maxAge: SESSION_MAX_AGE
		});
		throw redirect(303, '/admin');
	}
};
