<script lang="ts">
	/** The red "Krock" mark for something that is impossible as scheduled. `title` explains why. */
	let { title = undefined }: { title?: string } = $props();
</script>

<span class="bg-danger text-danger-foreground shrink-0 rounded-full px-2 py-0.5 text-xs" {title}>Krock</span>
