<script>
	import { Icon, Button, Input, FormGroup, Label } from '@sveltestrap/sveltestrap';
    const roles = [
        "Medarbetare",
        "Arbetsledare",
        "Systemadministratör"
    ]
    let role = roles[0]
    let year = new Date().getFullYear();
</script>

<div class="container-fluid">
    <h1>Välkommen till KlangHan</h1>
    <p>Detta är en hanterare för <a href="https://klanglandet.se/" target="_blank" rel="noopener noreferrer">Klanglandet</a>. Här hanterar vi arbetet under festivalen {year}.</p>
        
    {#if role == roles[0]}
        <p>När du väljer att logga in som {role.toLowerCase()} så använder du den inloggningskod som är angiven i vår Discord-server.</p>
    {:else}
        <p>När du väljer att logga in som {role.toLowerCase()} så får du din inloggningskod ifrån Oscar.</p>
        <img src="/oscar.png" style="display: inline; width: auto; height: 3rem;" alt="oscar är glad">
    {/if}
    
    <FormGroup>
        <Label>Logga in</Label>
        {#each roles as value}
        <Input type="radio" bind:group={role} {value} label={value.charAt(0).toUpperCase() + value.slice(1)} />
        {/each}
        <br>
        <Button color="success"><Icon name="door-open-fill" /> Logga in som {role.toLowerCase()}</Button>
    </FormGroup>

</div>
