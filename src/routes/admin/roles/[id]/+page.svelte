<script lang="ts">
	import { formatOffset, formatShiftTime, getDuration } from "$lib/time";
    import defaultPfp from "$lib/assets/default-pfp.svg";
	let { data } = $props();
</script>

<svelte:head>
    <title>{data.role.name} - Schema</title>
</svelte:head>

<div class="space-y-6 max-w-2xl px-1">
	<div class="flex items-center justify-between">
        <div>
		    <h2 class="text-xl font-bold text-foreground tracking-tight">{data.role.name}</h2>
		    <p class="text-muted-foreground mt-0.5 text-xs">Fullständigt schema och täckning.</p>
        </div>
        <a 
            href="/admin/roles"
            class="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-lg transition-all text-[10px] font-bold uppercase tracking-wider border border-border"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Tillbaka
        </a>
	</div>

    {#if data.days.length === 0}
        <div class="bg-card border border-border border-dashed rounded-xl p-12 text-center">
            <div class="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <p class="text-sm font-medium text-muted-foreground">Inga arbetspass inbokade för denna roll än.</p>
        </div>
    {:else}
        <div class="space-y-8">
            {#each data.days as day}
                <div class="space-y-3">
                    <h3 class="text-sm font-bold text-foreground/80 flex items-center gap-2 px-1">
                        <span class="w-2 h-2 rounded-full bg-primary"></span>
                        {day.dayName}
                    </h3>
                    
                    <div class="relative pl-4 space-y-4 before:absolute before:left-[21px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border/40">
                        {#each day.items as item}
                            <div class="relative">
                                <!-- Marker -->
                                <div class="absolute left-[-22px] top-4 w-3 h-3 rounded-full border-2 bg-background z-10 
                                    {item.type === 'shift' ? 'border-primary' : 'border-amber-500 animate-pulse'}"></div>

                                {#if item.type === 'gap'}
                                    <div class="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between group hover:bg-amber-500/10 transition-colors">
                                        <div class="flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                            </div>
                                            <div>
                                                <p class="text-[10px] font-black text-amber-600 uppercase tracking-widest">Lucka i schemat</p>
                                                <p class="text-xs font-bold text-amber-900/80">
                                                    {formatOffset(item.startOffset).split(' ')[1]} - {formatOffset(item.endOffset).split(' ')[1]}
                                                </p>
                                            </div>
                                        </div>
                                        <div class="text-[10px] font-bold text-amber-600/70 bg-amber-500/10 px-2 py-1 rounded">
                                            {getDuration(item.startOffset, item.endOffset)}
                                        </div>
                                    </div>
                                {:else}
                                    <div class="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/30 transition-all flex items-center justify-between">
                                        <div class="flex items-center gap-4">
                                            <img src={item.userImageUrl || defaultPfp} alt={item.userName} class="w-10 h-10 rounded-lg object-cover border border-border shadow-sm bg-muted/50" />
                                            <div>
                                                <p class="text-xs font-bold text-foreground">{item.userName}</p>
                                                <p class="text-[10px] font-medium text-muted-foreground">
                                                    {formatOffset(item.startOffset).split(' ')[1]} - {formatOffset(item.endOffset).split(' ')[1]}
                                                </p>
                                            </div>
                                        </div>
                                        <div class="text-[10px] font-bold text-primary/70 bg-primary/5 px-2 py-1 rounded border border-primary/10">
                                            {getDuration(item.startOffset, item.endOffset)}
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <div class="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3 items-start">
        <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </div>
        <div class="space-y-1">
            <h4 class="text-xs font-bold text-foreground">Tips för schema-granskning</h4>
            <p class="text-[10px] text-muted-foreground leading-relaxed">
                Tidsluckor (gaps) identifieras automatiskt som perioder med noll bemanning mellan det första och sista passet för dagen. 
                Detta hjälper dig att se till att dörrar aldrig lämnas obevakade!
            </p>
        </div>
    </div>
</div>
