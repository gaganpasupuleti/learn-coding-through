"""Client-ready job digest email builder for Code Quest."""

from __future__ import annotations

import html
import logging
import re
import smtplib
from collections import Counter
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any
from urllib.parse import urlparse

from app.core.config import settings
from app.services.email_brevo import send_brevo_email

logger = logging.getLogger(__name__)

_TAG_RE = re.compile(r"<[^>]+>")
_MAX_SUBJECT = 120
_MAX_INTRO = 500
_MAX_CTA_LABEL = 40

FOOTER_TEXT = (
    "This is a Code Quest job alert. Listings are scraped from public job boards for practice and discovery. "
    "Apply via the original posting links."
)


@dataclass
class DigestBuildOptions:
    search_term: str = "python developer"
    location: str = "India"
    max_jobs: int = 20
    subject_override: str | None = None
    intro_message: str | None = None
    cta_label: str | None = None
    cta_url: str | None = None


@dataclass
class DigestSummary:
    total_active_jobs: int
    selected_jobs_count: int
    recent_jobs_count: int
    internships_24h: int = 0
    freshers_24h: int = 0
    top_roles: list[str] = field(default_factory=list)
    top_companies: list[str] = field(default_factory=list)
    top_locations: list[str] = field(default_factory=list)
    source_split: dict[str, int] = field(default_factory=dict)

    def as_dict(self) -> dict[str, Any]:
        return {
            "totalActiveJobs": self.total_active_jobs,
            "selectedJobsCount": self.selected_jobs_count,
            "recentJobsCount": self.recent_jobs_count,
            "internships24h": self.internships_24h,
            "freshers24h": self.freshers_24h,
            "topRoles": self.top_roles,
            "topCompanies": self.top_companies,
            "topLocations": self.top_locations,
            "sourceSplit": self.source_split,
        }


@dataclass
class DigestContent:
    subject: str
    html: str
    text: str
    summary: DigestSummary
    job_count: int


def sanitize_plain_text(value: str | None, *, max_len: int) -> str:
    """Strip HTML-like markup from admin-editable plain text."""
    if not value:
        return ""
    cleaned = _TAG_RE.sub("", value)
    cleaned = " ".join(cleaned.split())
    return cleaned[:max_len].strip()


def validate_safe_https_url(value: str | None) -> str | None:
    """Allow only https URLs; optional prefix match against configured CTA base."""
    if not value:
        return None
    raw = value.strip()
    try:
        parsed = urlparse(raw)
    except ValueError:
        return None
    if parsed.scheme != "https" or not parsed.netloc:
        return None
    allowed_base = (getattr(settings, "job_digest_cta_url", None) or "").strip()
    if allowed_base:
        if not raw.startswith(allowed_base.rstrip("/")):
            return None
    return raw


def _short_description(text: str | None, limit: int = 160) -> str:
    if not text:
        return ""
    cleaned = " ".join(text.split())
    if len(cleaned) <= limit:
        return cleaned
    return cleaned[: limit - 1].rstrip() + "…"


def _top_value_counts(jobs: list[dict[str, Any]], key: str, limit: int = 5) -> list[tuple[str, int]]:
    counter: Counter[str] = Counter()
    for job in jobs:
        raw = (job.get(key) or "").strip()
        if raw:
            counter[raw] += 1
    return counter.most_common(limit)


def _top_values(jobs: list[dict[str, Any]], key: str, limit: int = 5) -> list[str]:
    return [name for name, _ in _top_value_counts(jobs, key, limit)]


def _source_split(jobs: list[dict[str, Any]]) -> dict[str, int]:
    counter: Counter[str] = Counter()
    for job in jobs:
        source = (job.get("source") or "unknown").strip().lower()
        counter[source] += 1
    return dict(counter.most_common())


