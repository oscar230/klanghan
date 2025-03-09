<script lang="ts">
	import { Icon, Button, Input, FormGroup, Label, Alert } from '@sveltestrap/sveltestrap';
	const userTypes: Array<string> = ['medarbetare', 'arbetsledare', 'systemadministratör'];
	const users: Array<string> = ['Oscar', 'Olof', 'Evelina', 'Markus'];
	let selectedUserType: string = userTypes[0];
	let year: number = new Date().getFullYear();
	let enteredAccessKey: string = '';
</script>

<div class="container">
	<div class="row">
		<div class="col-12 col-lg-6">
			<h1>Välkommen till KlangHan</h1>
			<p>
				Detta är en applikation för <a
					href="https://klanglandet.se/"
					target="_blank"
					rel="noopener noreferrer">Klanglandet</a
				>. Här hanterar vi arbetet under festivalen {year}.
			</p>

			<FormGroup>
				<Label>Din roll</Label>
				{#each userTypes as value}
					<Input
						type="radio"
						bind:group={selectedUserType}
						{value}
						label={value.charAt(0).toUpperCase() + value.slice(1)}
					/>
				{/each}
				<br>
				{#if selectedUserType == userTypes[0]}
					<p>
						När du väljer att logga in som {selectedUserType} så använder du den åtkomstnyckel som är angiven i vår
						Discord-server.
					</p>
				{:else}
					<p>
						När du väljer att logga in som {selectedUserType} så får du din åtkomstnyckel ifrån Oscar.
					</p>
					<img
						src="/oscar.png"
						style="display: inline; width: auto; height: 3rem;"
						alt="oscar är glad"
					/>
				{/if}
			</FormGroup>
			<FormGroup>
				<Label>Åtkomstnyckel</Label>
				<Input
					type="password"
					placeholder="Din åtkomstnyckel"
					bind:value={enteredAccessKey}
					style="max-width: 15rem;"
				/>
			</FormGroup>
			{#if selectedUserType == userTypes[0]}
				<FormGroup>
					<Label>Vem är du?</Label>
					{#if users.length > 0}
						<Input type="select" style="max-width: 15rem;">
							{#each users as user}
								<option>{user}</option>
							{/each}
						</Input>
					{:else}
						<Alert color="danger">
							<p><b>Fel:</b> Det finns inga användare, du kan inte logga in som {userTypes[0]} just nu, vänligen kontakta {userTypes[2]}.</p>
						</Alert>
					{/if}
				</FormGroup>
			{/if}
			<FormGroup>
				<Button color="success" disabled={selectedUserType == userTypes[0] && users.length == 0}>
					<Icon name="door-open-fill" /> Logga in som {selectedUserType.toLowerCase()}
				</Button>
			</FormGroup>
		</div>
	</div>
</div>
