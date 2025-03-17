<script lang="ts">
	import { Styles	} from '@sveltestrap/sveltestrap';
	import Navigation from '$lib/components/Navigation.svelte';
	export const prerender = true;
</script>

<Styles />
<Navigation />
<slot />