def _recent_jobs_count(jobs: list[dict[str, Any]], days: int = 7) -> int:
    cutoff = datetime.utcnow() - timedelta(days=days)
    count = 0
    for job in jobs:
        created = job.get("createdAt")
        if created is None:
            continue
        if isinstance(created, str):
            try:
                created = datetime.fromisoformat(created.replace("Z", "+00:00")).replace(tzinfo=None)
            except ValueError:
                continue
        if isinstance(created, datetime) and created >= cutoff:
            count += 1
    return count


def build_digest_summary(
    jobs: list[dict[str, Any]],
    *,
    total_active_jobs: int,
    selected: list[dict[str, Any]],
    internships_24h: int = 0,
    freshers_24h: int = 0,
) -> DigestSummary:
    return DigestSummary(
        total_active_jobs=total_active_jobs,
        selected_jobs_count=len(selected),
        recent_jobs_count=_recent_jobs_count(selected),
        internships_24h=internships_24h,
        freshers_24h=freshers_24h,
        top_roles=_top_values(selected, "title"),
        top_companies=_top_values(selected, "company"),
        top_locations=_top_values(selected, "location"),
        source_split=_source_split(selected),
    )


def build_digest(
    jobs: list[dict[str, Any]],
    *,
    search_term: str = "python developer",
    location: str = "India",
    max_jobs: int = 20,
    total_active_jobs: int | None = None,
    internships_24h: int = 0,
    freshers_24h: int = 0,
    subject_override: str | None = None,
    intro_message: str | None = None,
    cta_label: str | None = None,
    cta_url: str | None = None,
) -> DigestContent:
    """Build the premium client-ready digest HTML/text with summary insights."""
    opts = DigestBuildOptions(
        search_term=sanitize_plain_text(search_term, max_len=80) or "python developer",
        location=location,
        max_jobs=max(1, min(max_jobs, 50)),
        subject_override=sanitize_plain_text(subject_override, max_len=_MAX_SUBJECT) or None,
        intro_message=sanitize_plain_text(intro_message, max_len=_MAX_INTRO) or None,
        cta_label=sanitize_plain_text(cta_label, max_len=_MAX_CTA_LABEL) or None,
        cta_url=validate_safe_https_url(cta_url),
    )
    if not opts.cta_url and getattr(settings, "job_digest_cta_url", None):
        opts.cta_url = validate_safe_https_url(settings.job_digest_cta_url)

    selected = jobs[: opts.max_jobs]
    total = total_active_jobs if total_active_jobs is not None else len(jobs)
    summary = build_digest_summary(
        jobs,
        total_active_jobs=total,
        selected=selected,
        internships_24h=internships_24h,
        freshers_24h=freshers_24h,
    )

    topic = html.escape(opts.search_term)
    loc = html.escape(opts.location)
    role_count = len(selected)

    if opts.subject_override:
        subject = opts.subject_override
    else:
        subject = f"Code Quest Job Alert: {opts.search_term} in {opts.location} ({role_count} roles)"

    intro_html = ""
    intro_text = ""
    if opts.intro_message:
        intro_html = (
            f"<p style='color:#334155;font-size:15px;line-height:1.6;margin:0 0 20px;'>"
            f"{html.escape(opts.intro_message)}</p>"
        )
        intro_text = f"{opts.intro_message}\n\n"

    cta_label_final = opts.cta_label or "Browse all jobs on Code Quest"
    cta_html = ""
    cta_text = ""
    if opts.cta_url:
        safe_url = html.escape(opts.cta_url, quote=True)
        cta_html = (
            "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='margin:28px 0 8px;'>"
            "<tr><td align='center'>"
            f"<a href='{safe_url}' style='display:inline-block;background:#4f46e5;color:#ffffff;"
            "font-weight:700;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;"
            "box-shadow:0 4px 14px rgba(79,70,229,0.35);'>"
            f"{html.escape(cta_label_final)} &rarr;</a>"
            "</td></tr></table>"
        )
        cta_text = f"{cta_label_final}: {opts.cta_url}\n\n"

    kpi_cards = _kpi_cards(summary)
    pipeline_strip = _pipeline_strip(summary)

    role_counts = _top_value_counts(selected, "title")
    company_counts = _top_value_counts(selected, "company")
    city_counts = _top_value_counts(selected, "location")
    insights_html = _insights_section(role_counts, company_counts, city_counts)

    featured_html = _featured_two_col(selected, opts.location)

    text_lines = [
        f"Code Quest Job Alert — {opts.search_term} in {opts.location}",
        (
            f"Active jobs: {summary.total_active_jobs} | In digest: {summary.selected_jobs_count} "
            f"| New this week: {summary.recent_jobs_count}"
        ),
        f"Internships opened (24h): {summary.internships_24h} | Fresher jobs opened (24h): {summary.freshers_24h}",
        "",
    ]
    if opts.intro_message:
        text_lines.insert(3, opts.intro_message)

    if summary.top_roles:
        text_lines.append("Top roles: " + ", ".join(summary.top_roles[:5]))
    if summary.top_companies:
        text_lines.append("Top companies: " + ", ".join(summary.top_companies[:5]))
    if summary.top_locations:
        text_lines.append("Top cities: " + ", ".join(summary.top_locations[:5]))
    text_lines.append("")
    text_lines.append("Featured roles:")

    for job in selected:
        title = job.get("title") or "Untitled"
        company = job.get("company") or "Company not listed"
        job_loc = job.get("location") or opts.location
        apply_url = job.get("applyUrl") or job.get("jobUrl") or "#"
        desc = _short_description(job.get("description"))
        text_lines.extend([f"• {title}", f"  {company} · {job_loc}", f"  {apply_url}"])
        if desc:
            text_lines.append(f"  {desc}")
        text_lines.append("")

    html_body = (
        "<div style='background:#eef2f8;padding:24px 0;'>"
        "<div style='font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;"
        "max-width:640px;margin:0 auto;color:#0f172a;background:#ffffff;border-radius:16px;overflow:hidden;"
        "box-shadow:0 10px 30px rgba(15,23,42,0.08);'>"
        # Hero
        "<div style='background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#312e81 100%);padding:32px 28px;color:#ffffff;'>"
        "<div style='font-size:12px;text-transform:uppercase;letter-spacing:0.18em;font-weight:700;opacity:0.9;'>"
        "&#9889; Code Quest</div>"
        "<h1 style='margin:10px 0 0;font-size:26px;font-weight:800;line-height:1.2;'>Weekly Job Digest</h1>"
        f"<p style='margin:10px 0 0;opacity:0.92;font-size:14px;'>{topic} &middot; {loc} &middot; curated for learners</p>"
        "</div>"
        # Body
        "<div style='padding:28px;'>"
        f"{intro_html}"
        f"{kpi_cards}"
        f"{pipeline_strip}"
        f"{insights_html}"
        "<h2 style='font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#475569;margin:28px 0 14px;'>"
        "Featured roles</h2>"
        f"{featured_html}"
        f"{cta_html}"
        "<p style='color:#94a3b8;font-size:11px;margin:28px 0 0;line-height:1.6;border-top:1px solid #e2e8f0;padding-top:18px;'>"
        "This is a <strong>Code Quest</strong> job alert. Listings are aggregated from public job boards for "
        "practice and discovery. Always apply via the original posting links.</p>"
        "</div></div></div>"
    )

    text_lines.append(FOOTER_TEXT)
    if cta_text:
        text_lines.insert(-1, cta_text.strip())

    return DigestContent(
        subject=subject,
        html=html_body,
        text="\n".join(text_lines),
        summary=summary,
        job_count=len(selected),
    )


