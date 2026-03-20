<script lang="ts">
	import { onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';

	const timelineNowdate = new Date('2025-01-01T01:10:00');
	let timelineStartDate = new Date('2025-01-01T00:00:00');
	let timelineEndDate = new Date('2025-01-01T23:59:59');
	let totalTimelineWidth: number = 10000; // Define the total width of the timeline container

	class Shift {
		start: Date;
		end: Date;
		user: string;
		role: string;
		free: boolean;

		constructor(start: Date, end: Date, user: string = '', role: string = '') {
			this.start = start;
			this.end = end;
			this.user = user;
			this.role = role;
			this.free = !user;
		}

		// Method to calculate the difference in minutes
		getDurationInMinutes(): number {
			return Math.floor((this.end.getTime() - this.start.getTime()) / (1000 * 60));
		}

		position(start: null | number = null): string {
			if (!start) {
				start = this.start.getTime();
			}
			const eventStartOffset: number = start - timelineStartDate.getTime();
			const eventEndOffset: number = this.end.getTime() - timelineStartDate.getTime();
			const height: number =
				((eventEndOffset - eventStartOffset) /
					(timelineEndDate.getTime() - timelineStartDate.getTime())) *
				totalTimelineWidth;
			const top: number =
				(eventStartOffset / (timelineEndDate.getTime() - timelineStartDate.getTime())) *
				totalTimelineWidth;

			return `top: ${top < 0 ? 0 : top}px; height: ${height}px;`;
		}

		classes(index: number): string {
			if (this.role === '#Tid') {
				return 'bg-light-subtle';
			} else if (this.start.getTime() > this.end.getTime()) {
				return 'bg-danger';
			} else if (this.start.getTime() <= timelineNowdate.getTime() && this.end.getTime() > timelineNowdate.getTime()) {
				return 'shift-animated';
			} else if (index % 2 === 0) {
				return 'bg-primary-subtle';
			} else {
				return 'bg-info-subtle';
			}
		}
	}

	let shifts: Writable<Array<Shift>> = writable([]);
	$: roles = [...new Set($shifts.filter((shift) => shift.role).map((shift) => shift.role))].sort();

	const addshift = (shift: Shift) => {
		shifts.update((r) => [...r, shift]);
	};

	onMount(() => {
		// Generate hourly intervals
		let current = new Date(timelineStartDate);
		while (current < timelineEndDate) {
			const start = new Date(current);
			const end = new Date(current);
			end.setHours(end.getHours() + 1);
			addshift(new Shift(start, end, 'Tid', '#Tid'));
			current = end;
		}
		addshift(
			new Shift(
				new Date('2024-12-31T23:00:00'),
				new Date('2025-01-01T00:30:00'),
				'Oscar',
				'Arbetsledare'
			)
		);
		addshift(
			new Shift(
				new Date('2025-01-01T00:30:00'),
				new Date('2025-01-01T01:00:00'),
				'Evelina',
				'Arbetsledare'
			)
		);
		addshift(
			new Shift(
				new Date('2025-01-01T01:00:00'),
				new Date('2025-01-01T02:30:00'),
				'Olof',
				'Arbetsledare'
			)
		);
		addshift(
			new Shift(
				new Date('2025-01-01T02:15:00'),
				new Date('2025-01-01T02:30:00'),
				'Markus',
				'Arbetsledare'
			)
		);

		addshift(
			new Shift(
				new Date('2025-01-01T00:00:00'),
				new Date('2025-01-01T00:30:00'),
				'OscarOscarOscarOscaraaaaaaaaaaaaaaaaaaa',
				'DJ'
			)
		);
		addshift(
			new Shift(new Date('2025-01-01T00:00:00'), new Date('2025-01-01T00:30:00'), 'Markus', 'DJ')
		);
		addshift(
			new Shift(new Date('2025-01-01T01:00:00'), new Date('2025-01-01T00:30:00'), 'Marble', 'DJ')
		);
		addshift(
			new Shift(
				new Date('2025-01-01T00:00:00'),
				new Date('2025-01-01T00:30:00'),
				'Trocadero Sunrise',
				'DJ0'
			)
		);

		addshift(
			new Shift(
				new Date('2025-01-01T00:00:00'),
				new Date('2025-01-01T00:30:00'),
				'Trocadero Sunrise',
				'DJ1'
			)
		);
		addshift(
			new Shift(
				new Date('2025-01-01T00:00:00'),
				new Date('2025-01-01T00:30:00'),
				'Trocadero Sunrise',
				'DJ2'
			)
		);
		addshift(
			new Shift(
				new Date('2025-01-01T00:00:00'),
				new Date('2025-01-01T00:30:00'),
				'Trocadero Sunrise',
				'AAAA'
			)
		);

		if ($shifts.length > 0) {
			timelineStartDate = new Date(Math.min(...$shifts.map(s => s.start.getTime())));
			timelineEndDate = new Date(Math.max(...$shifts.map(s => s.end.getTime())));
		}
	});
</script>

<div class="container-fluid">
	<div class="row">
		<div class="col-12 col-lg-4">
			<div class="mb-4">
				<div class="flex gap-2">
					<button class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700" on:click={() => (totalTimelineWidth -= 1000)}
						>[-] Zoom Out</button
					>
					<button class="px-3 py-1 bg-gray-500 text-white rounded" disabled>{totalTimelineWidth} pixlar/24h</button>
					<button class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700" on:click={() => (totalTimelineWidth += 1000)}
						>[+] Zoom In</button
					>
				</div>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="col-12 schedule">
			<div class="schedule-header">
				{#each roles as role}
					<div class="schedule-column">
						<p class="m-1">
							{#if role === '#Tid'}
								<b>Tidslinje</b>
							{:else}
								{role}
							{/if}
						</p>
					</div>
				{/each}
			</div>
			<div class="schedule-body">
				{#each roles as role}
					<div class="schedule-column" style="height: {totalTimelineWidth}px;">
						{#each $shifts.filter((shift) => shift.role === role) as shift, index}
							{#if shift.start.getTime() <= timelineNowdate.getTime() && shift.end.getTime() > timelineNowdate.getTime()}
								<div class="shift shift-line" style={shift.position(timelineNowdate.getTime())}>
								</div>
							{/if}
							<div class="shift p-1 {shift.classes(index)}" style={shift.position()}>
								<p>
									{#if role === '#Tid'}
										<b>Tid:</b> {shift.start.toLocaleTimeString('sv-SE')}
									{:else}
										{shift.user}
										<br />
										<code>{shift.start.toLocaleTimeString('sv-SE')}</code>
										<br />
										<code>{shift.end.toLocaleTimeString('sv-SE')}</code>
									{/if}
								</p>
								{#if role !== '#Tid'}
									<button class="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">Ändra</button>
								{/if}
							</div>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.schedule-column:first-of-type {
		border-left: 2px solid black;
	}
	.schedule-column {
		border-right: 2px solid black;
		border-top: 2px solid black;
	}

	.schedule {
		width: auto; /* Allow the content to expand horizontally */
		overflow-x: auto; /* Allow horizontal scrolling */
		white-space: nowrap; /* Prevent content from wrapping to the next line */
		height: 85vh;
	}

	.schedule-header > div {
		display: inline-block;
		width: 10rem;
		height: 5vh;
	}

	.schedule-body > .schedule-column {
		position: relative;
		display: inline-block;
		width: 10rem;
	}

	.schedule-body > .schedule-column > .shift {
		position: absolute;
		width: 9rem;
		overflow-y: scroll;
		z-index: 1;
		white-space: normal; /* Allow text wrapping */
		word-wrap: break-word; /* Ensure long words wrap */
	}

	.shift-line {
		z-index: 2 !important;
		background-color: red;
		color: white;
		opacity: 0.5;
		height: 2px !important;
		pointer-events: none !important;
		overflow-y: hidden !important;
		width: 10rem !important;
	}

	.shift-animated {
		background-color: #e4ffc3;
		background-image: repeating-linear-gradient(
			-45deg,
			transparent,
			transparent 1rem,
			#ccff8e 1rem,
			#ccff8e 2rem
		);
		background-size: 200% 200%;
		animation: barberpole 30s linear infinite;
	}

	@keyframes barberpole {
		100% {
			background-position: 100% 100%;
		}
	}
</style>
