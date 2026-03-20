<script lang="ts">
	import { onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';

	let roles: Writable<Array<string>> = writable([]);
	let newRole = '';
	let open = false;

	const toggle = () => (open = !open);
	const addRole = (role: string = newRole) => {
		roles.update(r => [...r, role.trim()]);
		if (role === newRole) {
			newRole = '';
		}
	};
	const removeRole = (roleToRemove: string) => {
		roles.update(r => r.filter(role => role !== roleToRemove));
	};

	onMount(() => {
		addRole('arbetsledare');
		addRole('säkerhetsansvarige');
		addRole('trygghetsvärd');
		addRole('DJ');
	});
</script>

{#if open}
<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
	<div class="bg-white rounded-lg shadow-xl w-full max-w-md">
		<div class="p-4 border-b">
            <h2 class="text-xl font-semibold">Lägg till roll</h2>
        </div>
		<div class="p-4">
			<div class="mb-4">
				<input type="text" class="w-full border p-2 rounded" bind:value={newRole} placeholder="Rollnamn" />
			</div>
		</div>
		<div class="p-4 border-t flex justify-end gap-2">
            <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" on:click={() => { addRole(); toggle(); }}>
                Lägg till roll
            </button>
            <button class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" on:click={toggle}>
                Avbryt
            </button>
		</div>
	</div>
</div>
{/if}

<div class="container mx-auto p-4">
    <div class="mb-8">
        <h1 class="text-3xl font-bold mb-4">Roller</h1>
        <div class="mb-4">
            <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" on:click={toggle}>
                [+] Lägg till roll
            </button>
        </div>
        <table class="min-w-full border-collapse border border-gray-300">
            <thead class="bg-gray-100">
                <tr>
                    <th class="border border-gray-300 p-2 text-left">Arbetsroll</th>
                    <th class="border border-gray-300 p-2"></th>
                </tr>
            </thead>
            <tbody>
                {#each $roles as role}
                    <tr>
                        <td class="border border-gray-300 p-2">{role}</td>
                        <td class="border border-gray-300 p-2 text-right">
                            <button class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700" on:click={() => removeRole(role)}>
                                Ta bort roll
                            </button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>
