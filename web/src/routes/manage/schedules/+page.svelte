<script lang="ts">
	import { Column, Table, Tooltip } from '@sveltestrap/sveltestrap';
	import { onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';

	const timelineStartDate = new Date('2025-01-01T00:00:00');
	const timelineEndDate = new Date('2025-01-01T23:59:59');
	const totalTimelineWidth: number = 10000; // Define the total width of the timeline container
	const timelineWidthPerHour: number = totalTimelineWidth / 24; // Number of pixels per hour on the timeline

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

		position(): any {
			const eventStartOffset: number = this.start.getTime() - timelineStartDate.getTime();
			const eventEndOffset: number = this.end.getTime() - timelineStartDate.getTime();
			const eventWidth: number =
				((eventEndOffset - eventStartOffset) /
					(timelineEndDate.getTime() - timelineStartDate.getTime())) *
				totalTimelineWidth;
			const eventLeft: number =
				(eventStartOffset / (timelineEndDate.getTime() - timelineStartDate.getTime())) *
				totalTimelineWidth;

			return `top: ${eventLeft}px; height: ${eventWidth}px;`;
		}
	}

	let shifts: Writable<Array<Shift>> = writable([]);
	$: roles = [...new Set($shifts.filter((shift) => shift.role).map((shift) => shift.role))].sort();

	const addshift = (shift: Shift) => {
		shifts.update((r) => [...r, shift]);
	};

	onMount(() => {
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
	});
</script>

<div class="schedule">
	<div class="schedule-header">
		{#each roles as role}
			<div class="schedule-column border border">
				<p class="m-1">{role}</p>
			</div>
		{/each}
	</div>
	<div class="schedule-body">
		{#each roles as role}
			<div class="schedule-column border">
				{#each $shifts.filter((shift) => shift.role === role) as shift, index}
					<div
						class="shift p-1 border {index % 2 === 0
							? 'border-warning bg-warning-subtle'
							: 'border-info bg-info-subtle'}"
						style={shift.position()}
					>
						<p>
							{shift.user}
							<br />
							{shift.start.getHours()}:{shift.start.getMinutes()} - {shift.end.getHours()}:{shift.end.getMinutes()}
						</p>
					</div>
				{/each}
			</div>
		{/each}
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
		height: 90vh;
	}

	.schedule-body > .schedule-column > .shift {
		border-left: solid black 10px !important;
		position: absolute;
		width: 10rem;
		overflow: hidden;
	}

	.shift-ongoing {
		border-left-color: rgb(110, 255, 20) !important;

	}
	.shift-completed {
		border-left-color: rgb(0, 94, 255) !important;
		
	}
	.shift-not-started {
		border-left-color: rgb(255, 234, 0) !important;
	}
</style>
