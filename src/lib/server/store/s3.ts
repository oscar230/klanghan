import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client
} from '@aws-sdk/client-s3';
import {
	ConflictError,
	emptySchedule,
	normalizeSchedule,
	type Schedule,
	type Store,
	type StoredImage
} from './types';
import { mimeForFileName } from './mime';

const SCHEDULE_KEY = 'schedule.json';
const IMAGE_PREFIX = 'uploads/';

const errorInfo = (e: any) => ({
	name: e?.name as string | undefined,
	status: e?.$metadata?.httpStatusCode as number | undefined
});

/**
 * Stores the schedule as one S3 object. Concurrent edits are detected with
 * conditional writes (If-Match on the ETag), so the last writer never silently
 * overwrites someone else's change.
 */
export class S3Store implements Store {
	constructor(
		private readonly bucket: string,
		private readonly client: S3Client = new S3Client({
			// Don't add checksum trailers that S3-compatible endpoints may not understand.
			requestChecksumCalculation: 'WHEN_REQUIRED',
			responseChecksumValidation: 'WHEN_REQUIRED'
		})
	) {}

	async readSchedule(): Promise<{ schedule: Schedule; etag: string | null }> {
		try {
			const res = await this.client.send(
				new GetObjectCommand({ Bucket: this.bucket, Key: SCHEDULE_KEY })
			);
			const text = (await res.Body?.transformToString()) ?? '';
			return { schedule: normalizeSchedule(JSON.parse(text)), etag: res.ETag ?? null };
		} catch (e) {
			const { name, status } = errorInfo(e);
			if (name === 'NoSuchKey' || status === 404) return { schedule: emptySchedule(), etag: null };
			throw e;
		}
	}

	async writeSchedule(schedule: Schedule, etag: string | null): Promise<string> {
		try {
			const res = await this.client.send(
				new PutObjectCommand({
					Bucket: this.bucket,
					Key: SCHEDULE_KEY,
					Body: JSON.stringify(schedule),
					ContentType: 'application/json',
					CacheControl: 'no-store',
					...(etag ? { IfMatch: etag } : { IfNoneMatch: '*' })
				})
			);
			return res.ETag ?? '';
		} catch (e) {
			const { name, status } = errorInfo(e);
			// 412: precondition failed. 409: another conditional write was in flight.
			if (status === 412 || status === 409 || name === 'PreconditionFailed') {
				throw new ConflictError();
			}
			throw e;
		}
	}

	async putImage(fileName: string, data: Uint8Array, contentType: string): Promise<void> {
		await this.client.send(
			new PutObjectCommand({
				Bucket: this.bucket,
				Key: IMAGE_PREFIX + fileName,
				Body: data,
				ContentType: contentType,
				CacheControl: 'public, max-age=31536000, immutable'
			})
		);
	}

	async getImage(fileName: string): Promise<StoredImage | null> {
		const contentType = mimeForFileName(fileName);
		if (!contentType) return null;
		try {
			const res = await this.client.send(
				new GetObjectCommand({ Bucket: this.bucket, Key: IMAGE_PREFIX + fileName })
			);
			const data = await res.Body?.transformToByteArray();
			return data ? { data, contentType } : null;
		} catch (e) {
			const { name, status } = errorInfo(e);
			if (name === 'NoSuchKey' || status === 404) return null;
			throw e;
		}
	}

	async deleteImage(fileName: string): Promise<void> {
		await this.client.send(
			new DeleteObjectCommand({ Bucket: this.bucket, Key: IMAGE_PREFIX + fileName })
		);
	}
}
