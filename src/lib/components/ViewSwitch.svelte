<script lang="ts">
	import { page } from '$app/state';

	/** Switches between a page's list and its calendar view (`?view=calendar`). */
	let { listLabel = 'Lista' }: { listLabel?: string } = $props();

	let calendar = $derived(page.url.searchParams.get('view') === 'calendar');

	const item =
		'rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted aria-[current=page]:bg-primary-soft aria-[current=page]:text-primary';
</script>

<nav aria-label="Vy" class="border-field-border inline-flex rounded-full border p-0.5">
	<a href={page.url.pathname} data-sveltekit-noscroll aria-current={calendar ? undefined : 'page'} class={item}>
		{listLabel}
	</a>
	<a href="?view=calendar" data-sveltekit-noscroll aria-current={calendar ? 'page' : undefined} class={item}>
		Kalender
	</a>
</nav>
