import { redirect, type Handle } from '@sveltejs/kit';
import { SESSION_COOKIE, verifySessionToken } from '$lib/server/auth';
import { isAdminArea, isLoginRoute } from '$lib/server/guard';

const LOGIN_PATH = '/admin/login';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.isAdmin = verifySessionToken(event.cookies.get(SESSION_COOKIE));

	// Guard everything under /admin here (pages, __data.json and form actions),
	// since layout load functions do not run for form action requests.
	const routeId = event.route.id;
	if (isAdminArea(event.url.pathname, routeId) && !event.locals.isAdmin && !isLoginRoute(routeId)) {
		throw redirect(303, LOGIN_PATH);
	}

	return resolve(event);
};
