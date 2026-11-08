<script lang="ts">
	import { notice, dismiss } from '$lib/notice.svelte';
	import Icon from './Icon.svelte';
</script>

{#if notice.message}
	<div
		role="alert"
		class="bg-foreground text-background shadow-raised fixed inset-x-4 top-20 z-50 mx-auto flex max-w-md items-center gap-2 rounded-lg py-2 pr-2 pl-4 text-sm"
	>
		<span class="flex-1">{notice.message}</span>
		<button type="button" class="btn h-8 px-2" aria-label="Stäng" onclick={dismiss}>
			<Icon name="x" size={18} />
		</button>
	</div>
{/if}
