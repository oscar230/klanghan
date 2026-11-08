<script lang="ts">
	import Avatar from './Avatar.svelte';
	import { formatClock } from '$lib/time';
	import type { PersonShifts } from '$lib/people';

	/** A volunteer with the role and time of each of their shifts, one line each. */
	let {
		person
	}: {
		person: PersonShifts<{ roleName: string; startOffset: number; endOffset: number }>;
	} = $props();
</script>

<li class="list-row min-h-14">
	<Avatar src={person.imageUrl} name={person.userName} size={36} />
	<div class="min-w-0 flex-1">
		<p class="truncate text-sm font-medium">{person.userName}</p>
		{#each person.shifts as shift}
			<p class="text-muted-foreground truncate text-sm">
				{shift.roleName} · {formatClock(shift.startOffset)} – {formatClock(shift.endOffset)}
			</p>
		{/each}
	</div>
</li>
