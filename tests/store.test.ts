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
import { ConflictError, emptySchedule, type Store } from '../src/lib/server/store/types';
import { createStore } from '../src/lib/server/store';
import { createRepository } from '../src/lib/server/repository';
import * as ops from '../src/lib/server/operations';
import { DomainError } from '../src/lib/server/operations';
import { roleTimeline } from '../src/lib/server/views';

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
			first.schedule.roles.push({ id: 'r1', name: 'Entré', description: null });
			const etag1 = await store.writeSchedule(first.schedule, first.etag);

			const reread = await store.readSchedule();
			assert.equal(reread.schedule.roles[0].name, 'Entré');
			assert.equal(reread.etag, etag1);

			// A second writer that still holds the original (null) etag must lose
			await assert.rejects(store.writeSchedule(emptySchedule(), null), ConflictError);
			reread.schedule.roles.push({ id: 'r2', name: 'Teknik', description: null });
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
				Array.from({ length: 8 }, (_, i) => repo.update((s) => ops.addRole(s, `Roll ${i}`, null)))
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
	const role = ops.addRole(s, 'Entré', null);

	assert.throws(() => ops.addUser(s, ' oscar ', null), DomainError); // names are unique, case-insensitively
	assert.throws(() => ops.addRole(s, 'ENTRÉ', null), DomainError);

	const base = { userId: user.id, roleId: role.id };
	assert.throws(() => ops.addShift(s, { ...base, startOffset: 60, endOffset: 60 }), /Sluttid/);
	assert.throws(() => ops.addShift(s, { ...base, startOffset: -5, endOffset: 60 }), /Ogiltig tid/);
	assert.throws(() => ops.addShift(s, { ...base, startOffset: 0, endOffset: 99999 }), /Ogiltig tid/);
	assert.throws(() => ops.addShift(s, { userId: 'ghost', roleId: role.id, startOffset: 0, endOffset: 60 }), /finns inte/);
	const shift = ops.addShift(s, { ...base, startOffset: 0, endOffset: 60 });

	const other = ops.addUser(s, 'Lisa', null);
	const bar = ops.addRole(s, 'Bar', null);
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

test('roleTimeline marks gaps and overlaps', () => {
	const s = emptySchedule();
	const a = ops.addUser(s, 'A', null);
	const b = ops.addUser(s, 'B', null);
	const role = ops.addRole(s, 'Teknik', null);
	ops.addShift(s, { userId: a.id, roleId: role.id, startOffset: 600, endOffset: 720 });
	ops.addShift(s, { userId: b.id, roleId: role.id, startOffset: 700, endOffset: 780 });
	ops.addShift(s, { userId: a.id, roleId: role.id, startOffset: 840, endOffset: 900 });

	const [friday] = roleTimeline(s, role.id);
	assert.deepEqual(
		friday.items.map((i) => (i.type === 'gap' ? 'gap' : i.isOverlap ? 'overlap' : 'shift')),
		['shift', 'overlap', 'gap', 'shift']
	);
});
