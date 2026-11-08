// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			isAdmin: boolean;
		}
		interface PageData {
			/** Set by the admin layout: whether the visitor is logged in as admin. */
			authenticated?: boolean;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
