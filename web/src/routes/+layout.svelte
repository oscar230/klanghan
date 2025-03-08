<script>
	export let isMobile = true;
	export const isAdmin = true;
	export const isManager = true;
	import {
		Styles,
		Icon,
		Button,
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
	class=""
	container="fluid"
	color="primary"
	dark={false}
	expand="md"
	fixed=""
	sticky=""
	theme="auto"
>
	<NavbarBrand href="/" class="me-auto">
		<a class="navbar-brand" href="/">
			<img src="/logo.png" width="auto" height="30" alt="Klanglandet logotyp" />
			Klanglandet Hanterare
		</a>
	</NavbarBrand>
	<Dropdown direction="down">
		<DropdownToggle color="secondary" caret><Icon name="gear-fill" /> Meny</DropdownToggle>
		<DropdownMenu>
            <DropdownItem header>Allmänt</DropdownItem>
			<DropdownItem href="/"><Icon name="house-fill" /> Hem</DropdownItem>
			<DropdownItem href="/about"><Icon name="chat-left-text-fill" /> Vad är detta?</DropdownItem>

            {#if isManager}
			<DropdownItem divider />
			<DropdownItem header>Hanterare</DropdownItem>
			<DropdownItem href="/overview"><Icon name="calendar-event-fill" /> Överblick</DropdownItem>
			<DropdownItem href="/schedule"><Icon name="calendar-check-fill" /> Arbetspass</DropdownItem>
			<DropdownItem href="/users"><Icon name="person-fill-gear" /> Användare</DropdownItem>
            {/if}

            {#if isAdmin}
			<DropdownItem divider />
			<DropdownItem header>Administratör</DropdownItem>
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
