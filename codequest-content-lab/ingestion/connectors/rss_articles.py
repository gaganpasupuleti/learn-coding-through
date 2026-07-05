"""RSS article metadata connector (no full article body storage)."""

from __future__ import annotations

import re
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.error import URLError
from urllib.request import urlopen

SOURCE_NAME = "RSS / Atom Feed Parser"
SOURCE_TYPE = "rss"


def _text(element: ET.Element | None) -> str:
    if element is None or element.text is None:
        return ""
    return element.text.strip()


def _parse_rss_xml(xml_text: str) -> list[dict]:
    root = ET.fromstring(xml_text)
    items: list[dict] = []

    for item in root.findall(".//item"):
        title = _text(item.find("title"))
        link = _text(item.find("link"))
        description = _text(item.find("description"))
        author = _text(item.find("author")) or "Unknown"
        pub_date = _text(item.find("pubDate"))
        published_date = None
        if pub_date:
            try:
                published_date = parsedate_to_datetime(pub_date).date().isoformat()
            except (TypeError, ValueError):
                published_date = None

        domain = "python" if re.search(r"python", title + description, re.I) else "sql"
        items.append(
            {
                "external_id": link or title,
                "title": title,
                "content_type": "article",
                "source_type": SOURCE_TYPE,
                "source_name": SOURCE_NAME,
                "source_url": link,
                "author_or_creator": author,
                "summary": description[:500] or "Article metadata from RSS feed (no full body stored).",
                "domains": [domain],
                "tags": ["rss", "no-full-text"],
                "license_status": "no-full-text",
                "review_status": "pending_review",
                "published_date": published_date,
            }
        )

    return items


def fetch_raw(mode: str, fixtures_dir: Path, *, feed_url: str | None = None, limit: int = 10) -> list[dict]:
    if mode == "fixture":
        xml_text = (fixtures_dir / "rss_feed.fixture.xml").read_text(encoding="utf-8")
        return _parse_rss_xml(xml_text)[:limit]

    if mode != "live":
        raise ValueError(f"unsupported mode: {mode}")
    if not feed_url:
        raise ValueError("feed_url is required for RSS live mode")

    try:
        with urlopen(feed_url, timeout=20) as response:
            xml_text = response.read().decode("utf-8", errors="replace")
    except (URLError, TimeoutError) as exc:
        raise RuntimeError(f"RSS live fetch failed: {exc}") from exc

    return _parse_rss_xml(xml_text)[:limit]


def fetch_records(mode: str, fixtures_dir: Path, **kwargs) -> list[dict]:
    return fetch_raw(mode, fixtures_dir, **kwargs)
