<script lang="ts">
	import type { Snippet } from 'svelte';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import Dialog from './Dialog.svelte';

	/**
	 * A form in a dialog. Validation errors from the server stay in the dialog; on
	 * success it closes and the page data is refreshed.
	 */
	let {
		open,
		title,
		action,
		submitLabel,
		onclose,
		enctype,
		children
	}: {
		open: boolean;
		title: string;
		action: string;
		submitLabel: string;
		onclose: () => void;
		enctype?: 'multipart/form-data';
		children: Snippet;
	} = $props();

	let error = $state<string | null>(null);
	let submitting = $state(false);

	// Each opening starts without the previous error
	$effect(() => {
		if (open) error = null;
	});

	const submit: SubmitFunction = () => {
		submitting = true;
		error = null;
		return async ({ result, update }) => {
			submitting = false;
			if (result.type === 'failure') {
				error = String(result.data?.error ?? 'Något gick fel');
				return;
			}
			if (result.type === 'error') {
				// Network trouble or a server error: keep the dialog and what was typed
				error = 'Något gick fel. Försök igen.';
				return;
			}
			await update();
			onclose();
		};
	};
</script>

<Dialog {open} {title} {onclose}>
	<form method="POST" {action} {enctype} use:enhance={submit} class="flex min-h-0 flex-col">
		<div class="space-y-4 overflow-y-auto px-6 py-1">
			{@render children()}
			{#if error}
				<p role="alert" class="text-danger text-sm">{error}</p>
			{/if}
		</div>

		<div class="flex justify-end gap-2 px-6 pt-4 pb-6">
			<button type="button" class="btn btn-text" onclick={onclose}>Avbryt</button>
			<button class="btn btn-primary" disabled={submitting}>
				{submitting ? 'Sparar…' : submitLabel}
			</button>
		</div>
	</form>
</Dialog>
