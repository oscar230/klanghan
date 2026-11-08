<script lang="ts">
	import { page } from '$app/state';

	let notFound = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{notFound ? 'Sidan finns inte' : 'Något gick fel'} - Klanglandet</title>
</svelte:head>

<div class="py-12 text-center">
	<p class="text-muted-foreground text-sm">{page.status}</p>
	<h1 class="mt-1 text-2xl">{notFound ? 'Sidan finns inte' : 'Något gick fel'}</h1>
	<p class="text-muted-foreground mt-2 text-sm">
		{notFound ? 'Adressen stämmer inte med någon sida.' : 'Försök igen om en stund.'}
	</p>
	<a href="/" class="btn btn-primary mt-6">Till schemat</a>
</div>
