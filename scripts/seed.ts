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
	s.stages.push(...demo.stages);
	s.performances.push(...demo.performances);
});

console.log(
	`Added ${demo.users.length} volunteers, ${demo.roles.length} roles, ${demo.shifts.length} shifts, ` +
		`${demo.stages.length} stages and ${demo.performances.length} performances.`
);
console.log('Remove them again with: npm run unseed');
