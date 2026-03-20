<script lang="ts">
	import { onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';

    const isMobile: Writable<boolean> = writable(true);
    const isAdmin: Writable<boolean> = writable(true);
    const isManager: Writable<boolean> = writable(true);
    
    let menuOpen = false;

    onMount(() => {
        const checkMobile = () => {
            $isMobile = window.matchMedia('(max-width: 768px)').matches;
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    });
</script>

<nav class="bg-gray-800 text-white p-4 flex justify-between items-center fixed w-full top-0 z-50">
	<div class="flex items-center">
		<a href="/" class="flex items-center gap-2 text-xl font-bold bg-transparent text-white no-underline hover:text-gray-300">
			<img src="/logo.png" width="auto" height="30" alt="Klanglandets logotyp" />
			KlangHan
		</a>
	</div>
	
	<div class="relative">
		<button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2 cursor-pointer border-none" on:click={() => menuOpen = !menuOpen}>
			Meny ▼
		</button>
		
		{#if menuOpen}
		<div class="absolute right-0 mt-2 w-56 bg-white text-gray-900 rounded shadow-lg py-2 z-50 border border-gray-200">
            <div class="px-4 py-1 text-xs font-bold text-gray-500 uppercase tracking-wider">Allmänt</div>
			<a href="/" class="block px-4 py-2 hover:bg-gray-100 no-underline text-gray-800">Ditt schema</a>
			<a href="/schedules" class="block px-4 py-2 hover:bg-gray-100 no-underline text-gray-800">Scheman</a>
			<a href="/about" class="block px-4 py-2 hover:bg-gray-100 no-underline text-gray-800">Vad är detta?</a>

            {#if $isManager}
            <div class="border-t border-gray-200 my-1"></div>
			<div class="px-4 py-1 text-xs font-bold text-gray-500 uppercase tracking-wider">Arbetsledare</div>
			<a href="/manage/roles" class="block px-4 py-2 hover:bg-gray-100 no-underline text-gray-800">Arbetsroller</a>
            {/if}

            {#if $isAdmin}
            <div class="border-t border-gray-200 my-1"></div>
			<div class="px-4 py-1 text-xs font-bold text-gray-500 uppercase tracking-wider">Systemadministratör</div>
			<a href="/settings/discord" class="block px-4 py-2 hover:bg-gray-100 no-underline text-gray-800">Discord</a>
			<a href="/settings/access" class="block px-4 py-2 hover:bg-gray-100 no-underline text-gray-800">Åtkomst</a>
            {/if}

            <div class="border-t border-gray-200 my-1"></div>
            <div class="px-4 py-1 text-xs font-bold text-gray-500 uppercase tracking-wider">{#if $isAdmin || $isManager}Din användare{:else}Användare{/if}</div>
			<a href="#" class="block px-4 py-2 hover:bg-gray-100 no-underline text-red-600">Logga ut</a>
		</div>
		{/if}
	</div>
</nav>