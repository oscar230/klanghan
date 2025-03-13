<script lang="ts">
	import { Icon, Button, FormGroup } from '@sveltestrap/sveltestrap';
	import { onMount } from 'svelte';

	let year: number = new Date().getFullYear();
	let code: string | null = null;
	let callbackResponse: any = null;

	onMount(async () => {
		const urlParams = new URLSearchParams(window.location.search);
		code = urlParams.get('code');

		if (code) {
			try {
				const response = await fetch(`http://localhost:5200/auth/discord/callback?code=${code}`);
				callbackResponse = await response.json();
			} catch (error) {
				console.error('Error fetching callback:', error);
			}
		}
	});
</script>

<div class="container">
	<div class="row">
		<div class="col-12 col-lg-6">
			{#if callbackResponse && callbackResponse['username']}
				<h1>Välkommen till KlangHan {callbackResponse.username}!</h1>
			{:else}
				<h1>Välkommen till KlangHan</h1>
			{/if}
			<p>
				Detta är en applikation för <a
					href="https://klanglandet.se/"
					target="_blank"
					rel="noopener noreferrer">Klanglandet</a
				>. Här hanterar vi arbetet under festivalen {year}.
			</p>
			<FormGroup>
				<Button
					color="primary"
					class="login-button"
					on:click={() => {
						window.location.href = 'http://localhost:5200/auth/login';
					}}
				>
					<Icon name="discord" /> Logga in
				</Button>
			</FormGroup>
			{#if code}
				<p>Code: {code}</p>
			{/if}
			{#if callbackResponse}
				<p>Response: <code>{JSON.stringify(callbackResponse, null, 2)}</code></p>
				<p>Logged in as: {callbackResponse.username}</p>
			{/if}
		</div>
	</div>
</div>
