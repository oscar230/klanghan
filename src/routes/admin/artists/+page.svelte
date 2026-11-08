<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import ArtistFilters from '$lib/components/ArtistFilters.svelte';
	import Dialog from '$lib/components/Dialog.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import PerformanceSummary from '$lib/components/PerformanceSummary.svelte';
	import RowActions from '$lib/components/RowActions.svelte';
	import ScheduleCalendar from '$lib/components/ScheduleCalendar.svelte';
	import ViewSwitch from '$lib/components/ViewSwitch.svelte';
	import WhenFields from '$lib/components/WhenFields.svelte';
	import { performanceEvent } from '$lib/calendar';
	import { STAGE_CONFLICT_MESSAGE, findStageConflicts } from '$lib/conflicts';
	import { showNotice, submitWithNotice } from '$lib/notice.svelte';
	import { formatClock, groupByStartDay } from '$lib/time';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { data } = $props();

	type Performance = (typeof data.performances)[number];

	let calendar = $derived(page.url.searchParams.get('view') === 'calendar');
	let adding = $state(false);
	let editing = $state<Performance | null>(null);
	let selected = $state<Performance | null>(null);

	// Two artists on the same stage at once is impossible (different stages may play at the same time)
	let conflicts = $derived(findStageConflicts(data.performances));

	let stageId = $state(page.url.searchParams.get('stage') ?? '');
	let query = $state('');
	let onlyConflicts = $state(false);
	let visible = $derived(
		data.performances.filter(
			(p) =>
				(!stageId || p.stageId === stageId) &&
				(!query || `${p.artist} ${p.genre}`.toLowerCase().includes(query.trim().toLowerCase())) &&
				(!onlyConflicts || conflicts.has(p.id))
		)
	);
	let days = $derived(groupByStartDay(visible));
	let genres = $derived([...new Set(data.performances.map((p) => p.genre))].sort((a, b) => a.localeCompare(b, 'sv')));

	const deleteSelected: SubmitFunction = () => async ({ result, update }) => {
		if (result.type === 'failure') {
			showNotice(String(result.data?.error ?? 'Något gick fel'));
			return;
		}
		await update();
		selected = null;
	};

	const edit = (performance: Performance) => {
		selected = null;
		editing = performance;
	};
</script>

<svelte:head>
	<title>Artister - Administratör</title>
</svelte:head>

