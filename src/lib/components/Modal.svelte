<script lang="ts">
	import type { Snippet } from 'svelte';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';

	/**
	 * A form in a native <dialog>. The content is only rendered while `open`, so every
	 * opening starts from a fresh form. Validation errors from the server stay in the
	 * dialog; on success it closes and the page data is refreshed.
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

	let dialog = $state<HTMLDialogElement>();
	let error = $state<string | null>(null);
	let submitting = $state(false);

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) {
			error = null;
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
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
			await update();
			onclose();
		};
	};
</script>

<!-- The dialog closes through Esc or the cancel button, not by clicking the backdrop, so typed text is not lost by accident. -->
<dialog
	bind:this={dialog}
	onclose={onclose}
	aria-labelledby="modal-title"
	class="bg-surface text-foreground shadow-raised m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl p-0"
>
	{#if open}
		<form method="POST" {action} {enctype} use:enhance={submit} class="flex max-h-[calc(100dvh-2rem)] flex-col">
			<h2 id="modal-title" class="px-6 pt-6 pb-4 text-xl">{title}</h2>

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
	{/if}
</dialog>