def _kpi_card(value: int, label: str, value_color: str, label_color: str, bg: str) -> str:
    return (
        f"<td style='background:{bg};border-radius:12px;padding:16px 10px;text-align:center;width:33%;'>"
        f"<div style='font-size:28px;font-weight:800;color:{value_color};line-height:1;'>{value}</div>"
        f"<div style='font-size:11px;font-weight:600;color:{label_color};text-transform:uppercase;"
        f"letter-spacing:0.04em;margin-top:6px;'>{label}</div></td>"
    )


def _kpi_cards(summary: DigestSummary) -> str:
    return (
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' "
        "style='border-collapse:separate;border-spacing:8px;margin:0 0 4px;'>"
        "<tr>"
        + _kpi_card(summary.total_active_jobs, "Active Jobs", "#312e81", "#6366f1", "#eef2ff")
        + _kpi_card(summary.selected_jobs_count, "In Digest", "#14532d", "#16a34a", "#f0fdf4")
        + _kpi_card(summary.recent_jobs_count, "New This Week", "#9a3412", "#ea580c", "#fff7ed")
        + "</tr></table>"
    )


def _pipeline_strip(summary: DigestSummary) -> str:
    """Two email-safe highlight blocks: internships + fresher jobs opened in last 24h."""
    return (
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' "
        "style='border-collapse:separate;border-spacing:8px;margin:0 0 18px;'>"
        "<tr>"
        "<td style='background:#ecfeff;border:1px solid #cffafe;border-radius:12px;padding:14px 16px;width:50%;'>"
        f"<div style='font-size:22px;font-weight:800;color:#0e7490;line-height:1;'>{summary.internships_24h}</div>"
        "<div style='font-size:12px;font-weight:600;color:#0891b2;margin-top:5px;'>Internships opened &middot; last 24h</div>"
        "</td>"
        "<td style='background:#fdf4ff;border:1px solid #f5d0fe;border-radius:12px;padding:14px 16px;width:50%;'>"
        f"<div style='font-size:22px;font-weight:800;color:#a21caf;line-height:1;'>{summary.freshers_24h}</div>"
        "<div style='font-size:12px;font-weight:600;color:#c026d3;margin-top:5px;'>Fresher jobs opened &middot; last 24h</div>"
        "</td>"
        "</tr></table>"
    )


