<script lang="ts">
	import { formatOffset, formatShiftTime } from '$lib/time';
	import type { PageData } from './$types';
	let { data } = $props<{ data: PageData }>();

	let selectedUserId = $state('');

	let myShifts = $derived(
		data.shifts.filter((s: any) => s.userId === selectedUserId)
	);

	const getCoworkers = (shift: typeof data.shifts[0]) => {
		return data.shifts.filter((s: any) => 
			s.id !== shift.id && 
			s.startOffset < shift.endOffset &&
			s.endOffset > shift.startOffset
		);
	};
</script>

<svelte:head>
	<title>Klanghan - Schema</title>
</svelte:head>

<div class="min-h-screen bg-background flex flex-col items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
    <div class="fixed top-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full bg-primary/10 blur-[100px] pointer-events-none"></div>
    <div class="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-secondary/10 blur-[100px] pointer-events-none"></div>

	<div class="max-w-3xl w-full space-y-6 relative z-10">
        <div class="flex items-center justify-between mt-2 mb-6">
            <div>
                <h1 class="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight drop-shadow-sm">Klanghan Schema</h1>
                <p class="text-xs md:text-sm text-muted-foreground mt-1">Välj ditt namn för att se schemat och kollegor.</p>
            </div>
            <a href="/admin" class="px-3 py-1.5 bg-card/80 backdrop-blur-sm text-primary font-bold rounded shadow-sm border border-border hover:bg-muted hover:border-primary/50 transition-all text-[11px] uppercase tracking-wider">
                Administratör
            </a>
        </div>

		<div class="bg-card/80 backdrop-blur-md p-4 rounded-xl shadow-md border border-border flex items-center gap-4">
			<label for="volunteer-select" class="text-foreground font-bold text-sm whitespace-nowrap">Vem är du?</label>
			<select 
				id="volunteer-select" 
				bind:value={selectedUserId} 
				class="w-full sm:w-72 px-3 py-2 bg-input/80 border border-input-border text-foreground rounded-md focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer font-medium shadow-inner text-sm"
			>
				<option value="" disabled selected>Välj ditt namn...</option>
				{#each data.users as user}
					<option value={user.id}>{user.name}</option>
				{/each}
			</select>
		</div>

		{#if selectedUserId}
			<div class="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
				<h2 class="text-lg font-bold text-foreground px-1 tracking-tight border-b border-border/50 pb-2">Dina arbetspass</h2>
				
				{#if myShifts.length === 0}
					<div class="bg-card p-6 rounded-xl shadow-sm border border-border border-dashed text-center">
						<p class="text-muted-foreground text-sm font-medium">Du har inga inbokade arbetspass ännu.</p>
					</div>
				{:else}
					{#each myShifts as shift}
						{@const coworkers = getCoworkers(shift)}
						<div class="group bg-card rounded-xl shadow-sm border border-border overflow-hidden transform transition-all hover:border-primary/30 hover:shadow-md duration-200 relative">
                            <div class="absolute left-0 top-0 bottom-0 w-1 bg-primary group-hover:bg-secondary transition-colors duration-500"></div>
                            
							<div class="p-4 md:p-5 flex flex-col md:flex-row gap-4 pl-5">
								<div class="md:w-48 shrink-0 border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0 md:pr-4">
									<div class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 mb-3 tracking-wide truncate max-w-full">
										{shift.roleName}
									</div>
                                    <div class="space-y-0.5">
                                        <p class="text-muted-foreground text-[9px] font-bold uppercase tracking-widest">Arbetspass</p>
                                        <p class="text-sm font-bold text-foreground">{formatShiftTime(shift.startOffset, shift.endOffset)}</p>
                                    </div>
								</div>
								
								<div class="flex-1">
									<h3 class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-3">Arbetar med</h3>
									{#if coworkers.length === 0}
										<div class="bg-muted/30 rounded p-2.5 border border-border/50">
                                            <p class="text-muted-foreground italic text-xs">Du arbetar ensam på detta pass!</p>
                                        </div>
									{:else}
										<ul class="space-y-2">
											{#each coworkers as cw}
												<li class="flex items-center gap-3 bg-muted/10 p-2 rounded-lg border border-transparent hover:border-border/50 transition-colors">
													<div class="shrink-0 w-7 h-7 rounded-sm bg-secondary/10 text-secondary flex items-center justify-center font-bold text-xs border border-secondary/20 shadow-sm">
														{cw.userName.charAt(0).toUpperCase()}
													</div>
													<div class="flex-1 min-w-0">
														<p class="font-bold text-foreground text-xs truncate">{cw.userName}</p>
														<p class="text-[10px] text-muted-foreground font-medium mt-0.5 truncate">{cw.roleName} <span class="text-border mx-1">•</span> {formatOffset(cw.startOffset).split(' ')[1]} - {formatOffset(cw.endOffset).split(' ')[1]}</p>
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
