<script lang="ts">
	import TimeSelect from './TimeSelect.svelte';
	import { AFTER_FESTIVAL, DAYS, formatClock } from '$lib/time';

	/** A day and a 24-hour time, for a start or an end. Posts `<prefix>Day`, `<prefix>Hour` and `<prefix>Minute`. */
	let {
		prefix,
		label,
		offset = null
	}: { prefix: 'start' | 'end'; label: string; offset?: number | null } = $props();

	// The festival's end (00:00 after the last day) is a valid end time, so the end day has one more option
	const days = $derived(prefix === 'end' ? [...DAYS, AFTER_FESTIVAL] : DAYS);
</script>

<fieldset>
	<legend class="field-label">{label}</legend>
	<div class="grid grid-cols-2 gap-2">
		<select name="{prefix}Day" required aria-label="{label}dag" class="field">
			{#each days as day, i}
				<option value={i} selected={offset !== null && i === Math.floor(offset / 1440)}>{day}</option>
			{/each}
		</select>
		<TimeSelect name={prefix} {label} value={offset === null ? null : formatClock(offset)} />
	</div>
	{#if prefix === 'end'}
		<p class="text-muted-foreground mt-1 text-xs">{AFTER_FESTIVAL} går bara att välja med klockan 00:00, när festivalen slutar.</p>
	{/if}
</fieldset>