def _ranked_list(label: str, items: list[tuple[str, int]], bar_color: str) -> str:
    if not items:
        return ""
    top = max((c for _, c in items), default=1) or 1
    rows = [
        f"<div style='font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;"
        f"color:#64748b;margin:0 0 10px;'>{html.escape(label)}</div>"
    ]
    for name, count in items[:5]:
        pct = max(8, round((count / top) * 100))
        rows.append(
            "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='margin:0 0 8px;'>"
            "<tr><td style='font-size:13px;color:#334155;padding:0 0 3px;'>"
            f"<span style='font-weight:600;'>{html.escape(name)}</span>"
            f"<span style='color:#94a3b8;'> &middot; {count}</span></td></tr>"
            "<tr><td style='background:#f1f5f9;border-radius:6px;height:7px;line-height:7px;font-size:0;'>"
            f"<div style='background:{bar_color};width:{pct}%;height:7px;border-radius:6px;font-size:0;line-height:7px;'>&nbsp;</div>"
            "</td></tr></table>"
        )
    return (
        "<td style='vertical-align:top;padding:0 6px;width:33%;'>" + "".join(rows) + "</td>"
    )


def _insights_section(
    role_counts: list[tuple[str, int]],
    company_counts: list[tuple[str, int]],
    city_counts: list[tuple[str, int]],
) -> str:
    cells = (
        _ranked_list("Top roles", role_counts, "#6366f1")
        + _ranked_list("Top companies", company_counts, "#16a34a")
        + _ranked_list("Top cities", city_counts, "#ea580c")
    )
    if not cells:
        return ""
    return (
        "<div style='background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:18px 12px;margin:0 0 4px;'>"
        "<h2 style='font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#475569;margin:0 0 16px;padding:0 6px;'>"
        "Market insights</h2>"
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0'><tr>"
        f"{cells}"
        "</tr></table></div>"
    )


