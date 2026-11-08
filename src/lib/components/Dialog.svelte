<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * A native <dialog>. The content is only rendered while `open`, so every opening starts
	 * fresh. It closes through Esc or `onclose`, not by clicking the backdrop, so typed text
	 * is not lost by accident.
	 */
	let {
		open,
		title,
		onclose,
		children
	}: { open: boolean; title: string; onclose: () => void; children: Snippet } = $props();

	const titleId = $props.id();
	let dialog = $state<HTMLDialogElement>();

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});
</script>

<dialog
	bind:this={dialog}
	{onclose}
	aria-labelledby={titleId}
	class="bg-surface text-foreground shadow-raised m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl p-0"
>
	{#if open}
		<div class="flex max-h-[calc(100dvh-2rem)] flex-col">
			<h2 id={titleId} class="px-6 pt-6 pb-4 text-xl">{title}</h2>
			{@render children()}
		</div>
	{/if}
</dialog>
