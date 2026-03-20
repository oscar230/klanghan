import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import fs from 'fs';
import path from 'path';

if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in environment payload!');
}

const dbPath = env.DATABASE_URL;
if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

export const runMigrations = async () => {
	console.log('Running automatic SQLite schemas migrations...');
	try {
	    // SQLite migrate is synchronous in better-sqlite3, but wrapper handles it
	    migrate(db, { migrationsFolder: './drizzle' });
	    console.log('Migrations complete.');
	} catch (e) {
	    console.error('Failed to run migrations', e);
	}
};
