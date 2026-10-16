import 'dotenv/config';
import { createStore } from '../src/lib/server/store';
import { createRepository } from '../src/lib/server/repository';

/** Opens whatever storage the environment points at, and says which one. */
export function open(args: string[]) {
	const store = createStore(process.env);
	const kind = store.constructor.name === 'S3Store' ? `S3 bucket ${process.env.S3_BUCKET}` : `local folder ${process.env.DATA_DIR || 'data'}`;

	// Guard against filling a real deployment with fake people.
	if (store.constructor.name === 'S3Store' && !args.includes('--allow-s3')) {
		console.error(`Refusing to touch ${kind} without --allow-s3.`);
		process.exit(1);
	}
	console.log(`Using ${kind}`);
	return { store, repo: createRepository(store) };
}
