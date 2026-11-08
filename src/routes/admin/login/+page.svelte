<script lang="ts">
	import { enhance } from '$app/forms';
	let { form } = $props();
</script>

<svelte:head>
	<title>Administratörsinloggning</title>
</svelte:head>

<div class="border-border mx-auto mt-8 max-w-sm rounded-3xl border p-6 sm:p-8">
	<h1 class="mb-6 text-2xl">Administratörsinloggning</h1>

	<form method="POST" use:enhance class="space-y-4">
		<div>
			<label class="field-label" for="password">Huvudlösenord</label>
			<input type="password" id="password" name="password" required class="field" />
		</div>

		{#if form?.error}
			<p role="alert" class="text-danger text-sm">{form.error}</p>
		{/if}

		<div class="flex items-center justify-between gap-2 pt-2">
			<a href="/" class="btn btn-text -ml-4">Till schemat</a>
			<button type="submit" class="btn btn-primary">Logga in</button>
		</div>
	</form>
</div>
