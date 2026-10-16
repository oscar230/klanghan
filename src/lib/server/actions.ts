import { fail } from '@sveltejs/kit';
import { DomainError } from './operations';
import { UploadError } from './uploads';

/** Turns expected validation problems into form failures; anything else is a real error. */
export function failFrom(e: unknown) {
	if (e instanceof DomainError) return fail(e.status, { error: e.message });
	if (e instanceof UploadError) return fail(400, { error: e.message });
	throw e;
}
