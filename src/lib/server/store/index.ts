import { LocalStore } from './local';
import { S3Store } from './s3';
import type { Store } from './types';

export * from './types';
export { LocalStore, S3Store };

type Env = Record<string, string | undefined>;

/**
 * Picks the storage backend from the environment:
 *   STORAGE=local  files under DATA_DIR (default ./data)
 *   STORAGE=s3     objects in S3_BUCKET
 * When unset, AWS Lambda uses S3 and everything else uses local files.
 */
export function createStore(env: Env): Store {
	const kind = env.STORAGE ?? (env.AWS_LAMBDA_FUNCTION_NAME ? 's3' : 'local');

	if (kind === 's3') {
		if (!env.S3_BUCKET) throw new Error('STORAGE=s3 requires S3_BUCKET to be set');
		return new S3Store(env.S3_BUCKET);
	}
	if (kind === 'local') {
		if (env.AWS_LAMBDA_FUNCTION_NAME) {
			throw new Error('STORAGE=local cannot be used on Lambda: its filesystem is ephemeral');
		}
		return new LocalStore(env.DATA_DIR || 'data');
	}
	throw new Error(`Unknown STORAGE "${kind}" (expected "local" or "s3")`);
}
