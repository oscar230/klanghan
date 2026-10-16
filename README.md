# KlangHan

Volunteer scheduling for Klanglandet. Visitors pick their name on the public page to see their shifts and who they work with; an admin manages volunteers, roles and shifts under `/admin`.

SvelteKit + Tailwind. The whole app runs in a single AWS Lambda and keeps all data in S3: one `schedule.json` document plus the uploaded photos. There is no database. Locally the same code stores the same files in a folder.

## Configuration

| Variable         | Required | Description                                                                                                   |
| ---------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| `ADMIN_PASSWORD` | yes      | Password for `/admin`. Also signs session cookies, so changing it signs everyone out.                          |
| `STORAGE`        | no       | `local` (files in `DATA_DIR`) or `s3`. Defaults to `s3` on Lambda and `local` everywhere else.                |
| `DATA_DIR`       | no       | Folder for the local backend. Default `data`.                                                                 |
| `S3_BUCKET`      | s3 only  | Bucket holding `schedule.json` and `uploads/`.                                                                |
| `ORIGIN`         | `npm start` / docker over http | e.g. `http://localhost:3000`. Without it adapter-node assumes https and rejects form posts. Not needed for `npm run dev` or on Lambda. |

Copy `.env.example` to `.env` to get started.

## Run and demo it locally

```sh
cp .env.example .env
npm ci
npm run seed      # fill data/ with fake volunteers, roles, shifts and avatars
npm run dev       # http://localhost:5173  (admin: /admin, password from .env)
npm run unseed    # remove exactly the fake data again; anything you created is kept
```

The demo data includes a double-booked volunteer ("Krock") on the shifts page and an uncovered gap in the Teknik role's Saturday, so the warnings can be shown. `seed` is repeatable: it replaces the previous demo data. Both commands refuse to touch an S3 bucket unless you add `--allow-s3`.

Other ways to run it:

```sh
npm run build && npm start      # the production build, reads .env
npm test                        # storage, concurrency and scheduling-rule tests
npm run check                   # svelte-check

docker build -t klanghan .
docker run --rm -p 3000:3000 -e ADMIN_PASSWORD=choose-a-password -e ORIGIN=http://localhost:3000 -v "$PWD/data:/app/data" klanghan
```

(With a bind mount the host folder must be writable by uid 1000, the image's `node` user.)

## Deploy to AWS

`template.yaml` is an AWS SAM template: a private, versioned S3 bucket and one container-image Lambda with a Function URL. The image uses the [AWS Lambda Web Adapter](https://github.com/awslabs/aws-lambda-web-adapter) to run the unmodified Node server.

```sh
sam build
sam deploy --guided          # asks for AdminPassword; outputs FunctionUrl and BucketName
```

To carry existing data over from a local folder (or from the old SQLite database):

```sh
python3 scripts/import-sqlite.py            # only if you still have data/sqlite.db -> data/schedule.json
S3_BUCKET=<BucketName> npm run push:s3      # copies schedule.json + uploads; refuses to overwrite a bucket that has data
```

Things worth knowing:

* **Concurrent edits.** Every save is a conditional write (`If-Match` on the ETag). If two admins save at the same moment, the loser re-reads and retries instead of overwriting. Bucket versioning keeps 30 days of old `schedule.json` versions, so a bad edit can be rolled back from the S3 console.
* **Photos** are downscaled to 512 px in the browser before upload, which keeps requests well under Lambda's 6 MB payload limit. The server rejects anything over 4 MB or not actually an image.
* **Login throttling** is in memory per Lambda instance, so it slows guessing down but is not a hard lockout. Pick a long password.
* **`ADMIN_PASSWORD` is a plain environment variable** on the function. See the note in `template.yaml` for moving it to SSM Parameter Store.

## Licenses

* Default profile picture used under license `Sarang, Public domain, via Wikimedia Commons`.
