"""LibriVox audiobook metadata connector (no audio file downloads)."""

from __future__ import annotations

import json
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

SOURCE_NAME = "LibriVox"
SOURCE_TYPE = "librivox"
LIBRIVOX_API = "https://librivox.org/api/feed/audiobooks"


def _author_name(authors: list[dict]) -> str:
    parts = []
    for author in authors:
        first = author.get("first_name", "").strip()
        last = author.get("last_name", "").strip()
        name = " ".join(p for p in (first, last) if p)
        if name:
            parts.append(name)
    return ", ".join(parts) if parts else "Unknown"


def _map_audiobook(book: dict) -> dict:
    book_id = book.get("id")
    title = str(book.get("title", "")).strip()
    source_url = book.get("url_librivox") or f"https://librivox.org/search?title={urllib.parse.quote(title)}"

    return {
        "external_id": str(book_id),
        "title": title,
        "content_type": "audiobook",
        "source_type": SOURCE_TYPE,
        "source_name": SOURCE_NAME,
        "source_url": source_url,
        "author_or_creator": _author_name(book.get("authors") or []),
        "summary": str(book.get("description", "")).strip()[:500]
        or f"Public-domain audiobook from LibriVox (project {book_id}).",
        "domains": ["career"],
        "tags": ["audiobook", "public-domain", str(book.get("language", "English")).lower()],
        "license_status": "public-domain",
        "review_status": "pending_review",
    }


def fetch_raw(mode: str, fixtures_dir: Path, *, title: str = "science", limit: int = 5) -> list[dict]:
    if mode == "fixture":
        payload = json.loads((fixtures_dir / "librivox_audiobooks.fixture.json").read_text(encoding="utf-8"))
        return payload.get("books", [])[:limit]

    if mode != "live":
        raise ValueError(f"unsupported mode: {mode}")

    params = urllib.parse.urlencode({"format": "json", "title": title})
    url = f"{LIBRIVOX_API}?{params}"
    try:
        with urllib.request.urlopen(url, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"LibriVox live fetch failed: {exc}") from exc

    books = payload.get("books", payload if isinstance(payload, list) else [])
    return books[:limit]


def fetch_records(mode: str, fixtures_dir: Path, **kwargs) -> list[dict]:
    return [_map_audiobook(book) for book in fetch_raw(mode, fixtures_dir, **kwargs)]
