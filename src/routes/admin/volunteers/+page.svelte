<script lang="ts">
    import { enhance } from "$app/forms";
    import defaultPfp from "$lib/assets/default-pfp.svg";
    import { SvelteSet } from "svelte/reactivity";
    let { data, form } = $props();

    let newUserFileName = $state("");
    let uploadingIds = new SvelteSet<string>();
    let activeMenuId = $state<string | null>(null);

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

    const enhanceUpload = (id: string) => () => async ({ update }: { update: () => Promise<void> }) => {
        uploadingIds.delete(id);
        await update();
    };

    const toggleMenu = (e: MouseEvent, id: string) => {
        e.stopPropagation();
        activeMenuId = activeMenuId === id ? null : id;
    };
</script>

<!-- Close the row menu when clicking elsewhere -->
<svelte:window onclick={() => (activeMenuId = null)} />

<svelte:head>
    <title>Volontärer - Administratör</title>
</svelte:head>

<div class="space-y-4">
    <div>
        <h2 class="text-xl font-bold text-foreground tracking-tight">
            Volontärer
        </h2>
        <p class="text-muted-foreground mt-0.5 text-xs">
            Hantera festivalens volontärer.
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
                action="?/addUser"
                use:enhance={() => {
                    return async ({ update }) => {
                        newUserFileName = "";
                        await update();
                    };
                }}
                enctype="multipart/form-data"
                class="flex flex-col sm:flex-row gap-3"
            >
                <input
                    type="text"
                    name="name"
                    placeholder="Ny volontärs namn"
                    required
                    class="flex-1 px-3 py-1.5 bg-input border border-input-border text-foreground rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground text-xs"
                />
                <div class="flex-1 flex items-center gap-2">
                    <label
                        class="cursor-pointer group flex items-center gap-2 px-3 py-1.5 bg-muted/50 border border-dashed border-input-border rounded hover:border-primary/50 transition-all overflow-hidden max-w-full"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="text-primary shrink-0"
                            ><path
                                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                            /><polyline points="17 8 12 3 7 8" /><line
                                x1="12"
                                x2="12"
                                y1="3"
                                y2="15"
                            /></svg
                        >
                        <span
                            class="text-[10px] font-bold text-muted-foreground truncate"
                        >
                            {newUserFileName || "Välj bild..."}
                        </span>
                        <input
                            type="file"
                            name="imageFile"
                            accept="image/*"
                            class="hidden"
                            onchange={handleFileChange}
                        />
                    </label>
                </div>
                <button
                    class="px-4 py-1.5 bg-primary text-primary-foreground font-bold rounded hover:opacity-90 transition-opacity text-xs whitespace-nowrap"
                    >Lägg till</button
                >
            </form>
        </div>
        <div class="p-2 grid content-start gap-1 lg:grid-cols-2 2xl:grid-cols-3 max-h-[500px] lg:max-h-[calc(100vh-18rem)] overflow-y-auto">
            {#each data.users as user}
                <div
                    class="flex justify-between items-center group p-2 hover:bg-muted/50 rounded border border-transparent hover:border-border transition-all relative"
                >
                    <div class="flex items-center gap-3 flex-1 min-w-0">
                        <div class="relative">
                            <img
                                src={user.imageUrl || defaultPfp}
                                alt={user.name}
                                class="w-10 h-10 rounded-lg object-cover border border-border shadow-sm shrink-0 bg-muted/50 {uploadingIds.has(
                                    user.id,
                                )
                                    ? 'opacity-30'
                                    : ''}"
                            />
                            {#if uploadingIds.has(user.id)}
                                <div
                                    class="absolute inset-0 flex items-center justify-center"
                                >
                                    <div
                                        class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"
                                    ></div>
                                </div>
                            {/if}
                        </div>
                        <div class="flex flex-col min-w-0 flex-1">
                            <span
                                class="font-bold text-foreground text-sm truncate"
                                >{user.name}</span
                            >
                            <span
                                class="text-[10px] text-muted-foreground font-medium uppercase tracking-wider"
                                >{user.shiftCount} inbokade pass</span
                            >
                        </div>
                    </div>

                    <!-- Mobile/Desktop Responsive Actions -->
                    <div class="flex items-center gap-2 ml-4">
                        <!-- Desktop View: Full buttons -->
                        <div class="hidden sm:flex items-center gap-2">
                            <div class="flex gap-2">
                                <form
                                    method="POST"
                                    action="?/updateUser"
                                    use:enhance={enhanceUpload(user.id)}
                                    enctype="multipart/form-data"
                                >
                                    <input
                                        type="hidden"
                                        name="id"
                                        value={user.id}
                                    />
                                    <label
                                        class="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all shadow-sm border border-primary/10"
                                        title="Uppdatera bild"
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
                                                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                                            /><polyline
                                                points="17 8 12 3 7 8"
                                            /><line
                                                x1="12"
                                                x2="12"
                                                y1="3"
                                                y2="15"
                                            /></svg
                                        >
                                        <span
                                            class="text-[10px] font-bold uppercase tracking-wider"
                                            >Ändra</span
                                        >
                                        <input
                                            type="file"
                                            name="imageFile"
                                            accept="image/*"
                                            class="hidden"
                                            onchange={(e) =>
                                                handleFileChange(e, user.id)}
                                        />
                                    </label>
                                </form>
                                {#if user.imageUrl}
                                    <form
                                        method="POST"
                                        action="?/removeImage"
                                        use:enhance
                                    >
                                        <input
                                            type="hidden"
                                            name="id"
                                            value={user.id}
                                        />
                                        <button
                                            class="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg transition-all shadow-sm border border-secondary/10"
                                            title="Ta bort bild"
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
                                                /><circle
                                                    cx="12"
                                                    cy="13"
                                                    r="3"
                                                /></svg
                                            >
                                            <span
                                                class="text-[10px] font-bold uppercase tracking-wider"
                                                >Ta bort bild</span
                                            >
                                        </button>
                                    </form>
                                {/if}
                            </div>
                            <div class="w-px h-6 bg-border/50 mx-1"></div>
                            <form
                                method="POST"
                                action="?/deleteUser"
                                use:enhance
                            >
                                <input
                                    type="hidden"
                                    name="id"
                                    value={user.id}
                                />
                                <button
                                    disabled={user.shiftCount > 0}
                                    class="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg transition-all shadow-sm border border-secondary/10 disabled:opacity-20"
                                    title="Ta bort volontär"
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
                                        >Ta bort volontär</span
                                    >
                                </button>
                            </form>
                        </div>

                        <!-- Mobile View: Menu Button -->
                        <div class="sm:hidden relative">
                            <button
                                onclick={(e) => toggleMenu(e, user.id)}
                                aria-label="Fler åtgärder för {user.name}"
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

                            {#if activeMenuId === user.id}
                                <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
                                <div
                                    onclick={(e) => e.stopPropagation()}
                                    class="absolute right-0 top-12 z-50 w-48 bg-card border border-border rounded-xl shadow-xl p-2 space-y-1 animate-in fade-in zoom-in duration-100 origin-top-right backdrop-blur-md"
                                >
                                    <form
                                        method="POST"
                                        action="?/updateUser"
                                        use:enhance={enhanceUpload(user.id)}
                                        enctype="multipart/form-data"
                                    >
                                        <input
                                            type="hidden"
                                            name="id"
                                            value={user.id}
                                        />
                                        <label
                                            class="flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded-lg text-xs font-bold text-primary transition-colors cursor-pointer"
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
                                                    d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                                                /><polyline
                                                    points="17 8 12 3 7 8"
                                                /><line
                                                    x1="12"
                                                    x2="12"
                                                    y1="3"
                                                    y2="15"
                                                /></svg
                                            >
                                            Ändra bild
                                            <input
                                                type="file"
                                                name="imageFile"
                                                accept="image/*"
                                                class="hidden"
                                                onchange={(e) =>
                                                    handleFileChange(
                                                        e,
                                                        user.id,
                                                    )}
                                            />
                                        </label>
                                    </form>
                                    {#if user.imageUrl}
                                        <form
                                            method="POST"
                                            action="?/removeImage"
                                            use:enhance
                                        >
                                            <input
                                                type="hidden"
                                                name="id"
                                                value={user.id}
                                            />
                                            <button
                                                class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded-lg text-xs font-bold text-secondary transition-colors"
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
                                                    /><circle
                                                        cx="12"
                                                        cy="13"
                                                        r="3"
                                                    /></svg
                                                >
                                                Ta bort bild
                                            </button>
                                        </form>
                                    {/if}
                                    <div class="h-px bg-border/50 my-1"></div>
                                    <form
                                        method="POST"
                                        action="?/deleteUser"
                                        use:enhance
                                    >
                                        <input
                                            type="hidden"
                                            name="id"
                                            value={user.id}
                                        />
                                        <button
                                            disabled={user.shiftCount > 0}
                                            class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/10 rounded-lg text-xs font-bold text-secondary transition-colors disabled:opacity-30"
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
                                            Ta bort volontär
                                        </button>
                                    </form>
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            {/each}

            {#if data.users.length === 0}
                <div
                    class="col-span-full text-center py-6 text-muted-foreground border border-dashed border-border/50 rounded text-xs"
                >
                    Inga volontärer hittades.
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
                Tips: Ta bort volontär
            </h4>
            <p class="text-[10px] text-muted-foreground leading-relaxed">
                Om du behöver ta bort en volontär, se först till att denna
                volontär inte har några pass tilldelade.
            </p>
        </div>
    </div>
</div>
