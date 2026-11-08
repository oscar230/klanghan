<svelte:head>
	<title>Handbok - Administratör</title>
</svelte:head>

<h1 class="text-2xl">Handbok</h1>
<p class="text-muted-foreground mt-1 mb-6 text-sm">Kort om hur appen fungerar.</p>

<div class="space-y-8 leading-relaxed">
	<section>
		<h2 class="mb-2 text-lg font-medium">Så fungerar det</h2>
		<p>
			Volontärerna öppnar startsidan, väljer sitt namn och ser sina arbetspass och vilka de arbetar med. Här i
			administrationen lägger du in volontärer, roller och arbetspass. Festivalen pågår fredag till söndag och alla
			tider anges som dag och klockslag.
		</p>
	</section>

	<section>
		<h2 class="mb-2 text-lg font-medium">Volontärer</h2>
		<p>
			Lägg till volontärer med knappen <em>Ny volontär</em>. Bilden är frivillig och visas rund. Med <em>Ändra bild</em>
			byter du bild och med <em>Ta bort bild</em> återgår volontären till standardbilden.
		</p>
		<p class="mt-2">
			Du kan bara ta bort en volontär som inte har några arbetspass. Ta först bort eller flytta passen.
		</p>
	</section>

	<section>
		<h2 class="mb-2 text-lg font-medium">Roller</h2>
		<p>
			En roll är en uppgift under festivalen, till exempel bar eller entré. Skriv en beskrivning så att volontärerna
			vet vad som förväntas av dem; den visas för dem i deras schema.
		</p>
		<p class="mt-2">
			En roll kan bara tas bort när inget arbetspass använder den. <em>Visa schema</em> visar alla pass för rollen,
			dag för dag.
		</p>
	</section>

	<section>
		<h2 class="mb-2 text-lg font-medium">Schema</h2>
		<p>
			Under <em>Schema</em> bokar du in en volontär på en roll med start och slut. Med <em>Byt volontär</em> flyttar du
			ett pass till någon annan och med <em>Ta bort</em> tar du bort passet.
		</p>
		<p class="mt-2">
			Är en volontär bokad på flera pass samtidigt markeras passen med <em>Krock</em>. Det går att spara ändå, men
			volontärer bör normalt inte ha flera pass på en gång. Behövs det, skapa hellre en egen roll som täcker uppdraget.
		</p>
	</section>

	<section>
		<h2 class="mb-2 text-lg font-medium">Luckor och överlapp</h2>
		<p>
			I schemat för en roll visas <em>Lucka i schemat</em> när ingen är bemannad mellan två pass samma dag. Använd det för
			att se till att ingen plats lämnas obevakad. Luckor räknas bara mellan dagens första och sista pass.
		</p>
		<p class="mt-2">
			<em>Överlapp</em> betyder att ett pass börjar innan det förra har slutat. Det är tillåtet, eftersom det ibland ska
			vara flera personer på samma roll samtidigt.
		</p>
	</section>

	<section>
		<h2 class="mb-2 text-lg font-medium">Övrigt</h2>
		<ul class="list-disc space-y-1 pl-5">
			<li>Kalenderikonen högst upp till höger visar det publika schemat som volontärerna ser.</li>
			<li>Månen och solen byter mellan ljust och mörkt läge. Som standard följer appen enhetens inställning.</li>
			<li>På smala skärmar finns radens åtgärder bakom en meny med tre punkter.</li>
		</ul>
	</section>
</div>
