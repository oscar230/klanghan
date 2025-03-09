<script lang="ts">
	import {
		Button,
		ButtonGroup,
		Icon,
		Card,
		CardHeader,
		CardTitle,
		CardBody
	} from '@sveltestrap/sveltestrap';
	import { onMount } from 'svelte';
	let accessKeys: Array<string> = [];

	onMount(() => {
		invalidateKey(0, 8, 'abcdefghkmnopqrstuvwxyz0123456789');
		invalidateKey(1);
		invalidateKey(2);
	});

	const copy = async (text: string) => {
		await navigator.clipboard.writeText(text);
	};

	const invalidateKey = (
		index: number,
		length: number = 32,
		chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	) => {
		let result = '';
		const array = new Uint8Array(length);
		crypto.getRandomValues(array); // Secure random values
		array.forEach((byte) => {
			result += chars[byte % chars.length];
		});
		accessKeys[index] = result;
	};
</script>

<div class="container">
	<div class="row gy-3">
		{#if accessKeys[0]}
			<div class="col-12 col-lg-6">
				<Card>
					<CardHeader>
						<CardTitle>Medarbetare</CardTitle>
					</CardHeader>
					<CardBody>
						<p>Åtkomstnyckeln för medarbetare är: <code>{accessKeys[0]}</code></p>
						<ButtonGroup>
							<Button color="danger" on:click={() => invalidateKey(0, 8, 'abcdefghkmnopqrstuvwxyz0123456789')}>
								<Icon name="trash-fill" /> Invalidera och skapa ny
							</Button>
							<Button color="primary">
								<Icon name="discord" /> Skicka till Discord
							</Button>
							<Button color="primary" on:click={async () => await copy(accessKeys[0])}>
								<Icon name="clipboard-fill" /> Kopiera
							</Button>
						</ButtonGroup>
					</CardBody>
				</Card>
			</div>
		{/if}
		{#if accessKeys[1]}
			<div class="col-12 col-lg-6">
				<Card>
					<CardHeader>
						<CardTitle>Arbetsledare</CardTitle>
					</CardHeader>
					<CardBody>
						<p>Åtkomstnyckeln för arbetsledare är: <code>{accessKeys[1]}</code></p>
						<ButtonGroup>
							<Button color="danger" on:click={() => invalidateKey(1)}>
								<Icon name="trash-fill" /> Invalidera och skapa ny
							</Button>
							<Button color="primary" on:click={async () => await copy(accessKeys[1])}>
								<Icon name="clipboard-fill" /> Kopiera
							</Button>
						</ButtonGroup>
					</CardBody>
				</Card>
			</div>
		{/if}
		{#if accessKeys[2]}
			<div class="col-12 col-lg-6">
				<Card>
					<CardHeader>
						<CardTitle>Systemadministratör</CardTitle>
					</CardHeader>
					<CardBody>
						<p>Åtkomstnyckeln för systemadministratörer är: <code>{accessKeys[2]}</code></p>
						<ButtonGroup>
							<Button color="primary" on:click={async () => await copy(accessKeys[2])}>
								<Icon name="clipboard-fill" /> Kopiera
							</Button>
						</ButtonGroup>
					</CardBody>
				</Card>
			</div>
		{/if}
	</div>
</div>
