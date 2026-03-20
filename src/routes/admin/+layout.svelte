<script lang="ts">
	import { page } from '$app/stores';
	let { children } = $props();
	
	let isLogin = $derived($page.url.pathname === '/admin/login');
</script>

{#if isLogin}
	{@render children()}
{:else}
<div class="min-h-screen bg-background flex flex-col md:flex-row">
	<!-- Sidebar -->
	<aside class="w-full md:w-64 bg-card border-b md:border-b-0 md:border-r border-border p-6 flex flex-col">
		<h1 class="text-2xl font-bold text-foreground mb-8">Administratör</h1>
		<nav class="space-y-2 flex-1">
			<a href="/admin/volunteers" class="block px-4 py-2.5 rounded-md text-sm font-medium transition-colors {$page.url.pathname === '/admin/volunteers' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}">
				Volontärer
			</a>
			<a href="/admin/roles" class="block px-4 py-2.5 rounded-md text-sm font-medium transition-colors {$page.url.pathname === '/admin/roles' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}">
				Roller
			</a>
			<a href="/admin/shifts" class="block px-4 py-2.5 rounded-md text-sm font-medium transition-colors {$page.url.pathname === '/admin/shifts' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}">
				Schemahantering
			</a>
		</nav>
		<div class="mt-8 pt-8 border-t border-border">
			<a href="/" class="block px-4 py-2 text-sm text-secondary hover:text-secondary-foreground transition-colors md:text-left text-center">
				Visa publikt schema
			</a>
		</div>
	</aside>

	<!-- Main Content -->
	<main class="flex-1 p-6 md:p-12 overflow-y-auto">
		{@render children()}
	</main>
</div>
{/if}
