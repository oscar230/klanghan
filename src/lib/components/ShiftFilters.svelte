<script lang="ts">
	import FilterBar from './FilterBar.svelte';

	/** Narrows the schedule editor (list and calendar) by volunteer, role or conflicts. */
	let {
		users,
		roles,
		userId = $bindable(''),
		roleId = $bindable(''),
		onlyConflicts = $bindable(false),
		shown,
		total
	}: {
		users: Array<{ id: string; name: string }>;
		roles: Array<{ id: string; name: string }>;
		userId?: string;
		roleId?: string;
		onlyConflicts?: boolean;
		shown: number;
		total: number;
	} = $props();

	const clear = () => {
		userId = '';
		roleId = '';
		onlyConflicts = false;
	};
</script>

<FilterBar
	label="Filtrera pass"
	noun="pass"
	{shown}
	{total}
	active={Boolean(userId || roleId || onlyConflicts)}
	onclear={clear}
	bind:onlyConflicts
>
	<div>
		<label class="field-label" for="filter-user">Volontär</label>
		<select id="filter-user" bind:value={userId} class="field">
			<option value="">Alla volontärer</option>
			{#each users as user}
				<option value={user.id}>{user.name}</option>
			{/each}
		</select>
	</div>
	<div>
		<label class="field-label" for="filter-role">Roll</label>
		<select id="filter-role" bind:value={roleId} class="field">
			<option value="">Alla roller</option>
			{#each roles as role}
				<option value={role.id}>{role.name}</option>
			{/each}
		</select>
	</div>
</FilterBar>
