<script lang="ts">
	import FilterBar from './FilterBar.svelte';

	/** Narrows an artist schedule by stage and name. Admins can also show only conflicting performances. */
	let {
		stages,
		stageId = $bindable(''),
		query = $bindable(''),
		showConflicts = false,
		onlyConflicts = $bindable(false),
		shown,
		total
	}: {
		stages: Array<{ id: string; name: string }>;
		stageId?: string;
		query?: string;
		/** Offer "Endast krockar" (admin only; conflicts are not shown publicly). */
		showConflicts?: boolean;
		onlyConflicts?: boolean;
		shown: number;
		total: number;
	} = $props();

	const clear = () => {
		stageId = '';
		query = '';
		onlyConflicts = false;
	};
</script>

<FilterBar
	label="Filtrera artister"
	noun="spelningar"
	{shown}
	{total}
	active={Boolean(stageId || query || onlyConflicts)}
	onclear={clear}
	{showConflicts}
	bind:onlyConflicts
>
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
</FilterBar>
