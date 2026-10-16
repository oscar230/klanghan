import { building } from '$app/environment';
import { redirect, type Handle } from '@sveltejs/kit';
import { runMigrations } from '$lib/server/db';
import { SESSION_COOKIE, verifySessionToken } from '$lib/server/auth';

if (!building) {
	// Don't serve traffic against a database whose schema could not be brought up to date.
	runMigrations().catch(() => process.exit(1));
}

const LOGIN_PATH = '/admin/login';

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;
	const isAdminArea = pathname === '/admin' || pathname.startsWith('/admin/');

	event.locals.isAdmin = verifySessionToken(event.cookies.get(SESSION_COOKIE));

	// Guard everything under /admin here (pages, __data.json and form actions),
	// since layout load functions do not run for form action requests.
	if (isAdminArea && !event.locals.isAdmin && pathname !== LOGIN_PATH) {
		throw redirect(303, LOGIN_PATH);
	}

	return resolve(event);
};
