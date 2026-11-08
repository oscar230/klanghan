import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { LocalStore, S3Store } from '../src/lib/server/store';
import { mimeForFileName } from '../src/lib/server/store/mime';

/**
 * Copies the local data folder (schedule.json + uploads) into the S3 bucket.
 * Refuses to overwrite a bucket that already has a schedule.
 */
const dataDir = process.env.DATA_DIR || 'data';
const bucket = process.env.S3_BUCKET;
if (!bucket) {
	console.error('Set S3_BUCKET to the bucket to publish to (the SAM stack outputs it).');
	process.exit(1);
}

const local = new LocalStore(dataDir);
const remote = new S3Store(bucket);

const { schedule } = await local.readSchedule();
const existing = await remote.readSchedule();
if (existing.etag) {
	console.error(`s3://${bucket} already contains a schedule; refusing to overwrite it.`);
	process.exit(1);
}

const uploadDir = path.join(dataDir, 'uploads');
const files = fs.existsSync(uploadDir) ? fs.readdirSync(uploadDir) : [];
for (const file of files) {
	const contentType = mimeForFileName(file);
	if (!contentType) continue;
	await remote.putImage(file, fs.readFileSync(path.join(uploadDir, file)), contentType);
}
await remote.writeSchedule(schedule, null);

console.log(
	`Published ${schedule.users.length} volunteers, ${schedule.roles.length} roles, ` +
		`${schedule.shifts.length} shifts, ${schedule.stages.length} stages, ${schedule.performances.length} performances and ${files.length} images to s3://${bucket}`
);
