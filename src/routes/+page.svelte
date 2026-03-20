<script lang="ts">
	import { formatOffset } from '$lib/time';
	import type { PageData } from './$types';
	let { data } = $props<{ data: PageData }>();

	let selectedUserId = $state('');

	let myShifts = $derived(
		data.shifts.filter((s) => s.userId === selectedUserId)
	);

	const getCoworkers = (shift: typeof data.shifts[0]) => {
		return data.shifts.filter((s) => 
			s.id !== shift.id && 
			s.startOffset < shift.endOffset &&
			s.endOffset > shift.startOffset
		);
	};
</script>

<svelte:head>
	<title>Klanghan - Schema</title>
</svelte:head>

<div class="min-h-screen bg-background flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <div class="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>
    <div class="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none"></div>

	<div class="max-w-4xl w-full space-y-12 relative z-10">
        <div class="absolute top-0 right-0">
            <a href="/admin" class="px-5 py-2.5 bg-card/80 backdrop-blur-sm text-foreground font-medium rounded-full shadow-lg border border-border hover:bg-muted hover:border-primary/50 transition-all text-sm">Administratör</a>
        </div>

		<div class="text-center mt-12">
			<h1 class="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight mb-4 drop-shadow-sm">Klanghan Schema</h1>
			<p class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">Välj ditt namn för att se dina inkallade arbetspass och vilka du jobbar med under festivalen.</p>
		</div>

		<div class="bg-card/50 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-border flex flex-col sm:flex-row items-center justify-center gap-6">
			<label for="volunteer-select" class="text-foreground font-semibold text-lg">Vem är du?</label>
			<select 
				id="volunteer-select" 
				bind:value={selectedUserId} 
				class="w-full sm:w-96 px-5 py-3.5 bg-input/80 border border-input-border text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer font-medium shadow-inner"
			>
				<option value="" disabled selected>Välj ditt namn...</option>
				{#each data.users as user}
					<option value={user.id}>{user.name}</option>
				{/each}
			</select>
		</div>

		{#if selectedUserId}
			<div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
				<h2 class="text-3xl font-bold text-foreground px-2 tracking-tight">Dina arbetspass</h2>
				
				{#if myShifts.length === 0}
					<div class="bg-card p-12 rounded-3xl shadow-xl border border-border text-center">
						<p class="text-muted-foreground text-xl font-medium">Du har inga inbokade arbetspass ännu.</p>
					</div>
				{:else}
					{#each myShifts as shift}
						{@const coworkers = getCoworkers(shift)}
						<div class="group bg-card rounded-3xl shadow-xl border border-border overflow-hidden transform transition-all hover:shadow-[0_8px_30px_-4px_rgba(138,154,91,0.15)] hover:-translate-y-1 duration-300 relative">
                            <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-primary group-hover:bg-secondary transition-colors duration-500"></div>
                            
							<div class="p-8 md:p-10 flex flex-col md:flex-row gap-8 pl-10">
								<div class="flex-[0.8] border-b md:border-b-0 md:border-r border-border pb-8 md:pb-0 md:pr-10">
									<div class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-primary/10 text-primary border border-primary/20 mb-6 tracking-wide">
										{shift.roleName}
									</div>
									<div class="space-y-1.5">
										<p class="text-muted-foreground text-xs font-bold uppercase tracking-widest">Start</p>
										<p class="text-2xl font-bold text-foreground">{formatOffset(shift.startOffset)}</p>
									</div>
									<div class="space-y-1.5 mt-6">
										<p class="text-muted-foreground text-xs font-bold uppercase tracking-widest">Slut</p>
										<p class="text-2xl font-bold text-foreground">{formatOffset(shift.endOffset)}</p>
									</div>
								</div>
								
								<div class="flex-1 md:pl-4">
									<h3 class="text-xs font-bold text-secondary uppercase tracking-widest mb-5">Arbetar med</h3>
									{#if coworkers.length === 0}
										<div class="bg-muted/30 rounded-xl p-4 border border-border/50">
                                            <p class="text-muted-foreground italic text-sm">Du arbetar ensam på detta pass!</p>
                                        </div>
									{:else}
										<ul class="space-y-4">
											{#each coworkers as cw}
												<li class="flex items-center gap-4 bg-muted/20 p-3 rounded-2xl border border-transparent hover:border-border transition-colors">
													<div class="w-10 h-10 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold text-lg border border-secondary/30 shadow-sm">
														{cw.userName.charAt(0).toUpperCase()}
													</div>
													<div class="flex-1">
														<p class="font-bold text-foreground text-base">{cw.userName}</p>
														<p class="text-sm text-muted-foreground font-medium mt-0.5">{cw.roleName} <span class="text-border mx-2">•</span> {formatOffset(cw.startOffset).split(' ')[1]} - {formatOffset(cw.endOffset).split(' ')[1]}</p>
													</div>
												</li>
											{/each}
										</ul>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
</div>
