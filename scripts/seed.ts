import { open } from './_run';
import { buildDemo, stripDemo } from './demo-data';

const { store, repo } = open(process.argv.slice(2));
const demo = buildDemo();

for (const image of demo.images) await store.putImage(image.fileName, image.data, 'image/png');

await repo.update((s) => {
	stripDemo(s); // re-seeding replaces the previous demo data instead of duplicating it
	s.users.push(...demo.users);
	s.roles.push(...demo.roles);
	s.shifts.push(...demo.shifts);
});

console.log(`Added ${demo.users.length} volunteers, ${demo.roles.length} roles and ${demo.shifts.length} shifts.`);
console.log('Remove them again with: npm run unseed');
