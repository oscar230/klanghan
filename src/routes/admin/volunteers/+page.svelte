<script lang="ts">
	import { enhance } from '$app/forms';
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
			<form method="POST" action="?/addUser" use:enhance class="flex gap-2">
				<input type="text" name="name" placeholder="Ny volontärs namn" required class="w-1/2 px-3 py-1.5 bg-input border border-input-border text-foreground rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground text-xs" />
                <input type="url" name="imageUrl" placeholder="Bild-URL (frivilligt)" class="flex-1 px-3 py-1.5 bg-input border border-input-border text-foreground rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground text-xs" />
				<button class="px-4 py-1.5 bg-primary text-primary-foreground font-bold rounded hover:opacity-90 transition-opacity text-xs">Lägg till</button>
			</form>
		</div>
        <div class="p-2 space-y-1 max-h-96 overflow-y-auto">
            {#each data.users as user}
                <div class="flex justify-between items-center group p-2 hover:bg-muted/50 rounded border border-transparent hover:border-border transition-all">
                    <div class="flex items-center gap-3 flex-1 min-w-0">
                        {#if user.imageUrl}
                            <img src={user.imageUrl} alt={user.name} class="w-8 h-8 rounded-full object-cover border border-border shadow-sm shrink-0" />
                        {:else}
                            <div class="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs border border-secondary/20 shadow-sm shrink-0">{user.name.charAt(0).toUpperCase()}</div>
                        {/if}
                        <div class="flex flex-col min-w-0 flex-1">
                            <span class="font-bold text-foreground text-xs truncate">{user.name}</span>
                            <form method="POST" action="?/updateUser" use:enhance class="mt-1 flex items-center gap-2">
                                <input type="hidden" name="id" value={user.id} />
                                <input 
                                    type="url" 
                                    name="imageUrl" 
                                    value={user.imageUrl || ''} 
                                    placeholder="Ändra bild-URL" 
                                    class="flex-1 bg-transparent border-none p-0 text-[10px] text-muted-foreground focus:ring-0 placeholder:text-muted-foreground/50 h-auto"
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
                        {/if}
                        <form method="POST" action="?/deleteUser" use:enhance>
                            <input type="hidden" name="id" value={user.id} />
                            <button 
                                disabled={user.shiftCount > 0}
                                class="text-secondary hover:text-secondary-foreground text-[10px] font-bold px-2 py-1 hover:bg-secondary/20 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                title={user.shiftCount > 0 ? "Kan inte ta bort volontär med arbetspass" : "Ta bort volontär"}
                            >
                                Ta bort
                            </button>
                        </form>
                    </div>
                </div>
            {/each}
            
            {#if data.users.length === 0}
                <div class="text-center py-6 text-muted-foreground border border-dashed border-border/50 rounded text-xs">
                    Inga volontärer hittades.
                </div>
            {/if}
        </div>
	</div>
</div>
