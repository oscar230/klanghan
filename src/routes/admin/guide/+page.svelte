<svelte:head>
	<title>Handbok - Administratör</title>
</svelte:head>

<h1 class="text-2xl">Handbok</h1>
<p class="text-muted-foreground mt-1 mb-6 text-sm">Kort om hur appen fungerar.</p>

<div class="space-y-8 leading-relaxed">
	<section>
		<h2 class="mb-2 text-lg font-medium">Så fungerar det</h2>
		<p>
			Volontärerna öppnar startsidan, väljer sitt namn och ser sina arbetspass och vilka de arbetar med. Bredvid
			<em>Arbetspass</em> finns fliken <em>Artister</em> med vem som spelar var och när. Här i administrationen lägger
			du in volontärer, roller, arbetspass, scener och artister. Festivalen pågår fredag till söndag och alla tider
			anges som dag och 24-timmarsklocka.
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
		<p class="mt-2">
			De flesta roller kan ha hur många personer som helst. En roll som markeras som <em>Ledande roll</em>, till
			exempel <em>Säkerhetsansvarig</em>, kan däremot bara innehas av en person åt gången. Bara ledande roller kan leda
			andra roller: välj den under <em>Leds av</em> på den roll som ska ledas, till exempel
			<em>Trygghetsvärd</em>. En ledande roll kan leda flera roller, men en roll kan bara ha en ledare och en ledande roll
			kan inte själv ledas av en annan.
		</p>
		<p class="mt-2">
			Volontärer ser på sitt schema vem med den ledande rollen som arbetar under passet och som de kan fråga om
			hjälp. En ledande roll som leder andra roller kan inte tas bort, och inte heller göras om till en vanlig roll,
			förrän kopplingarna tagits bort: ändra de roller som leds och välj <em>Ingen</em> under <em>Leds av</em>.
		</p>
	</section>

	<section>
		<h2 class="mb-2 text-lg font-medium">Arbetspass</h2>
		<p>
			Under <em>Arbetspass</em> bokar du in en volontär på en roll med start och slut. Med <em>Ändra</em> byter du
			volontär, roll eller tider för ett pass och med <em>Ta bort</em> tar du bort det. Tider anges alltid med 24-timmarsklocka.
		</p>
		<p class="mt-2">
			Pass som inte går att genomföra markeras med <em>Krock</em> och i rött i kalendern: en volontär som är bokad på
			flera pass samtidigt, eller en ledande roll som två personer har samtidigt. Det går att spara ändå, men
			ändra passen så att de inte krockar. Behövs det verkligen, skapa hellre en egen roll som täcker uppdraget.
		</p>
	</section>

	<section>
		<h2 class="mb-2 text-lg font-medium">Listvy och kalendervy</h2>
		<p>
			Arbetspass och artister kan visas som <em>Listvy</em> eller <em>Kalendervy</em>. Valet ändrar bara hur
			samma uppgifter visas, inte vilka uppgifter det är; det är flikarna som byter mellan arbetspass och artister.
			Kalendervyn har en kolumn per dag och klockslagen längs sidan. Pass som sker samtidigt ligger bredvid
			varandra; i smala kolumner står texten på högkant. På smala skärmar visas en dag i taget. Tryck på ett pass
			för att se detaljer, ändra eller ta bort det. Arbetspass är blå och artister svartvita, och med knapparna
			ovanför kalendern väljer du om du vill se arbetspass, artister eller båda. Pass som krockar är röda.
			Volontärerna har samma kalender på startsidan, men utan möjlighet att ändra.
		</p>
		<p class="mt-2">
			Med filtren ovanför listan och kalendern, på sidorna <em>Arbetspass</em> och <em>Artister</em>, begränsar du
			vyn till en volontär, en roll eller scen, eller bara det som krockar. Filtren gäller både listvyn och
			kalendervyn, och krockar räknas alltid på hela schemat även om en del är bortfiltrerad.
		</p>
	</section>

	<section>
		<h2 class="mb-2 text-lg font-medium">Artister och scener</h2>
		<p>
			Artistschemat är skilt från arbetspassen och alla kan se det. Under <em>Scener</em> lägger du in scenerna.
			Under <em>Artister</em> bokar du in en spelning med artistens namn, genre, scen, start och slut. En spelning är
			alltså en händelse i schemat och inte ett eget register över artister. Flera artister kan spela samtidigt på
			olika scener, men två på samma scen samtidigt krockar och markeras med rött. En scen med spelningar kan inte
			tas bort förrän spelningarna är borttagna eller flyttade.
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
			<li>Admin-ikonen med streck över högst upp till höger lämnar administrationen och visar det publika schemat som volontärerna ser.</li>
			<li>Pilen ut ur rutan loggar ut, efter en fråga om du verkligen vill det.</li>
			<li>Månen och solen byter mellan ljust och mörkt läge. Som standard följer appen enhetens inställning.</li>
			<li>På smala skärmar finns radens åtgärder bakom en meny med tre punkter.</li>
		</ul>
	</section>
</div>
