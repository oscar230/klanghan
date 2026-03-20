<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form } = $props();
</script>

<svelte:head>
    <title>Roller - Administratör</title>
</svelte:head>

<div class="space-y-6 max-w-2xl">
	<div>
		<h2 class="text-3xl font-bold text-foreground tracking-tight">Roller</h2>
		<p class="text-muted-foreground mt-1 text-sm">Hantera festivalens arbetsroller (t.ex. Ljudtekniker, Scenbyggare).</p>
	</div>

	{#if form?.error}
		<div class="bg-secondary/10 text-secondary border border-secondary/20 p-4 rounded-md text-sm font-medium">
			{form.error}
		</div>
	{/if}

	<div class="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
		<div class="p-6">
			<form method="POST" action="?/addRole" use:enhance class="flex gap-3 mb-8">
				<input type="text" name="name" placeholder="Ny roll" required class="flex-1 px-4 py-2 bg-input border border-input-border text-foreground rounded-md focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground text-sm" />
				<button class="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:opacity-90 transition-opacity text-sm">Lägg till</button>
			</form>
			
			<div class="space-y-2">
				{#each data.roles as role}
					<div class="flex justify-between items-center group p-3 hover:bg-muted/50 rounded-md border border-transparent hover:border-border transition-all">
						<span class="font-medium text-foreground text-sm">{role.name}</span>
						<form method="POST" action="?/deleteRole" use:enhance>
							<input type="hidden" name="id" value={role.id} />
							<button class="text-secondary opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-secondary-foreground text-xs font-medium px-3 py-1.5 hover:bg-secondary/20 rounded transition-all">Ta bort</button>
						</form>
					</div>
				{/each}
				
				{#if data.roles.length === 0}
					<div class="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg text-sm">
						Inga roller hittades.
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
