#!/usr/bin/env python3
"""One-off: convert the old SQLite database into data/schedule.json.

    python3 scripts/import-sqlite.py [data/sqlite.db] [data/schedule.json]

Uploaded photos already live in data/uploads and keep working unchanged.
To publish the result to S3 afterwards, run: npm run push:s3
"""
import json
import sqlite3
import sys
from pathlib import Path

src = Path(sys.argv[1] if len(sys.argv) > 1 else "data/sqlite.db")
dst = Path(sys.argv[2] if len(sys.argv) > 2 else "data/schedule.json")

if not src.exists():
    sys.exit(f"No database at {src}")
if dst.exists():
    sys.exit(f"{dst} already exists; refusing to overwrite it")

db = sqlite3.connect(f"file:{src}?mode=ro", uri=True)
db.row_factory = sqlite3.Row

schedule = {
    "version": 1,
    "users": [
        {"id": r["id"], "name": r["name"], "imageUrl": r["image_url"]}
        for r in db.execute("select * from users")
    ],
    "roles": [
        {"id": r["id"], "name": r["name"], "description": r["description"], "isSupervisor": False, "supervisorRoleId": None}
        for r in db.execute("select * from roles")
    ],
    "shifts": [
        {
            "id": r["id"],
            "userId": r["user_id"],
            "roleId": r["role_id"],
            "startOffset": r["start_offset"],
            "endOffset": r["end_offset"],
        }
        for r in db.execute("select * from shifts")
    ],
    "stages": [],
    "performances": [],
}

dst.write_text(json.dumps(schedule, indent=2, ensure_ascii=False))
print(
    f"Wrote {dst}: {len(schedule['users'])} volunteers, "
    f"{len(schedule['roles'])} roles, {len(schedule['shifts'])} shifts"
)
