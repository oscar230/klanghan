<script>
	import { Icon, Button, Input, FormGroup, Label } from '@sveltestrap/sveltestrap';
    const roles = [
        "Medarbetare",
        "Arbetsledare",
        "Systemadministratör"
    ]
    let role = roles[0]
    let year = new Date().getFullYear();
    let accessKey = ""
</script>

<div class="container">
    <h1>Välkommen till KlangHan</h1>
    <p>Detta är en hanterare för <a href="https://klanglandet.se/" target="_blank" rel="noopener noreferrer">Klanglandet</a>. Här hanterar vi arbetet under festivalen {year}.</p>
        
    {#if role == roles[0]}
        <p>När du väljer att logga in som {role.toLowerCase()} så använder du den åtkomstnyckel som är angiven i vår Discord-server.</p>
    {:else}
        <p>När du väljer att logga in som {role.toLowerCase()} så får du din åtkomstnyckel ifrån Oscar.</p>
        <img src="/oscar.png" style="display: inline; width: auto; height: 3rem;" alt="oscar är glad">
    {/if}
    
    <FormGroup>
        <Label>Logga in</Label>
        {#each roles as value}
        <Input type="radio" bind:group={role} {value} label={value.charAt(0).toUpperCase() + value.slice(1)} />
        {/each}
        <br>
        <Input type="password" placeholder="Åtkomstnyckel" bind:value={accessKey} style="max-width: 10rem;" />
        <br>
        <Button color="success"><Icon name="door-open-fill" /> Logga in som {role.toLowerCase()}</Button>
    </FormGroup>

</div>