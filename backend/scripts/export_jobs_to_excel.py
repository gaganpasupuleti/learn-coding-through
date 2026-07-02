#!/usr/bin/env python3
"""Fetch active jobs from the Code Quest jobs API and export to Excel."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from openpyxl import Workbook
from openpyxl.styles import Font
from openpyxl.utils import get_column_letter


def fetch_jobs(base_url: str, limit: int = 100) -> list[dict]:
    params = urlencode({"limit": limit, "page": 1})
    url = f"{base_url.rstrip('/')}/api/jobs?{params}"
    req = Request(url, headers={"Accept": "application/json"})
    try:
        with urlopen(req, timeout=60) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except (HTTPError, URLError) as exc:
        raise SystemExit(f"Failed to fetch jobs from {url}: {exc}") from exc

    jobs = payload.get("jobs") or []
    if len(jobs) < limit:
        print(
            f"Warning: requested {limit} jobs but API returned {len(jobs)} (total={payload.get('total', 0)})",
            file=sys.stderr,
        )
    return jobs


def export_to_excel(jobs: list[dict], output_path: Path) -> None:
    headers = [
        "S.No",
        "Title",
        "Company",
        "Location",
        "Source",
        "Job Type",
        "Date Posted",
        "Salary Min",
        "Salary Max",
        "Currency",
        "Job Link",
        "Apply Link",
        "Link Status",
    ]

    wb = Workbook()
    ws = wb.active
    ws.title = "Jobs"

    header_font = Font(bold=True)
    for col, header in enumerate(headers, start=1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.font = header_font

    for idx, job in enumerate(jobs, start=1):
        row = idx + 1
        job_url = job.get("jobUrl") or ""
        apply_url = job.get("applyUrl") or job_url
        ws.cell(row=row, column=1, value=idx)
        ws.cell(row=row, column=2, value=job.get("title") or "")
        ws.cell(row=row, column=3, value=job.get("company") or "")
        ws.cell(row=row, column=4, value=job.get("location") or "")
        ws.cell(row=row, column=5, value=job.get("source") or "")
        ws.cell(row=row, column=6, value=job.get("jobType") or "")
        ws.cell(row=row, column=7, value=job.get("datePosted") or "")
        ws.cell(row=row, column=8, value=job.get("salaryMin"))
        ws.cell(row=row, column=9, value=job.get("salaryMax"))
        ws.cell(row=row, column=10, value=job.get("currency") or "")
        link_cell = ws.cell(row=row, column=11, value=job_url)
        if job_url:
            link_cell.hyperlink = job_url
            link_cell.font = Font(color="0563C1", underline="single")
        apply_cell = ws.cell(row=row, column=12, value=apply_url)
        if apply_url:
            apply_cell.hyperlink = apply_url
            apply_cell.font = Font(color="0563C1", underline="single")
        ws.cell(row=row, column=13, value=job.get("linkStatus") or "active")

    for col in range(1, len(headers) + 1):
        letter = get_column_letter(col)
        max_len = max(
            len(str(ws.cell(row=r, column=col).value or "")) for r in range(1, ws.max_row + 1)
        )
        ws.column_dimensions[letter].width = min(max(max_len + 2, 12), 50)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(output_path)


def main() -> int:
    parser = argparse.ArgumentParser(description="Export Code Quest jobs to Excel")
    parser.add_argument("--base-url", default="http://127.0.0.1:8000", help="Jobs API base URL")
    parser.add_argument("--limit", type=int, default=100, help="Number of jobs to export")
    parser.add_argument(
        "--output",
        default="codequest_jobs_100.xlsx",
        help="Output .xlsx path",
    )
    args = parser.parse_args()

    jobs = fetch_jobs(args.base_url, limit=args.limit)
    jobs = [j for j in jobs if j.get("jobUrl")]
    if not jobs:
        raise SystemExit("No jobs with links found.")

    output_path = Path(args.output).resolve()
    export_to_excel(jobs[: args.limit], output_path)
    print(f"Exported {min(len(jobs), args.limit)} jobs to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
