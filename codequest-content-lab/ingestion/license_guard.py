"""License and storage safety checks for lab ingestion MVP."""

from __future__ import annotations

ALLOWED_LICENSE_STATUSES = frozenset(
    {"public-domain", "no-full-text", "open-access", "internal"}
)

REQUIRED_FIELDS = frozenset(
    {
        "title",
        "content_type",
        "source_type",
        "source_name",
        "source_url",
        "author_or_creator",
        "summary",
        "domains",
        "tags",
        "license_status",
        "review_status",
        "file_path",
        "audio_file_path",
        "sha256_hash",
    }
)


def validate_item(item: dict) -> tuple[bool, str | None]:
    missing = REQUIRED_FIELDS - item.keys()
    if missing:
        return False, f"missing required fields: {sorted(missing)}"

    if item.get("file_path") is not None:
        return False, "file_path must be null in MVP (no book file downloads)"
    if item.get("audio_file_path") is not None:
        return False, "audio_file_path must be null in MVP (no audiobook downloads)"
    if item.get("sha256_hash") is not None:
        return False, "sha256_hash must be null until files are approved for download"
    if item.get("content_body"):
        return False, "content_body/full text storage forbidden in MVP"

    license_status = item.get("license_status")
    if license_status not in ALLOWED_LICENSE_STATUSES:
        return False, f"unsupported license_status: {license_status!r}"

    content_type = item.get("content_type")
    if content_type in {"book", "ebook", "audiobook"} and license_status != "public-domain":
        return False, f"{content_type} requires license_status=public-domain"
    if content_type == "article" and license_status != "no-full-text":
        return False, "articles require license_status=no-full-text in MVP"

    if not str(item.get("title", "")).strip():
        return False, "title is empty"
    if not str(item.get("source_url", "")).strip():
        return False, "source_url is empty"

    return True, None
