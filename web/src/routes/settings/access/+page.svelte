<script lang="ts">
	import { onMount } from 'svelte';
	let accessKeys: Array<string> = [];

	onMount(() => {
		invalidateKey(0, 8, 'abcdefghkmnopqrstuvwxyz0123456789');
		invalidateKey(1);
		invalidateKey(2);
	});

	const copy = async (text: string) => {
		await navigator.clipboard.writeText(text);
	};

	const invalidateKey = (
		index: number,
		length: number = 32,
		chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	) => {
		let result = '';
		const array = new Uint8Array(length);
		crypto.getRandomValues(array); // Secure random values
		array.forEach((byte) => {
			result += chars[byte % chars.length];
		});
		accessKeys[index] = result;
	};
</script>

<div class="container mx-auto p-4">
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
		{#if accessKeys[0]}
			<div class="border rounded shadow-sm">
				<div class="bg-gray-100 p-3 border-b">
					<h2 class="text-xl font-bold">Medarbetare</h2>
				</div>
				<div class="p-4">
					<p class="mb-4">Åtkomstnyckeln för medarbetare är: <code class="bg-gray-100 px-1 py-0.5 rounded">{accessKeys[0]}</code></p>
					<div class="flex flex-wrap gap-2">
						<button class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700" on:click={() => invalidateKey(0, 8, 'abcdefghkmnopqrstuvwxyz0123456789')}>
							Invalidera och skapa ny
						</button>
						<button class="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">
							Skicka till Discord
						</button>
						<button class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700" on:click={async () => await copy(accessKeys[0])}>
							Kopiera
						</button>
					</div>
				</div>
			</div>
		{/if}
		{#if accessKeys[1]}
			<div class="border rounded shadow-sm">
				<div class="bg-gray-100 p-3 border-b">
					<h2 class="text-xl font-bold">Arbetsledare</h2>
				</div>
				<div class="p-4">
					<p class="mb-4">Åtkomstnyckeln för arbetsledare är: <code class="bg-gray-100 px-1 py-0.5 rounded">{accessKeys[1]}</code></p>
					<div class="flex flex-wrap gap-2">
						<button class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700" on:click={() => invalidateKey(1)}>
							Invalidera och skapa ny
						</button>
						<button class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700" on:click={async () => await copy(accessKeys[1])}>
							Kopiera
						</button>
					</div>
				</div>
			</div>
		{/if}
		{#if accessKeys[2]}
			<div class="border rounded shadow-sm">
				<div class="bg-gray-100 p-3 border-b">
					<h2 class="text-xl font-bold">Systemadministratör</h2>
				</div>
				<div class="p-4">
					<p class="mb-4">Åtkomstnyckeln för systemadministratörer är: <code class="bg-gray-100 px-1 py-0.5 rounded">{accessKeys[2]}</code></p>
					<div class="flex flex-wrap gap-2">
						<button class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700" on:click={async () => await copy(accessKeys[2])}>
							Kopiera
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
