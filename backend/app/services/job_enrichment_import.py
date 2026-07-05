"""Parse and validate job enrichment CSV uploads (preview only — no DB writes)."""

from __future__ import annotations

import csv
import io
from collections import Counter

from sqlalchemy.orm import Session

from app.models.models import JobRole, JobRoleLevel, QuizPack, ScrapedJob
from app.schemas.job_enrichment_import import (
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


def preview_job_enrichment_import(db: Session, raw: bytes) -> JobEnrichmentImportPreviewResponse:
    _, rows = _parse_csv_rows(raw)
    role_ids, level_to_role, level_to_experience, scraped_job_ids, quiz_pack_ids = _load_reference_data(db)

    job_id_counts = Counter(row["job_id"] for row in rows if row["job_id"])
    previews: list[JobEnrichmentRowPreview] = []

    role_counter: Counter[str] = Counter()
    live_status_counter: Counter[str] = Counter()
    jd_status_counter: Counter[str] = Counter()
    review_counter: Counter[str] = Counter()
    quiz_pack_counter: Counter[str] = Counter()

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
        if not confidence_raw:
            errors.append("mapping_confidence is required")
        else:
            try:
                confidence = float(confidence_raw)
                if confidence < 0 or confidence > 1:
                    errors.append("mapping_confidence must be between 0 and 1")
                elif confidence < 0.70:
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

        quiz_pack_id = row["quiz_pack_id"]
        if quiz_pack_id:
            quiz_pack_counter[quiz_pack_id] += 1
            if quiz_pack_id not in quiz_pack_ids:
                warnings.append(f"Unknown quiz_pack_id: {quiz_pack_id}")

        if not errors and actual_role_id:
            role_counter[actual_role_id] += 1
        if live_status in JOB_LIVE_STATUSES:
            live_status_counter[live_status] += 1
        if jd_status in JD_FETCH_STATUSES:
            jd_status_counter[jd_status] += 1
        if review in MANUAL_REVIEW_VALUES:
            review_counter[review] += 1

        previews.append(
            JobEnrichmentRowPreview(
                row_number=idx,
                job_id=job_id,
                errors=errors,
                warnings=warnings,
            )
        )

    valid_rows = sum(1 for p in previews if not p.errors)
    invalid_rows = sum(1 for p in previews if p.errors)
    warning_rows = sum(1 for p in previews if p.warnings)

    return JobEnrichmentImportPreviewResponse(
        total_rows=len(rows),
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