def _featured_two_col(selected: list[dict[str, Any]], default_loc: str) -> str:
    """Render featured roles in an email-safe 2-column card grid."""
    if not selected:
        return ""

    def card(job: dict[str, Any]) -> str:
        title = html.escape(job.get("title") or "Untitled")
        company = html.escape(job.get("company") or "Company not listed")
        job_loc = html.escape(job.get("location") or default_loc)
        apply_url = html.escape(str(job.get("applyUrl") or job.get("jobUrl") or "#"), quote=True)
        desc = _short_description(job.get("description"), limit=110)
        desc_html = (
            f"<p style='color:#64748b;font-size:12px;margin:8px 0 0;line-height:1.5;'>{html.escape(desc)}</p>"
            if desc
            else ""
        )
        return (
            "<div style='border:1px solid #e2e8f0;border-radius:12px;padding:14px;background:#ffffff;height:100%;'>"
            f"<div style='font-weight:700;font-size:15px;margin:0 0 4px;color:#0f172a;line-height:1.3;'>{title}</div>"
            f"<div style='color:#475569;font-size:13px;'>{company}</div>"
            f"<div style='color:#94a3b8;font-size:12px;margin-top:2px;'>{job_loc}</div>"
            f"{desc_html}"
            f"<p style='margin:12px 0 0;'><a href='{apply_url}' "
            "style='display:inline-block;color:#4f46e5;font-weight:700;text-decoration:none;font-size:13px;'>"
            "Apply &rarr;</a></p></div>"
        )

    rows: list[str] = []
    for i in range(0, len(selected), 2):
        left = card(selected[i])
        right = card(selected[i + 1]) if i + 1 < len(selected) else "<div></div>"
        rows.append(
            "<tr>"
            f"<td style='width:50%;vertical-align:top;padding:0 6px 12px 0;'>{left}</td>"
            f"<td style='width:50%;vertical-align:top;padding:0 0 12px 6px;'>{right}</td>"
            "</tr>"
        )
    return (
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' "
        "style='border-collapse:separate;'>" + "".join(rows) + "</table>"
    )


def _smtp_configured() -> bool:
    return bool(settings.smtp_host and settings.smtp_from)


def _active_provider() -> str:
    return (settings.email_provider or "smtp").strip().lower()


def send_email(*, to_addrs: list[str], subject: str, html_body: str, text_body: str) -> tuple[int, list[str]]:
    """Send one message per recipient via the configured provider. Returns (sent_count, failed_emails)."""
    provider = _active_provider()
    if provider == "brevo":
        return send_brevo_email(
            to_addrs=to_addrs,
            subject=subject,
            html_body=html_body,
            text_body=text_body,
        )
    if provider != "smtp":
        raise ValueError(f"Unknown email provider: {provider} (use smtp or brevo)")
    return _send_via_smtp(
        to_addrs=to_addrs,
        subject=subject,
        html_body=html_body,
        text_body=text_body,
    )


def _send_via_smtp(
    *, to_addrs: list[str], subject: str, html_body: str, text_body: str
) -> tuple[int, list[str]]:
    if not _smtp_configured():
        raise ValueError("SMTP is not configured (SMTP_HOST, SMTP_FROM required)")

    sent = 0
    failed: list[str] = []
    for addr in to_addrs:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.smtp_from or ""
            msg["To"] = addr
            msg.attach(MIMEText(text_body, "plain", "utf-8"))
            msg.attach(MIMEText(html_body, "html", "utf-8"))

            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=30) as server:
                server.ehlo()
                if settings.smtp_port != 25:
                    server.starttls()
                    server.ehlo()
                if settings.smtp_user and settings.smtp_pass:
                    server.login(settings.smtp_user, settings.smtp_pass)
                server.sendmail(settings.smtp_from or "", [addr], msg.as_string())
            sent += 1
            logger.info("Job digest sent to %s", addr)
        except Exception as exc:
            logger.exception("Failed to send job digest to %s", addr)
            failed.append(f"{addr}: {exc}")

    return sent, failed
