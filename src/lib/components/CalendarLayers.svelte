<script lang="ts">
	/** Chooses what the calendar shows: work shifts, artist performances or both. */
	let {
		shifts = $bindable(true),
		performances = $bindable(true)
	}: { shifts?: boolean; performances?: boolean } = $props();

	const toggle = 'border-field-border inline-flex items-center gap-2 rounded-full border py-1.5 pr-4 pl-3 text-sm font-medium';
</script>

<div class="flex flex-wrap gap-2" role="group" aria-label="Visa i kalendern">
	<label class={toggle}>
		<input type="checkbox" bind:checked={shifts} class="accent-primary size-4" />
		<span class="bg-primary-soft border-primary size-3 rounded-sm border-l-4" aria-hidden="true"></span>
		Arbetspass
	</label>
	<label class={toggle}>
		<input type="checkbox" bind:checked={performances} class="accent-primary size-4" />
		<span class="bg-foreground size-3 rounded-sm" aria-hidden="true"></span>
		Artister
	</label>
</div>
