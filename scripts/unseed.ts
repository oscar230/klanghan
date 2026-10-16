import { open } from './_run';
import { stripDemo } from './demo-data';

const { store, repo } = open(process.argv.slice(2));

const files = await repo.update((s) => stripDemo(s));
for (const file of files) await store.deleteImage(file);

console.log(`Removed demo data (${files.length} images). Anything you created yourself was left alone.`);
