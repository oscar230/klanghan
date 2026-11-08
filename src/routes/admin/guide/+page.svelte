<svelte:head>
	<title>Handbok - Administratör</title>
</svelte:head>

<h1 class="text-2xl">Handbok</h1>
<p class="text-muted-foreground mt-1 mb-6 text-sm">Kort om hur appen fungerar.</p>

<div class="space-y-6 leading-relaxed">
	<section>
		<h2 class="mb-1 text-lg font-medium">Så fungerar det</h2>
		<p>
			Appen har en publik sida för volontärer och festivalbesökare och en administration som bara du når. Festivalen pågår
			fredag till söndag och alla tider anges som dag och 24-timmarsklocka. På telefon ligger knapparna för varje rad
			bakom en meny med tre punkter, på bredare skärmar står de till höger om raden. Nya poster läggs till med knappen
			nere till höger och ändras eller tas bort på raden. Formulär öppnas i en ruta, och felmeddelanden visas i rutan.
		</p>
	</section>

	<section>
		<h2 class="mb-1 text-lg font-medium">Publika sidan</h2>
		<p>
			På startsidan väljer en volontär sitt namn och ser sina arbetspass, vem hen arbetar med och, om rollen leds av en
			ledande roll, vem med den rollen som är i tjänst och kan hjälpa till. Fliken <em>Artister</em> visar vem som spelar
			var och när, med filter för scen och sökning på artist eller genre. Namnet kommer ihåg på enheten. Ikonen med skölden
			uppe till höger leder till administrationen.
		</p>
	</section>

	<section>
		<h2 class="mb-1 text-lg font-medium">Listvy och kalendervy</h2>
		<p>
			Arbetspass och artister kan visas som <em>Listvy</em> eller <em>Kalendervy</em>. Valet ändrar bara hur samma
			uppgifter visas; det är flikarna som byter mellan arbetspass och artister. Kalendern har en kolumn per dag och
			klockslagen längs sidan, pass som sker samtidigt ligger bredvid varandra och på smala skärmar visas en dag i taget.
			Tryck på ett pass för detaljer. Arbetspass är blå och artister svartvita, och knapparna ovanför kalendern väljer vad
			som visas. Besökare kan inte ändra något i kalendern, och volontärens egna pass lyfts fram när hen valt sitt namn.
		</p>
	</section>

	<section>
		<h2 class="mb-1 text-lg font-medium">Ljust och mörkt läge</h2>
		<p>
			Appen följer enhetens inställning. Månen eller solen uppe till höger byter läge, och valet sparas på enheten
			så länge det skiljer sig från enhetens inställning.
		</p>
	</section>

	<section>
		<h2 class="mb-1 text-lg font-medium">Inloggning</h2>
		<p>
			Administrationen kräver huvudlösenordet. Ikonen med den överstrukna skölden lämnar administrationen och visar den
			publika sidan, och pilen ut ur rutan loggar ut efter en bekräftelse.
		</p>
	</section>

	<section>
		<h2 class="mb-1 text-lg font-medium">Volontärer</h2>
		<p>
			Lägg till volontärer med namn och en frivillig bild, som visas rund. <em>Ändra bild</em> byter bilden och
			<em>Ta bort bild</em> återgår till standardbilden. Namn måste vara unika. En volontär kan bara tas bort när hen inte
			har några arbetspass, så ta först bort eller flytta passen.
		</p>
	</section>

	<section>
		<h2 class="mb-1 text-lg font-medium">Roller</h2>
		<p>
			En roll är en uppgift under festivalen, till exempel bar eller entré, med en beskrivning som volontärerna ser på sitt
			schema. De flesta roller kan ha hur många personer som helst. <em>Visa schema</em> visar alla pass för rollen dag för
			dag, med luckor (tid då ingen arbetar mellan två pass) och överlapp. En roll kan bara tas bort när inget pass använder
			den.
		</p>
	</section>

	<section>
		<h2 class="mb-1 text-lg font-medium">Ledande roller</h2>
		<p>
			En roll som markeras som <em>Ledande roll</em>, till exempel Säkerhetsansvarig, kan bara innehas av en person åt
			gången och kan leda andra roller: välj den under <em>Leds av</em> på rollen som ska ledas, till exempel
			Trygghetsvärd. En ledande roll kan leda flera roller, en roll kan bara ha en ledare och en ledande roll kan inte själv
			ledas. Så länge en roll leder andra kan den varken tas bort eller göras om till en vanlig roll; ändra först de roller
			den leder och välj <em>Ingen</em> under <em>Leds av</em>.
		</p>
	</section>

	<section>
		<h2 class="mb-1 text-lg font-medium">Arbetspass</h2>
		<p>
			Under <em>Arbetspass</em> bokar du en volontär på en roll med start och slut. <em>Ändra</em> byter volontär, roll eller
			tider och <em>Ta bort</em> tar bort passet. Ett pass kan sluta måndag klockan 00:00, när festivalen slutar. Filtren
			ovanför, för volontär, roll eller bara krockar, gäller både listvyn och kalendervyn.
		</p>
	</section>

	<section>
		<h2 class="mb-1 text-lg font-medium">Krockar</h2>
		<p>
			Pass som inte går att genomföra markeras med <em>Krock</em> och i rött i kalendern: en volontär som är bokad på flera
			pass samtidigt, en ledande roll som två personer har samtidigt, eller två artister på samma scen samtidigt. Det går
			att spara ändå, men ändra passen så att de inte krockar. Krockar syns bara i administrationen, och de räknas alltid på
			hela schemat även när ett filter döljer en del.
		</p>
	</section>

	<section>
		<h2 class="mb-1 text-lg font-medium">Scener</h2>
		<p>
			Under <em>Scener</em> lägger du in scenerna där artisterna spelar. Namn måste vara unika, och en scen med spelningar
			kan inte tas bort förrän spelningarna är borttagna eller flyttade till en annan scen.
		</p>
	</section>

	<section>
		<h2 class="mb-1 text-lg font-medium">Artister</h2>
		<p>
			Artistschemat är skilt från arbetspassen och alla kan se det. Under <em>Artister</em> bokar du en spelning med
			artistens namn, genre, scen, start och slut; en spelning är en händelse i schemat och inte ett eget register över
			artister. Flera artister kan spela samtidigt på olika scener. Filtren på sidan begränsar till en scen, en sökning eller
			bara krockar.
		</p>
	</section>
</div>
