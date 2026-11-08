<script lang="ts">
	import type { Snippet } from 'svelte';
	import Dialog from './Dialog.svelte';

	/**
	 * Shows the details of one shift or performance. "Stäng" always has focus when it opens, so Enter
	 * can never trigger something destructive; `start` (left, e.g. a delete form) and `end` (right,
	 * e.g. "Ändra") add the admin actions.
	 */
	let {
		open,
		title,
		onclose,
		children,
		start,
		end
	}: {
		open: boolean;
		title: string;
		onclose: () => void;
		children: Snippet;
		start?: Snippet;
		end?: Snippet;
	} = $props();
</script>

<Dialog {open} {title} {onclose}>
	<div class="space-y-4 px-6 py-1">{@render children()}</div>
	<div class="flex items-center gap-2 px-6 pt-4 pb-6">
		<div class="mr-auto">{#if start}{@render start()}{/if}</div>
		<button type="button" class="btn btn-text" data-autofocus onclick={onclose}>Stäng</button>
		{#if end}{@render end()}{/if}
	</div>
</Dialog>
