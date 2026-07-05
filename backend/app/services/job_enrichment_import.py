"""Parse and validate job enrichment CSV uploads; preview (read-only) and commit (upsert)."""

from __future__ import annotations

import csv
import io
from collections import Counter
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from app.models.models import JobEnrichment, JobRole, JobRoleLevel, QuizPack, ScrapedJob
from app.schemas.job_enrichment_import import (
    JobEnrichmentImportCommitResponse,
    JobEnrichmentImportPreviewResponse,
    JobEnrichmentRowPreview,
    QuizPackSummaryItem,
    RoleSummaryItem,
)

REQUIRED_COLUMNS: tuple[str, ...] = (
    "job_id",
    "actual_role_id",
    "actual_role_name",
    "role_level_id",
    "experience_level",
    "job_live_status",
    "jd_fetch_status",
    "jd_summary",
    "required_skills",
    "good_to_have_skills",
    "tools",
    "programming_languages",
    "databases",
    "frameworks",
    "student_preparation_topics",
    "quiz_pack_id",
    "mapping_confidence",
    "manual_review_needed",
    "notes",
)

JOB_LIVE_STATUSES = frozenset({"LIVE", "EXPIRED", "UNKNOWN"})
JD_FETCH_STATUSES = frozenset({"FETCHED", "BLOCKED", "PARTIAL", "UNKNOWN"})
MANUAL_REVIEW_VALUES = frozenset({"yes", "no"})


@dataclass
class ValidatedEnrichmentRow:
    row_number: int
    job_id: str
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    payload: dict[str, Any] | None = None


def _parse_csv_rows(raw: bytes) -> tuple[list[str], list[dict[str, str]]]:
    text = raw.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        raise ValueError("CSV header row is missing")
    headers = [h.strip() for h in reader.fieldnames if h and h.strip()]
    missing = [col for col in REQUIRED_COLUMNS if col not in headers]
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(missing)}")
    rows: list[dict[str, str]] = []
    for record in reader:
        rows.append({col: (record.get(col) or "").strip() for col in REQUIRED_COLUMNS})
    return headers, rows


def _pipe_list(value: str) -> list[str] | None:
    items = [part.strip() for part in value.split("|") if part.strip()]
    return items or None


def _load_reference_data(db: Session) -> tuple[
    set[str],
    dict[str, str],
    dict[str, str],
    set[str],
    set[str],
]:
    role_ids = {r.role_id for r in db.query(JobRole.role_id).all()}
    levels = db.query(JobRoleLevel.role_level_id, JobRoleLevel.role_id, JobRoleLevel.experience_level).all()
    level_to_role = {lvl.role_level_id: lvl.role_id for lvl in levels}
    level_to_experience = {lvl.role_level_id: lvl.experience_level for lvl in levels}
    scraped_job_ids = {row.job_id for row in db.query(ScrapedJob.job_id).filter(ScrapedJob.job_id.isnot(None)).all()}
    quiz_pack_ids = {row.quiz_pack_id for row in db.query(QuizPack.quiz_pack_id).all()}
    return role_ids, level_to_role, level_to_experience, scraped_job_ids, quiz_pack_ids


