<script lang="ts">
	import { enhance } from '$app/forms';
	import Avatar from '$lib/components/Avatar.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import RowActions from '$lib/components/RowActions.svelte';
	import { submitWithNotice } from '$lib/notice.svelte';
	import { DAYS, formatShiftTime } from '$lib/time';

	let { data } = $props();

	type Shift = (typeof data.shifts)[number];

	let adding = $state(false);
	let reassigning = $state<Shift | null>(null);

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
</script>

<svelte:head>
	<title>Schema - Administratör</title>
</svelte:head>

{#snippet when(prefix: 'start' | 'end', label: string)}
	<fieldset>
		<legend class="field-label">{label}</legend>
		<div class="grid grid-cols-2 gap-2">
			<select name="{prefix}Day" required aria-label="{label}dag" class="field">
				{#each DAYS as day, i}
					<option value={i}>{day}</option>
				{/each}
			</select>
			<input type="time" name="{prefix}Time" step="900" required aria-label="{label}tid" class="field" />
		</div>
	</fieldset>
{/snippet}

<h1 class="text-2xl">Schemahantering</h1>
<p class="text-muted-foreground mt-1 mb-6 text-sm">Boka in volontärer på arbetspass under festivalen.</p>

{#if data.shifts.length === 0}
	<p class="text-muted-foreground py-12 text-center text-sm">Inga arbetspass schemalagda ännu.</p>
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
					<button type="button" class="action action-primary" onclick={() => (reassigning = shift)}>
						<Icon name="swap" size={18} /> Byt volontär
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

<Modal open={adding} title="Nytt arbetspass" action="?/addShift" submitLabel="Schemalägg" onclose={() => (adding = false)}>
	<div>
		<label class="field-label" for="shift-user">Volontär</label>
		<select id="shift-user" name="userId" required class="field">
			<option value="">Välj…</option>
			{#each data.users as user}
				<option value={user.id}>{user.name}</option>
			{/each}
		</select>
	</div>
	<div>
		<label class="field-label" for="shift-role">Roll</label>
		<select id="shift-role" name="roleId" required class="field">
			<option value="">Välj…</option>
			{#each data.roles as role}
				<option value={role.id}>{role.name}</option>
			{/each}
		</select>
	</div>
	{@render when('start', 'Start')}
	{@render when('end', 'Slut')}
</Modal>

<Modal
	open={reassigning !== null}
	title="Byt volontär"
	action="?/updateShiftUser"
	submitLabel="Spara"
	onclose={() => (reassigning = null)}
>
	{#if reassigning}
		<input type="hidden" name="shiftId" value={reassigning.id} />
		<p class="text-muted-foreground text-sm">
			{reassigning.roleName}, {formatShiftTime(reassigning.startOffset, reassigning.endOffset)}
		</p>
		<div>
			<label class="field-label" for="shift-new-user">Volontär</label>
			<select id="shift-new-user" name="userId" required class="field">
				{#each data.users as user}
					<option value={user.id} selected={user.id === reassigning.userId}>{user.name}</option>
				{/each}
			</select>
		</div>
	{/if}
</Modal>
