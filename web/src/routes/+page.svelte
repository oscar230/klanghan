<script lang="ts">
	import { Icon, Button, Input, FormGroup, Label, Alert } from '@sveltestrap/sveltestrap';
	const roles: Array<string> = ['medarbetare', 'arbetsledare', 'systemadministratör'];
	const users: Array<string> = ['Oscar', 'Olof', 'Evelina', 'Markus'];
	let role: string = roles[0];
	let year: number = new Date().getFullYear();
	let accessKey: string = '';
</script>

<div class="container">
	<div class="row">
		<div class="col-12 col-lg-6">
			<h1>Välkommen till KlangHan</h1>
			<p>
				Detta är en applikation för <a
					href="https://klanglandet.se/"
					target="_blank"
					rel="noopener noreferrer"><b>Klang</b>landet</a
				>. Här <b>han</b>terar vi arbetet under festivalen {year}.
			</p>

			<FormGroup>
				<Label>Din roll</Label>
				{#each roles as value}
					<Input
						type="radio"
						bind:group={role}
						{value}
						label={value.charAt(0).toUpperCase() + value.slice(1)}
					/>
				{/each}
				<br>
				{#if role == roles[0]}
					<p>
						När du väljer att logga in som {role} så använder du den åtkomstnyckel som är angiven i vår
						Discord-server.
					</p>
				{:else}
					<p>
						När du väljer att logga in som {role} så får du din åtkomstnyckel ifrån Oscar.
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
					bind:value={accessKey}
					style="max-width: 15rem;"
				/>
			</FormGroup>
			{#if role == roles[0]}
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
							<p><b>Fel:</b> Det finns inga användare, du kan inte logga in som {roles[0]} just nu, vänligen kontakta {roles[2]}.</p>
						</Alert>
					{/if}
				</FormGroup>
			{/if}
			<FormGroup>
				<Button color="success" disabled={role == roles[0] && users.length == 0}>
					<Icon name="door-open-fill" /> Logga in som {role.toLowerCase()}
				</Button>
			</FormGroup>
		</div>
	</div>
</div>