def _validate_parsed_rows(
    db: Session,
    rows: list[dict[str, str]],
) -> list[ValidatedEnrichmentRow]:
    role_ids, level_to_role, level_to_experience, scraped_job_ids, quiz_pack_ids = _load_reference_data(db)
    job_id_counts = Counter(row["job_id"] for row in rows if row["job_id"])
    validated: list[ValidatedEnrichmentRow] = []

    for idx, row in enumerate(rows, start=2):
        errors: list[str] = []
        warnings: list[str] = []
        job_id = row["job_id"]

        if not job_id:
            errors.append("job_id is required")
        elif job_id_counts[job_id] > 1:
            errors.append("Duplicate job_id in uploaded CSV")

        actual_role_id = row["actual_role_id"]
        if not actual_role_id:
            errors.append("actual_role_id is required")
        elif actual_role_id not in role_ids:
            errors.append(f"Unknown actual_role_id: {actual_role_id}")

        if not row["actual_role_name"]:
            errors.append("actual_role_name is required")

        role_level_id = row["role_level_id"]
        if not role_level_id:
            errors.append("role_level_id is required")
        elif role_level_id not in level_to_role:
            errors.append(f"Unknown role_level_id: {role_level_id}")
        elif actual_role_id and role_level_id in level_to_role:
            if level_to_role[role_level_id] != actual_role_id:
                errors.append("role_level_id does not belong to actual_role_id")

        experience_level = row["experience_level"].lower()
        if not experience_level:
            errors.append("experience_level is required")
        elif role_level_id in level_to_experience and experience_level != level_to_experience[role_level_id]:
            errors.append("experience_level does not match role_level_id")

        live_status = row["job_live_status"].upper()
        if not live_status:
            errors.append("job_live_status is required")
        elif live_status not in JOB_LIVE_STATUSES:
            errors.append(f"Invalid job_live_status: {row['job_live_status']}")

        jd_status = row["jd_fetch_status"].upper()
        if not jd_status:
            errors.append("jd_fetch_status is required")
        elif jd_status not in JD_FETCH_STATUSES:
            errors.append(f"Invalid jd_fetch_status: {row['jd_fetch_status']}")

        review = row["manual_review_needed"].lower()
        if not review:
            errors.append("manual_review_needed is required")
        elif review not in MANUAL_REVIEW_VALUES:
            errors.append(f"Invalid manual_review_needed: {row['manual_review_needed']}")

        confidence_raw = row["mapping_confidence"]
        confidence_value: float | None = None
        if not confidence_raw:
            errors.append("mapping_confidence is required")
        else:
            try:
                confidence_value = float(confidence_raw)
                if confidence_value < 0 or confidence_value > 1:
                    errors.append("mapping_confidence must be between 0 and 1")
                elif confidence_value < 0.70:
                    warnings.append("mapping_confidence below 0.70")
            except ValueError:
                errors.append("mapping_confidence must be numeric")

        if not row["required_skills"]:
            errors.append("required_skills is required")

        if actual_role_id == "ROLE_OTHER_REVIEW" and review == "no":
            errors.append("ROLE_OTHER_REVIEW requires manual_review_needed=yes")

        if job_id and job_id not in scraped_job_ids:
            warnings.append(f"job_id not found in scraped_jobs: {job_id}")

        if review == "yes":
            warnings.append("manual_review_needed=yes")

        if jd_status in {"PARTIAL", "UNKNOWN"}:
            warnings.append(f"jd_fetch_status is {jd_status}")

        quiz_pack_raw = row["quiz_pack_id"]
        quiz_pack_id: str | None = None
        if quiz_pack_raw:
            if quiz_pack_raw in quiz_pack_ids:
                quiz_pack_id = quiz_pack_raw
            else:
                warnings.append(f"Unknown quiz_pack_id: {quiz_pack_raw}")

        payload: dict[str, Any] | None = None
        if not errors and job_id and confidence_value is not None:
            payload = {
                "job_id": job_id,
                "actual_role_id": actual_role_id,
                "actual_role_name": row["actual_role_name"],
                "role_level_id": role_level_id,
                "experience_level": experience_level,
                "job_live_status": live_status,
                "jd_fetch_status": jd_status,
                "jd_summary": row["jd_summary"] or None,
                "required_skills": _pipe_list(row["required_skills"]),
                "good_to_have_skills": _pipe_list(row["good_to_have_skills"]),
                "tools": _pipe_list(row["tools"]),
                "programming_languages": _pipe_list(row["programming_languages"]),
                "databases": _pipe_list(row["databases"]),
                "frameworks": _pipe_list(row["frameworks"]),
                "student_preparation_topics": _pipe_list(row["student_preparation_topics"]),
                "quiz_pack_id": quiz_pack_id,
                "mapping_confidence": confidence_value,
                "manual_review_needed": review == "yes",
                "approved_status": "NEEDS_REVIEW" if review == "yes" else "PENDING",
            }

        validated.append(
            ValidatedEnrichmentRow(
                row_number=idx,
                job_id=job_id,
                errors=errors,
                warnings=warnings,
                payload=payload,
            )
        )

    return validated


