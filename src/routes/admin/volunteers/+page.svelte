<script lang="ts">
	import { enhance } from '$app/forms';
    import defaultPfp from "$lib/assets/default-pfp.svg";
	let { data, form } = $props();
</script>

<svelte:head>
    <title>Volontärer - Administratör</title>
</svelte:head>

<div class="space-y-4 max-w-2xl">
	<div>
		<h2 class="text-xl font-bold text-foreground tracking-tight">Volontärer</h2>
		<p class="text-muted-foreground mt-0.5 text-xs">Hantera festivalens volontärer.</p>
	</div>

	{#if form?.error}
		<div class="bg-secondary/10 text-secondary border border-secondary/20 p-2.5 rounded text-xs font-medium">
			{form.error}
		</div>
	{/if}

	<div class="bg-card border border-border rounded shadow-sm">
		<div class="p-3 border-b border-border/50 bg-muted/20">
			<form method="POST" action="?/addUser" use:enhance enctype="multipart/form-data" class="flex flex-col sm:flex-row gap-3">
				<input type="text" name="name" placeholder="Ny volontärs namn" required class="flex-1 px-3 py-1.5 bg-input border border-input-border text-foreground rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground text-xs" />
                <div class="flex-1 flex items-center gap-2">
                    <label class="text-[10px] font-bold text-muted-foreground uppercase whitespace-nowrap">Profilbild:</label>
                    <input type="file" name="imageFile" accept="image/*" class="flex-1 text-[10px] text-muted-foreground file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30" />
                </div>
				<button class="px-4 py-1.5 bg-primary text-primary-foreground font-bold rounded hover:opacity-90 transition-opacity text-xs whitespace-nowrap">Lägg till</button>
			</form>
		</div>
        <div class="p-2 space-y-1 max-h-[500px] overflow-y-auto">
            {#each data.users as user}
                <div class="flex justify-between items-center group p-2 hover:bg-muted/50 rounded border border-transparent hover:border-border transition-all">
                    <div class="flex items-center gap-3 flex-1 min-w-0">
                        <img src={user.imageUrl || defaultPfp} alt={user.name} class="w-10 h-10 rounded-lg object-cover border border-border shadow-sm shrink-0 bg-muted/50" />
                        <div class="flex flex-col min-w-0 flex-1">
                            <span class="font-bold text-foreground text-sm truncate">{user.name}</span>
                            <form method="POST" action="?/updateUser" use:enhance enctype="multipart/form-data" class="mt-1.5 flex items-center gap-2">
                                <input type="hidden" name="id" value={user.id} />
                                <label class="text-[9px] font-bold text-muted-foreground/60 uppercase whitespace-nowrap">Uppdatera bild:</label>
                                <input 
                                    type="file" 
                                    name="imageFile" 
                                    accept="image/*"
                                    class="text-[9px] text-muted-foreground/50 file:mr-1.5 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[9px] file:font-bold file:bg-muted file:text-muted-foreground hover:file:bg-border transition-all"
                                    onchange={(e) => e.currentTarget.form?.requestSubmit()}
                                />
                            </form>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 ml-4">
                        {#if user.shiftCount > 0}
                            <div class="text-[9px] font-bold text-amber-500 uppercase bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20" title="Har inbokade pass">
                                {user.shiftCount} pass
                            </div>
                        {:else}
                            <form method="POST" action="?/deleteUser" use:enhance>
                                <input type="hidden" name="id" value={user.id} />
                                <button 
                                    class="text-secondary hover:text-secondary-foreground text-[10px] font-bold px-2 py-1 hover:bg-secondary/20 rounded transition-all whitespace-nowrap"
                                    title="Ta bort volontär"
                                >
                                    Ta bort
                                </button>
                            </form>
                        {/if}
                    </div>
                </div>
            {/each}
            
            {#each Array(Math.max(0, 3 - data.users.length)).fill(0) as _}
                <div class="h-12 invisible"></div>
            {/each}

            {#if data.users.length === 0}
                <div class="text-center py-6 text-muted-foreground border border-dashed border-border/50 rounded text-xs">
                    Inga volontärer hittades.
                </div>
            {/if}
        </div>
	</div>
</div>

