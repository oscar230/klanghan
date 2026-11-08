<script lang="ts">
	import Avatar from '$lib/components/Avatar.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { formatClock, getDuration } from '$lib/time';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.role.name} - Schema</title>
</svelte:head>

<div class="mb-6 flex items-center gap-2">
	<a href="/admin/roles" class="icon-btn -ml-2" aria-label="Tillbaka till roller" title="Tillbaka till roller">
		<Icon name="back" />
	</a>
	<div class="min-w-0">
		<h1 class="truncate text-2xl">{data.role.name}</h1>
		<p class="text-muted-foreground text-sm">Fullständigt schema och täckning.</p>
	</div>
</div>

{#if data.days.length === 0}
	<p class="text-muted-foreground py-12 text-center text-sm">Inga arbetspass inbokade för denna roll än.</p>
{:else}
	{#each data.days as day}
		<section class="mb-8">
			<h2 class="text-muted-foreground mb-1 text-sm font-medium">{day.dayName}</h2>
			<ul class="list">
				{#each day.items as item}
					{#if item.type === 'gap'}
						<li class="list-row border-border my-2 rounded-lg border border-dashed px-3">
							<div class="flex-1">
								<p class="font-medium">Lucka i schemat</p>
								<p class="text-muted-foreground text-sm">
									{formatClock(item.startOffset)} – {formatClock(item.endOffset)}
								</p>
							</div>
							<span class="chip">{getDuration(item.startOffset, item.endOffset)}</span>
						</li>
					{:else}
						<li class="list-row">
							<Avatar src={item.imageUrl} name={item.userName} />
							<div class="min-w-0 flex-1">
								<p class="truncate font-medium">{item.userName}</p>
								<p class="text-muted-foreground text-sm">
									{formatClock(item.startOffset)} – {formatClock(item.endOffset)}
								</p>
							</div>
							{#if item.isOverlap}
								<span class="bg-foreground text-background rounded-full px-2 py-0.5 text-xs">Överlapp</span>
							{/if}
							<span class="chip">{getDuration(item.startOffset, item.endOffset)}</span>
						</li>
					{/if}
				{/each}
			</ul>
		</section>
	{/each}
{/if}