def _validate_enrichment_rows(db: Session, raw: bytes) -> list[ValidatedEnrichmentRow]:
    _, rows = _parse_csv_rows(raw)
    return _validate_parsed_rows(db, rows)


def _row_previews(validated: list[ValidatedEnrichmentRow]) -> list[JobEnrichmentRowPreview]:
    return [
        JobEnrichmentRowPreview(
            row_number=row.row_number,
            job_id=row.job_id,
            errors=row.errors,
            warnings=row.warnings,
        )
        for row in validated
    ]


def preview_job_enrichment_import(db: Session, raw: bytes) -> JobEnrichmentImportPreviewResponse:
    _, rows = _parse_csv_rows(raw)
    validated = _validate_parsed_rows(db, rows)
    previews = _row_previews(validated)
    _, _, _, _, quiz_pack_ids = _load_reference_data(db)

    role_counter: Counter[str] = Counter()
    live_status_counter: Counter[str] = Counter()
    jd_status_counter: Counter[str] = Counter()
    review_counter: Counter[str] = Counter()
    quiz_pack_counter: Counter[str] = Counter()

    for row in validated:
        if row.errors or not row.payload:
            continue
        payload = row.payload
        role_counter[str(payload["actual_role_id"])] += 1
        live_status_counter[str(payload["job_live_status"])] += 1
        jd_status_counter[str(payload["jd_fetch_status"])] += 1
        review_counter["yes" if payload["manual_review_needed"] else "no"] += 1

    for row in rows:
        pack = row["quiz_pack_id"]
        if pack:
            quiz_pack_counter[pack] += 1

    valid_rows = sum(1 for p in previews if not p.errors)
    invalid_rows = sum(1 for p in previews if p.errors)
    warning_rows = sum(1 for p in previews if p.warnings)

    return JobEnrichmentImportPreviewResponse(
        total_rows=len(validated),
        valid_rows=valid_rows,
        invalid_rows=invalid_rows,
        warning_rows=warning_rows,
        row_errors=previews,
        role_summary=[
            RoleSummaryItem(role_id=role_id, count=count)
            for role_id, count in sorted(role_counter.items())
        ],
        status_summary={
            "job_live_status": dict(live_status_counter),
            "jd_fetch_status": dict(jd_status_counter),
            "manual_review_needed": dict(review_counter),
        },
        quiz_pack_summary=[
            QuizPackSummaryItem(
                quiz_pack_id=pack_id,
                count=count,
                exists=pack_id in quiz_pack_ids,
            )
            for pack_id, count in sorted(quiz_pack_counter.items())
        ],
    )


def commit_job_enrichment_import(db: Session, raw: bytes) -> JobEnrichmentImportCommitResponse:
    validated = _validate_enrichment_rows(db, raw)
    previews = _row_previews(validated)

    inserted_count = 0
    updated_count = 0
    skipped_count = 0
    saved_job_ids: list[str] = []
    skipped_job_ids: list[str] = []

    for row in validated:
        if row.errors or not row.payload:
            skipped_count += 1
            skipped_job_ids.append(row.job_id or f"row-{row.row_number}")
            continue

        payload = dict(row.payload)
        job_id = str(payload.pop("job_id"))
        now = datetime.utcnow()
        existing = db.get(JobEnrichment, job_id)
        if existing:
            for key, value in payload.items():
                setattr(existing, key, value)
            existing.updated_at = now
            updated_count += 1
        else:
            db.add(JobEnrichment(job_id=job_id, created_at=now, updated_at=now, **payload))
            inserted_count += 1
        saved_job_ids.append(job_id)

    if inserted_count or updated_count:
        db.commit()

    invalid_rows = sum(1 for p in previews if p.errors)
    warning_rows = sum(1 for p in previews if p.warnings)

    return JobEnrichmentImportCommitResponse(
        total_rows=len(validated),
        inserted_count=inserted_count,
        updated_count=updated_count,
        skipped_count=skipped_count,
        invalid_rows=invalid_rows,
        warning_rows=warning_rows,
        row_errors=previews,
        saved_job_ids=saved_job_ids,
        skipped_job_ids=skipped_job_ids,
    )
