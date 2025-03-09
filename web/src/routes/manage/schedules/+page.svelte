<script lang="ts">
	import {
		Table,

		Tooltip

	} from '@sveltestrap/sveltestrap';
	import { onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';

	class Shift {
		start: Date;
		end: Date;
		user: string;
		role: string;
		free: boolean;

		constructor(start: Date, end: Date,	user: string = '', role: string = '') {
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
	}

	let shifts: Writable<Array<Shift>> = writable([]);
	$: roles = [...new Set($shifts.filter(shift => shift.role).map(shift => shift.role))].sort();

	const addshift = (shift: Shift) => {
		shifts.update(r => [...r, shift]);
	};

	onMount(() => {
		addshift(new Shift(new Date("2025-01-01T00:00:00"), new Date("2025-01-01T00:30:00"), 'Oscar', 'Arbetsledare'));
		addshift(new Shift(new Date("2025-01-01T00:30:00"), new Date("2025-01-01T01:00:00"), 'Evelina', 'Arbetsledare'));
		addshift(new Shift(new Date("2025-01-01T01:00:00"), new Date("2025-01-01T02:30:00"), 'Olof', 'Arbetsledare'));
		addshift(new Shift(new Date("2025-01-01T02:00:00"), new Date("2025-01-01T02:15:00"), '', 'Arbetsledare'));
		addshift(new Shift(new Date("2025-01-01T02:15:00"), new Date("2025-01-01T02:30:00"), 'Markus', 'Arbetsledare'));

		addshift(new Shift(new Date("2025-01-01T00:00:00"), new Date("2025-01-01T00:30:00"), 'OscarOscarOscarOscar', 'DJ'));
		addshift(new Shift(new Date("2025-01-01T00:00:00"), new Date("2025-01-01T00:30:00"), 'Markus', 'DJ'));
		addshift(new Shift(new Date("2025-01-01T00:00:00"), new Date("2025-01-01T00:30:00"), 'Marble', 'DJ'));
		addshift(new Shift(new Date("2025-01-01T00:00:00"), new Date("2025-01-01T00:30:00"), 'Trocadero Sunrise', 'DJ'));
	});
</script>

<div class="container-fluid">
	<div class="row">
		<div class="col-12">
			<h1>Roller</h1>
			<Table bordered striped hover>
				<thead>
					<tr>
						<th class="col-1">Arbetsroll</th>
						<th class="col-11">Skift</th>
					</tr>
				</thead>
				<tbody>
					{#each roles as role}
						<tr>
							<th scope="row">{role}</th>
							<td class="shift-container">
								{#each $shifts.filter(shift => shift.role === role) as shift, index}
									<div 
										class="shift border {shift.free ? 'border-dark bg-dark-subtle' : (index % 2 === 0 ? 'border-warning bg-warning-subtle' : 'border-info bg-info-subtle')}"
										style="width: {shift.getDurationInMinutes() * 2}px;">
										{#if shift.free}
											Ledigt
										{:else}
											{shift.user}
										{/if}
									</div>
								{/each}
							</td>
						</tr>
					{/each}
				</tbody>
			</Table>
		</div>
	</div>
</div>

<style>
	.shift-container {
		overflow-x: hidden;
	}
	.shift {
		display: inline-block;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
</style>