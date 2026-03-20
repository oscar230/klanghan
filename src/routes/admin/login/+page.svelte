<script lang="ts">
	import { enhance } from "$app/forms";
	let { form } = $props();
</script>

<svelte:head>
	<title>Administratörsinloggning</title>
</svelte:head>

<div
	class="min-h-screen flex items-center justify-center bg-background p-4 relative"
>
	<div
		class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--color-primary),_transparent_40%)] opacity-10"
	></div>
	<div
		class="max-w-md w-full bg-card rounded-xl shadow-2xl p-8 border border-border relative z-10"
	>
		<h1
			class="text-2xl font-bold text-center mb-6 text-foreground tracking-tight"
		>
			Administratörsinloggning
		</h1>

		<form method="POST" use:enhance class="space-y-4">
			<div class="space-y-2">
				<label
					class="block text-sm font-medium text-muted-foreground"
					for="password">Huvudlösenord</label
				>
				<input
					type="password"
					id="password"
					name="password"
					required
					class="w-full px-4 py-2.5 bg-input border border-input-border text-foreground rounded-md focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground"
				/>
			</div>

			{#if form?.error}
				<p class="text-secondary text-sm font-medium">{form.error}</p>
			{/if}

			<button
				type="submit"
				class="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-md font-bold hover:opacity-90 active:scale-[0.98] transition-all"
			>
				Logga in
			</button>
			<div class="text-center mt-6">
				<a
					href="/"
					class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>Tillbaka till schemat</a
				>
			</div>
		</form>
	</div>
</div>
