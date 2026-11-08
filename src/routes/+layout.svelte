<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import Dialog from '$lib/components/Dialog.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import Snackbar from '$lib/components/Snackbar.svelte';

	let { children } = $props();

	let width = $derived(page.data.wide ? 'max-w-screen-2xl' : 'max-w-3xl');
	// The calendar's day header sticks below the app bar, so it needs to know how tall that is
	let headerHeight = $state(0);

	let confirmingLogout = $state(false);

	let inAdmin = $derived(page.url.pathname === '/admin' || page.url.pathname.startsWith('/admin/'));
</script>

<header bind:clientHeight={headerHeight} class="bg-background border-border sticky top-0 z-30 border-b">
	<div class="mx-auto flex h-16 items-center gap-1 px-4 {width}">
		<a href={inAdmin ? '/admin' : '/'} class="mr-auto text-xl">Klanglandet</a>

		{#if inAdmin}
			<a href="/" class="icon-btn" aria-label="Lämna administrationen och visa publikt schema" title="Visa publikt schema">
				<Icon name="admin-off" />
			</a>
			{#if page.data.authenticated}
				<button type="button" class="icon-btn" aria-label="Logga ut" title="Logga ut" onclick={() => (confirmingLogout = true)}>
					<Icon name="logout" />
				</button>
			{/if}
		{:else}
			<a href="/admin" class="icon-btn" aria-label="Administratör" title="Administratör">
				<Icon name="admin" />
			</a>
		{/if}
		<ThemeToggle />
	</div>
	{#if inAdmin && page.url.pathname !== '/admin/login'}
		<nav aria-label="Administratör" class="mx-auto flex overflow-x-auto px-2 {width}">
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

<main style:--header-h="{headerHeight}px" class="mx-auto px-4 pt-6 pb-28 {width}">
	{@render children()}
</main>

<Dialog open={confirmingLogout} title="Logga ut" onclose={() => (confirmingLogout = false)}>
	<form method="POST" action="/admin/logout">
		<p class="px-6 py-1">Vill du verkligen logga ut från administrationen?</p>
		<div class="flex justify-end gap-2 px-6 pt-4 pb-6">
			<button type="button" class="btn btn-text" onclick={() => (confirmingLogout = false)}>Avbryt</button>
			<button class="btn btn-primary">Logga ut</button>
		</div>
	</form>
</Dialog>

<Snackbar />
