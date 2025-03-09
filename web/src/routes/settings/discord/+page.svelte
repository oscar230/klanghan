<script>
	import { Card, CardHeader, CardTitle, CardBody, FormGroup, Input, Icon, Button, ButtonGroup } from '@sveltestrap/sveltestrap';
	let billettoValidationResponse = ""
	const billettoValidation = () => {
		billettoValidationResponse = "validering exempeltext"
	}
</script>

<div class="container">
	<div class="row gy-3">
		<div class="col-12 col-md-6 ">
			<Card>
				<CardHeader>
					<CardTitle>Meddela om försäljning på Billetto</CardTitle>
				</CardHeader>
				<CardBody>
					<FormGroup>
						<Input placeholder="Billetto Event ID" />
					</FormGroup>
					<FormGroup>
						<Input placeholder="Discord Webhook URL" />
					</FormGroup>
					<FormGroup>
						<ButtonGroup>
							<Button color="primary" on:click={() => billettoValidation()}><Icon name="check-square-fill" /> Validera</Button>
							<Button color="success"><Icon name="save-fill" /> Spara</Button>
						</ButtonGroup>
						{#if billettoValidationResponse}
							<p>{billettoValidationResponse}</p>
						{/if}
					</FormGroup>
				</CardBody>
			</Card>
		</div>
		<div class="col-12 col-md-6">
			<Card>
				<CardHeader>
					<CardTitle>Meddela om ny medarbetaråtkomst</CardTitle>
				</CardHeader>
				<CardBody>
					<FormGroup>
						<Input placeholder="Discord Webhook URL" />
					</FormGroup>
					<FormGroup>
						<Button color="success"><Icon name="save-fill" /> Spara</Button>
					</FormGroup>
				</CardBody>
			</Card>
		</div>
	</div>
</div>
