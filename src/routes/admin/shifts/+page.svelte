<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Avatar from '$lib/components/Avatar.svelte';
	import Dialog from '$lib/components/Dialog.svelte';
	import ShiftSummary from '$lib/components/ShiftSummary.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import RowActions from '$lib/components/RowActions.svelte';
	import ScheduleCalendar from '$lib/components/ScheduleCalendar.svelte';
	import WhenFields from '$lib/components/WhenFields.svelte';
	import CalendarLayers from '$lib/components/CalendarLayers.svelte';
	import PerformanceSummary from '$lib/components/PerformanceSummary.svelte';
	import ViewSwitch from '$lib/components/ViewSwitch.svelte';
	import { describeConflicts, findConflicts, findStageConflicts } from '$lib/conflicts';
	import { showNotice, submitWithNotice } from '$lib/notice.svelte';
	import { performanceEvent, shiftEvent } from '$lib/calendar';
	import { formatShiftTime } from '$lib/time';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { data } = $props();

	type Shift = (typeof data.shifts)[number];

	let calendar = $derived(page.url.searchParams.get('view') === 'calendar');
	let adding = $state(false);
	let editing = $state<Shift | null>(null);
	let selected = $state<Shift | null>(null);
	let selectedPerformance = $state<(typeof data.performances)[number] | null>(null);

	// Shifts that cannot work as scheduled: double-booked volunteers, or a supervisor role held by two people at once.
	// Worked out on all shifts, so a conflict with a shift hidden by the filter still shows.
	let conflicts = $derived(findConflicts(data.shifts));
	let conflictIds = $derived(new Set(conflicts.keys()));

	// What the calendar shows; artists are read-only here and are edited under "Artister"
	let showShifts = $state(true);
	let showPerformances = $state(true);
	let events = $derived([
		...(showShifts ? data.shifts.map(shiftEvent) : []),
		...(showPerformances ? data.performances.map(performanceEvent) : [])
	]);
	let calendarConflicts = $derived(
		new Set([...conflictIds, ...(showPerformances ? findStageConflicts(data.performances) : [])])
	);
	const selectEvent = (event: { id: string; kind: 'shift' | 'performance' }) => {
		if (event.kind === 'shift') selected = data.shifts.find((s) => s.id === event.id) ?? null;
		else selectedPerformance = data.performances.find((p) => p.id === event.id) ?? null;
	};

	const deleteSelected: SubmitFunction = () => async ({ result, update }) => {
		if (result.type === 'failure') {
			showNotice(String(result.data?.error ?? 'Något gick fel'));
			return;
		}
		await update();
		selected = null;
	};

	const edit = (shift: Shift) => {
		selected = null;
		editing = shift;
	};
</script>

<svelte:head>
	<title>Arbetspass - Administratör</title>
</svelte:head>

{#snippet shiftFields(shift: Shift | null)}
	<div>
		<label class="field-label" for="shift-user">Volontär</label>
		<select id="shift-user" name="userId" required class="field">
			{#if !shift}<option value="">Välj…</option>{/if}
			{#each data.users as user}
				<option value={user.id} selected={user.id === shift?.userId}>{user.name}</option>
			{/each}
		</select>
	</div>
	<div>
		<label class="field-label" for="shift-role">Roll</label>
		<select id="shift-role" name="roleId" required class="field">
			{#if !shift}<option value="">Välj…</option>{/if}
			{#each data.roles as role}
				<option value={role.id} selected={role.id === shift?.roleId}>{role.name}</option>
			{/each}
		</select>
	</div>
	<WhenFields prefix="start" label="Start" offset={shift ? shift.startOffset : null} />
	<WhenFields prefix="end" label="Slut" offset={shift ? shift.endOffset : null} />
{/snippet}

<h1 class="text-2xl">Arbetspass</h1>
<p class="text-muted-foreground mt-1 mb-4 text-sm">Boka in volontärer på arbetspass under festivalen.</p>
<div class="mb-6"><ViewSwitch /></div>

{#if data.shifts.length === 0}
	<p class="text-muted-foreground py-12 text-center text-sm">Inga arbetspass schemalagda ännu.</p>
{:else}
	{#if calendar}
		<div class="mb-4"><CalendarLayers bind:shifts={showShifts} bind:performances={showPerformances} /></div>
		<ScheduleCalendar {events} conflicts={calendarConflicts} onselect={selectEvent} />
	{:else}
		<ul class="list">
			{#each data.shifts as shift (shift.id)}
				<li class="list-row">
					<Avatar src={shift.imageUrl} name={shift.userName} />
					<div class="min-w-0 flex-1">
						<p class="flex items-center gap-2 font-medium">
							<span class="truncate">{shift.userName}</span>
							{#if conflictIds.has(shift.id)}
								<span
									class="bg-danger text-danger-foreground shrink-0 rounded-full px-2 py-0.5 text-xs"
									title={describeConflicts(conflicts.get(shift.id) ?? [], shift.roleName).join(' ')}
								>
									Krock
								</span>
							{/if}
						</p>
						<p class="text-muted-foreground text-sm">
							{shift.roleName} · {formatShiftTime(shift.startOffset, shift.endOffset)}
						</p>
					</div>

					<RowActions label="{shift.userName}, {shift.roleName}">
						<button type="button" class="action action-primary" onclick={() => edit(shift)}>
							<Icon name="pencil" size={18} /> Ändra
						</button>
						<form method="POST" action="?/deleteShift" use:enhance={submitWithNotice}>
							<input type="hidden" name="id" value={shift.id} />
							<button class="action action-danger"><Icon name="trash" size={18} /> Ta bort</button>
						</form>
					</RowActions>
				</li>
			{/each}
		</ul>
	{/if}
{/if}

<button type="button" class="fab" onclick={() => (adding = true)}>
	<Icon name="plus" /> Nytt pass
</button>

<Dialog open={selected !== null} title="Arbetspass" onclose={() => (selected = null)}>
	{#if selected}
		<div class="space-y-4 px-6 py-1">
			<ShiftSummary shift={selected} />
			{#each describeConflicts(conflicts.get(selected.id) ?? [], selected.roleName) as message}
				<p class="text-danger text-sm">
					<span class="bg-danger text-danger-foreground rounded-full px-2 py-0.5 text-xs">Krock</span>
					{message}
				</p>
			{/each}
		</div>
		<div class="flex items-center gap-2 px-6 pt-4 pb-6">
			<form method="POST" action="?/deleteShift" use:enhance={deleteSelected} class="mr-auto">
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

<Dialog open={selectedPerformance !== null} title="Artist" onclose={() => (selectedPerformance = null)}>
	{#if selectedPerformance}
		<div class="space-y-4 px-6 py-1">
			<PerformanceSummary performance={selectedPerformance} />
		</div>
		<div class="flex items-center justify-end gap-2 px-6 pt-4 pb-6">
			<a href="/admin/artists" class="btn btn-text">Hantera artister</a>
			<button type="button" class="btn btn-primary" onclick={() => (selectedPerformance = null)}>Stäng</button>
		</div>
	{/if}
</Dialog>

<Modal open={adding} title="Nytt arbetspass" action="?/addShift" submitLabel="Schemalägg" onclose={() => (adding = false)}>
	{@render shiftFields(null)}
</Modal>

<Modal open={editing !== null} title="Ändra arbetspass" action="?/updateShift" submitLabel="Spara" onclose={() => (editing = null)}>
	{#if editing}
		<input type="hidden" name="id" value={editing.id} />
		{@render shiftFields(editing)}
	{/if}
</Modal>
