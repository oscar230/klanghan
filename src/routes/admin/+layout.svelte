<script lang="ts">
	import { page } from '$app/stores';
	let { children } = $props();
	
	let isLogin = $derived($page.url.pathname === '/admin/login');
    let menuOpen = $state(false);
</script>

{#if isLogin}
	{@render children()}
{:else}
<div class="min-h-screen bg-background flex flex-col">
	<header class="w-full bg-card border-b border-border">
        <div class="px-4 py-3 flex items-center justify-between">
            <h1 class="text-base font-bold text-foreground tracking-tight">Administratör</h1>
            
            <!-- Mobile Menu Toggle -->
            <button class="sm:hidden p-1 text-muted-foreground hover:text-foreground" onclick={() => menuOpen = !menuOpen} aria-label="Toggle menu">
                {#if !menuOpen}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                {/if}
            </button>

            <!-- Desktop Nav -->
            <div class="hidden sm:flex items-center gap-4">
                <nav class="flex gap-1">
                    <a href="/admin/volunteers" class="px-3 py-1.5 rounded text-sm font-medium transition-colors {$page.url.pathname === '/admin/volunteers' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}">Volontärer</a>
                    <a href="/admin/roles" class="px-3 py-1.5 rounded text-sm font-medium transition-colors {$page.url.pathname === '/admin/roles' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}">Roller</a>
                    <a href="/admin/shifts" class="px-3 py-1.5 rounded text-sm font-medium transition-colors {$page.url.pathname === '/admin/shifts' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}">Schemahantering</a>
                </nav>
                <div class="w-px h-6 bg-border"></div>
                <a href="/" class="px-3 py-1.5 text-xs font-semibold text-secondary hover:text-secondary-foreground transition-colors border border-border rounded hover:bg-muted">Visa publikt schema</a>
            </div>
        </div>

        <!-- Mobile Nav Dropdown -->
        {#if menuOpen}
            <div class="sm:hidden border-t border-border bg-card px-2 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                <a href="/admin/volunteers" onclick={() => menuOpen = false} class="block px-3 py-2 rounded-md text-sm font-medium transition-colors {$page.url.pathname === '/admin/volunteers' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}">Volontärer</a>
                <a href="/admin/roles" onclick={() => menuOpen = false} class="block px-3 py-2 rounded-md text-sm font-medium transition-colors {$page.url.pathname === '/admin/roles' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}">Roller</a>
                <a href="/admin/shifts" onclick={() => menuOpen = false} class="block px-3 py-2 rounded-md text-sm font-medium transition-colors {$page.url.pathname === '/admin/shifts' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}">Schemahantering</a>
                <div class="h-px bg-border my-2 mx-2"></div>
                <a href="/" class="block px-3 py-2 text-sm font-semibold text-secondary hover:text-secondary-foreground">Visa publikt schema</a>
            </div>
        {/if}
	</header>

	<!-- Main Content -->
	<main class="flex-1 p-4 lg:p-6 2xl:px-10 overflow-y-auto">
		<div class="w-full max-w-[120rem] mx-auto">
			{@render children()}
		</div>
	</main>
</div>
{/if}
