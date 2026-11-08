<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * The frame shared by the schedule filters: the filter fields (`children`), an optional "only
	 * conflicts" switch, how many of the items are shown and a button that clears everything.
	 */
	let {
		label,
		noun,
		shown,
		total,
		active,
		onclear,
		showConflicts = true,
		onlyConflicts = $bindable(false),
		children
	}: {
		label: string;
		/** What is counted, in plural: "pass" or "spelningar". */
		noun: string;
		shown: number;
		total: number;
		/** Whether any filter is set. */
		active: boolean;
		onclear: () => void;
		showConflicts?: boolean;
		onlyConflicts?: boolean;
		children: Snippet;
	} = $props();
</script>

<div class="mb-4 space-y-3" role="search" aria-label={label}>
	<div class="grid gap-3 sm:grid-cols-2">{@render children()}</div>
	<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
		{#if showConflicts}
			<label class="flex items-center gap-2 text-sm">
				<input type="checkbox" bind:checked={onlyConflicts} class="accent-primary size-4" />
				Endast krockar
			</label>
		{:else}
			<span></span>
		{/if}
		<div class="flex items-center gap-1 text-sm">
			<span class="text-muted-foreground" aria-live="polite">Visar {shown} av {total} {noun}</span>
			<button type="button" class="btn btn-text h-8 px-3" disabled={!active} onclick={onclear}>Rensa filter</button>
		</div>
	</div>
</div>
