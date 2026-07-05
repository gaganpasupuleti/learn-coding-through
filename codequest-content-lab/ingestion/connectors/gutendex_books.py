"""Gutendex / Project Gutenberg book metadata connector (no file downloads)."""

from __future__ import annotations

import json
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

SOURCE_NAME = "Gutendex"
SOURCE_TYPE = "gutenberg"
GUTENDEX_API = "https://gutendex.com/books/"


def _author_name(authors: list[dict]) -> str:
    names = [a.get("name", "").strip() for a in authors if a.get("name")]
    return ", ".join(names) if names else "Unknown"


def _map_book(book: dict) -> dict:
    gutenberg_id = book.get("id")
    subjects = book.get("subjects") or []
    summaries = book.get("summaries") or []
    summary = summaries[0] if summaries else f"Public-domain book from Project Gutenberg (#{gutenberg_id})."
    domain = "maths" if any("math" in s.lower() for s in subjects) else "career"

    return {
        "external_id": str(gutenberg_id),
        "title": book.get("title", "").strip(),
        "content_type": "book",
        "source_type": SOURCE_TYPE,
        "source_name": SOURCE_NAME,
        "source_url": f"https://www.gutenberg.org/ebooks/{gutenberg_id}",
        "author_or_creator": _author_name(book.get("authors") or []),
        "summary": summary[:500],
        "domains": [domain],
        "tags": [s.split("--")[0].strip() for s in subjects[:3]] or ["public-domain"],
        "license_status": "public-domain",
        "review_status": "pending_review",
    }


def fetch_raw(mode: str, fixtures_dir: Path, *, search: str = "mathematics", limit: int = 5) -> list[dict]:
    if mode == "fixture":
        payload = json.loads((fixtures_dir / "gutendex_books.fixture.json").read_text(encoding="utf-8"))
        return payload.get("results", [])[:limit]

    if mode != "live":
        raise ValueError(f"unsupported mode: {mode}")

    params = urllib.parse.urlencode({"search": search, "languages": "en"})
    url = f"{GUTENDEX_API}?{params}"
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "CodeQuestContentLab/1.0 (metadata-only; +https://github.com/gaganpasupuleti/learn-coding-through)"},
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"Gutendex live fetch failed: {exc}") from exc

    return payload.get("results", [])[:limit]


def fetch_records(mode: str, fixtures_dir: Path, **kwargs) -> list[dict]:
    return [_map_book(book) for book in fetch_raw(mode, fixtures_dir, **kwargs)]
