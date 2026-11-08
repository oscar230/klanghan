<script lang="ts">
	import { enhance } from '$app/forms';
	import Avatar from '$lib/components/Avatar.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import ImageField from '$lib/components/ImageField.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import RowActions from '$lib/components/RowActions.svelte';
	import { submitWithNotice } from '$lib/notice.svelte';

	let { data } = $props();

	type User = (typeof data.users)[number];

	let adding = $state(false);
	let editing = $state<User | null>(null);
</script>

<svelte:head>
	<title>Volontärer - Administratör</title>
</svelte:head>

<h1 class="text-2xl">Volontärer</h1>
<p class="text-muted-foreground mt-1 mb-6 text-sm">Hantera festivalens volontärer.</p>

{#if data.users.length === 0}
	<p class="empty">Inga volontärer ännu.</p>
{:else}
	<ul class="list">
		{#each data.users as user (user.id)}
			<li class="list-row">
				<Avatar src={user.imageUrl} name={user.name} />
				<div class="min-w-0 flex-1">
					<p class="truncate font-medium">{user.name}</p>
					<p class="text-muted-foreground text-sm">{user.shiftCount} inbokade pass</p>
				</div>

				<RowActions label={user.name}>
					<button type="button" class="action action-primary" onclick={() => (editing = user)}>
						<Icon name="image" size={18} /> Ändra bild
					</button>
					<form method="POST" action="?/removeImage" use:enhance={submitWithNotice}>
						<input type="hidden" name="id" value={user.id} />
						<button class="action action-danger" disabled={!user.imageUrl}>
							<Icon name="trash" size={18} /> Ta bort bild
						</button>
					</form>
					<form method="POST" action="?/deleteUser" use:enhance={submitWithNotice}>
						<input type="hidden" name="id" value={user.id} />
						<button
							class="action action-danger"
							disabled={user.shiftCount > 0}
							title={user.shiftCount > 0 ? 'Kan inte ta bort en volontär med arbetspass' : undefined}
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
	<Icon name="plus" /> Ny volontär
</button>

<Modal
	open={adding}
	title="Ny volontär"
	action="?/addUser"
	submitLabel="Lägg till"
	enctype="multipart/form-data"
	onclose={() => (adding = false)}
>
	<div>
		<label class="field-label" for="new-user-name">Namn</label>
		<input id="new-user-name" type="text" name="name" required maxlength="100" class="field" />
	</div>
	<ImageField />
</Modal>

<Modal
	open={editing !== null}
	title="Ändra bild"
	action="?/updateUser"
	submitLabel="Spara"
	enctype="multipart/form-data"
	onclose={() => (editing = null)}
>
	{#if editing}
		<input type="hidden" name="id" value={editing.id} />
		<p class="font-medium">{editing.name}</p>
		<ImageField current={editing.imageUrl} name={editing.name} required />
	{/if}
</Modal>
