<script lang="ts">
	import { page } from '$app/stores';
	let { children } = $props();
	
	let isLogin = $derived($page.url.pathname === '/admin/login');
</script>

{#if isLogin}
	{@render children()}
{:else}
<div class="min-h-screen bg-background flex flex-col">
	<!-- Compact Top Navigation -->
	<header class="w-full bg-card border-b border-border px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2">
		<div class="flex items-center gap-6 w-full sm:w-auto">
			<h1 class="text-base font-bold text-foreground tracking-tight">Administratör</h1>
			<nav class="flex gap-1 overflow-x-auto">
				<a href="/admin/volunteers" class="px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap {$page.url.pathname === '/admin/volunteers' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}">
					Volontärer
				</a>
				<a href="/admin/roles" class="px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap {$page.url.pathname === '/admin/roles' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}">
					Roller
				</a>
				<a href="/admin/shifts" class="px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap {$page.url.pathname === '/admin/shifts' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}">
					Schemahantering
				</a>
			</nav>
		</div>
		<a href="/" class="px-3 py-1.5 text-xs font-semibold text-secondary hover:text-secondary-foreground transition-colors border border-border rounded hover:bg-muted whitespace-nowrap shrink-0">
			Visa publikt schema
		</a>
	</header>

	<!-- Main Content -->
	<main class="flex-1 p-4 overflow-y-auto">
		<div class="max-w-6xl mx-auto w-full">
			{@render children()}
		</div>
	</main>
</div>
{/if}
