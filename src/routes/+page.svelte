<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import Avatar from '$lib/components/Avatar.svelte';
	import DetailsDialog from '$lib/components/DetailsDialog.svelte';
	import ShiftSummary from '$lib/components/ShiftSummary.svelte';
	import ScheduleCalendar from '$lib/components/ScheduleCalendar.svelte';
	import CalendarLayers from '$lib/components/CalendarLayers.svelte';
	import PersonRow from '$lib/components/PersonRow.svelte';
	import PerformanceSummary from '$lib/components/PerformanceSummary.svelte';
	import ViewSwitch from '$lib/components/ViewSwitch.svelte';
	import { performanceEvent, shiftEvent } from '$lib/calendar';
	import { groupByPerson } from '$lib/people';
	import { formatShiftTime } from '$lib/time';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const STORAGE_KEY = 'klanghan:selectedUserId';
	let selectedUserId = $state('');

	// Remember who the visitor is, so returning to the schedule is one tap.
	onMount(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved && data.users.some((u) => u.id === saved)) {
				selectedUserId = saved;
			}
		} catch {
			// Storage can be unavailable (private mode); the selection just won't persist.
		}
	});

	const rememberSelection = () => {
		try {
			if (selectedUserId) localStorage.setItem(STORAGE_KEY, selectedUserId);
		} catch {
			// ignore
		}
	};

	let calendar = $derived(page.url.searchParams.get('view') === 'calendar');
	let selected = $state<(typeof data.shifts)[number] | null>(null);
	let selectedPerformance = $state<(typeof data.performances)[number] | null>(null);

	// What the calendar shows
	let showShifts = $state(true);
	let showPerformances = $state(true);
	let events = $derived([
		...(showShifts ? data.shifts.map(shiftEvent) : []),
		...(showPerformances ? data.performances.map(performanceEvent) : [])
	]);
	const selectEvent = (event: { id: string; kind: 'shift' | 'performance' }) => {
		if (event.kind === 'shift') selected = data.shifts.find((s) => s.id === event.id) ?? null;
		else selectedPerformance = data.performances.find((p) => p.id === event.id) ?? null;
	};

	let myShifts = $derived(data.shifts.filter((s) => s.userId === selectedUserId));

	type Shift = (typeof data.shifts)[number];

	const overlapping = (shift: Shift) =>
		data.shifts.filter(
			(s) => s.userId !== selectedUserId && s.startOffset < shift.endOffset && s.endOffset > shift.startOffset
		);

	// People in the role that leads this shift's role who are working at the same time
	const getSupervisors = (shift: Shift) =>
		shift.supervisorRoleId ? overlapping(shift).filter((s) => s.roleId === shift.supervisorRoleId) : [];
</script>

<svelte:head>
	<title>Klanglandet Schema</title>
</svelte:head>

<h1 class="text-2xl">Klanglandet 2026</h1>
<p class="text-muted-foreground mt-1 mb-4 text-sm">Schema för dig och dina medvolontärer.</p>
<div class="mb-6"><ViewSwitch /></div>

<label class="field-label" for="volunteer-select">{calendar ? 'Markera pass för' : 'Visa schema för'}</label>
<select id="volunteer-select" bind:value={selectedUserId} onchange={rememberSelection} class="field bg-muted">
	<option value="" disabled>Välj ditt namn…</option>
	{#each data.users as user}
		<option value={user.id}>{user.name}</option>
	{/each}
</select>

{#if calendar}
	<div class="mt-6 mb-4"><CalendarLayers bind:shifts={showShifts} bind:performances={showPerformances} /></div>
	<ScheduleCalendar {events} highlightUserId={selectedUserId} onselect={selectEvent} />
{:else if selectedUserId}
	<h2 class="mt-8 mb-3 text-lg font-medium">Dina arbetspass</h2>

	{#if myShifts.length === 0}
		<p class="text-muted-foreground py-8 text-center text-sm">Du har inga inbokade arbetspass ännu.</p>
	{:else}
		<ul class="space-y-3">
			{#each myShifts as shift (shift.id)}
				{@const supervisors = getSupervisors(shift)}
				{@const coworkers = overlapping(shift).filter((s) => !supervisors.includes(s))}
				<li class="bg-card border-border rounded-2xl border p-4">
					<p class="font-medium">{formatShiftTime(shift.startOffset, shift.endOffset)}</p>
					<p class="mt-1">
						<span class="chip bg-primary-soft text-primary">{shift.roleName}</span>
					</p>
					{#if shift.roleDescription}
						<p class="text-muted-foreground mt-2 text-sm">{shift.roleDescription}</p>
					{/if}

					{#if shift.supervisorRoleName}
						<h3 class="text-muted-foreground mt-4 mb-1 text-xs font-medium">
							Behöver du hjälp? Fråga {shift.supervisorRoleName}
						</h3>
						{#if supervisors.length === 0}
							<p class="text-muted-foreground text-sm">
								Ingen {shift.supervisorRoleName.toLowerCase()} arbetar under det här passet.
							</p>
						{:else}
							<ul class="list border-t-0 border-b-0">
								{#each groupByPerson(supervisors) as person (person.userId)}
									<PersonRow {person} />
								{/each}
							</ul>
						{/if}
					{/if}

					<h3 class="text-muted-foreground mt-4 mb-1 text-xs font-medium">Arbetar med</h3>
					{#if coworkers.length === 0}
						<p class="text-muted-foreground text-sm">Du arbetar ensam på detta pass.</p>
					{:else}
						<ul class="list border-b-0 border-t-0">
							{#each groupByPerson(coworkers) as person (person.userId)}
								<PersonRow {person} />
							{/each}
						</ul>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
{/if}

<DetailsDialog open={selected !== null} title="Arbetspass" onclose={() => (selected = null)}>
	{#if selected}<ShiftSummary shift={selected} />{/if}
</DetailsDialog>

<DetailsDialog open={selectedPerformance !== null} title="Artist" onclose={() => (selectedPerformance = null)}>
	{#if selectedPerformance}<PerformanceSummary performance={selectedPerformance} />{/if}
</DetailsDialog>
