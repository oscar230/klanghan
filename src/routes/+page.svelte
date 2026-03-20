<script lang="ts">
	import type { PageData } from './$types';
	let { data } = $props<{ data: PageData }>();

	let selectedUserId = $state('');

	let myShifts = $derived(
		data.shifts.filter((s) => s.userId === selectedUserId)
	);

	const getCoworkers = (shift: typeof data.shifts[0]) => {
		return data.shifts.filter((s) => 
			s.id !== shift.id && 
			s.startTime < shift.endTime &&
			s.endTime > shift.startTime
		);
	};
</script>

<svelte:head>
	<title>Klanghan - Schema</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-4xl w-full space-y-8 relative">
        <div class="absolute top-0 right-0">
            <a href="/admin" class="px-4 py-2 bg-white text-gray-700 font-medium rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors text-sm">Administratör</a>
        </div>

		<div class="text-center mt-6">
			<h1 class="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Klanghan Schema</h1>
			<p class="text-lg text-gray-600">Välj ditt namn för att se dina kommande arbetspass och kollegor.</p>
		</div>

		<div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-4">
			<label for="volunteer-select" class="text-gray-700 font-medium">Vem är du?</label>
			<select 
				id="volunteer-select" 
				bind:value={selectedUserId} 
				class="w-full sm:w-80 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all cursor-pointer font-medium text-gray-800"
			>
				<option value="" disabled selected>Välj ditt namn...</option>
				{#each data.users as user}
					<option value={user.id}>{user.name}</option>
				{/each}
			</select>
		</div>

		{#if selectedUserId}
			<div class="space-y-6">
				<h2 class="text-2xl font-bold text-gray-900 px-2">Dina arbetspass</h2>
				
				{#if myShifts.length === 0}
					<div class="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
						<p class="text-gray-500 text-lg">Du har inga inbokade arbetspass ännu.</p>
					</div>
				{:else}
					{#each myShifts as shift}
						{@const coworkers = getCoworkers(shift)}
						<div class="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden transform transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 duration-300">
							<div class="p-6 sm:p-8 flex flex-col md:flex-row gap-6">
								<div class="flex-1 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-8">
									<div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800 mb-4">
										{shift.role}
									</div>
									<div class="space-y-1">
										<p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Start</p>
										<p class="text-xl font-bold text-gray-900">{new Date(shift.startTime).toLocaleString('sv-SE', { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
									</div>
									<div class="space-y-1 mt-4">
										<p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Slut</p>
										<p class="text-xl font-bold text-gray-900">{new Date(shift.endTime).toLocaleString('sv-SE', { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
									</div>
								</div>
								
								<div class="flex-1 md:pl-2">
									<h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Arbetar med</h3>
									{#if coworkers.length === 0}
										<p class="text-gray-400 italic text-sm mt-2">Du arbetar ensam på detta pass!</p>
									{:else}
										<ul class="space-y-3">
											{#each coworkers as cw}
												<li class="flex items-center gap-3">
													<div class="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-200">
														{cw.userName.charAt(0).toUpperCase()}
													</div>
													<div>
														<p class="font-bold text-gray-900 text-sm">{cw.userName}</p>
														<p class="text-xs text-gray-500 font-medium">{cw.role} <span class="text-gray-300 mx-1">•</span> {new Date(cw.startTime).toLocaleTimeString('sv-SE', {hour: '2-digit', minute: '2-digit'})} - {new Date(cw.endTime).toLocaleTimeString('sv-SE', {hour: '2-digit', minute: '2-digit'})}</p>
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
<!-- Minimal footer -->
<footer class="mt-auto py-8 w-full text-center text-gray-400 text-xs tracking-widest uppercase">
	<a href="/admin" class="hover:text-gray-600 transition-colors">Administratörsinloggning</a>
</footer>
