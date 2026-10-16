<script lang="ts">
    import { enhance } from "$app/forms";
    import {
        DAYS,
        HOURS,
        QUARTERS,
        formatOffset,
        formatShiftTime,
    } from "$lib/time";
    import type { PageData } from "./$types";

    let { data, form }: { data: PageData; form: any } = $props();

    function hasOverlap(shift: (typeof data.shifts)[0]) {
        return data.shifts.some(
            (s: any) =>
                s.id !== shift.id &&
                s.userId === shift.userId &&
                s.startOffset < shift.endOffset &&
                s.endOffset > shift.startOffset,
        );
    }
</script>

<svelte:head>
    <title>Schemahantering - Administratör</title>
</svelte:head>

<div class="space-y-4">
    <div>
        <h2 class="text-xl font-bold text-foreground tracking-tight">
            Schemahantering
        </h2>
        <p class="text-muted-foreground mt-0.5 text-xs">
            Boka in volontärer på arbetspass under festivalen.
        </p>
    </div>

    {#if form?.error}
        <div
            class="bg-secondary/10 text-secondary border border-secondary/20 p-2.5 rounded text-xs font-medium"
        >
            {form.error}
        </div>
    {/if}

    <div class="bg-card border border-border rounded shadow-sm">
        <div class="p-3 border-b border-border/50 bg-muted/20">
            <form
                method="POST"
                action="?/addShift"
                use:enhance
                class="flex flex-wrap lg:flex-nowrap gap-2 items-end"
            >
                <div class="flex-1 min-w-[120px]">
                    <label
                        class="block text-[10px] font-bold text-primary uppercase mb-1"
                        for="userId">Volontär</label
                    >
                    <select
                        name="userId"
                        id="userId"
                        required
                        class="w-full px-2 py-1.5 bg-input border border-input-border text-foreground rounded focus:ring-1 focus:ring-primary outline-none text-xs transition-all"
                    >
                        <option value="">Välj...</option>
                        {#each data.users as user}
                            <option value={user.id}>{user.name}</option>
                        {/each}
                    </select>
                </div>

                <div class="flex-1 min-w-[120px]">
                    <label
                        class="block text-[10px] font-bold text-primary uppercase mb-1"
                        for="roleId">Roll</label
                    >
                    <select
                        name="roleId"
                        id="roleId"
                        required
                        class="w-full px-2 py-1.5 bg-input border border-input-border text-foreground rounded focus:ring-1 focus:ring-primary outline-none text-xs transition-all"
                    >
                        <option value="">Välj...</option>
                        {#each data.roles as role}
                            <option value={role.id}>{role.name}</option>
                        {/each}
                    </select>
                </div>

                <div class="min-w-[180px]">
                    <span
                        class="block text-[10px] font-bold text-primary uppercase mb-1"
                        >Start</span
                    >
                    <div class="flex gap-1 items-center">
                        <select
                            name="startDay"
                            required
                            class="flex-1 px-1.5 py-1.5 bg-input border border-input-border text-foreground rounded text-[11px] focus:ring-1 focus:ring-primary outline-none"
                        >
                            {#each DAYS as day, i}
                                <option value={i}>{day}</option>
                            {/each}
                        </select>
                        <select
                            name="startHour"
                            required
                            class="w-[42px] px-1 py-1.5 bg-input border border-input-border text-foreground rounded text-[11px] focus:ring-1 focus:ring-primary outline-none text-center"
                        >
                            {#each HOURS as h}
                                <option value={h}>{h}</option>
                            {/each}
                        </select>
                        <span class="text-muted-foreground font-bold text-xs"
                            >:</span
                        >
                        <select
                            name="startMinute"
                            required
                            class="w-[42px] px-1 py-1.5 bg-input border border-input-border text-foreground rounded text-[11px] focus:ring-1 focus:ring-primary outline-none text-center"
                        >
                            {#each QUARTERS as m}
                                <option value={m}>{m}</option>
                            {/each}
                        </select>
                    </div>
                </div>

                <div class="min-w-[180px]">
                    <span
                        class="block text-[10px] font-bold text-primary uppercase mb-1"
                        >Slut</span
                    >
                    <div class="flex gap-1 items-center">
                        <select
                            name="endDay"
                            required
                            class="flex-1 px-1.5 py-1.5 bg-input border border-input-border text-foreground rounded text-[11px] focus:ring-1 focus:ring-primary outline-none"
                        >
                            {#each DAYS as day, i}
                                <option value={i}>{day}</option>
                            {/each}
                        </select>
                        <select
                            name="endHour"
                            required
                            class="w-[42px] px-1 py-1.5 bg-input border border-input-border text-foreground rounded text-[11px] focus:ring-1 focus:ring-primary outline-none text-center"
                        >
                            {#each HOURS as h}
                                <option value={h}>{h}</option>
                            {/each}
                        </select>
                        <span class="text-muted-foreground font-bold text-xs"
                            >:</span
                        >
                        <select
                            name="endMinute"
                            required
                            class="w-[42px] px-1 py-1.5 bg-input border border-input-border text-foreground rounded text-[11px] focus:ring-1 focus:ring-primary outline-none text-center"
                        >
                            {#each QUARTERS as m}
                                <option value={m}>{m}</option>
                            {/each}
                        </select>
                    </div>
                </div>

                <div class="w-full lg:w-auto shrink-0 lg:ml-2">
                    <button
                        class="w-full lg:w-28 py-1.5 px-3 bg-primary text-primary-foreground font-bold rounded hover:opacity-90 transition-opacity text-xs whitespace-nowrap"
                        >Schemalägg</button
                    >
                </div>
            </form>
        </div>

        <div class="overflow-x-auto">
            <table class="min-w-full text-left border-collapse text-xs">
                <thead class="bg-card border-b border-border">
                    <tr>
                        <th
                            class="px-4 py-2 font-bold text-muted-foreground uppercase tracking-wider"
                            >Volontär</th
                        >
                        <th
                            class="px-4 py-2 font-bold text-muted-foreground uppercase tracking-wider"
                            >Roll</th
                        >
                        <th
                            class="px-4 py-2 font-bold text-muted-foreground uppercase tracking-wider"
                            >Start - Slut (Total)</th
                        >
                        <th
                            class="px-4 py-2 font-bold text-muted-foreground uppercase tracking-wider text-right"
                            >Åtgärd</th
                        >
                    </tr>
                </thead>
                <tbody class="divide-y divide-border bg-card">
                    {#each data.shifts as shift (shift.id)}
                        <tr
                            class="hover:bg-muted/30 transition-colors {hasOverlap(
                                shift,
                            )
                                ? 'bg-red-950/20'
                                : ''}"
                        >
                            <td
                                class="px-4 py-2 font-semibold {hasOverlap(
                                    shift,
                                )
                                    ? 'text-red-400'
                                    : 'text-foreground'}"
                            >
                                {shift.userName}
                                {#if hasOverlap(shift)}
                                    <span
                                        class="ml-2 text-red-500 font-extrabold text-[9px] uppercase bg-red-950/60 px-1 py-0.5 rounded border border-red-900/50 shadow-sm"
                                        title="Krockar med ett annat arbetspass!"
                                        >⚠️ Krock</span
                                    >
                                {/if}
                            </td>
                            <td class="px-4 py-2 text-foreground font-medium">
                                {shift.roleName}
                            </td>
                            <td
                                class="px-4 py-2 text-muted-foreground font-medium"
                                >{formatShiftTime(
                                    shift.startOffset,
                                    shift.endOffset,
                                )}</td
                            >
                            <td
                                class="px-4 py-2 flex items-center justify-end gap-2 text-right"
                            >
                                <form
                                    method="POST"
                                    action="?/updateShiftUser"
                                    use:enhance
                                    class="inline-flex items-center"
                                >
                                    <input
                                        type="hidden"
                                        name="shiftId"
                                        value={shift.id}
                                    />
                                    <div class="relative">
                                        <select
                                            name="userId"
                                            onchange={(e) =>
                                                e.currentTarget.form?.requestSubmit()}
                                            class="px-2 py-1 bg-secondary/10 text-secondary hover:bg-secondary/20 hover:text-secondary-foreground border border-secondary/20 rounded font-bold text-xs appearance-none outline-none focus:ring-1 focus:ring-primary cursor-pointer pr-6 transition-all"
                                            title="Byt volontär"
                                        >
                                            {#each data.users as user}
                                                {#if user.id === shift.userId}
                                                    <option
                                                        value={user.id}
                                                        selected
                                                        class="text-foreground bg-popover font-medium"
                                                        >{user.name}</option
                                                    >
                                                {:else}
                                                    <option
                                                        value={user.id}
                                                        class="text-foreground bg-popover font-medium"
                                                        >{user.name}</option
                                                    >
                                                {/if}
                                            {/each}
                                        </select>
                                        <svg
                                            class="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-secondary pointer-events-none"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                            ><path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M19 9l-7 7-7-7"
                                            ></path></svg
                                        >
                                    </div>
                                </form>
                                <form
                                    method="POST"
                                    action="?/deleteShift"
                                    use:enhance
                                    class="inline"
                                >
                                    <input
                                        type="hidden"
                                        name="id"
                                        value={shift.id}
                                    />
                                    <button
                                        class="font-bold text-secondary hover:text-secondary-foreground hover:bg-secondary/10 px-2 py-1 rounded transition-all whitespace-nowrap"
                                        >Ta bort</button
                                    >
                                </form>
                            </td>
                        </tr>
                    {/each}

                    {#if data.shifts.length === 0}
                        <tr>
                            <td
                                colspan="4"
                                class="px-4 py-6 text-center text-muted-foreground border-t border-border border-dashed"
                                >Inga arbetspass schemalagda ännu.</td
                            >
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>
    </div>

    <div
        class="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3 items-start"
    >
        <div
            class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-primary"
                ><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path
                    d="M12 8h.01"
                /></svg
            >
        </div>
        <div class="space-y-1">
            <h4 class="text-xs font-bold text-foreground">
                Tips: Se luckor i schemat
            </h4>
            <p class="text-[10px] text-muted-foreground leading-relaxed">
                Gå till sidan "Roller" och välj den roll du vill visa alla
                schemalagda pass för. Då kan du se luckor i schemat för just den
                rollen.
            </p>
        </div>
    </div>

    <div
        class="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3 items-start"
    >
        <div
            class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-primary"
                ><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path
                    d="M12 8h.01"
                /></svg
            >
        </div>
        <div class="space-y-1">
            <h4 class="text-xs font-bold text-foreground">
                Tips: Krock i schemat
            </h4>
            <p class="text-[10px] text-muted-foreground leading-relaxed">
                En dubbelbokad volontär markeras med en röd text. Volotärer bör
                inte vara schemalagda på flera pass samtidigt, om så krävs skapa
                istället en ny roll som täcker uppdraget för den volontären.
            </p>
        </div>
    </div>
</div>
