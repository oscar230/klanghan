<script lang="ts">
	/** Narrows an artist schedule by stage and name. Admins can also show only conflicting performances. */
	let {
		stages,
		stageId = $bindable(''),
		query = $bindable(''),
		onlyConflicts = $bindable(undefined),
		shown,
		total
	}: {
		stages: Array<{ id: string; name: string }>;
		stageId?: string;
		query?: string;
		/** Leave unbound to hide the option. */
		onlyConflicts?: boolean | undefined;
		shown: number;
		total: number;
	} = $props();

	let active = $derived(Boolean(stageId || query || onlyConflicts));

	const clear = () => {
		stageId = '';
		query = '';
		if (onlyConflicts !== undefined) onlyConflicts = false;
	};
</script>

<div class="mb-4 space-y-3" role="search" aria-label="Filtrera artister">
	<div class="grid gap-3 sm:grid-cols-2">
		<div>
			<label class="field-label" for="filter-stage">Scen</label>
			<select id="filter-stage" bind:value={stageId} class="field">
				<option value="">Alla scener</option>
				{#each stages as stage}
					<option value={stage.id}>{stage.name}</option>
				{/each}
			</select>
		</div>
		<div>
			<label class="field-label" for="filter-artist">Sök artist eller genre</label>
			<input id="filter-artist" type="search" bind:value={query} class="field" />
		</div>
	</div>
	<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
		{#if onlyConflicts !== undefined}
			<label class="flex items-center gap-2 text-sm">
				<input type="checkbox" bind:checked={onlyConflicts} class="accent-primary size-4" />
				Endast krockar
			</label>
		{:else}
			<span></span>
		{/if}
		<div class="flex items-center gap-1 text-sm">
			<span class="text-muted-foreground" aria-live="polite">Visar {shown} av {total} spelningar</span>
			<button type="button" class="btn btn-text h-8 px-3" disabled={!active} onclick={clear}>Rensa filter</button>
		</div>
	</div>
</div>
