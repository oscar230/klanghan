<script lang="ts">
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import type { PageData } from './$types';

	export let data: PageData;
	$: user = data.user;

	let year: number = new Date().getFullYear();
	let debug: boolean = false;
</script>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-3xl">
		{#if user}
			<h1 class="text-3xl font-bold mb-4">Hej {user.username} 🎉</h1>
		{:else}
			<h1 class="text-3xl font-bold mb-4">Välkommen till KlangHan</h1>
		{/if}
		<p class="mb-6">
			Detta är en applikation för <a
				href="https://klanglandet.se/"
				target="_blank"
				rel="noopener noreferrer"
				class="text-blue-600 hover:underline">Klanglandet</a
			>. Här hanterar vi arbetet under festivalen {year}.
		</p>
		
		<div class="mb-6">
			{#if user}
				<div class="flex gap-2">
					<button
						class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
						on:click={() => {
							window.location.href = `${PUBLIC_API_BASE_URL}/auth/logout`;
						}}
					>
						Logga ut
					</button>
					<button
						class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
						on:click={() => {
							debug = !debug;
						}}
					>
						Debug
					</button>
				</div>
			{:else}
				<button
					class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
					on:click={() => {
						window.location.href = `${PUBLIC_API_BASE_URL}/auth/login`;
					}}
				>
					Logga in
				</button>
			{/if}
		</div>
		
		{#if debug && user}
			<div class="bg-gray-100 p-4 rounded text-sm">
				<ul class="list-disc pl-5">
					<li>Discord UID: <code>{user.userId}</code></li>
					<li>Discord Display Name: <code>{user.username}</code></li>
					<li>
						Guild Roles
						<ul class="list-circle pl-5 mt-2">
							{#each user.roles as role}
								<li>RID: <code>{role}</code></li>
							{/each}
						</ul>
					</li>
					<li>Admin: {user.admin ? '✅' : '⛔'}</li>
					<li>Manager: {user.manager ? '✅' : '⛔'}</li>
					<li>Member: {user.member ? '✅' : '⛔'}</li>
				</ul>
			</div>
		{/if}
	</div>
</div>
