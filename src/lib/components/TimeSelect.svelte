<script lang="ts">
	/**
	 * A 24-hour clock made of two native selects. <input type="time"> is not used because
	 * browsers show it in the device's own format (often AM/PM), which cannot be overridden.
	 * Posts `<name>Hour` and `<name>Minute`.
	 */
	let {
		name,
		label,
		value = null
	}: { name: string; label: string; value?: string | null } = $props();

	const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
	const QUARTERS = ['00', '15', '30', '45'];

	let [hour, minute] = $derived(value ? value.split(':') : ['', '']);
	// Keep an existing odd minute (e.g. 10:07 from imported data) selectable instead of silently changing it
	let minutes = $derived(minute && !QUARTERS.includes(minute) ? [...QUARTERS, minute].sort() : QUARTERS);
</script>

<div class="flex items-center gap-1">
	<select name="{name}Hour" required aria-label="{label}, timme" class="field px-2">
		{#if !hour}<option value="" selected disabled>--</option>{/if}
		{#each HOURS as h}
			<option value={h} selected={h === hour}>{h}</option>
		{/each}
	</select>
	<span class="text-muted-foreground font-medium" aria-hidden="true">:</span>
	<select name="{name}Minute" required aria-label="{label}, minut" class="field px-2">
		{#if !minute}<option value="" selected disabled>--</option>{/if}
		{#each minutes as m}
			<option value={m} selected={m === minute}>{m}</option>
		{/each}
	</select>
</div>
