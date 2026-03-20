import { building } from '$app/environment';
import { runMigrations } from '$lib/server/db';

if (!building) {
	runMigrations().catch(console.error);
}
