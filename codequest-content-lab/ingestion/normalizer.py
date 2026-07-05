"""Normalize connector records into the lab ingestion MVP schema."""

from __future__ import annotations


def normalize_item(raw: dict) -> dict:
    """Map a connector-specific partial record to the standard output shape."""
    domains = raw.get("domains") or []
    if isinstance(domains, str):
        domains = [domains]

    tags = raw.get("tags") or []
    if isinstance(tags, str):
        tags = [tags]

    return {
        "external_id": raw.get("external_id"),
        "title": str(raw.get("title", "")).strip(),
        "content_type": raw.get("content_type"),
        "source_type": raw.get("source_type"),
        "source_name": raw.get("source_name"),
        "source_url": raw.get("source_url"),
        "author_or_creator": raw.get("author_or_creator") or "Unknown",
        "summary": str(raw.get("summary", "")).strip(),
        "domains": list(domains),
        "tags": list(tags),
        "license_status": raw.get("license_status"),
        "review_status": raw.get("review_status", "pending_review"),
        "published_date": raw.get("published_date"),
        "file_path": None,
        "audio_file_path": None,
        "sha256_hash": None,
    }
