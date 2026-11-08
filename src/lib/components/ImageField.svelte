<script lang="ts">
	import { onDestroy } from 'svelte';
	import Avatar from './Avatar.svelte';
	import { downscaleImage } from '$lib/resizeImage';

	/** File input named `imageFile` with a round preview. Photos are downscaled in the browser first. */
	let {
		current = null,
		name = '',
		required = false
	}: { current?: string | null; name?: string; required?: boolean } = $props();

	let preview = $state<string | null>(null);
	let fileName = $state('');

	onDestroy(() => {
		if (preview) URL.revokeObjectURL(preview);
	});

	const MAX_BYTES = 4 * 1024 * 1024; // the server's limit (see uploads.ts)

	async function onchange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const original = input.files?.[0];
		// The form cannot be submitted while the photo is being resized (the original could be too big)
		input.setCustomValidity(original ? 'Bilden bearbetas, vänta ett ögonblick.' : '');
		if (original) {
			// Keeps the upload under Lambda's payload limit; never throws.
			const resized = await downscaleImage(original);
			if (resized !== original) {
				const dt = new DataTransfer();
				dt.items.add(resized);
				input.files = dt.files;
			}
		}
		const file = input.files?.[0];
		input.setCustomValidity(file && file.size > MAX_BYTES ? 'Bilden är för stor (max 4 MB).' : '');
		if (preview) URL.revokeObjectURL(preview);
		preview = file ? URL.createObjectURL(file) : null;
		fileName = file?.name ?? '';
	}
</script>

<div class="flex items-center gap-4">
	<Avatar src={preview ?? current} {name} size={64} />
	<div class="min-w-0">
		<label class="btn btn-text has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary">
			{fileName || current ? 'Välj en annan bild' : 'Välj bild'}
			<input type="file" name="imageFile" accept="image/*" class="sr-only" {required} {onchange} />
		</label>
		{#if fileName}
			<p class="text-muted-foreground truncate px-4 text-xs">{fileName}</p>
		{/if}
	</div>
</div>
