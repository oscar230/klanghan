<script lang="ts">
	import type { Snippet } from 'svelte';
	import ConflictBadge from './ConflictBadge.svelte';
	import { STAGE_CONFLICT_MESSAGE } from '$lib/conflicts';
	import { formatClock } from '$lib/time';

	/** One line of the artist list: times, artist, genre and stage. Admins add `actions`. */
	let {
		performance,
		conflict = false,
		actions
	}: {
		performance: { artist: string; genre: string; stageName: string; startOffset: number; endOffset: number };
		conflict?: boolean;
		actions?: Snippet;
	} = $props();
</script>

<li class="list-row">
	<div class="w-14 shrink-0 text-sm tabular-nums">
		<p class="font-medium">{formatClock(performance.startOffset)}</p>
		<p class="text-muted-foreground">{formatClock(performance.endOffset)}</p>
	</div>
	<div class="min-w-0 flex-1">
		<p class="flex items-center gap-2 font-medium">
			<span class="truncate">{performance.artist}</span>
			{#if conflict}<ConflictBadge title={STAGE_CONFLICT_MESSAGE} />{/if}
		</p>
		<p class="text-muted-foreground text-sm">{performance.genre} · {performance.stageName}</p>
	</div>
	{#if actions}{@render actions()}{/if}
</li>
