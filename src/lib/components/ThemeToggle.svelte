<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from './Icon.svelte';
	import { currentTheme, toggleTheme, type Theme } from '$lib/theme';

	let theme = $state<Theme>('light');

	onMount(() => {
		theme = currentTheme();
		// Keep the icon right when the device setting changes while the app is open
		const media = window.matchMedia('(prefers-color-scheme: dark)');
		const refresh = () => (theme = currentTheme());
		media.addEventListener('change', refresh);
		return () => media.removeEventListener('change', refresh);
	});

	const label = $derived(theme === 'dark' ? 'Byt till ljust läge' : 'Byt till mörkt läge');
</script>

<button type="button" class="icon-btn" aria-label={label} title={label} onclick={() => (theme = toggleTheme())}>
	<Icon name={theme === 'dark' ? 'sun' : 'moon'} />
</button>
