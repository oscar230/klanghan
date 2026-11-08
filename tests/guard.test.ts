import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAdminArea, isLoginRoute } from '../src/lib/server/guard';

test('admin routes are guarded however the URL is written', () => {
	assert.equal(isAdminArea('/admin', '/admin'), true);
	assert.equal(isAdminArea('/admin/volunteers', '/admin/volunteers'), true);
	assert.equal(isAdminArea('/admin/roles/abc/__data.json', '/admin/roles/[id]'), true);
	// SvelteKit routes on the decoded path, so a percent-encoded letter reaches the same page
	assert.equal(isAdminArea('/%61dmin/volunteers', '/admin/volunteers'), true);
	assert.equal(isAdminArea('/%61dmin/volunteers/__data.json', '/admin/volunteers'), true);
	assert.equal(isAdminArea('/%61dmin', '/admin'), true);
	// ...and also when no route matched (the decoded path is checked as well)
	assert.equal(isAdminArea('/%41dmin/anything', null), true);
	assert.equal(isAdminArea('/admin/anything', null), true);
});

test('public routes are not treated as admin', () => {
	assert.equal(isAdminArea('/', '/'), false);
	assert.equal(isAdminArea('/artists', '/artists'), false);
	assert.equal(isAdminArea('/uploads/a.png', '/uploads/[...file]'), false);
	assert.equal(isAdminArea('/administrator', null), false);
	assert.equal(isAdminArea('/%E0%A4%A', null), false); // malformed escape: no crash
});

test('only the login page is open', () => {
	assert.equal(isLoginRoute('/admin/login'), true);
	assert.equal(isLoginRoute('/admin'), false);
	assert.equal(isLoginRoute(null), false);
});
