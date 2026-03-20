<script lang="ts">
	import Navigation from '$lib/components/Navigation.svelte';
</script>

<div class="min-h-screen bg-gray-50 text-gray-900">
	<Navigation />
	<main class="pt-16">
		<slot />
	</main>
</div>
