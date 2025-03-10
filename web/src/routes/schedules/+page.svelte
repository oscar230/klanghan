<script lang="ts">
	import { Button, ButtonGroup, FormGroup, Icon } from '@sveltestrap/sveltestrap';
	import { onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';

	const timelineStartDate = new Date('2025-01-01T00:00:00');
	const timelineEndDate = new Date('2025-01-01T23:59:59');
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
	});
</script>

<div class="container-fluid">
	<div class="row">
		<div class="col-12 col-lg-4">
			<FormGroup>
				<ButtonGroup>
					<Button color="primary" on:click={() => (totalTimelineWidth -= 1000)}
						><Icon name="zoom-out" /></Button
					>
					<Button color="secondary" disabled>{totalTimelineWidth} pixlar/24h</Button>
					<Button color="primary" on:click={() => (totalTimelineWidth += 1000)}
						><Icon name="zoom-in" /></Button
					>
				</ButtonGroup>
			</FormGroup>
		</div>
	</div>
	<div class="row">
		<div class="col-12 schedule">
			<div class="schedule-header">
				{#each roles as role}
					<div class="schedule-column border border">
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
					<div class="schedule-column border" style="height: {totalTimelineWidth}px;">
						{#each $shifts.filter((shift) => shift.role === role) as shift, index}
							<div
								class="shift p-1 border {shift.role === '#Tid'
									? 'border-light bg-light-subtle'
									: index % 2 === 0
										? 'border-warning bg-warning-subtle'
										: 'border-info bg-info-subtle'}"
								style={shift.position()}
							>
								<p>
									{#if role === '#Tid'}
										<b>Tid:</b> {shift.start.toLocaleTimeString('sv-SE')}
									{:else}
										{shift.user}
										<br />
										{shift.start.toLocaleTimeString('sv-SE')}
										<br />
										{shift.end.toLocaleTimeString('sv-SE')}
									{/if}
								</p>
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
		width: 10rem;
		overflow: hidden;
		z-index: 1;
	}
</style>
