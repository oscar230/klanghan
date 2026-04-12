<script lang="ts">
	import { enhance } from '$app/forms';
    import defaultPfp from "$lib/assets/default-pfp.svg";
	let { data, form } = $props();

    let newUserFileName = $state("");
    let uploadingIds = $state<Set<string>>(new Set());

    const handleFileChange = (e: Event, id: string | null = null) => {
        const input = e.target as HTMLInputElement;
        const fileName = input.files?.[0]?.name || "";
        if (id === null) {
            newUserFileName = fileName;
        } else {
            if (fileName) {
                uploadingIds.add(id);
                // @ts-ignore - submit is valid on form
                input.form?.requestSubmit();
            }
        }
    };
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
			<form method="POST" action="?/addUser" use:enhance={() => {
                return async ({ update }) => {
                    newUserFileName = "";
                    await update();
                };
            }} enctype="multipart/form-data" class="flex flex-col sm:flex-row gap-3">
				<input type="text" name="name" placeholder="Ny volontärs namn" required class="flex-1 px-3 py-1.5 bg-input border border-input-border text-foreground rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground text-xs" />
                <div class="flex-1 flex items-center gap-2">
                    <label class="cursor-pointer group flex items-center gap-2 px-3 py-1.5 bg-muted/50 border border-dashed border-input-border rounded hover:border-primary/50 transition-all overflow-hidden max-w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary shrink-0"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                        <span class="text-[10px] font-bold text-muted-foreground truncate">
                            {newUserFileName || "Välj bild..."}
                        </span>
                        <input type="file" name="imageFile" accept="image/*" class="hidden" onchange={handleFileChange} />
                    </label>
                </div>
				<button class="px-4 py-1.5 bg-primary text-primary-foreground font-bold rounded hover:opacity-90 transition-opacity text-xs whitespace-nowrap">Lägg till</button>
			</form>
		</div>
        <div class="p-2 space-y-1 max-h-[500px] overflow-y-auto">
            {#each data.users as user}
                <div class="flex justify-between items-center group p-2 hover:bg-muted/50 rounded border border-transparent hover:border-border transition-all">
                    <div class="flex items-center gap-3 flex-1 min-w-0">
                        <div class="relative">
                            <img src={user.imageUrl || defaultPfp} alt={user.name} class="w-10 h-10 rounded-lg object-cover border border-border shadow-sm shrink-0 bg-muted/50 {uploadingIds.has(user.id) ? 'opacity-30' : ''}" />
                            {#if uploadingIds.has(user.id)}
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            {/if}
                        </div>
                        <div class="flex flex-col min-w-0 flex-1">
                            <span class="font-bold text-foreground text-sm truncate">{user.name}</span>
                            <form method="POST" action="?/updateUser" use:enhance={() => {
                                return async ({ update }) => {
                                    uploadingIds.delete(user.id);
                                    await update();
                                };
                            }} enctype="multipart/form-data" class="mt-1.5">
                                <input type="hidden" name="id" value={user.id} />
                                <label class="inline-flex items-center gap-1.5 cursor-pointer text-[9px] font-bold text-muted-foreground/60 hover:text-primary transition-colors uppercase tracking-wider">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                                    Uppdatera bild
                                    <input 
                                        type="file" 
                                        name="imageFile" 
                                        accept="image/*"
                                        class="hidden"
                                        onchange={(e) => handleFileChange(e, user.id)}
                                    />
                                </label>
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

