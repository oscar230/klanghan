import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in environment payload!');
}

const client = postgres(env.DATABASE_URL);
export const db = drizzle(client, { schema });

export const runMigrations = async () => {
	console.log('Running automatic Postgres schemas migrations...');
	try {
	    await migrate(db, { migrationsFolder: './drizzle' });
	    console.log('Migrations complete.');
	} catch (e) {
	    console.error('Failed to run migrations', e);
	}
};
