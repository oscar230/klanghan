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
		<div class="col-12">
			<h1>KlangHan</h1>
			<p>
				Detta är en applikation för <a
					href="https://klanglandet.se/"
					target="_blank"
					rel="noopener noreferrer"><b>Klang</b>landet</a
				>. Här <b>han</b>terar vi arbetet under festivalen {year}.
			</p>
		</div>
	</div>
</div>
