<script lang="ts">
	import { formatShiftTime } from '$lib/time';

	/** An artist's performance, as shown in the details dialog. */
	let {
		performance
	}: {
		performance: { artist: string; genre: string; stageName: string; startOffset: number; endOffset: number };
	} = $props();
</script>

<div>
	<p class="font-medium">{performance.artist}</p>
	<p class="text-muted-foreground text-sm">{performance.genre}</p>
</div>
<p>{performance.stageName}</p>
<p>{formatShiftTime(performance.startOffset, performance.endOffset)}</p>
