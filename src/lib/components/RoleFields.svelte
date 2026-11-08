<script lang="ts">
	interface RoleOption {
		id: string;
		name: string;
		isSupervisor: boolean;
		supervisorRoleId: string | null;
		subordinateNames: string[];
		description: string | null;
	}

	/** The fields of the role form, shared by "Ny roll" and "Ändra roll". */
	let { role, roles }: { role: RoleOption | null; roles: RoleOption[] } = $props();

	// Only the starting value is wanted: the form is rendered afresh each time its dialog opens
	// svelte-ignore state_referenced_locally
	let isSupervisor = $state(role?.isSupervisor ?? false);

	// A supervisor role that still leads other roles must stay one until those links are removed
	const leads = $derived(role?.subordinateNames ?? []);
	const locked = $derived(leads.length > 0);
	const supervisors = $derived(roles.filter((other) => other.isSupervisor && other.id !== role?.id));
</script>

<div>
	<label class="field-label" for="role-name">Namn</label>
	<input id="role-name" type="text" name="name" value={role?.name ?? ''} required maxlength="100" class="field" />
</div>
<div>
	<label class="field-label" for="role-description">Beskrivning (frivilligt)</label>
	<textarea id="role-description" name="description" rows="4" maxlength="1000" class="field">{role?.description ?? ''}</textarea>
</div>

<div>
	<label class="flex items-start gap-3">
		<input
			type="checkbox"
			name={locked ? undefined : 'isSupervisor'}
			bind:checked={isSupervisor}
			disabled={locked}
			class="accent-primary mt-0.5 size-5 shrink-0"
		/>
		<span>
			<span class="block text-sm font-medium">Ledande roll</span>
			<span class="text-muted-foreground block text-xs">
				Kan bara innehas av en person åt gången och kan leda andra roller. Andra roller har obegränsat antal personer.
			</span>
		</span>
	</label>
	{#if locked}
		<input type="hidden" name="isSupervisor" value="on" />
		<p class="text-muted-foreground mt-1 text-xs">Leder {leads.join(', ')}. Ta bort kopplingarna för att ändra detta.</p>
	{/if}
</div>

<div>
	<label class="field-label" for="role-supervisor">Leds av (frivilligt)</label>
	<select id="role-supervisor" name="supervisorRoleId" disabled={isSupervisor} class="field disabled:opacity-50">
		<option value="">Ingen</option>
		{#each supervisors as other}
			<option value={other.id} selected={!isSupervisor && other.id === role?.supervisorRoleId}>{other.name}</option>
		{/each}
	</select>
	<p class="text-muted-foreground mt-1 text-xs">
		{#if isSupervisor}
			En ledande roll kan inte ledas av en annan roll.
		{:else if supervisors.length === 0}
			Det finns inga ledande roller ännu. Markera först en roll som ledande roll.
		{:else}
			Volontärer med den här rollen får se vem som leder dem om de behöver hjälp.
		{/if}
	</p>
</div>
