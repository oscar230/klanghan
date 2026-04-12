<script lang="ts">
    import { enhance } from "$app/forms";
    let { data, form } = $props();

    let editingId = $state<string | null>(null);
    let activeMenuId = $state<string | null>(null);

    const toggleMenu = (e: MouseEvent, id: string) => {
        e.stopPropagation();
        activeMenuId = activeMenuId === id ? null : id;
    };

    if (typeof window !== "undefined") {
        window.onclick = () => (activeMenuId = null);
    }
</script>

<svelte:head>
    <title>Roller - Administratör</title>
</svelte:head>

<div class="space-y-4 max-w-2xl">
    <div>
        <h2 class="text-xl font-bold text-foreground tracking-tight">Roller</h2>
        <p class="text-muted-foreground mt-0.5 text-xs">
            Hantera festivalens arbetsroller.
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
                action="?/addRole"
                use:enhance
                class="flex flex-col gap-3"
            >
                <input
                    type="text"
                    name="name"
                    placeholder="Ny roll"
                    required
                    class="w-full px-3 py-1.5 bg-input border border-input-border text-foreground rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground text-xs font-medium"
                />
                <textarea
                    name="description"
                    placeholder="Beskrivning av rollen (frivilligt)"
                    rows="2"
                    class="w-full px-3 py-1.5 bg-input border border-input-border text-foreground rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground text-xs"
                ></textarea>
                <button
                    class="w-full sm:w-auto px-6 py-2 bg-primary text-primary-foreground font-bold rounded hover:opacity-90 transition-opacity text-xs self-end"
                    >Lägg till roll</button
                >
            </form>
        </div>
        <div class="p-2 space-y-1 max-h-[500px] overflow-y-auto">
            {#each data.roles as role}
                {#if editingId === role.id}
                    <div
                        class="p-3 bg-muted/30 rounded border border-primary/30 animate-in fade-in duration-200"
                    >
                        <form
                            method="POST"
                            action="?/updateRole"
                            use:enhance={() => {
                                editingId = null;
                                return async ({ update }) => {
                                    await update();
                                };
                            }}
                            class="space-y-2"
                        >
                            <input type="hidden" name="id" value={role.id} />
                            <input
                                type="text"
                                name="name"
                                value={role.name}
                                required
                                class="w-full px-3 py-1.5 bg-input border border-input-border text-foreground rounded focus:ring-1 focus:ring-primary outline-none text-xs font-bold"
                            />
                            <textarea
                                name="description"
                                value={role.description}
                                rows="3"
                                class="w-full px-3 py-1.5 bg-input border border-input-border text-foreground rounded focus:ring-1 focus:ring-primary outline-none text-xs leading-snug"
                            ></textarea>
                            <div class="flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onclick={() => (editingId = null)}
                                    class="px-3 py-1 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Avbryt
                                </button>
                                <button
                                    class="px-3 py-1 bg-primary text-primary-foreground font-bold rounded text-[10px] hover:opacity-90 transition-opacity"
                                >
                                    Spara ändringar
                                </button>
                            </div>
                        </form>
                    </div>
                {:else}
                    <div
                        class="flex justify-between items-start group p-2 hover:bg-muted/50 rounded border border-transparent hover:border-border transition-all relative"
                    >
                        <div class="flex flex-col gap-0.5 max-w-[70%]">
                            <div class="flex items-center gap-2">
                                <span
                                    class="font-medium text-foreground text-xs"
                                    >{role.name}</span
                                >
                                <span
                                    class="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider"
                                    >{role.shiftCount} pass</span
                                >
                            </div>
                            {#if role.description}
                                <p
                                    class="text-[10px] text-muted-foreground leading-snug break-words"
                                >
                                    {role.description}
                                </p>
                            {/if}
                        </div>

                        <!-- Desktop Actions -->
                        <div class="hidden sm:flex gap-2 items-center">
                            <a
                                href="/admin/roles/{role.id}"
                                class="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-lg transition-all shadow-sm border border-border"
                                title="Visa schema"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="shrink-0"
                                    ><rect
                                        width="18"
                                        height="18"
                                        x="3"
                                        y="4"
                                        rx="2"
                                        ry="2"
                                    /><line
                                        x1="16"
                                        y1="2"
                                        x2="16"
                                        y2="6"
                                    /><line x1="8" y1="2" x2="8" y2="6" /><line
                                        x1="3"
                                        y1="10"
                                        x2="21"
                                        y2="10"
                                    /></svg
                                >
                                <span
                                    class="text-[10px] font-bold uppercase tracking-wider"
                                    >Visa schema</span
                                >
                            </a>
                            <button
                                onclick={() => (editingId = role.id)}
                                class="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all shadow-sm border border-primary/10"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="shrink-0"
                                    ><path
                                        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                                    /><path
                                        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                                    /></svg
                                >
                                <span
                                    class="text-[10px] font-bold uppercase tracking-wider"
                                    >Ändra</span
                                >
                            </button>
                            <form
                                method="POST"
                                action="?/deleteRole"
                                use:enhance
                            >
                                <input
                                    type="hidden"
                                    name="id"
                                    value={role.id}
                                />
                                <button
                                    disabled={role.shiftCount > 0}
                                    class="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg transition-all shadow-sm border border-secondary/10 disabled:opacity-20"
                                    title={role.shiftCount > 0
                                        ? "Kan inte ta bort roll med arbetspass"
                                        : "Ta bort roll"}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        class="shrink-0"
                                        ><path d="M3 6h18" /><path
                                            d="M19 6v14c0 1-1 2-2 2H7c1 0-2-1-2-2V6"
                                        /><path
                                            d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
                                        /><line
                                            x1="10"
                                            x2="10"
                                            y1="11"
                                            y2="17"
                                        /><line
                                            x1="14"
                                            x2="14"
                                            y1="11"
                                            y2="17"
                                        /></svg
                                    >
                                    <span
                                        class="text-[10px] font-bold uppercase tracking-wider"
                                        >Ta bort</span
                                    >
                                </button>
                            </form>
                        </div>

                        <!-- Mobile Actions -->
                        <div class="sm:hidden relative">
                            <button
                                onclick={(e) => toggleMenu(e, role.id)}
                                class="w-10 h-10 flex items-center justify-center bg-muted border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    ><circle cx="12" cy="12" r="1" /><circle
                                        cx="12"
                                        cy="5"
                                        r="1"
                                    /><circle cx="12" cy="19" r="1" /></svg
                                >
                            </button>

                            {#if activeMenuId === role.id}
                                <div
                                    class="absolute right-0 top-12 z-50 w-44 bg-card border border-border rounded-xl shadow-xl p-2 space-y-1 animate-in fade-in zoom-in duration-100 origin-top-right backdrop-blur-md"
                                >
                                    <a
                                        href="/admin/roles/{role.id}"
                                        class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            ><rect
                                                width="18"
                                                height="18"
                                                x="3"
                                                y="4"
                                                rx="2"
                                                ry="2"
                                            /><line
                                                x1="16"
                                                y1="2"
                                                x2="16"
                                                y2="6"
                                            /><line
                                                x1="8"
                                                y1="2"
                                                x2="8"
                                                y2="6"
                                            /><line
                                                x1="3"
                                                y1="10"
                                                x2="21"
                                                y2="10"
                                            /></svg
                                        >
                                        Visa schema
                                    </a>
                                    <button
                                        onclick={() => {
                                            editingId = role.id;
                                            activeMenuId = null;
                                        }}
                                        class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded-lg text-xs font-bold text-primary transition-colors"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            ><path
                                                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                                            /><path
                                                d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                                            /></svg
                                        >
                                        Ändra
                                    </button>
                                    <form
                                        method="POST"
                                        action="?/deleteRole"
                                        use:enhance
                                    >
                                        <input
                                            type="hidden"
                                            name="id"
                                            value={role.id}
                                        />
                                        <button
                                            disabled={role.shiftCount > 0}
                                            class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded-lg text-xs font-bold text-secondary transition-colors text-left uppercase disabled:opacity-30"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                ><path d="M3 6h18" /><path
                                                    d="M19 6v14c0 1-1 2-2 2H7c1 0-2-1-2-2V6"
                                                /><path
                                                    d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
                                                /><line
                                                    x1="10"
                                                    x2="10"
                                                    y1="11"
                                                    y2="17"
                                                /><line
                                                    x1="14"
                                                    x2="14"
                                                    y1="11"
                                                    y2="17"
                                                /></svg
                                            >
                                            Ta bort
                                        </button>
                                    </form>
                                </div>
                            {/if}
                        </div>
                    </div>
                {/if}
            {/each}

            {#if data.roles.length === 0}
                <div
                    class="text-center py-6 text-muted-foreground border border-dashed border-border/50 rounded text-xs"
                >
                    Inga roller hittades.
                </div>
            {/if}
        </div>
    </div>

    <div
        class="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-500"
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
                ><circle cx="12" cy="12" r="10" /><line
                    x1="12"
                    y1="16"
                    x2="12"
                    y2="12"
                /><line x1="12" y1="8" x2="12.01" y2="8" /></svg
            >
        </div>
        <div class="space-y-1">
            <h4 class="text-xs font-bold text-foreground">
                Tips: Ta bort roll
            </h4>
            <p class="text-[10px] text-muted-foreground leading-relaxed">
                Om du behöver ta bort en roll, se först till att ingen volontär
                har den rollen tilldelad i ett schemalagt pass.
            </p>
        </div>
    </div>

    <div
        class="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-500"
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
                ><circle cx="12" cy="12" r="10" /><line
                    x1="12"
                    y1="16"
                    x2="12"
                    y2="12"
                /><line x1="12" y1="8" x2="12.01" y2="8" /></svg
            >
        </div>
        <div class="space-y-1">
            <h4 class="text-xs font-bold text-foreground">Tips: Visa schema</h4>
            <p class="text-[10px] text-muted-foreground leading-relaxed">
                Tryck på knappen "Visa schema" för att se alla pass där rollen
                är tilldelad.
            </p>
        </div>
    </div>

    <div
        class="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-500"
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
                ><circle cx="12" cy="12" r="10" /><line
                    x1="12"
                    y1="16"
                    x2="12"
                    y2="12"
                /><line x1="12" y1="8" x2="12.01" y2="8" /></svg
            >
        </div>
        <div class="space-y-1">
            <h4 class="text-xs font-bold text-foreground">
                Tips: Rollens beskrivning
            </h4>
            <p class="text-[10px] text-muted-foreground leading-relaxed">
                Skriv en utförlig beskrivning av rollen så att volontärerna vet
                vad som förväntas av dem.
            </p>
        </div>
    </div>
</div>
