<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	/**
	 * Actions for one list row. From the breakpoint and up the buttons sit inline to
	 * the right of the row; below it they fold into one menu button. The breakpoint
	 * (40rem) is the same for every list in the app, so actions are always in the
	 * same place on a given device. Keep it in sync with the media query below.
	 */
	let { label, children }: { label: string; children: Snippet } = $props();

	const id = $props.id();
	let menu = $state<HTMLElement>();
	let toggle = $state<HTMLButtonElement>();

	// Place the menu under its button (or above it when there is no room below)
	function place() {
		if (!menu || !toggle) return;
		const rect = toggle.getBoundingClientRect();
		const margin = 4;
		const below = rect.bottom + margin;
		const fitsBelow = below + menu.offsetHeight <= window.innerHeight - margin;
		menu.style.top = `${fitsBelow ? below : Math.max(margin, rect.top - margin - menu.offsetHeight)}px`;
		menu.style.right = `${document.documentElement.clientWidth - rect.right}px`;
	}

	function closeMenu() {
		if (menu?.matches(':popover-open')) menu.hidePopover();
	}

	function onMenuClick(e: MouseEvent) {
		// Choosing an action closes the menu
		if ((e.target as Element).closest('button:not(:disabled), a')) closeMenu();
	}
</script>

<!-- A menu left open would end up detached from its row -->
<svelte:window onscroll={closeMenu} onresize={closeMenu} />

<div class="row-actions">
	<button
		bind:this={toggle}
		type="button"
		class="icon-btn menu-button"
		popovertarget={id}
		aria-label="Fler åtgärder för {label}"
	>
		<Icon name="more" />
	</button>
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div {id} bind:this={menu} popover="auto" class="menu" onbeforetoggle={place} ontoggle={place} onclick={onMenuClick}>
		{@render children()}
	</div>
</div>

<style>
	.row-actions {
		flex-shrink: 0;
	}

	/* Below the breakpoint: a popover menu */
	.menu {
		position: fixed;
		inset: auto;
		margin: 0;
		min-width: 12rem;
		padding: 0.5rem 0;
		border: 0;
		border-radius: 0.5rem;
		background: var(--color-surface);
		color: var(--color-foreground);
		box-shadow: var(--shadow-raised);
		/* Actions are buttons, forms or links; stack them */
		flex-direction: column;
	}
	.menu:popover-open {
		display: flex;
	}
	.menu :global(form) {
		display: contents;
	}
	.menu :global(.action) {
		display: flex;
		width: 100%;
		height: 3rem;
		align-items: center;
		gap: 0.75rem;
		padding: 0 1rem;
		font-size: 0.9375rem;
		text-align: left;
	}
	.menu :global(.action:hover:not(:disabled)) {
		background: var(--color-muted);
	}
	.menu :global(.action:disabled) {
		opacity: 0.4;
	}

	/* From the breakpoint and up: the same element, shown inline */
	@media (min-width: 40rem) {
		.menu-button {
			display: none;
		}
		.menu,
		.menu:popover-open {
			position: static;
			display: flex;
			min-width: 0;
			padding: 0;
			flex-direction: row;
			align-items: center;
			gap: 0.25rem;
			border-radius: 0;
			background: transparent;
			box-shadow: none;
			overflow: visible;
		}
		.menu :global(.action) {
			width: auto;
			height: 2.5rem;
			padding: 0 1rem;
			border-radius: 9999px;
			font-size: 0.875rem;
			font-weight: 500;
			white-space: nowrap;
		}
		.menu :global(.action-primary:hover:not(:disabled)) {
			background: var(--color-primary-soft);
		}
		.menu :global(.action-danger:hover:not(:disabled)) {
			background: var(--color-danger-soft);
		}
	}
	.menu :global(.action-danger) {
		color: var(--color-danger);
	}
	.menu :global(.action-primary) {
		color: var(--color-primary);
	}
</style>
