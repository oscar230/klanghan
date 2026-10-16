import { ConflictError, type Schedule, type Store } from './store/types';
import { DomainError } from './operations';

const MAX_ATTEMPTS = 10;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Read/modify/write access to the schedule. `update` re-reads and retries when
 * another writer got in between, so concurrent admins never lose each other's edits.
 */
export function createRepository(store: Store) {
	return {
		async get(): Promise<Schedule> {
			return (await store.readSchedule()).schedule;
		},

		/**
		 * Applies `mutate` to a fresh copy of the schedule and saves it. If `mutate`
		 * throws (e.g. a DomainError), nothing is written.
		 */
		async update<T>(mutate: (schedule: Schedule) => T): Promise<T> {
			for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
				const { schedule, etag } = await store.readSchedule();
				const result = mutate(schedule);
				try {
					await store.writeSchedule(schedule, etag);
					return result;
				} catch (e) {
					if (!(e instanceof ConflictError)) throw e;
					// Jittered backoff so contenders stop colliding in lockstep
					await sleep(Math.random() * 25 * (attempt + 1));
				}
			}
			throw new DomainError('Schemat ändrades samtidigt av någon annan. Försök igen.', 409);
		},

		store
	};
}

export type Repository = ReturnType<typeof createRepository>;
