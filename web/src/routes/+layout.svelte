<script>
	export let isMobile = true;
	export const isAdmin = true;
	export const isManager = true;
	import {
		Styles,
		Icon,
		colorMode,
		useColorMode,
		Navbar,
		NavbarBrand,
		Dropdown,
		DropdownToggle,
		DropdownMenu,
		DropdownItem
	} from '@sveltestrap/sveltestrap';
	import { onMount } from 'svelte';

	onMount(() => {
		const checkMobile = () => {
			isMobile = window.matchMedia('(max-width: 768px)').matches;
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	});
</script>

<Styles />
<Navbar
	container="fluid"
	fixed=""
	sticky=""
	theme="auto"
>
	<NavbarBrand href="/" class="me-auto">
		<a class="navbar-brand" href="/">
			<img src="/logo.png" width="auto" height="30" alt="Klanglandets logotyp" />
			KlangHan
		</a>
	</NavbarBrand>
	<Dropdown direction="down">
		<DropdownToggle color="primary" caret><Icon name="gear-fill" /> Meny</DropdownToggle>
		<DropdownMenu>
            <DropdownItem header>Allmänt</DropdownItem>
			<DropdownItem href="/"><Icon name="house-fill" /> Ditt schema</DropdownItem>
			<DropdownItem href="/overview"><Icon name="calendar-event-fill" /> Allas scheman</DropdownItem>
			<DropdownItem href="/about"><Icon name="chat-left-text-fill" /> Vad är detta?</DropdownItem>

            {#if isManager}
			<DropdownItem divider />
			<DropdownItem header>Arbetsledare</DropdownItem>
			<DropdownItem href="/manage/schedules"><Icon name="calendar-check-fill" /> Arbetspass</DropdownItem>
			<DropdownItem href="/manage/roles"><Icon name="hammer" /> Arbetsroller</DropdownItem>
			<DropdownItem href="/manage/users"><Icon name="person-fill-gear" /> Användare</DropdownItem>
            {/if}

            {#if isAdmin}
			<DropdownItem divider />
			<DropdownItem header>Systemadministratör</DropdownItem>
			<DropdownItem href="/settings/discord"><Icon name="discord" /> Discord</DropdownItem>
			<DropdownItem href="/settings/access"><Icon name="key-fill" /> Åtkomst</DropdownItem>
            {/if}

			<DropdownItem divider />
            {#if isAdmin || isManager}
			<DropdownItem header>Din användare</DropdownItem>
            {:else}
			<DropdownItem header>Användare</DropdownItem>
            {/if}
			<DropdownItem><Icon name="door-open-fill" /> Logga ut</DropdownItem>

			<DropdownItem divider />
			<DropdownItem header>Ändra färgschema</DropdownItem>
			<DropdownItem active={$colorMode === 'light'} on:click={() => useColorMode('light')}>
                <Icon name="sun-fill" /> Ljust
            </DropdownItem>
            <DropdownItem active={$colorMode === 'dark'} on:click={() => useColorMode('dark')}>
                <Icon name="moon-stars-fill" /> Mörkt
            </DropdownItem>
            <DropdownItem active={$colorMode === 'auto'} on:click={() => useColorMode('auto')}>
                <Icon name="circle-half" /> Automatiskt
            </DropdownItem>
		</DropdownMenu>
	</Dropdown>
</Navbar>

<slot />
