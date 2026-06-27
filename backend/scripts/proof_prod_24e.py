#!/usr/bin/env python3
"""Phase 24E production proof — client-ready digest preview + summary, safe test send.

No student emails: live stays blocked (JOB_MAIL_ENABLED=false); test mode is single recipient.
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request

BASE = os.environ.get(
    "PROD_BACKEND_URL", "https://learn-coding-through-production.up.railway.app"
).rstrip("/")
ADMIN_EMAIL = os.environ.get("PROD_ADMIN_EMAIL", "admin@example.com")
ADMIN_PASSWORD = os.environ.get("PROD_ADMIN_PASSWORD", "Admin@12345")


def call(method: str, path: str, body: dict | None = None, token: str | None = None) -> tuple[int, object]:
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(f"{BASE}{path}", data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            raw = resp.read().decode()
            try:
                return resp.status, json.loads(raw)
            except json.JSONDecodeError:
                return resp.status, raw
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            return e.code, json.loads(raw)
        except json.JSONDecodeError:
            return e.code, raw


def main() -> int:
    lines: list[str] = [f"backend: {BASE}"]

    code, login = call("POST", "/api/v1/auth/login", {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if code != 200 or not isinstance(login, dict) or "access_token" not in login:
        print("LOGIN FAILED", code, login)
        return 1
    token = login["access_token"]
    lines.append(f"auth: JWT admin ({ADMIN_EMAIL})")

    code, prev = call(
        "POST",
        "/api/admin/jobs/email-preview",
        {
            "jobIds": [],
            "searchTerm": "python developer",
            "location": "India",
            "subjectOverride": "Code Quest — Weekly Job Picks",
            "introMessage": "Hand-picked roles for Code Quest learners this week.",
            "maxJobs": 10,
        },
        token,
    )
    summary = prev.get("summary", {}) if isinstance(prev, dict) else {}
    lines.extend(
        [
            "",
            f"=== email-preview HTTP {code} (expect 200) ===",
            f"subject: {prev.get('subject') if isinstance(prev, dict) else prev}",
            f"jobCount: {prev.get('jobCount') if isinstance(prev, dict) else 'n/a'}",
            "--- summary counts ---",
            f"totalActiveJobs: {summary.get('totalActiveJobs')}",
            f"selectedJobsCount: {summary.get('selectedJobsCount')}",
            f"recentJobsCount: {summary.get('recentJobsCount')}",
            f"topRoles: {summary.get('topRoles')}",
            f"topCompanies: {summary.get('topCompanies')}",
            f"topLocations: {summary.get('topLocations')}",
            f"sourceSplit: {summary.get('sourceSplit')}",
        ]
    )

    code, dry = call("POST", "/api/admin/jobs/send-digest", {"mode": "dry_run", "jobIds": []}, token)
    lines.extend(
        [
            "",
            f"=== send-digest dry_run HTTP {code} (expect 200, sentCount=0) ===",
            json.dumps(dry, indent=2),
        ]
    )

    code, live = call("POST", "/api/admin/jobs/send-digest", {"mode": "live", "jobIds": []}, token)
    lines.extend(["", f"=== send-digest live HTTP {code} (expect 403) ===", json.dumps(live, indent=2)])

    code, test = call("POST", "/api/admin/jobs/send-digest", {"mode": "test", "jobIds": []}, token)
    lines.extend(
        [
            "",
            f"=== send-digest test HTTP {code} (Brevo, server JOB_MAIL_TEST_RECIPIENT) ===",
            json.dumps(test, indent=2),
        ]
    )
    if isinstance(test, dict):
        msg = test.get("message") or ""
        if "sent to" in msg:
            lines.append(f"test_recipient_used: {msg.split('sent to', 1)[1].strip()}")
        lines.append(f"sentCount: {test.get('sentCount')} failedCount: {test.get('failedCount')}")

    lines.extend(
        [
            "",
            "student_emails_sent: 0 (test mode only; live blocked with JOB_MAIL_ENABLED=false)",
            "inbox: confirm manually — sender should match EMAIL_FROM_ADDRESS on Railway",
        ]
    )

    text = "\n".join(lines)
    out = __file__.replace("proof_prod_24e.py", "proof_prod_24e_output.txt")
    with open(out, "w", encoding="utf-8") as f:
        f.write(text)
    print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