{#snippet fields(performance: Performance | null)}
	<div>
		<label class="field-label" for="performance-artist">Artist</label>
		<input id="performance-artist" type="text" name="artist" value={performance?.artist ?? ''} required maxlength="100" class="field" />
	</div>
	<div>
		<label class="field-label" for="performance-genre">Genre</label>
		<input
			id="performance-genre"
			type="text"
			name="genre"
			list="genres"
			value={performance?.genre ?? ''}
			required
			maxlength="100"
			autocomplete="off"
			class="field"
		/>
		<datalist id="genres">
			{#each genres as genre}
				<option value={genre}></option>
			{/each}
		</datalist>
	</div>
	<div>
		<label class="field-label" for="performance-stage">Scen</label>
		<select id="performance-stage" name="stageId" required class="field">
			{#if !performance}<option value="">Välj…</option>{/if}
			{#each data.stages as stage}
				<option value={stage.id} selected={stage.id === performance?.stageId}>{stage.name}</option>
			{/each}
		</select>
		{#if data.stages.length === 0}
			<p class="text-muted-foreground mt-1 text-xs">
				Det finns inga scener ännu. <a href="/admin/stages" class="text-primary underline">Lägg till en scen</a> först.
			</p>
		{/if}
	</div>
	<WhenFields prefix="start" label="Start" offset={performance ? performance.startOffset : null} />
	<WhenFields prefix="end" label="Slut" offset={performance ? performance.endOffset : null} />
{/snippet}

<h1 class="text-2xl">Artister</h1>
<p class="text-muted-foreground mt-1 mb-4 text-sm">
	Artistschemat är skilt från arbetspassen. Flera artister kan spela samtidigt på olika scener.
</p>
<div class="mb-6"><ViewSwitch /></div>

{#if data.performances.length === 0}
	<p class="text-muted-foreground py-12 text-center text-sm">Inga artister inbokade ännu.</p>
{:else}
	<ArtistFilters
		stages={data.stages}
		bind:stageId
		bind:query
		bind:onlyConflicts
		shown={visible.length}
		total={data.performances.length}
	/>

	{#if calendar}
		<ScheduleCalendar
			events={visible.map(performanceEvent)}
			{conflicts}
			onselect={(event) => (selected = data.performances.find((p) => p.id === event.id) ?? null)}
		/>
	{:else if visible.length === 0}
		<p class="text-muted-foreground py-12 text-center text-sm">Inga artister matchar filtret.</p>
	{:else}
		{#each days as day}
			<section class="mb-8">
				<h2 class="text-muted-foreground mb-1 text-sm font-medium">{day.name}</h2>
				<ul class="list">
					{#each day.items as performance (performance.id)}
						<li class="list-row">
							<div class="w-14 shrink-0 text-sm tabular-nums">
								<p class="font-medium">{formatClock(performance.startOffset)}</p>
								<p class="text-muted-foreground">{formatClock(performance.endOffset)}</p>
							</div>
							<div class="min-w-0 flex-1">
								<p class="flex items-center gap-2 font-medium">
									<span class="truncate">{performance.artist}</span>
									{#if conflicts.has(performance.id)}
										<span
											class="bg-danger text-danger-foreground shrink-0 rounded-full px-2 py-0.5 text-xs"
											title={STAGE_CONFLICT_MESSAGE}
										>
											Krock
										</span>
									{/if}
								</p>
								<p class="text-muted-foreground text-sm">{performance.genre} · {performance.stageName}</p>
							</div>

							<RowActions label="{performance.artist}, {performance.stageName}">
								<button type="button" class="action action-primary" onclick={() => edit(performance)}>
									<Icon name="pencil" size={18} /> Ändra
								</button>
								<form method="POST" action="?/deletePerformance" use:enhance={submitWithNotice}>
									<input type="hidden" name="id" value={performance.id} />
									<button class="action action-danger"><Icon name="trash" size={18} /> Ta bort</button>
								</form>
							</RowActions>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	{/if}
{/if}

<button type="button" class="fab" onclick={() => (adding = true)}>
	<Icon name="plus" /> Ny spelning
</button>

<Dialog open={selected !== null} title="Artist" onclose={() => (selected = null)}>
	{#if selected}
		<div class="space-y-4 px-6 py-1">
			<PerformanceSummary performance={selected} />
			{#if conflicts.has(selected.id)}
				<p class="text-danger text-sm">
					<span class="bg-danger text-danger-foreground rounded-full px-2 py-0.5 text-xs">Krock</span>
					{STAGE_CONFLICT_MESSAGE}
				</p>
			{/if}
		</div>
		<div class="flex items-center gap-2 px-6 pt-4 pb-6">
			<form method="POST" action="?/deletePerformance" use:enhance={deleteSelected} class="mr-auto">
				<input type="hidden" name="id" value={selected.id} />
				<button class="btn btn-danger -ml-4"><Icon name="trash" size={18} /> Ta bort</button>
			</form>
			<button type="button" class="btn btn-text" onclick={() => (selected = null)}>Stäng</button>
			<button type="button" class="btn btn-primary" onclick={() => selected && edit(selected)}>
				<Icon name="pencil" size={18} /> Ändra
			</button>
		</div>
	{/if}
</Dialog>

<Modal open={adding} title="Ny spelning" action="?/addPerformance" submitLabel="Lägg till" onclose={() => (adding = false)}>
	{@render fields(null)}
</Modal>

<Modal open={editing !== null} title="Ändra spelning" action="?/updatePerformance" submitLabel="Spara" onclose={() => (editing = null)}>
	{#if editing}
		<input type="hidden" name="id" value={editing.id} />
		{@render fields(editing)}
	{/if}
</Modal>
