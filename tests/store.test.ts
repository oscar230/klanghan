import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { createHash } from 'node:crypto';
import { S3Client } from '@aws-sdk/client-s3';
import { LocalStore } from '../src/lib/server/store/local';
import { S3Store } from '../src/lib/server/store/s3';
import { ConflictError, emptySchedule, normalizeSchedule, type Store } from '../src/lib/server/store/types';
import { createStore } from '../src/lib/server/store';
import { createRepository } from '../src/lib/server/repository';
import * as ops from '../src/lib/server/operations';
import { DomainError } from '../src/lib/server/operations';
import { roleTimeline } from '../src/lib/server/views';

const plainRole = (name: string) => ({ name, description: null, isSupervisor: false, supervisorRoleId: null });

/** A tiny in-memory S3 that implements just enough for S3Store, including conditional writes. */
function fakeS3() {
	const objects = new Map<string, { body: Buffer; etag: string; type: string }>();
	const server = http.createServer((req, res) => {
		const chunks: Buffer[] = [];
		req.on('data', (c) => chunks.push(c));
		req.on('end', () => {
			const key = decodeURIComponent(req.url!.split('?')[0]).replace(/^\/[^/]+\//, '');
			const current = objects.get(key);
			const xml = (code: string, status: number) => {
				res.writeHead(status, { 'content-type': 'application/xml' });
				res.end(`<?xml version="1.0"?><Error><Code>${code}</Code><Message>${code}</Message></Error>`);
			};

			if (req.method === 'PUT') {
				const ifMatch = req.headers['if-match'];
				const ifNoneMatch = req.headers['if-none-match'];
				if ((ifMatch && ifMatch !== current?.etag) || (ifNoneMatch === '*' && current)) {
					return xml('PreconditionFailed', 412);
				}
				const body = Buffer.concat(chunks);
				const etag = `"${createHash('md5').update(body).digest('hex')}"`;
				objects.set(key, { body, etag, type: String(req.headers['content-type']) });
				res.writeHead(200, { ETag: etag });
				return res.end();
			}
			if (req.method === 'GET') {
				if (!current) return xml('NoSuchKey', 404);
				res.writeHead(200, { ETag: current.etag, 'content-type': current.type });
				return res.end(current.body);
			}
			if (req.method === 'DELETE') {
				objects.delete(key);
				res.writeHead(204);
				return res.end();
			}
			res.writeHead(405);
			res.end();
		});
	});
	return { server, objects };
}

async function withS3(run: (store: S3Store, objects: Map<string, unknown>) => Promise<void>) {
	const { server, objects } = fakeS3();
	await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
	const { port } = server.address() as { port: number };
	const client = new S3Client({
		region: 'eu-north-1',
		endpoint: `http://127.0.0.1:${port}`,
		forcePathStyle: true,
		credentials: { accessKeyId: 'x', secretAccessKey: 'x' },
		requestChecksumCalculation: 'WHEN_REQUIRED',
		responseChecksumValidation: 'WHEN_REQUIRED'
	});
	try {
		await run(new S3Store('bucket', client), objects);
	} finally {
		client.destroy();
		server.close();
	}
}

const tmpStore = () => new LocalStore(fs.mkdtempSync(path.join(os.tmpdir(), 'klanghan-')));

/** Behaviour every backend must share. */
function contract(name: string, withStore: (run: (s: Store) => Promise<void>) => Promise<void>) {
	test(`${name}: reads an empty schedule before anything is stored`, () =>
		withStore(async (store) => {
			const { schedule, etag } = await store.readSchedule();
			assert.equal(etag, null);
			assert.deepEqual(schedule, emptySchedule());
		}));

	test(`${name}: round-trips and rejects stale writes`, () =>
		withStore(async (store) => {
			const first = await store.readSchedule();
			first.schedule.roles.push({ id: 'r1', name: 'Entré', description: null, isSupervisor: false, supervisorRoleId: null });
			const etag1 = await store.writeSchedule(first.schedule, first.etag);

			const reread = await store.readSchedule();
			assert.equal(reread.schedule.roles[0].name, 'Entré');
			assert.equal(reread.etag, etag1);

			// A second writer that still holds the original (null) etag must lose
			await assert.rejects(store.writeSchedule(emptySchedule(), null), ConflictError);
			reread.schedule.roles.push({ id: 'r2', name: 'Teknik', description: null, isSupervisor: false, supervisorRoleId: null });
			await store.writeSchedule(reread.schedule, etag1);
			await assert.rejects(store.writeSchedule(reread.schedule, etag1), ConflictError);
		}));

	test(`${name}: stores, serves and deletes images`, () =>
		withStore(async (store) => {
			assert.equal(await store.getImage('a.png'), null);
			await store.putImage('a.png', Buffer.from([1, 2, 3]), 'image/png');
			const img = await store.getImage('a.png');
			assert.deepEqual([...img!.data], [1, 2, 3]);
			assert.equal(img!.contentType, 'image/png');
			await store.deleteImage('a.png');
			assert.equal(await store.getImage('a.png'), null);
			assert.equal(await store.getImage('script.svg'), null);
		}));

	test(`${name}: concurrent repository updates are not lost`, () =>
		withStore(async (store) => {
			const repo = createRepository(store);
			await Promise.all(
				Array.from({ length: 8 }, (_, i) => repo.update((s) => ops.addRole(s, plainRole(`Roll ${i}`))))
			);
			assert.equal((await repo.get()).roles.length, 8);
		}));
}

contract('local', async (run) => run(tmpStore()));
contract('s3', async (run) => withS3((store) => run(store)));

test('s3: conflicts surface as ConflictError even with the first write racing', () =>
	withS3(async (store) => {
		const results = await Promise.allSettled([
			store.writeSchedule(emptySchedule(), null),
			store.writeSchedule(emptySchedule(), null)
		]);
		assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
	}));

test('createStore picks a backend from the environment', () => {
	assert.ok(createStore({ STORAGE: 'local', DATA_DIR: fs.mkdtempSync(path.join(os.tmpdir(), 'k-')) }) instanceof LocalStore);
	assert.ok(createStore({ STORAGE: 's3', S3_BUCKET: 'b' }) instanceof S3Store);
	assert.ok(createStore({ AWS_LAMBDA_FUNCTION_NAME: 'f', S3_BUCKET: 'b' }) instanceof S3Store);
	assert.throws(() => createStore({ STORAGE: 's3' }), /S3_BUCKET/);
	assert.throws(() => createStore({ STORAGE: 'local', AWS_LAMBDA_FUNCTION_NAME: 'f' }), /Lambda/);
	assert.throws(() => createStore({ STORAGE: 'nope' }), /Unknown STORAGE/);
});

test('operations enforce the scheduling rules', () => {
	const s = emptySchedule();
	const user = ops.addUser(s, 'Oscar', null);
	const role = ops.addRole(s, plainRole('Entré'));

	assert.throws(() => ops.addUser(s, ' oscar ', null), DomainError); // names are unique, case-insensitively
	assert.throws(() => ops.addRole(s, plainRole('ENTRÉ')), DomainError);

	const base = { userId: user.id, roleId: role.id };
	assert.throws(() => ops.addShift(s, { ...base, startOffset: 60, endOffset: 60 }), /Sluttid/);
	assert.throws(() => ops.addShift(s, { ...base, startOffset: -5, endOffset: 60 }), /Ogiltig tid/);
	assert.throws(() => ops.addShift(s, { ...base, startOffset: 0, endOffset: 99999 }), /Ogiltig tid/);
	assert.throws(() => ops.addShift(s, { userId: 'ghost', roleId: role.id, startOffset: 0, endOffset: 60 }), /finns inte/);
	const shift = ops.addShift(s, { ...base, startOffset: 0, endOffset: 60 });

	const other = ops.addUser(s, 'Lisa', null);
	const bar = ops.addRole(s, plainRole('Bar'));
	ops.updateShift(s, shift.id, { userId: other.id, roleId: bar.id, startOffset: 30, endOffset: 90 });
	assert.deepEqual(s.shifts, [{ id: shift.id, userId: other.id, roleId: bar.id, startOffset: 30, endOffset: 90 }]);
	assert.throws(() => ops.updateShift(s, shift.id, { userId: other.id, roleId: bar.id, startOffset: 90, endOffset: 30 }), /Sluttid/);
	assert.throws(() => ops.updateShift(s, 'ghost', { userId: other.id, roleId: bar.id, startOffset: 0, endOffset: 30 }), /hittades inte/);
	assert.equal(s.shifts[0].startOffset, 30); // a rejected update changes nothing
	ops.updateShift(s, shift.id, { userId: user.id, roleId: role.id, startOffset: 0, endOffset: 60 });
	ops.deleteRole(s, bar.id);
	ops.deleteUser(s, other.id);

	assert.throws(() => ops.deleteUser(s, user.id), /inbokade/);
	assert.throws(() => ops.deleteRole(s, role.id), /inbokade/);
	ops.deleteShift(s, shift.id);
	ops.deleteRole(s, role.id);
	ops.deleteUser(s, user.id);
	assert.equal(s.users.length + s.roles.length + s.shifts.length, 0);
});

test('supervisor roles: only they can lead, one leader per role, and a leader cannot be led', () => {
	const s = emptySchedule();
	const input = (name: string, extra: Partial<ops.RoleInput> = {}) => ({
		name,
		description: null,
		isSupervisor: false,
		supervisorRoleId: null,
		...extra
	});
	const chief = ops.addRole(s, input('Säkerhetsansvarig', { isSupervisor: true }));
	const other = ops.addRole(s, input('Barchef', { isSupervisor: true }));
	const guard = ops.addRole(s, input('Trygghetsvärd', { supervisorRoleId: chief.id }));
	const host = ops.addRole(s, input('Värd', { supervisorRoleId: chief.id })); // one supervisor can lead many roles
	assert.equal(guard.supervisorRoleId, chief.id);
	assert.equal(host.supervisorRoleId, chief.id);

	// The leader must exist and be a supervisor role
	assert.throws(() => ops.addRole(s, input('Spöke', { supervisorRoleId: 'ghost' })), /finns inte/);
	assert.throws(() => ops.addRole(s, input('Gäst', { supervisorRoleId: guard.id })), /ledande roll/);
	assert.throws(() => ops.updateRole(s, host.id, input('Värd', { supervisorRoleId: host.id })), /egen/);
	// A supervisor role cannot be led, neither when created nor when changed
	assert.throws(() => ops.addRole(s, input('Chef2', { isSupervisor: true, supervisorRoleId: chief.id })), /kan inte ledas/);
	assert.throws(() => ops.updateRole(s, other.id, input('Barchef', { isSupervisor: true, supervisorRoleId: chief.id })), /kan inte ledas/);
	assert.throws(() => ops.updateRole(s, guard.id, input('Trygghetsvärd', { isSupervisor: true, supervisorRoleId: chief.id })), /kan inte ledas/);
	// ...and a role that leads others stays a supervisor role until the links are gone
	assert.throws(() => ops.updateRole(s, chief.id, input('Säkerhetsansvarig', { isSupervisor: false })), /Ta bort kopplingarna/);
	assert.equal(chief.isSupervisor, true); // rejected changes leave the role as it was

	// A role has one leader; moving it to another supervisor replaces the old one
	ops.updateRole(s, host.id, input('Värd', { supervisorRoleId: other.id }));
	assert.equal(host.supervisorRoleId, other.id);

	// The leader cannot be deleted until the link is broken
	assert.throws(() => ops.deleteRole(s, chief.id), /leder andra/);
	ops.updateRole(s, guard.id, input('Trygghetsvärd'));
	ops.deleteRole(s, chief.id);
	assert.deepEqual(s.roles.map((r) => r.name).sort(), ['Barchef', 'Trygghetsvärd', 'Värd']);
});

test('roles saved by older versions are normalised to satisfy the supervisor rules', () => {
	// Before the flag existed: "a" was led by "b", which is therefore a supervisor role. "b" was led by "c" (not allowed now)
	const s = normalizeSchedule({
		roles: [
			{ id: 'a', name: 'A', description: null, supervisorRoleId: 'b' },
			{ id: 'b', name: 'B', description: null, supervisorRoleId: 'c' },
			{ id: 'c', name: 'C', description: null },
			{ id: 'd', name: 'D', description: null, supervisorRoleId: 'gone' }
		]
	});
	const byId = Object.fromEntries(s.roles.map((r) => [r.id, r]));
	assert.deepEqual([byId.a.isSupervisor, byId.a.supervisorRoleId], [false, 'b']);
	assert.deepEqual([byId.b.isSupervisor, byId.b.supervisorRoleId], [true, null]);
	assert.deepEqual([byId.c.isSupervisor, byId.c.supervisorRoleId], [true, null]);
	assert.deepEqual([byId.d.isSupervisor, byId.d.supervisorRoleId], [false, null]);
});

test('stages and performances: rules and stage deletion', () => {
	const s = emptySchedule();
	const main = ops.addStage(s, 'Stora scenen');
	assert.throws(() => ops.addStage(s, ' stora SCENEN '), DomainError); // unique, case-insensitively
	const forest = ops.addStage(s, 'Skogsscenen');
	ops.updateStage(s, forest.id, 'Lilla scenen');
	assert.throws(() => ops.updateStage(s, forest.id, 'Stora scenen'), /finns redan/);
	assert.throws(() => ops.updateStage(s, 'ghost', 'X'), /hittades inte/);

	const act = { stageId: main.id, artist: 'Vera Solhem', genre: 'Folk', startOffset: 1200, endOffset: 1260 };
	assert.throws(() => ops.addPerformance(s, { ...act, stageId: 'ghost' }), /Scenen finns inte/);
	assert.throws(() => ops.addPerformance(s, { ...act, artist: '  ' }), /namn/);
	assert.throws(() => ops.addPerformance(s, { ...act, genre: '' }), /Genre/);
	assert.throws(() => ops.addPerformance(s, { ...act, endOffset: 1200 }), /Sluttid/);
	assert.throws(() => ops.addPerformance(s, { ...act, endOffset: 99999 }), /Ogiltig tid/);

	// Several artists may play at once, on the same or on different stages (overlaps are only flagged, see conflicts)
	const a = ops.addPerformance(s, act);
	ops.addPerformance(s, { ...act, stageId: forest.id, artist: 'Lerbäcken' });
	assert.equal(s.performances.length, 2);

	ops.updatePerformance(s, a.id, { ...act, artist: 'Vera', startOffset: 1230 });
	assert.deepEqual([s.performances[0].artist, s.performances[0].startOffset], ['Vera', 1230]);
	assert.throws(() => ops.updatePerformance(s, a.id, { ...act, endOffset: 5 }), /Sluttid/);
	assert.equal(s.performances[0].artist, 'Vera'); // a rejected update changes nothing
	assert.throws(() => ops.updatePerformance(s, 'ghost', act), /hittades inte/);

	assert.throws(() => ops.deleteStage(s, main.id), /inbokade artister/);
	ops.deletePerformance(s, a.id);
	ops.deleteStage(s, main.id);
	assert.deepEqual(s.stages.map((st) => st.name), ['Lilla scenen']);
});

test('older documents load with empty stages and performances', () => {
	const s = normalizeSchedule({ users: [], roles: [], shifts: [] });
	assert.deepEqual([s.stages, s.performances], [[], []]);
});

test('roleTimeline marks gaps and overlaps', () => {
	const s = emptySchedule();
	const a = ops.addUser(s, 'A', null);
	const b = ops.addUser(s, 'B', null);
	const role = ops.addRole(s, plainRole('Teknik'));
	ops.addShift(s, { userId: a.id, roleId: role.id, startOffset: 600, endOffset: 720 });
	ops.addShift(s, { userId: b.id, roleId: role.id, startOffset: 700, endOffset: 780 });
	ops.addShift(s, { userId: a.id, roleId: role.id, startOffset: 840, endOffset: 900 });

	const [friday] = roleTimeline(s, role.id);
	assert.deepEqual(
		friday.items.map((i) => (i.type === 'gap' ? 'gap' : i.isOverlap ? 'overlap' : 'shift')),
		['shift', 'overlap', 'gap', 'shift']
	);
});
