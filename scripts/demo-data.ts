import { deflateSync } from 'node:zlib';
import type { Role, Schedule, Shift, User } from '../src/lib/server/store/types';

/** Everything this script creates carries this id/file prefix, so it can be removed again cleanly. */
export const DEMO_PREFIX = 'demo-';
export const isDemo = (id: string) => id.startsWith(DEMO_PREFIX);

const NAMES = [
	'Astrid Lind', 'Bo Karlsson', 'Cecilia Berg', 'David Holm', 'Elin Sjöberg', 'Filip Nyström',
	'Greta Lund', 'Hugo Persson', 'Ida Strand', 'Jonas Åkesson', 'Klara Ek', 'Love Hedlund',
	'Maja Öberg', 'Nils Forsberg'
];

const ROLES: Array<[string, string | null]> = [
	['Entré', 'Välkomnar gäster, scannar biljetter och delar ut armband.'],
	['Bar', 'Serverar och håller baren ren. Legitimera alltid vid osäkerhet.'],
	['Kök', 'Förbereder och serverar mat till funktionärer och artister.'],
	['Teknik', 'Hjälper till med ljud, ljus och scenbyten.'],
	['Städ', null],
	['Info', 'Svarar på frågor och hänvisar rätt.']
];

// [role index, day, start hour, end hour, how many people]
const PLAN: Array<[number, number, number, number, number]> = [];
for (const day of [0, 1, 2]) {
	for (let h = 10; h < 22; h += 4) {
		PLAN.push([0, day, h, h + 4, 2]); // Entré, round the clock of the opening hours
		PLAN.push([1, day, h + 4 > 22 ? 18 : h + 4, Math.min(h + 8, 24), 2]); // Bar, later in the day
		PLAN.push([5, day, h, h + 4, 1]);
	}
	PLAN.push([2, day, 8, 14, 2], [2, day, 16, 20, 2]);
	PLAN.push([4, day, 6, 9, 2]);
	// Teknik: deliberately leave Saturday 14-16 uncovered so the "lucka" warning shows up
	PLAN.push([3, day, 10, 14, 1]);
	if (day !== 1) PLAN.push([3, day, 14, 18, 1]);
	PLAN.push([3, day, 18, 23, 2]);
}

/** A small round avatar so the demo shows photos. Hand-rolled PNG, no dependencies. */
export function avatarPng(hue: number, size = 96): Buffer {
	const hslToRgb = (h: number, s: number, l: number) => {
		const a = s * Math.min(l, 1 - l);
		const f = (n: number) => l - a * Math.max(-1, Math.min((n + h / 30) % 12 - 3, 9 - ((n + h / 30) % 12), 1));
		return [f(0), f(8), f(4)].map((v) => Math.round(v * 255));
	};
	const [r, g, b] = hslToRgb(hue, 0.45, 0.5);
	const raw = Buffer.alloc((size * 4 + 1) * size);
	const c = size / 2;
	for (let y = 0; y < size; y++) {
		raw[y * (size * 4 + 1)] = 0; // filter: none
		for (let x = 0; x < size; x++) {
			const o = y * (size * 4 + 1) + 1 + x * 4;
			const d = Math.hypot(x + 0.5 - c, y + 0.5 - c);
			// A simple "head and shoulders" silhouette inside a disc
			const head = Math.hypot(x + 0.5 - c, y + 0.5 - c * 0.8) < size * 0.18;
			const body = Math.hypot(x + 0.5 - c, y + 0.5 - c * 1.6) < size * 0.32;
			const shade = head || body ? 235 : 0;
			raw[o] = shade || r;
			raw[o + 1] = shade || g;
			raw[o + 2] = shade || b;
			raw[o + 3] = d <= c ? 255 : 0;
		}
	}
	const crcTable = Array.from({ length: 256 }, (_, n) => {
		let k = n;
		for (let i = 0; i < 8; i++) k = k & 1 ? 0xedb88320 ^ (k >>> 1) : k >>> 1;
		return k >>> 0;
	});
	const crc = (buf: Buffer) => {
		let k = 0xffffffff;
		for (const byte of buf) k = crcTable[(k ^ byte) & 0xff] ^ (k >>> 8);
		return (k ^ 0xffffffff) >>> 0;
	};
	const chunk = (type: string, data: Buffer) => {
		const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
		const out = Buffer.alloc(body.length + 8);
		out.writeUInt32BE(data.length, 0);
		body.copy(out, 4);
		out.writeUInt32BE(crc(body), body.length + 4);
		return out;
	};
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(size, 0);
	ihdr.writeUInt32BE(size, 4);
	ihdr.set([8, 6, 0, 0, 0], 8); // 8-bit RGBA
	return Buffer.concat([
		Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
		chunk('IHDR', ihdr),
		chunk('IDAT', deflateSync(raw)),
		chunk('IEND', Buffer.alloc(0))
	]);
}

export function buildDemo() {
	const users: User[] = NAMES.map((name, i) => ({
		id: `${DEMO_PREFIX}user-${i + 1}`,
		name,
		// Leave a few without a photo so the default avatar is shown too
		imageUrl: i % 4 === 3 ? null : `/uploads/${DEMO_PREFIX}${i + 1}.png`
	}));
	const roles: Role[] = ROLES.map(([name, description], i) => ({
		id: `${DEMO_PREFIX}role-${i + 1}`,
		name,
		description
	}));

	const shifts: Shift[] = [];
	const cursor = new Map<number, number>(); // round-robin per role
	for (const [roleIdx, day, from, to, people] of PLAN) {
		for (let p = 0; p < people; p++) {
			const n = cursor.get(roleIdx) ?? roleIdx * 2;
			cursor.set(roleIdx, n + 1);
			shifts.push({
				id: `${DEMO_PREFIX}shift-${shifts.length + 1}`,
				userId: users[n % users.length].id,
				roleId: roles[roleIdx].id,
				startOffset: day * 1440 + from * 60,
				endOffset: day * 1440 + to * 60
			});
		}
	}

	// One deliberate double-booking so the "Krock" warning is visible in the admin view
	shifts.push({
		id: `${DEMO_PREFIX}shift-${shifts.length + 1}`,
		userId: shifts[0].userId,
		roleId: roles[4].id,
		startOffset: shifts[0].startOffset + 60,
		endOffset: shifts[0].startOffset + 180
	});

	const images = users
		.filter((u) => u.imageUrl)
		.map((u) => ({
			fileName: u.imageUrl!.slice('/uploads/'.length),
			data: avatarPng((Number(u.id.split('-').pop()) * 47) % 360)
		}));

	return { users, roles, shifts, images };
}

/** Removes demo records from a schedule. Returns the image files that belonged to them. */
export function stripDemo(s: Schedule): string[] {
	const files = s.users
		.filter((u) => isDemo(u.id) && u.imageUrl?.startsWith('/uploads/'))
		.map((u) => u.imageUrl!.slice('/uploads/'.length));
	s.users = s.users.filter((u) => !isDemo(u.id));
	s.roles = s.roles.filter((r) => !isDemo(r.id));
	s.shifts = s.shifts.filter((sh) => !isDemo(sh.id) && !isDemo(sh.userId) && !isDemo(sh.roleId));
	return files;
}
