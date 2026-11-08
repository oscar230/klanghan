<script lang="ts">
	// Inline SVG icons (24px grid, outline style). Add new ones here.
	const ICONS = {
		plus: ['M5 12h14', 'M12 5v14'],
		x: ['M18 6 6 18', 'm6 6 12 12'],
		pencil: ['M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z', 'm15 5 4 4'],
		trash: [
			'M3 6h18',
			'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6',
			'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2',
			'M10 11v6',
			'M14 11v6'
		],
		image: [
			'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z',
			'M10 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z',
			'm21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21'
		],
		calendar: [
			'M8 2v4',
			'M16 2v4',
			'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
			'M3 10h18'
		],
		more: [
			'M13 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z',
			'M13 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z',
			'M13 19a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z'
		],
		back: ['m15 18-6-6 6-6'],
		// Person inside a shield
		admin: [
			'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
			'M16 11a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
			'M6.376 18.91a6 6 0 0 1 11.249.003'
		],
		// The admin icon struck through: leave the admin side
		'admin-off': [
			'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
			'M16 11a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
			'M6.376 18.91a6 6 0 0 1 11.249.003',
			'M3 3l18 18'
		],
		logout: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'm16 17 5-5-5-5', 'M21 12H9'],
		sun: [
			'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
			'M12 2v2',
			'M12 20v2',
			'm4.93 4.93 1.41 1.41',
			'm17.66 17.66 1.41 1.41',
			'M2 12h2',
			'M20 12h2',
			'm6.34 17.66-1.41 1.41',
			'm19.07 4.93-1.41 1.41'
		],
		moon: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z']
	};

	let { name, size = 20 }: { name: keyof typeof ICONS; size?: number } = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	class="shrink-0"
>
	{#each ICONS[name] as d}
		<path {d} />
	{/each}
</svg>
