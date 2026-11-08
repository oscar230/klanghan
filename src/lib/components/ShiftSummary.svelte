<script lang="ts">
	import Avatar from './Avatar.svelte';
	import { formatShiftTime } from '$lib/time';

	/** Who works when, as shown in the details dialog of a shift. */
	let {
		shift
	}: {
		shift: {
			userName: string;
			imageUrl: string | null;
			roleName: string;
			roleDescription: string | null;
			supervisorRoleName: string | null;
			startOffset: number;
			endOffset: number;
		};
	} = $props();
</script>

<div class="flex items-center gap-3">
	<Avatar src={shift.imageUrl} name={shift.userName} size={48} />
	<div class="min-w-0">
		<p class="truncate font-medium">{shift.userName}</p>
		<p class="text-muted-foreground text-sm">{shift.roleName}</p>
	</div>
</div>
<p>{formatShiftTime(shift.startOffset, shift.endOffset)}</p>
{#if shift.roleDescription}
	<p class="text-muted-foreground text-sm">{shift.roleDescription}</p>
{/if}
{#if shift.supervisorRoleName}
	<p class="text-muted-foreground text-sm">Leds av {shift.supervisorRoleName}</p>
{/if}
