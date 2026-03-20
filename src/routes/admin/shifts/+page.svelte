<script lang="ts">
    import { enhance } from '$app/forms';
    import { DAYS, QUARTER_TIMES, formatOffset } from '$lib/time';
    import type { PageData } from './$types';
    
    let { data, form } = $props<{ data: PageData, form: any }>();
</script>

<svelte:head>
    <title>Schemahantering - Administratör</title>
</svelte:head>

<div class="space-y-4">
    <div>
        <h2 class="text-xl font-bold text-foreground tracking-tight">Schemahantering</h2>
        <p class="text-muted-foreground mt-0.5 text-xs">Boka in volontärer på arbetspass under festivalen.</p>
    </div>

    {#if form?.error}
        <div class="bg-secondary/10 text-secondary border border-secondary/20 p-2.5 rounded text-xs font-medium">
            {form.error}
        </div>
    {/if}

    <div class="bg-card border border-border rounded shadow-sm">
        <div class="p-3 border-b border-border/50 bg-muted/20">
            <form method="POST" action="?/addShift" use:enhance class="flex flex-wrap lg:flex-nowrap gap-2 items-end">
                
                <div class="flex-1 min-w-[120px]">
                    <label class="block text-[10px] font-bold text-primary uppercase mb-1" for="userId">Volontär</label>
                    <select name="userId" id="userId" required class="w-full px-2 py-1.5 bg-input border border-input-border text-foreground rounded focus:ring-1 focus:ring-primary outline-none text-xs transition-all">
                        <option value="">Välj...</option>
                        {#each data.users as user}
                            <option value={user.id}>{user.name}</option>
                        {/each}
                    </select>
                </div>
                
                <div class="flex-1 min-w-[120px]">
                    <label class="block text-[10px] font-bold text-primary uppercase mb-1" for="roleId">Roll</label>
                    <select name="roleId" id="roleId" required class="w-full px-2 py-1.5 bg-input border border-input-border text-foreground rounded focus:ring-1 focus:ring-primary outline-none text-xs transition-all">
                        <option value="">Välj...</option>
                        {#each data.roles as role}
                            <option value={role.id}>{role.name}</option>
                        {/each}
                    </select>
                </div>
                                
                <div class="min-w-[160px]">
                    <label class="block text-[10px] font-bold text-primary uppercase mb-1">Möte / Start</label>
                    <div class="flex gap-1">
                        <select name="startDay" required class="w-1/2 px-1.5 py-1.5 bg-input border border-input-border text-foreground rounded text-[11px] focus:ring-1 focus:ring-primary outline-none">
                            {#each DAYS as day, i}
                                <option value={i}>{day}</option>
                            {/each}
                        </select>
                        <select name="startTime" required class="w-1/2 px-1.5 py-1.5 bg-input border border-input-border text-foreground rounded text-[11px] focus:ring-1 focus:ring-primary outline-none">
                            {#each QUARTER_TIMES as time}
                                <option value={time}>{time}</option>
                            {/each}
                        </select>
                    </div>
                </div>
                
                <div class="min-w-[160px]">
                    <label class="block text-[10px] font-bold text-primary uppercase mb-1">Avslut / Slut</label>
                    <div class="flex gap-1">
                        <select name="endDay" required class="w-1/2 px-1.5 py-1.5 bg-input border border-input-border text-foreground rounded text-[11px] focus:ring-1 focus:ring-primary outline-none">
                            {#each DAYS as day, i}
                                <option value={i}>{day}</option>
                            {/each}
                        </select>
                        <select name="endTime" required class="w-1/2 px-1.5 py-1.5 bg-input border border-input-border text-foreground rounded text-[11px] focus:ring-1 focus:ring-primary outline-none">
                            {#each QUARTER_TIMES as time}
                                <option value={time}>{time}</option>
                            {/each}
                        </select>
                    </div>
                </div>
                
                <div class="w-full lg:w-auto shrink-0 lg:ml-2">
                    <button class="w-full lg:w-28 py-1.5 px-3 bg-primary text-primary-foreground font-bold rounded hover:opacity-90 transition-opacity text-xs whitespace-nowrap">Schemalägg</button>
                </div>
            </form>
        </div>
            
        <div class="overflow-x-auto">
            <table class="min-w-full text-left border-collapse text-xs">
                <thead class="bg-card border-b border-border">
                    <tr>
                        <th class="px-4 py-2 font-bold text-muted-foreground uppercase tracking-wider">Volontär</th>
                        <th class="px-4 py-2 font-bold text-muted-foreground uppercase tracking-wider">Roll</th>
                        <th class="px-4 py-2 font-bold text-muted-foreground uppercase tracking-wider">Start</th>
                        <th class="px-4 py-2 font-bold text-muted-foreground uppercase tracking-wider">Slut</th>
                        <th class="px-4 py-2 font-bold text-muted-foreground uppercase tracking-wider text-right">Åtgärd</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border bg-card">
                    {#each data.shifts as shift}
                        <tr class="hover:bg-muted/30 transition-colors">
                            <td class="px-4 py-2 font-semibold text-foreground">
                                {shift.userName}
                            </td>
                            <td class="px-4 py-2">
                                <span class="px-1.5 py-0.5 rounded-[3px] font-bold bg-secondary/10 text-secondary border border-secondary/20">
                                    {shift.roleName}
                                </span>
                            </td>
                            <td class="px-4 py-2 text-muted-foreground">{formatOffset(shift.startOffset)}</td>
                            <td class="px-4 py-2 text-muted-foreground">{formatOffset(shift.endOffset)}</td>
                            <td class="px-4 py-2 text-right">
                                <form method="POST" action="?/deleteShift" use:enhance class="inline">
                                    <input type="hidden" name="id" value={shift.id} />
                                    <button class="font-bold text-secondary hover:text-secondary-foreground hover:bg-secondary/10 px-2 py-1 rounded transition-all">Ta bort</button>
                                </form>
                            </td>
                        </tr>
                    {/each}
                    
                    {#if data.shifts.length === 0}
                        <tr>
                            <td colspan="5" class="px-4 py-6 text-center text-muted-foreground border-t border-border border-dashed">Inga arbetspass schemalagda ännu.</td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</div>
