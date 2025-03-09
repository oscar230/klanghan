<script lang="ts">
	import {
		Button,
		ButtonGroup,
		FormGroup,
		Icon,
		Input,
		Modal,
		ModalBody,
		ModalFooter,
		ModalHeader,
		Table
	} from '@sveltestrap/sveltestrap';
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

<Modal body isOpen={open} {toggle}>
	<ModalHeader>Lägg till roll</ModalHeader>
	<ModalBody>
		<FormGroup>
			<Input type="text" bind:value={newRole} placeholder="Rollnamn" />
		</FormGroup>
	</ModalBody>
	<ModalFooter>
		<ButtonGroup>
			<Button
				color="primary"
				on:click={() => {
					addRole();
					toggle();
				}}
			>
				<Icon name="plus" /> Lägg till roll
			</Button>
			<Button color="secondary" on:click={toggle}>
				<Icon name="arrow-90deg-left" /> Avbryt
			</Button>
		</ButtonGroup>
	</ModalFooter>
</Modal>

<div class="container">
	<div class="row">
		<div class="col-12">
			<h1>Roller</h1>
			<FormGroup>
				<ButtonGroup>
					<Button color="primary" on:click={toggle}>
						<Icon name="plus" /> Lägg till roll
					</Button>
				</ButtonGroup>
			</FormGroup>
			<Table bordered striped hover>
				<thead>
					<tr>
						<th>Arbetsroll</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each $roles as role}
						<tr>
							<th scope="row">{role}</th>
							<td>
								<ButtonGroup>
									<Button size="sm" color="danger" on:click={() => removeRole(role)}>
										<Icon name="trash-fill" /> Ta bort roll
									</Button>
								</ButtonGroup>
							</td>
						</tr>
					{/each}
				</tbody>
			</Table>
		</div>
	</div>
</div>
