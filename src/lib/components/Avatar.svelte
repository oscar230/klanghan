<script lang="ts">
	import defaultPfp from '$lib/assets/default-pfp.svg';

	let { src, name = '', size = 40 }: { src: string | null; name?: string; size?: number } = $props();
</script>

<img
	src={src || defaultPfp}
	alt={name}
	width={size}
	height={size}
	loading="lazy"
	class="bg-muted shrink-0 rounded-full object-cover"
	style:width="{size}px"
	style:height="{size}px"
/>
