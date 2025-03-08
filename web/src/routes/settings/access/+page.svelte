<script>
	import { TabContent, TabPane, Button, ButtonGroup, Icon } from '@sveltestrap/sveltestrap';
    const accessKey0 = "4603b32d939f5f61f75c0bf7ddc65a2e"
    const accessKey1 = "8a26bca45ccd42817602ba6a36339aee"
    const accessKey2 = "48966a8aa7dec30b79e25ebed48e04b3"
</script>

<div class="container">
    <TabContent>
        <TabPane tabId="0" tab="Medarbetare" active>
            <p>Åtkomstnyckeln för medarbetare är: <code>{accessKey0}</code></p>
            <ButtonGroup>
                <Button color="danger"><Icon name="trash-fill" /> Invalidera och skapa ny</Button>
                <Button color="primary"><Icon name="discord" /> Skicka ut i Discord</Button>
            </ButtonGroup>
        </TabPane>
        <TabPane tabId="1" tab="Arbetsledare">
            <p>Åtkomstnyckeln för arbetsledare är: <code>{accessKey1}</code></p>
        </TabPane>
        <TabPane tabId="2" tab="Systemadministratör">
            <p>Åtkomstnyckeln för systemadministratörer är: <code>{accessKey2}</code></p>
        </TabPane>
    </TabContent>
</div>
