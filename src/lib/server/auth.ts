import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';

export const SESSION_COOKIE = 'admin_auth';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 1 week, in seconds

const sign = (payload: string, secret: string) =>
	createHmac('sha256', secret).update(payload).digest('hex');

const safeEqual = (a: string, b: string) => {
	const ab = Buffer.from(a);
	const bb = Buffer.from(b);
	return ab.length === bb.length && timingSafeEqual(ab, bb);
};

/** Constant-time comparison of a submitted password against ADMIN_PASSWORD. */
export function checkPassword(candidate: string): boolean {
	const expected = env.ADMIN_PASSWORD;
	if (!expected) return false;
	// Hash both sides so the comparison length never depends on the secret.
	const h = (s: string) => createHmac('sha256', 'klanghan-password-check').update(s).digest();
	return timingSafeEqual(h(candidate), h(expected));
}

/**
 * Creates a signed, expiring session token. It is keyed on ADMIN_PASSWORD, so
 * changing the password invalidates all existing sessions.
 */
export function createSessionToken(): string {
	const expires = Date.now() + SESSION_MAX_AGE * 1000;
	return `${expires}.${sign(String(expires), env.ADMIN_PASSWORD ?? '')}`;
}

export function verifySessionToken(token: string | undefined): boolean {
	const secret = env.ADMIN_PASSWORD;
	if (!token || !secret) return false;

	const [expires, signature] = token.split('.');
	if (!expires || !signature) return false;
	if (!safeEqual(signature, sign(expires, secret))) return false;

	return Number(expires) > Date.now();
}

// Minimal in-memory throttle against password guessing, per client address.
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string): boolean {
	const entry = attempts.get(key);
	if (!entry) return false;
	if (entry.resetAt <= Date.now()) {
		attempts.delete(key);
		return false;
	}
	return entry.count >= MAX_ATTEMPTS;
}

export function recordFailedAttempt(key: string): void {
	const now = Date.now();
	const entry = attempts.get(key);
	if (!entry || entry.resetAt <= now) {
		attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
	} else {
		entry.count++;
	}
}

export function clearAttempts(key: string): void {
	attempts.delete(key);
}
