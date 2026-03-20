<script lang="ts">
    import { enhance } from '$app/forms';
    import { DAYS, formatOffset } from '$lib/time';
    import type { PageData } from './$types';
    
    let { data, form } = $props<{ data: PageData, form: any }>();
</script>

<svelte:head>
    <title>Schemahantering - Administratör</title>
</svelte:head>

<div class="space-y-6 max-w-5xl">
    <div>
        <h2 class="text-3xl font-bold text-foreground tracking-tight">Schemahantering</h2>
        <p class="text-muted-foreground mt-1 text-sm">Boka in volontärer på arbetspass under festivalen.</p>
    </div>

    {#if form?.error}
        <div class="bg-secondary/10 text-secondary border border-secondary/20 p-4 rounded-md text-sm font-medium">
            {form.error}
        </div>
    {/if}

    <div class="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        <div class="p-6">
            <form method="POST" action="?/addShift" use:enhance class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8 bg-muted/30 p-5 rounded-md border border-border">
                
                <div class="lg:col-span-1 border-b md:border-b-0 border-border pb-4 md:pb-0">
                    <label class="block text-xs font-semibold text-primary uppercase mb-1.5" for="userId">Volontär</label>
                    <select name="userId" id="userId" required class="w-full px-3 py-2 bg-input border border-input-border text-foreground rounded-md focus:ring-1 focus:ring-primary outline-none text-sm transition-all">
                        <option value="">Välj...</option>
                        {#each data.users as user}
                            <option value={user.id}>{user.name}</option>
                        {/each}
                    </select>
                </div>
                
                <div class="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-border pb-4 lg:pb-0 lg:pr-4">
                    <label class="block text-xs font-semibold text-primary uppercase mb-1.5" for="roleId">Roll</label>
                    <select name="roleId" id="roleId" required class="w-full px-3 py-2 bg-input border border-input-border text-foreground rounded-md focus:ring-1 focus:ring-primary outline-none text-sm transition-all">
                        <option value="">Välj...</option>
                        {#each data.roles as role}
                            <option value={role.id}>{role.name}</option>
                        {/each}
                    </select>
                </div>
                                
                <div class="lg:col-span-1">
                    <label class="block text-xs font-semibold text-primary uppercase mb-1.5">Möte / Start</label>
                    <div class="flex gap-2">
                        <select name="startDay" required class="w-1/2 px-2 py-2 bg-input border border-input-border text-foreground rounded-md text-xs focus:ring-1 focus:ring-primary outline-none">
                            {#each DAYS as day, i}
                                <option value={i}>{day}</option>
                            {/each}
                        </select>
                        <input type="time" name="startTime" required class="w-1/2 px-2 py-2 bg-input border border-input-border text-foreground rounded-md text-xs focus:ring-1 focus:ring-primary outline-none" />
                    </div>
                </div>
                
                <div class="lg:col-span-1 border-b lg:border-b-0 border-border pb-4 lg:pb-0">
                    <label class="block text-xs font-semibold text-primary uppercase mb-1.5">Avslut / Slut</label>
                    <div class="flex gap-2">
                        <select name="endDay" required class="w-1/2 px-2 py-2 bg-input border border-input-border text-foreground rounded-md text-xs focus:ring-1 focus:ring-primary outline-none">
                            {#each DAYS as day, i}
                                <option value={i}>{day}</option>
                            {/each}
                        </select>
                        <input type="time" name="endTime" required class="w-1/2 px-2 py-2 bg-input border border-input-border text-foreground rounded-md text-xs focus:ring-1 focus:ring-primary outline-none" />
                    </div>
                </div>
                
                <div class="lg:col-span-2 flex flex-col justify-end mt-2 lg:mt-0 lg:ml-2">
                    <button class="w-full py-2 bg-primary text-primary-foreground font-medium rounded-md hover:opacity-90 transition-opacity text-sm">Schemalägg</button>
                    <p class="text-[10px] text-muted-foreground mt-2 text-center">Schemalagda timmar beräknas dynamiskt</p>
                </div>
            </form>
            
            <div class="overflow-x-auto rounded-md border border-border">
                <table class="min-w-full text-left border-collapse">
                    <thead class="bg-muted/50 border-b border-border">
                        <tr>
                            <th class="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Volontär</th>
                            <th class="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Roll</th>
                            <th class="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Start</th>
                            <th class="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Slut</th>
                            <th class="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase text-right">Åtgärder</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-border bg-card">
                        {#each data.shifts as shift}
                            <tr class="hover:bg-muted/20 transition-colors">
                                <td class="px-5 py-3 text-sm font-medium text-foreground">
                                    {shift.userName}
                                </td>
                                <td class="px-5 py-3 text-sm text-foreground">
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-secondary/10 text-secondary border border-secondary/20">
                                        {shift.roleName}
                                    </span>
                                </td>
                                <td class="px-5 py-3 text-sm text-muted-foreground font-medium">{formatOffset(shift.startOffset)}</td>
                                <td class="px-5 py-3 text-sm text-muted-foreground font-medium">{formatOffset(shift.endOffset)}</td>
                                <td class="px-5 py-3 text-right">
                                    <form method="POST" action="?/deleteShift" use:enhance class="inline">
                                        <input type="hidden" name="id" value={shift.id} />
                                        <button class="text-xs font-medium text-secondary hover:text-secondary-foreground hover:bg-secondary/10 px-3 py-1.5 rounded transition-all">Ta bort</button>
                                    </form>
                                </td>
                            </tr>
                        {/each}
                        
                        {#if data.shifts.length === 0}
                            <tr>
                                <td colspan="5" class="px-5 py-8 text-center text-muted-foreground text-sm border-2 border-dashed border-border mx-4">Inga arbetspass schemalagda ännu.</td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
