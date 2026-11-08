<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import Snackbar from '$lib/components/Snackbar.svelte';

	let { children } = $props();

	let inAdmin = $derived(page.url.pathname === '/admin' || page.url.pathname.startsWith('/admin/'));
</script>

<header class="bg-background border-border sticky top-0 z-30 border-b">
	<div class="mx-auto flex h-16 max-w-3xl items-center gap-1 px-4">
		<a href={inAdmin ? '/admin' : '/'} class="mr-auto text-xl">Klanglandet</a>

		{#if inAdmin}
			<a href="/" class="icon-btn" aria-label="Visa publikt schema" title="Visa publikt schema">
				<Icon name="calendar" />
			</a>
		{:else}
			<a href="/admin" class="icon-btn" aria-label="Administratör" title="Administratör">
				<Icon name="admin" />
			</a>
		{/if}
		<ThemeToggle />
	</div>
	{#if inAdmin && page.url.pathname !== '/admin/login'}
		<nav aria-label="Administratör" class="mx-auto flex max-w-3xl overflow-x-auto px-2">
			{#each [['/admin/volunteers', 'Volontärer'], ['/admin/roles', 'Roller'], ['/admin/shifts', 'Schema'], ['/admin/guide', 'Handbok']] as [href, text]}
				<a
					{href}
					aria-current={page.url.pathname === href || page.url.pathname.startsWith(href + '/') ? 'page' : undefined}
					class="text-muted-foreground hover:bg-muted aria-[current=page]:border-primary aria-[current=page]:text-primary border-b-2 border-transparent px-4 py-3 text-sm font-medium whitespace-nowrap"
				>
					{text}
				</a>
			{/each}
		</nav>
	{/if}
</header>

<main class="mx-auto max-w-3xl px-4 pt-6 pb-28">
	{@render children()}
</main>

<Snackbar />
