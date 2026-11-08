<script lang="ts">
	import { onMount } from 'svelte';
	import Avatar from './Avatar.svelte';
	import { layoutDays, type CalendarEvent } from '$lib/calendar';
	import { formatClock, formatShiftTime } from '$lib/time';

	/**
	 * Read-only overview of work shifts and artist performances, one column per festival day (like a
	 * calendar's day view) and a shared 24 hour axis. The page itself scrolls.
	 * Shifts that overlap in time sit side by side; in narrow lanes the text runs
	 * vertically. On small screens one day is shown at a time.
	 */
	let {
		events,
		onselect,
		highlightUserId = '',
		conflicts = new Set<string>()
	}: {
		events: CalendarEvent[];
		onselect: (event: CalendarEvent) => void;
		/** Shifts of this volunteer stand out and the rest are muted. */
		highlightUserId?: string;
		/** Shifts that are impossible as scheduled (see $lib/conflicts); drawn in red. */
		conflicts?: Set<string>;
	} = $props();

	// Below the site's 40rem breakpoint there is room for one day at a time
	let activeDay = $state(0);

	const HOURS = Array.from({ length: 24 }, (_, h) => h);
	let days = $derived(layoutDays(events));

	// Start the view at the first shift of the festival rather than at midnight
	let firstShiftMarker = $state<HTMLElement>();
	let firstStart = $derived(
		events.length ? Math.min(...events.map((e) => e.startOffset % (24 * 60))) : 8 * 60
	);
	let stickyHeader = $state<HTMLElement>();
	onMount(() => {
		// Measured from the real elements: the layout may not have published the app bar's height yet
		const covered = (document.querySelector('header')?.getBoundingClientRect().height ?? 0) + (stickyHeader?.offsetHeight ?? 0);
		const top = (firstShiftMarker?.getBoundingClientRect().top ?? 0) + window.scrollY - covered - 8;
		window.scrollTo({ top: Math.max(0, top) });
	});

	// A clear line between the days (and around them), stronger than the hairlines of the hours
	const dayBorder = (index: number) =>
		`border-field-border border-l-2 ${index === days.length - 1 ? 'sm:border-r-2' : ''}`;

	const classes = (event: CalendarEvent) => {
		// Impossible events are red, whatever else is highlighted
		if (conflicts.has(event.id)) return 'bg-danger-soft text-foreground border-danger ring-danger ring-2 ring-inset';
		// Performances are black and white so they stand apart from the blue work shifts
		if (event.kind === 'performance') return 'bg-foreground text-background border-field-border';
		if (!highlightUserId) return 'bg-primary-soft text-foreground border-primary';
		return event.userId === highlightUserId
			? 'bg-primary text-primary-foreground border-primary-foreground'
			: 'bg-muted text-muted-foreground border-field-border';
	};

	const label = (event: CalendarEvent) =>
		`${event.title}, ${event.subtitle}, ${formatShiftTime(event.startOffset, event.endOffset)}${conflicts.has(event.id) ? ' (krock)' : ''}`;
</script>

<div style:--hour="3.5rem" class="[--axis:3rem]">
	<div bind:this={stickyHeader} class="bg-background border-border sticky top-[var(--header-h,0px)] z-10 border-b">
		<div class="flex sm:hidden" role="tablist" aria-label="Dag">
			{#each days as day, i}
				<button
					type="button"
					role="tab"
					aria-selected={activeDay === i}
					onclick={() => (activeDay = i)}
					class="text-muted-foreground hover:bg-muted aria-selected:border-primary aria-selected:text-primary flex-1 border-b-2 border-transparent py-2.5 text-sm font-medium"
				>
					{day.name}
				</button>
			{/each}
		</div>
		<div class="hidden grid-cols-[var(--axis)_repeat(3,minmax(0,1fr))] sm:grid">
			<div></div>
			{#each days as day, i}
				<h3 class="{dayBorder(i)} py-2 text-center text-sm font-semibold">{day.name}</h3>
			{/each}
		</div>
	</div>

	<div
		class="relative mt-3 grid grid-cols-[var(--axis)_minmax(0,1fr)] sm:grid-cols-[var(--axis)_repeat(3,minmax(0,1fr))]"
		style:height="calc(var(--hour) * 24)"
	>
		<div class="relative" aria-hidden="true">
			{#each HOURS as hour}
				<span
					class="text-muted-foreground absolute right-2 -translate-y-1/2 text-xs"
					style:top="calc(var(--hour) * {hour})"
				>
					{String(hour).padStart(2, '0')}:00
				</span>
			{/each}
		</div>

		{#each days as day, dayIndex}
			<div class="{dayBorder(dayIndex)} relative {activeDay === dayIndex ? '' : 'hidden sm:block'}">
				{#each HOURS as hour}
					<div class="border-border absolute inset-x-0 border-t" style:top="calc(var(--hour) * {hour})"></div>
				{/each}

				{#each day.segments as segment (segment.item.id)}
					{@const event = segment.item}
					{@const minutes = segment.end - segment.start}
					<div
						class="absolute p-px"
						style:top="calc(var(--hour) * {segment.start / 60})"
						style:height="calc(var(--hour) * {minutes / 60})"
						style:left="{(segment.lane / segment.lanes) * 100}%"
						style:width="{100 / segment.lanes}%"
					>
						<button
							type="button"
							title={label(event)}
							aria-label={label(event)}
							onclick={() => onselect(event)}
							class="@container flex h-full w-full flex-col gap-1.5 @min-[5rem]:flex-row overflow-hidden rounded-md border-l-4 px-1 py-0.5 text-left text-xs hover:opacity-80 {classes(event)} {segment.continuesFromPreviousDay ? 'rounded-t-none' : ''} {segment.continuesIntoNextDay ? 'rounded-b-none' : ''}"
						>
							{#if minutes >= 45 && event.kind === 'shift'}
								<span class="shrink-0 @max-[5rem]:mx-auto"><Avatar src={event.imageUrl} name="" size={20} /></span>
							{/if}
							<!-- Wide lane: ordinary text -->
							<span class="hidden min-w-0 flex-1 @min-[5rem]:block">
								<span class="block truncate font-medium">{event.title}</span>
								{#if minutes >= 45}
									<span class="block truncate opacity-80">{event.subtitle}</span>
								{/if}
								{#if minutes >= 90}
									<span class="block truncate opacity-80">
										{formatClock(event.startOffset)} – {formatClock(event.endOffset)}
									</span>
								{/if}
							</span>
							<!-- Narrow lane: the text runs down the block instead -->
							<span class="mx-auto min-h-0 flex-1 overflow-hidden [writing-mode:vertical-rl] @min-[5rem]:hidden">
								<span class="block truncate font-medium">{event.title}</span>
								{#if minutes >= 90}
									<span class="block truncate opacity-80">{event.subtitle}</span>
								{/if}
							</span>
						</button>
					</div>
				{/each}
			</div>
		{/each}

		<div
			bind:this={firstShiftMarker}
			class="pointer-events-none absolute"
			style:top="calc(var(--hour) * {Math.max(0, Math.floor(firstStart / 60) - 1)})"
		></div>
	</div>
</div>
