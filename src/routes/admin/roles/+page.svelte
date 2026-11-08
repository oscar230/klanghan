<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/Icon.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import RowActions from '$lib/components/RowActions.svelte';
	import { submitWithNotice } from '$lib/notice.svelte';

	let { data } = $props();

	type Role = (typeof data.roles)[number];

	let adding = $state(false);
	let editing = $state<Role | null>(null);
</script>

<svelte:head>
	<title>Roller - Administratör</title>
</svelte:head>

{#snippet roleFields(role: Role | null)}
	<div>
		<label class="field-label" for="role-name">Namn</label>
		<input id="role-name" type="text" name="name" value={role?.name ?? ''} required class="field" />
	</div>
	<div>
		<label class="field-label" for="role-description">Beskrivning (frivilligt)</label>
		<textarea id="role-description" name="description" rows="4" class="field">{role?.description ?? ''}</textarea>
	</div>
{/snippet}

<h1 class="text-2xl">Roller</h1>
<p class="text-muted-foreground mt-1 mb-6 text-sm">Hantera festivalens arbetsroller.</p>

{#if data.roles.length === 0}
	<p class="text-muted-foreground py-12 text-center text-sm">Inga roller ännu.</p>
{:else}
	<ul class="list">
		{#each data.roles as role (role.id)}
			<li class="list-row">
				<div class="min-w-0 flex-1">
					<p class="truncate font-medium">{role.name}</p>
					<p class="text-muted-foreground text-sm">{role.shiftCount} pass</p>
					{#if role.description}
						<p class="text-muted-foreground mt-1 line-clamp-2 text-sm break-words">{role.description}</p>
					{/if}
				</div>

				<RowActions label={role.name}>
					<a href="/admin/roles/{role.id}" class="action">
						<Icon name="calendar" size={18} /> Visa schema
					</a>
					<button type="button" class="action action-primary" onclick={() => (editing = role)}>
						<Icon name="pencil" size={18} /> Ändra
					</button>
					<form method="POST" action="?/deleteRole" use:enhance={submitWithNotice}>
						<input type="hidden" name="id" value={role.id} />
						<button
							class="action action-danger"
							disabled={role.shiftCount > 0}
							title={role.shiftCount > 0 ? 'Kan inte ta bort en roll med arbetspass' : undefined}
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
	<Icon name="plus" /> Ny roll
</button>

<Modal open={adding} title="Ny roll" action="?/addRole" submitLabel="Lägg till" onclose={() => (adding = false)}>
	{@render roleFields(null)}
</Modal>

<Modal open={editing !== null} title="Ändra roll" action="?/updateRole" submitLabel="Spara" onclose={() => (editing = null)}>
	{#if editing}
		<input type="hidden" name="id" value={editing.id} />
		{@render roleFields(editing)}
	{/if}
</Modal>
