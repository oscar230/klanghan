import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE } from '$lib/server/auth';
import type { RequestHandler } from './$types';

// POST only, so that a link or a prefetch can never log anyone out
export const POST: RequestHandler = async ({ cookies }) => {
	cookies.delete(SESSION_COOKIE, { path: '/' });
	throw redirect(303, '/');
};
