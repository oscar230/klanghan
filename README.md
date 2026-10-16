# KlangHan

Volunteer schedule for Klanglandet. Volunteers pick their name on the public page to see their shifts and coworkers; an admin manages volunteers, roles and shifts at `/admin`.

One SvelteKit app, designed to run in a single AWS Lambda with all data in S3 (one `schedule.json` plus photos). No database. Locally the same data lives in the `data/` folder.

## Test

```sh
npm ci
npm test          # storage, concurrency and scheduling-rule tests
npm run check     # type check
```

## Demo locally

```sh
cp .env.example .env     # set ADMIN_PASSWORD
npm run seed             # add fake volunteers, roles and shifts
npm run dev              # http://localhost:5173, admin at /admin
npm run unseed           # remove the fake data again (your own data is kept)
```

The demo data includes a double-booked volunteer and an uncovered gap, so the warnings are visible.

Production build or container (needs `ORIGIN` when served over plain http):

```sh
npm run build && npm start

docker build -t klanghan .
docker run --rm -p 3000:3000 -e ADMIN_PASSWORD=secret -e ORIGIN=http://localhost:3000 -v "$PWD/data:/app/data" klanghan
```

## Deploy to AWS

Needs the AWS CLI, [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) and Docker.

```sh
sam build
sam deploy --guided      # asks for the admin password; prints the site URL and bucket name
```

To publish data you already have locally:

```sh
S3_BUCKET=<bucket from the output> npm run push:s3
```

Not yet deployed or tested on real AWS, so expect to fix small things on the first run.

## Configuration

| Variable         | Description                                                                 |
| ---------------- | --------------------------------------------------------------------------- |
| `ADMIN_PASSWORD` | Required. Admin login; changing it signs everyone out.                      |
| `STORAGE`        | `local` or `s3`. Defaults to `s3` on Lambda, `local` elsewhere.             |
| `DATA_DIR`       | Local data folder. Default `data`.                                          |
| `S3_BUCKET`      | Bucket name when `STORAGE=s3`.                                              |
| `ORIGIN`         | e.g. `http://localhost:3000`. Needed for `npm start`/docker over http only. |

## Licenses

* Default profile picture used under license `Sarang, Public domain, via Wikimedia Commons`.
