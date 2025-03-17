<script lang="ts">
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import { Icon, Button, FormGroup, ButtonGroup, Spinner } from '@sveltestrap/sveltestrap';
	import { onMount } from 'svelte';

	class User {
		userId: string;
		username: string;
		roles: string[];
		admin: boolean;
		manager: boolean;
		member: boolean;

		constructor(
			userId: string,
			username: string,
			roles: string,
			admin: boolean,
			manager: boolean,
			member: boolean
		) {
			this.userId = userId;
			this.username = username;
			this.roles = roles.split(',');
			this.admin = admin;
			this.manager = manager;
			this.member = member;
		}
	}

	let year: number = new Date().getFullYear();
	let user: User | null = null;
	let done: boolean = false;
	let debug: boolean = false;

	onMount(async () => {
		const urlParams = new URLSearchParams(window.location.search);
		let code = urlParams.get('code');

		if (code && !document.cookie) {
			try {
				const response = await fetch(`${PUBLIC_API_BASE_URL}/auth/discord/callback?code=${code}`, {
					method: 'GET',
					credentials: 'include'
				});
				let callbackResponse = await response.json();
				console.log(response);
				console.log('OAuth2 callback response:', callbackResponse);
			} catch (error) {
				console.error('Error fetching callback:', error);
			}
		}

		if (document.cookie) {
			try {
				const response = await fetch(`${PUBLIC_API_BASE_URL}/member/`, {
					method: 'GET',
					credentials: 'include'
				});
				let callbackResponse = await response.json();
				user = new User(
					callbackResponse.id,
					callbackResponse.name,
					callbackResponse.roles,
					callbackResponse.admin,
					callbackResponse.manager,
					callbackResponse.member
				);
				console.log('Current user:', user);
			} catch (error) {
				console.error('Error getting current user:', error);
			}
		}

		done = true;
	});
</script>

<div class="container">
	<div class="row">
		<div class="col-12 col-lg-6">
			{#if done && user}
				<h1>Hej {user.username} 🎉</h1>
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
			{#if done && user}
				<FormGroup>
					{#if user}
						<ButtonGroup>
							<Button
								color="danger"
								on:click={() => {
									window.location.href = `${PUBLIC_API_BASE_URL}/auth/logout`;
								}}
							>
								<Icon name="door-open-fill" /> Logga ut
							</Button>
							<Button
								color="secondary"
								on:click={() => {
									debug = !debug;
								}}
							>
								<Icon name="bug-fill" /> Debug
							</Button>
						</ButtonGroup>
					{:else}
						<Button
							color="primary"
							on:click={() => {
								window.location.href = `${PUBLIC_API_BASE_URL}/auth/login`;
							}}
						>
							<Icon name="discord" /> Logga in
						</Button>
					{/if}
				</FormGroup>
			{:else}
				<Spinner color="primary" />
			{/if}
			{#if done && debug && user}
				<ul>
					<li>Discord UID: <code>{user.userId}</code></li>
					<li>Discord Display Name: <code>{user.username}</code></li>
					<li>
						Guild Roles
						<ul>
							{#each user.roles as role}
								<li>RID: <code>{role}</code></li>
							{/each}
						</ul>
					</li>
					<li>Admin: {user.admin ? '✅' : '⛔'}</li>
					<li>Manager: {user.manager ? '✅' : '⛔'}</li>
					<li>Member: {user.member ? '✅' : '⛔'}</li>
				</ul>
			{/if}
		</div>
	</div>
</div>
