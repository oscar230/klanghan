<script>
	export let isMobile = true;
	import { Styles, Icon } from '@sveltestrap/sveltestrap';
	import { onMount } from 'svelte';

	onMount(() => {
		const checkMobile = () => {
			isMobile = window.matchMedia('(max-width: 768px)').matches;
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	});
</script>

<Styles />
<div class="row">
	<div class="col-12 bg-warning text-center">
        <p class="display-4"><Icon name="exclamation-triangle" />
            {#if isMobile}
                You're on a mobile device!
            {:else}
                You're on a desktop device!
            {/if}
        </p>
	</div>
</div>
<slot />
