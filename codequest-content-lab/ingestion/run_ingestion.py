#!/usr/bin/env python3
"""Study Materials ingestion MVP orchestrator — lab isolated, metadata only."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import UTC, datetime
from pathlib import Path

from connectors import gutendex_books, librivox_audiobooks, rss_articles
from license_guard import validate_item
from normalizer import normalize_item

INGESTION_DIR = Path(__file__).resolve().parent
FIXTURES_DIR = INGESTION_DIR / "fixtures"
OUTPUT_DIR = INGESTION_DIR / "output"

CONNECTORS = {
    "gutendex": gutendex_books.fetch_records,
    "librivox": librivox_audiobooks.fetch_records,
    "rss": rss_articles.fetch_records,
}


def run(mode: str, sources: list[str], limit: int, feed_url: str | None) -> dict:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    input_records: list[dict] = []
    connector_errors: list[dict] = []

    for name in sources:
        fetch = CONNECTORS[name]
        kwargs = {"limit": limit}
        if name == "rss" and feed_url:
            kwargs["feed_url"] = feed_url
        try:
            input_records.extend(fetch(mode, FIXTURES_DIR, **kwargs))
        except Exception as exc:  # ponytail: surface connector failure, continue others
            connector_errors.append({"source": name, "error": str(exc)})

    normalized: list[dict] = []
    rejections: list[dict] = []

    for raw in input_records:
        item = normalize_item(raw)
        ok, reason = validate_item(item)
        if ok:
            normalized.append(item)
        else:
            rejections.append({"title": item.get("title"), "source_name": item.get("source_name"), "reason": reason})

    timestamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    output_path = OUTPUT_DIR / f"normalized-{timestamp}.json"
    run_log_path = OUTPUT_DIR / f"run-log-{timestamp}.json"

    payload = {
        "generated_at": datetime.now(UTC).isoformat(),
        "mode": mode,
        "sources": sources,
        "downloaded_file_count": 0,
        "items": normalized,
    }
    output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    run_log = {
        "command": " ".join(sys.argv),
        "mode": mode,
        "sources": sources,
        "input_count": len(input_records),
        "normalized_count": len(normalized),
        "rejected_count": len(rejections),
        "rejection_reasons": rejections,
        "connector_errors": connector_errors,
        "downloaded_file_count": 0,
        "generated_json_path": str(output_path.relative_to(INGESTION_DIR)),
        "sample_normalized_item": normalized[0] if normalized else None,
    }
    run_log_path.write_text(json.dumps(run_log, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    return {
        **run_log,
        "output_path": output_path,
        "run_log_path": run_log_path,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Study Materials lab ingestion MVP (metadata only).")
    parser.add_argument(
        "--mode",
        choices=("fixture", "live"),
        default="fixture",
        help="fixture=local fixtures (default); live=metadata fetch only, no file downloads",
    )
    parser.add_argument(
        "--sources",
        default="all",
        help="Comma-separated sources: gutendex,librivox,rss or all",
    )
    parser.add_argument("--limit", type=int, default=5, help="Max records per source")
    parser.add_argument("--feed-url", default=None, help="RSS feed URL (live RSS mode only)")
    args = parser.parse_args()

    if args.sources == "all":
        sources = list(CONNECTORS)
    else:
        sources = [s.strip() for s in args.sources.split(",") if s.strip()]
        unknown = set(sources) - set(CONNECTORS)
        if unknown:
            parser.error(f"unknown sources: {sorted(unknown)}")

    result = run(args.mode, sources, args.limit, args.feed_url)

    print("=== Study Materials ingestion MVP proof ===")
    print(f"command run: {result['command']}")
    print(f"mode: {result['mode']}")
    print(f"input count: {result['input_count']}")
    print(f"normalized count: {result['normalized_count']}")
    print(f"rejected count: {result['rejected_count']}")
    print(f"rejection reasons: {json.dumps(result['rejection_reasons'], ensure_ascii=False)}")
    print(f"generated JSON path: {result['generated_json_path']}")
    print(f"run log path: {result['run_log_path'].relative_to(INGESTION_DIR)}")
    print(f"downloaded_file_count: {result['downloaded_file_count']}")
    print("no real downloads: confirmed (file_path, audio_file_path, sha256_hash all null)")
    if result["sample_normalized_item"]:
        print(f"sample normalized item: {json.dumps(result['sample_normalized_item'], ensure_ascii=False)}")
    if result["connector_errors"]:
        print(f"connector errors: {json.dumps(result['connector_errors'], ensure_ascii=False)}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
