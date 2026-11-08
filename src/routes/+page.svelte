<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import Avatar from '$lib/components/Avatar.svelte';
	import Dialog from '$lib/components/Dialog.svelte';
	import ScheduleCalendar from '$lib/components/ScheduleCalendar.svelte';
	import ViewSwitch from '$lib/components/ViewSwitch.svelte';
	import { formatClock, formatShiftTime } from '$lib/time';
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

	let myShifts = $derived(data.shifts.filter((s) => s.userId === selectedUserId));

	const getCoworkers = (shift: (typeof data.shifts)[number]) =>
		data.shifts.filter(
			(s) => s.userId !== selectedUserId && s.startOffset < shift.endOffset && s.endOffset > shift.startOffset
		);
</script>

<svelte:head>
	<title>Klanglandet Schema</title>
</svelte:head>

<h1 class="text-2xl">Klanglandet 2026</h1>
<p class="text-muted-foreground mt-1 mb-4 text-sm">Schema för dig och dina medvolontärer.</p>
<div class="mb-6"><ViewSwitch listLabel="Mitt schema" /></div>

<label class="field-label" for="volunteer-select">{calendar ? 'Markera pass för' : 'Visa schema för'}</label>
<select id="volunteer-select" bind:value={selectedUserId} onchange={rememberSelection} class="field bg-muted">
	<option value="" disabled>Välj ditt namn…</option>
	{#each data.users as user}
		<option value={user.id}>{user.name}</option>
	{/each}
</select>

{#if calendar}
	<div class="mt-6">
		<ScheduleCalendar
			shifts={data.shifts}
			highlightUserId={selectedUserId}
			onselect={(shift) => (selected = data.shifts.find((s) => s.id === shift.id) ?? null)}
		/>
	</div>
{:else if selectedUserId}
	<h2 class="mt-8 mb-3 text-lg font-medium">Dina arbetspass</h2>

	{#if myShifts.length === 0}
		<p class="text-muted-foreground py-8 text-center text-sm">Du har inga inbokade arbetspass ännu.</p>
	{:else}
		<ul class="space-y-3">
			{#each myShifts as shift (shift.id)}
				{@const coworkers = getCoworkers(shift)}
				<li class="bg-card border-border rounded-2xl border p-4">
					<p class="font-medium">{formatShiftTime(shift.startOffset, shift.endOffset)}</p>
					<p class="mt-1">
						<span class="chip bg-primary-soft text-primary">{shift.roleName}</span>
					</p>
					{#if shift.roleDescription}
						<p class="text-muted-foreground mt-2 text-sm">{shift.roleDescription}</p>
					{/if}

					<h3 class="text-muted-foreground mt-4 mb-1 text-xs font-medium">Arbetar med</h3>
					{#if coworkers.length === 0}
						<p class="text-muted-foreground text-sm">Du arbetar ensam på detta pass.</p>
					{:else}
						<ul class="list border-b-0 border-t-0">
							{#each coworkers as cw}
								<li class="list-row min-h-14">
									<Avatar src={cw.imageUrl} name={cw.userName} size={36} />
									<div class="min-w-0 flex-1">
										<p class="truncate text-sm font-medium">{cw.userName}</p>
										<p class="text-muted-foreground truncate text-sm">
											{cw.roleName} · {formatClock(cw.startOffset)} – {formatClock(cw.endOffset)}
										</p>
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
{/if}

<Dialog open={selected !== null} title="Arbetspass" onclose={() => (selected = null)}>
	{#if selected}
		<div class="space-y-4 px-6 py-1">
			<div class="flex items-center gap-3">
				<Avatar src={selected.imageUrl} name={selected.userName} size={48} />
				<div class="min-w-0">
					<p class="truncate font-medium">{selected.userName}</p>
					<p class="text-muted-foreground text-sm">{selected.roleName}</p>
				</div>
			</div>
			<p>{formatShiftTime(selected.startOffset, selected.endOffset)}</p>
			{#if selected.roleDescription}
				<p class="text-muted-foreground text-sm">{selected.roleDescription}</p>
			{/if}
		</div>
		<div class="flex justify-end px-6 pt-4 pb-6">
			<button type="button" class="btn btn-text" onclick={() => (selected = null)}>Stäng</button>
		</div>
	{/if}
</Dialog>
