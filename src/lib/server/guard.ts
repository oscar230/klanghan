/**
 * Decides whether a request belongs to the admin area. This must not be fooled by how the URL is
 * written: SvelteKit routes on the *decoded* path, so `/%61dmin/volunteers` reaches the page
 * `/admin/volunteers`. The matched route is the truth; the decoded path covers requests that match
 * no route (they would 404, but are guarded anyway).
 */
export function isAdminArea(pathname: string, routeId: string | null): boolean {
	const isAdminRoute = (id: string) => id === '/admin' || id.startsWith('/admin/');
	if (routeId !== null && isAdminRoute(routeId)) return true;

	let decoded = pathname;
	try {
		decoded = decodeURI(pathname);
	} catch {
		// Malformed escapes cannot match a route
	}
	return isAdminRoute(decoded.toLowerCase());
}

/** The login page is the only admin page reachable without a session. */
export const isLoginRoute = (routeId: string | null) => routeId === '/admin/login';
