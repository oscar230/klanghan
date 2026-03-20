<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form } = $props();
</script>

<svelte:head>
    <title>Roller - Administratör</title>
</svelte:head>

<div class="space-y-4 max-w-2xl">
	<div>
		<h2 class="text-xl font-bold text-foreground tracking-tight">Roller</h2>
		<p class="text-muted-foreground mt-0.5 text-xs">Hantera festivalens arbetsroller.</p>
	</div>

	{#if form?.error}
		<div class="bg-secondary/10 text-secondary border border-secondary/20 p-2.5 rounded text-xs font-medium">
			{form.error}
		</div>
	{/if}

	<div class="bg-card border border-border rounded shadow-sm">
		<div class="p-3 border-b border-border/50 bg-muted/20">
			<form method="POST" action="?/addRole" use:enhance class="flex flex-col gap-2">
                <div class="flex gap-2">
				    <input type="text" name="name" placeholder="Ny roll" required class="flex-1 px-3 py-1.5 bg-input border border-input-border text-foreground rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground text-xs" />
				    <button class="px-4 py-1.5 bg-primary text-primary-foreground font-bold rounded hover:opacity-90 transition-opacity text-xs">Lägg till</button>
                </div>
                <textarea name="description" placeholder="Beskrivning av rollen (frivilligt)" rows="2" class="w-full px-3 py-1.5 bg-input border border-input-border text-foreground rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground text-xs"></textarea>
			</form>
		</div>
        <div class="p-2 space-y-1 max-h-96 overflow-y-auto">
            {#each data.roles as role}
                <div class="flex justify-between items-start group p-2 hover:bg-muted/50 rounded border border-transparent hover:border-border transition-all">
                    <div class="flex flex-col gap-0.5 max-w-[80%]">
                        <span class="font-medium text-foreground text-xs">{role.name}</span>
                        {#if role.description}
                            <p class="text-[10px] text-muted-foreground leading-snug">{role.description}</p>
                        {/if}
                    </div>
                    <form method="POST" action="?/deleteRole" use:enhance class="mt-0.5">
                        <input type="hidden" name="id" value={role.id} />
                        <button class="text-secondary hover:text-secondary-foreground text-[10px] font-bold px-2 py-1 hover:bg-secondary/20 rounded transition-all whitespace-nowrap">Ta bort</button>
                    </form>
                </div>
            {/each}
            
            {#if data.roles.length === 0}
                <div class="text-center py-6 text-muted-foreground border border-dashed border-border/50 rounded text-xs">
                    Inga roller hittades.
                </div>
            {/if}
        </div>
	</div>
</div>
