# KlangHan

Volunteer scheduling for the Klanglandet festival (Friday–Sunday). Volunteers pick their name on the public page (`/`) to see their shifts and coworkers; one admin manages volunteers, roles and shifts under `/admin`. The UI is in Swedish, so keep user-facing strings Swedish.

Stack: SvelteKit 2 + Svelte 5 (runes) + Tailwind 4, `adapter-node`, PWA via `@vite-pwa/sveltekit`. Node 20 locally (`.npmrc` has `engine-strict`), Node 22 in the Docker image.

## Architecture

The whole app (public page and admin) runs in one AWS Lambda and stores everything in S3. There is no database.

- **Data** is a single JSON document, `schedule.json` (`{ version, users, roles, shifts }`), plus image files under `uploads/`. Types are in `src/lib/server/store/types.ts`.
- **`Store` interface** (`src/lib/server/store/`): `LocalStore` (folder under `DATA_DIR`) and `S3Store`, chosen by `createStore(env)` from `STORAGE` (`local` | `s3`; defaults to `s3` on Lambda, `local` elsewhere). Writes are conditional on the ETag and throw `ConflictError` on a stale write.
- **`repository.ts`**: `get()` and `update(mutate)`. `update` re-reads, applies a synchronous mutation, writes conditionally and retries on conflict with jittered backoff. If `mutate` throws, nothing is written.
- **`operations.ts`**: pure functions that mutate a `Schedule` and enforce the rules (unique names, no deleting users/roles that have shifts, offset validation). They throw `DomainError`.
- **`views.ts`**: pure read models (joined shifts, counts, per-role timeline with gaps/overlaps).
- **`data.ts`**: the only place that touches SvelteKit's `$env`; it lazily builds the app's repository via `getRepo()`. Everything under `store/`, `repository.ts`, `operations.ts` and `views.ts` must stay free of `$env`/`$app` imports because `scripts/` and `tests/` import them outside SvelteKit.
- **Routes** are thin: parse the form, call `getRepo().update(s => operation(s, ...))`, return `failFrom(e)` on error (`actions.ts` maps `DomainError`/`UploadError` to form failures). To add a mutation: add an operation, add a test, call it from an action.
- **Uploads** (`uploads.ts`): images are identified by magic bytes (PNG/JPEG/GIF/WebP; never SVG), capped at 4 MB, stored with a generated name and served from `/uploads/<file>` by `src/routes/uploads/[...file]/+server.ts`. The volunteers page downscales photos to 512 px in the browser first (`src/lib/resizeImage.ts`), which is what keeps requests under Lambda's payload limit.
- **Auth** (`src/lib/server/auth.ts`, `src/hooks.server.ts`): one shared admin password (`ADMIN_PASSWORD`). Login sets an HMAC-signed, expiring session cookie keyed on the password. `handle` guards everything under `/admin` (pages, `__data.json` and form actions; layout loads do not run for actions). Login attempts are rate limited in memory per client address.
- **Time model** (`src/lib/time.ts`): a shift is `startOffset`/`endOffset` in minutes from Friday 00:00; `DAYS` is the festival length.

## Commands

```sh
npm run dev        # dev server (reads .env)
npm run check      # svelte-check; keep at 0 errors and 0 warnings
npm test           # node:test via tsx, tests/*.test.ts
npm run build && npm start     # production build; needs ORIGIN=http://localhost:3000 for form posts over http
npm run seed       # fake demo data into the configured storage (ids/files prefixed "demo-")
npm run unseed     # removes only the demo data
npm run push:s3    # copy local data/ to S3_BUCKET (refuses to overwrite existing data)
```

`seed`, `unseed` and `push:s3` run through `tsx` with `dotenv`; `seed`/`unseed` refuse to touch S3 without `--allow-s3`. `scripts/import-sqlite.py` converts a legacy SQLite file into `schedule.json`.

Config is in `.env` (see `.env.example`): `ADMIN_PASSWORD`, `STORAGE`, `DATA_DIR`, `S3_BUCKET`, `ORIGIN`. `data/` is git-ignored local state.

## Tests

`tests/store.test.ts` runs one shared contract against both backends (the S3 one against an in-memory fake S3 that honours `If-Match`/`If-None-Match`), plus concurrency, operations and timeline tests. The fake is not real S3. Vitest is deliberately not used (its audit findings); stay with `node:test`.

## Deployment

`template.yaml` (AWS SAM): private versioned S3 bucket, one container-image Lambda with a Function URL. `Dockerfile` runs the Node build behind the AWS Lambda Web Adapter and also works with plain `docker run`. The Lambda environment sets `ADDRESS_HEADER=x-forwarded-for` so the login rate limit sees real client IPs, and the Dockerfile sets `PROTOCOL_HEADER` so SvelteKit's CSRF check sees `https`. Lambda needs `s3:ListBucket` as well as object permissions, otherwise a missing key returns 403 instead of 404.

The Lambda deployment has never been built or deployed from this repo: the Dockerfile, template and adapter version are unverified against real AWS. `.github/workflows/docker-image.yml` builds an image to ghcr; Lambda cannot pull from ghcr, so it is not part of the Lambda deploy path.

## Style

Tabs in most files, 4 spaces in the larger admin `.svelte` files; match the file you are editing. Icons are inline SVG. Tailwind theme colours (`bg-card`, `text-primary`, ...) are defined in `src/app.css`. The admin layout uses the full desktop width; the public page is designed phone-first.
