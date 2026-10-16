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
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('busy_timeout = 5000');

export const db = drizzle(sqlite, { schema });


export const runMigrations = async () => {
	console.log('Running automatic SQLite schemas migrations...');
	try {
	    // Ensure we use an absolute path for Docker and bundled environments
	    const migrationsPath = path.resolve(process.cwd(), 'drizzle');
	    migrate(db, { migrationsFolder: migrationsPath });
	    console.log('Migrations complete.');
	} catch (e) {
	    console.error('Failed to run migrations', e);
	    throw e;
	}
};

