<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/Icon.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import RowActions from '$lib/components/RowActions.svelte';
	import { submitWithNotice } from '$lib/notice.svelte';

	let { data } = $props();

	type Stage = (typeof data.stages)[number];

	let adding = $state(false);
	let editing = $state<Stage | null>(null);
</script>

<svelte:head>
	<title>Scener - Administratör</title>
</svelte:head>

{#snippet fields(stage: Stage | null)}
	<div>
		<label class="field-label" for="stage-name">Namn</label>
		<input id="stage-name" type="text" name="name" value={stage?.name ?? ''} required maxlength="100" class="field" />
	</div>
{/snippet}

<h1 class="text-2xl">Scener</h1>
<p class="text-muted-foreground mt-1 mb-6 text-sm">Scenerna där artisterna spelar. Flera scener kan spela samtidigt.</p>

{#if data.stages.length === 0}
	<p class="empty">Inga scener ännu. Lägg till en för att kunna boka artister.</p>
{:else}
	<ul class="list">
		{#each data.stages as stage (stage.id)}
			<li class="list-row">
				<div class="min-w-0 flex-1">
					<p class="truncate font-medium">{stage.name}</p>
					<p class="text-muted-foreground text-sm">{stage.performanceCount} {stage.performanceCount === 1 ? 'spelning' : 'spelningar'}</p>
				</div>

				<RowActions label={stage.name}>
					<a href="/admin/artists?stage={stage.id}" class="action">
						<Icon name="calendar" size={18} /> Visa artister
					</a>
					<button type="button" class="action action-primary" onclick={() => (editing = stage)}>
						<Icon name="pencil" size={18} /> Ändra
					</button>
					<form method="POST" action="?/deleteStage" use:enhance={submitWithNotice}>
						<input type="hidden" name="id" value={stage.id} />
						<button
							class="action action-danger"
							disabled={stage.performanceCount > 0}
							title={stage.performanceCount > 0 ? 'Kan inte ta bort en scen med artister' : undefined}
						>
							<Icon name="trash" size={18} /> Ta bort
						</button>
					</form>
				</RowActions>
			</li>
		{/each}
	</ul>
{/if}

<button type="button" class="fab" onclick={() => (adding = true)}>
	<Icon name="plus" /> Ny scen
</button>

<Modal open={adding} title="Ny scen" action="?/addStage" submitLabel="Lägg till" onclose={() => (adding = false)}>
	{@render fields(null)}
</Modal>

<Modal open={editing !== null} title="Ändra scen" action="?/updateStage" submitLabel="Spara" onclose={() => (editing = null)}>
	{#if editing}
		<input type="hidden" name="id" value={editing.id} />
		{@render fields(editing)}
	{/if}
</Modal>
