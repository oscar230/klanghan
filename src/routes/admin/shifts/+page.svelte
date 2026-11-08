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
	import TimeSelect from '$lib/components/TimeSelect.svelte';
	import ViewSwitch from '$lib/components/ViewSwitch.svelte';
	import { showNotice, submitWithNotice } from '$lib/notice.svelte';
	import { DAYS, formatClock, formatShiftTime } from '$lib/time';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { data } = $props();

	type Shift = (typeof data.shifts)[number];

	let calendar = $derived(page.url.searchParams.get('view') === 'calendar');
	let adding = $state(false);
	let editing = $state<Shift | null>(null);
	let selected = $state<Shift | null>(null);

	// Shifts where the same volunteer is booked on something else at the same time
	let conflicts = $derived(
		new Set(
			data.shifts
				.filter((shift) =>
					data.shifts.some(
						(other) =>
							other.id !== shift.id &&
							other.userId === shift.userId &&
							other.startOffset < shift.endOffset &&
							other.endOffset > shift.startOffset
					)
				)
				.map((shift) => shift.id)
		)
	);

	// The festival's end (00:00 after the last day) is a valid end time, so the end day has one more option
	const END_DAYS = [...DAYS, 'Måndag'];

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
	<title>Schema - Administratör</title>
</svelte:head>

{#snippet when(prefix: 'start' | 'end', label: string, offset: number | null)}
	{@const days = prefix === 'start' ? DAYS : END_DAYS}
	<fieldset>
		<legend class="field-label">{label}</legend>
		<div class="grid grid-cols-2 gap-2">
			<select name="{prefix}Day" required aria-label="{label}dag" class="field">
				{#each days as day, i}
					<option value={i} selected={offset !== null && i === Math.floor(offset / 1440)}>{day}</option>
				{/each}
			</select>
			<TimeSelect name={prefix} label={label} value={offset === null ? null : formatClock(offset)} />
		</div>
	</fieldset>
{/snippet}

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
	{@render when('start', 'Start', shift ? shift.startOffset : null)}
	{@render when('end', 'Slut', shift ? shift.endOffset : null)}
{/snippet}

<h1 class="text-2xl">Schemahantering</h1>
<p class="text-muted-foreground mt-1 mb-4 text-sm">Boka in volontärer på arbetspass under festivalen.</p>
<div class="mb-6"><ViewSwitch /></div>

{#if data.shifts.length === 0}
	<p class="text-muted-foreground py-12 text-center text-sm">Inga arbetspass schemalagda ännu.</p>
{:else if calendar}
	<ScheduleCalendar shifts={data.shifts} {conflicts} onselect={(shift) => (selected = data.shifts.find((s) => s.id === shift.id) ?? null)} />
{:else}
	<ul class="list">
		{#each data.shifts as shift (shift.id)}
			<li class="list-row">
				<Avatar src={shift.imageUrl} name={shift.userName} />
				<div class="min-w-0 flex-1">
					<p class="flex items-center gap-2 font-medium">
						<span class="truncate">{shift.userName}</span>
						{#if conflicts.has(shift.id)}
							<span
								class="bg-foreground text-background shrink-0 rounded-full px-2 py-0.5 text-xs"
								title="Volontären är bokad på ett annat pass samtidigt"
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

<button type="button" class="fab" onclick={() => (adding = true)}>
	<Icon name="plus" /> Nytt pass
</button>

<Dialog open={selected !== null} title="Arbetspass" onclose={() => (selected = null)}>
	{#if selected}
		<div class="space-y-4 px-6 py-1">
			<ShiftSummary shift={selected} />
			{#if conflicts.has(selected.id)}
				<p class="text-sm">
					<span class="bg-foreground text-background rounded-full px-2 py-0.5 text-xs">Krock</span>
					Volontären är bokad på ett annat pass samtidigt.
				</p>
			{/if}
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

<Modal open={adding} title="Nytt arbetspass" action="?/addShift" submitLabel="Schemalägg" onclose={() => (adding = false)}>
	{@render shiftFields(null)}
</Modal>

<Modal open={editing !== null} title="Ändra arbetspass" action="?/updateShift" submitLabel="Spara" onclose={() => (editing = null)}>
	{#if editing}
		<input type="hidden" name="id" value={editing.id} />
		{@render shiftFields(editing)}
	{/if}
</Modal>
