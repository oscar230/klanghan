<script>
	let billettoValidationResponse = ""
	const billettoValidation = () => {
		billettoValidationResponse = "validering exempeltext"
	}
</script>

<div class="container mx-auto p-4">
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
		<div class="border rounded shadow-sm">
            <div class="bg-gray-100 p-3 border-b">
                <h2 class="text-xl font-bold">Meddela om försäljning på Billetto</h2>
            </div>
            <div class="p-4 space-y-4">
                <div>
                    <input type="text" class="w-full border p-2 rounded" placeholder="Billetto Event ID" />
                </div>
                <div>
                    <input type="text" class="w-full border p-2 rounded" placeholder="Discord Webhook URL" />
                </div>
                <div class="flex flex-col gap-2">
                    <div class="flex gap-2">
                        <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" on:click={() => billettoValidation()}>
                            Validera
                        </button>
                        <button class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                            Spara
                        </button>
                    </div>
                    {#if billettoValidationResponse}
                        <p class="text-sm mt-2">{billettoValidationResponse}</p>
                    {/if}
                </div>
            </div>
		</div>
		<div class="border rounded shadow-sm">
            <div class="bg-gray-100 p-3 border-b">
                <h2 class="text-xl font-bold">Meddela om ny medarbetaråtkomst</h2>
            </div>
            <div class="p-4 space-y-4">
                <div>
                    <input type="text" class="w-full border p-2 rounded" placeholder="Discord Webhook URL" />
                </div>
                <div>
                    <button class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                        Spara
                    </button>
                </div>
            </div>
		</div>
	</div>
</div>
