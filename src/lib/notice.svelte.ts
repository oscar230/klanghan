import type { SubmitFunction } from '@sveltejs/kit';

/** A message shown on top of the page, for failures of actions that have no form of their own. */
export const notice = $state<{ message: string | null }>({ message: null });

let timer: ReturnType<typeof setTimeout> | undefined;

export function showNotice(message: string) {
	notice.message = message;
	clearTimeout(timer);
	timer = setTimeout(dismiss, 8000);
}

export function dismiss() {
	clearTimeout(timer);
	notice.message = null;
}

/** `use:enhance` handler for buttons outside a modal (delete etc.): errors go to the notice. */
export const submitWithNotice: SubmitFunction = ({ formElement, cancel }) => {
	// A double click must not send the same delete twice (the second would report "not found")
	if (formElement.dataset.busy) return cancel();
	formElement.dataset.busy = 'true';

	return async ({ result, update }) => {
		delete formElement.dataset.busy;
		if (result.type === 'failure') {
			showNotice(String(result.data?.error ?? 'Något gick fel'));
			return;
		}
		if (result.type === 'error') {
			showNotice('Något gick fel. Försök igen.');
			return;
		}
		await update();
	};
};
