<script lang="ts">
	import { enhance } from '$app/forms';
	let { form } = $props();
</script>

<svelte:head>
    <title>Administratörsinloggning - Klanghan</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
	<div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
		<h1 class="text-2xl font-bold text-center mb-6 text-gray-900">Administratörsinloggning</h1>
		
		<form method="POST" use:enhance class="space-y-4">
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-1" for="password">Huvudlösenord</label>
				<input type="password" id="password" name="password" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
			</div>
			
			{#if form?.error}
				<p class="text-red-500 text-sm font-medium">{form.error}</p>
			{/if}

			<button type="submit" class="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:scale-[0.98] transition-all">
				Logga in
			</button>
            <div class="text-center mt-4">
                <a href="/" class="text-sm text-gray-500 hover:text-gray-800 transition-colors">Tillbaka till schemat</a>
            </div>
		</form>
	</div>
</div>
