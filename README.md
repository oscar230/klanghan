# KlangHan

Volunteer scheduling for Klanglandet. Visitors pick their name on the public page to see their shifts and who they work with; an admin manages volunteers, roles and shifts under `/admin`.

Built with SvelteKit, Tailwind CSS, Drizzle ORM and SQLite.

## Configuration

| Variable         | Required | Description                                                         |
| ---------------- | -------- | ------------------------------------------------------------------- |
| `DATABASE_URL`   | yes      | Path to the SQLite file, e.g. `data/sqlite.db`.                     |
| `ADMIN_PASSWORD` | yes      | Password for `/admin`. Changing it signs out all existing sessions. |

Uploaded volunteer photos are stored in `data/uploads` next to the database, so persist the whole `data` directory.

## Development

```sh
cp .env.example .env   # or create .env with the variables above
npm ci
npm run dev
npm run check
```

Migrations in `drizzle/` run automatically on startup. After changing `src/lib/server/db/schema.ts`, generate a new one with `npx drizzle-kit generate`.

## Running locally

```sh
npm run dev            # dev server with hot reload
npm run build && npm start   # production build, reads .env
```

Or as a container, which is how the production build is packaged:

```sh
docker build -t klanghan .
docker run --rm -p 3000:3000 -e ADMIN_PASSWORD=choose-a-password -v "$PWD/data:/app/data" klanghan
```

The app listens on port 3000. The image raises `BODY_SIZE_LIMIT` to 8M so phone photos can be uploaded; keep any reverse proxy's upload limit at least that high. Behind a proxy, set `ADDRESS_HEADER` (e.g. `X-Forwarded-For`) so login rate limiting sees the real client address.

## Licenses

* Default profile picture used under license `Sarang, Public domain, via Wikimedia Commons`.
