<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import ArtistFilters from '$lib/components/ArtistFilters.svelte';
	import CalendarLayers from '$lib/components/CalendarLayers.svelte';
	import DetailsDialog from '$lib/components/DetailsDialog.svelte';
	import PerformanceRow from '$lib/components/PerformanceRow.svelte';
	import PerformanceSummary from '$lib/components/PerformanceSummary.svelte';
	import ScheduleCalendar from '$lib/components/ScheduleCalendar.svelte';
	import ShiftSummary from '$lib/components/ShiftSummary.svelte';
	import ViewSwitch from '$lib/components/ViewSwitch.svelte';
	import { isCalendarView, performanceEvent, shiftEvent } from '$lib/calendar';
	import { groupByStartDay } from '$lib/time';

	let { data } = $props();

	let calendar = $derived(isCalendarView(page.url));

	let stageId = $state('');
	let query = $state('');
	let visible = $derived(
		data.performances.filter(
			(p) =>
				(!stageId || p.stageId === stageId) &&
				(!query || `${p.artist} ${p.genre}`.toLowerCase().includes(query.trim().toLowerCase()))
		)
	);
	let days = $derived(groupByStartDay(visible));

	// The calendar is about the artists here; the work shifts can be added
	let showPerformances = $state(true);
	let showShifts = $state(false);
	let events = $derived([
		...(showPerformances ? visible.map(performanceEvent) : []),
		...(showShifts ? data.shifts.map(shiftEvent) : [])
	]);

	// Highlight the visitor's own shifts, as on the work schedule page
	let highlightUserId = $state('');
	onMount(() => {
		try {
			const saved = localStorage.getItem('klanghan:selectedUserId');
			if (saved && data.users.some((u) => u.id === saved)) highlightUserId = saved;
		} catch {
			// ignore
		}
	});

	let selectedPerformance = $state<(typeof data.performances)[number] | null>(null);
	let selectedShift = $state<(typeof data.shifts)[number] | null>(null);
	const selectEvent = (event: { id: string; kind: 'shift' | 'performance' }) => {
		if (event.kind === 'performance') selectedPerformance = data.performances.find((p) => p.id === event.id) ?? null;
		else selectedShift = data.shifts.find((s) => s.id === event.id) ?? null;
	};
</script>

<svelte:head>
	<title>Artister - Klanglandet</title>
</svelte:head>

<h1 class="text-2xl">Artister</h1>
<p class="text-muted-foreground mt-1 mb-4 text-sm">Vem som spelar var och när. Flera scener spelar samtidigt.</p>
<div class="mb-6"><ViewSwitch /></div>

{#if data.performances.length === 0}
	<p class="empty">Artistschemat är inte klart ännu.</p>
{:else}
	<ArtistFilters stages={data.stages} bind:stageId bind:query shown={visible.length} total={data.performances.length} />

	{#if calendar}
		<div class="mb-4"><CalendarLayers bind:shifts={showShifts} bind:performances={showPerformances} /></div>
		<ScheduleCalendar {events} {highlightUserId} onselect={selectEvent} />
	{:else if visible.length === 0}
		<p class="empty">Inga artister matchar filtret.</p>
	{:else}
		{#each days as day}
			<section class="mb-8">
				<h2 class="text-muted-foreground mb-1 text-sm font-medium">{day.name}</h2>
				<ul class="list">
					{#each day.items as performance (performance.id)}
						<PerformanceRow {performance} />
					{/each}
				</ul>
			</section>
		{/each}
	{/if}
{/if}

<DetailsDialog open={selectedPerformance !== null} title="Artist" onclose={() => (selectedPerformance = null)}>
	{#if selectedPerformance}<PerformanceSummary performance={selectedPerformance} />{/if}
</DetailsDialog>

<DetailsDialog open={selectedShift !== null} title="Arbetspass" onclose={() => (selectedShift = null)}>
	{#if selectedShift}<ShiftSummary shift={selectedShift} />{/if}
</DetailsDialog>
