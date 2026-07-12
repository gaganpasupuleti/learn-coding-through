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
_MAX_FEATURED = 8

# Code Quest design tokens (email-safe hex — matches student UI)
_CREAM = "#FAF3E0"
_CREAM_DEEP = "#F5EBD3"
_NAVY = "#0A1020"
_NAVY_MID = "#152238"
_INK = "#0A1020"
_INK_SOFT = "#334155"
_MUTED = "#64748b"
_FAINT = "#94a3b8"
_BORDER = "#E8DFC8"
_ACCENT = "#2563eb"
_ACCENT_DARK = "#1d4ed8"
_WHITE = "#ffffff"

FOOTER_TEXT = (
    "Code Quest Jobs Radar — fresh, India-focused roles aggregated from public job boards for "
    "practice and discovery. Always apply via the original posting links."
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
        subject = f"Code Quest Jobs Radar: {role_count} handpicked {opts.search_term} roles in {opts.location}"

    intro_html = ""
    intro_text = ""
    if opts.intro_message:
        intro_html = (
            f"<div style='background:{_CREAM_DEEP};border:1px solid {_BORDER};border-radius:12px;"
            "padding:18px 20px;margin:0 0 24px;'>"
            f"<p style='color:{_INK_SOFT};font-size:15px;line-height:1.65;margin:0;font-style:italic;'>"
            f"&#8220;{html.escape(opts.intro_message)}&#8221;</p></div>"
        )
        intro_text = f"{opts.intro_message}\n\n"

    cta_label_final = opts.cta_label or "Open Jobs Dashboard"
    cta_text = ""
    hero_cta_html = ""
    footer_cta_html = ""
    if opts.cta_url:
        hero_cta_html = _cta_button(opts.cta_url, cta_label_final, on_dark=True)
        footer_cta_html = _cta_button(opts.cta_url, cta_label_final, on_dark=False)
        cta_text = f"{cta_label_final}: {opts.cta_url}\n\n"

    featured = selected[:_MAX_FEATURED]

    hero_html = _hero(topic, loc, summary, hero_cta_html)
    kpi_cards = _kpi_cards(summary)
    role_counts = _top_value_counts(selected, "title")
    company_counts = _top_value_counts(selected, "company")
    city_counts = _top_value_counts(selected, "location")
    insights_html = _insights_section(role_counts, city_counts, company_counts)
    why_html = _why_section(topic, loc)
    featured_html = _featured_two_col(featured, opts.location)

    text_lines = [
        f"Code Quest Jobs Radar — {opts.search_term} in {opts.location}",
        f"{summary.total_active_jobs} active jobs scanned · {summary.selected_jobs_count} handpicked roles",
        "",
        "Snapshot:",
        f"  Active Jobs: {summary.total_active_jobs}",
        f"  Handpicked Roles: {summary.selected_jobs_count}",
        f"  Fresh This Week: {summary.recent_jobs_count}",
        f"  Internships Today: {summary.internships_24h}",
        f"  Fresher Roles Today: {summary.freshers_24h}",
        "",
    ]
    if opts.intro_message:
        text_lines.insert(2, opts.intro_message)

    if summary.top_roles:
        text_lines.append("Top Roles: " + ", ".join(summary.top_roles[:5]))
    if summary.top_locations:
        text_lines.append("Hot Cities: " + ", ".join(summary.top_locations[:5]))
    if summary.top_companies:
        text_lines.append("Hiring Companies: " + ", ".join(summary.top_companies[:5]))
    text_lines.append("")
    text_lines.append(
        "Why these roles? Fresh, India-focused listings filtered for interns, freshers and "
        "early-career engineers, deduplicated so you only see live postings."
    )
    text_lines.append("")
    text_lines.append("Featured roles:")

    for job in featured:
        title = job.get("title") or "Untitled"
        company = job.get("company") or "Company not listed"
        job_loc = job.get("location") or opts.location
        posted = _format_job_date(job)
        source = (job.get("source") or "").strip()
        meta = " · ".join(p for p in [job_loc, posted, source] if p)
        apply_url = job.get("applyUrl") or job.get("jobUrl") or "#"
        text_lines.extend([f"• {title}", f"  {company} · {meta}", f"  {apply_url}", ""])

    html_body = (
        f"<div style='background:{_CREAM};padding:32px 16px;'>"
        "<div style='font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;"
        f"max-width:600px;margin:0 auto;color:{_INK};'>"
        f"{hero_html}"
        f"<div style='background:{_WHITE};border:1px solid {_BORDER};border-radius:0 0 16px 16px;"
        "padding:28px 24px 32px;box-shadow:0 8px 24px rgba(10,16,32,0.06);'>"
        f"{intro_html}"
        f"{kpi_cards}"
        f"{insights_html}"
        f"{why_html}"
        f"<h2 style='font-family:Georgia,Times New Roman,serif;font-size:20px;font-weight:700;"
        f"color:{_NAVY};margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid {_CREAM_DEEP};'>"
        "Featured roles</h2>"
        f"{featured_html}"
        f"{footer_cta_html}"
        f"<p style='color:{_MUTED};font-size:12px;margin:32px 0 0;line-height:1.65;"
        f"border-top:1px solid {_BORDER};padding-top:20px;text-align:center;'>"
        f"<strong style='color:{_NAVY};'>Code Quest Jobs Radar</strong><br/>"
        "Fresh, India-focused roles for students. Always apply via the original posting links."
        "</p></div></div></div>"
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


def _format_job_date(job: dict[str, Any]) -> str:
    raw = job.get("datePosted") or job.get("createdAt")
    if raw is None:
        return ""
    if isinstance(raw, str):
        try:
            raw = datetime.fromisoformat(raw.replace("Z", "+00:00")).replace(tzinfo=None)
        except ValueError:
            return ""
    if isinstance(raw, datetime):
        return raw.strftime("%d %b")
    return ""


def _cta_button(url: str, label: str, *, on_dark: bool) -> str:
    safe_url = html.escape(url, quote=True)
    if on_dark:
        style = (
            f"display:inline-block;background:{_CREAM};color:{_NAVY};font-weight:700;text-decoration:none;"
            "padding:13px 28px;border-radius:999px;font-size:14px;letter-spacing:0.02em;"
        )
        wrap_margin = "22px 0 0"
        align = "left"
    else:
        style = (
            f"display:inline-block;background:{_ACCENT};color:#ffffff;font-weight:700;text-decoration:none;"
            "padding:14px 32px;border-radius:999px;font-size:15px;"
            f"box-shadow:0 4px 14px rgba(37,99,235,0.28);"
        )
        wrap_margin = "28px 0 0"
        align = "center"
    return (
        f"<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='margin:{wrap_margin};'>"
        f"<tr><td align='{align}'>"
        f"<a href='{safe_url}' style='{style}'>{html.escape(label)} &rarr;</a>"
        "</td></tr></table>"
    )


def _hero(topic: str, loc: str, summary: DigestSummary, hero_cta_html: str) -> str:
    """Navy header with cream typography — Code Quest brand shell."""
    return (
        f"<div style='background:{_NAVY};padding:36px 28px 32px;border-radius:16px 16px 0 0;"
        "color:#ffffff;'>"
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0'><tr>"
        "<td style='vertical-align:top;'>"
        f"<div style='font-size:11px;text-transform:uppercase;letter-spacing:0.2em;font-weight:700;"
        f"color:{_CREAM};opacity:0.85;'>Code Quest &middot; Jobs Radar</div>"
        "<h1 style='font-family:Georgia,Times New Roman,serif;margin:12px 0 0;font-size:28px;"
        "font-weight:700;line-height:1.25;color:#ffffff;'>Your job picks for this week</h1>"
        f"<p style='margin:10px 0 0;color:#cbd5e1;font-size:15px;line-height:1.5;'>"
        f"<span style='color:{_CREAM};font-weight:600;'>{topic}</span> &middot; {loc}</p>"
        "</td></tr></table>"
        "<table role='presentation' cellspacing='0' cellpadding='0' style='margin:22px 0 0;'><tr>"
        f"<td style='padding:0 32px 0 0;border-right:1px solid rgba(250,243,224,0.25);'>"
        f"<div style='font-size:32px;font-weight:800;line-height:1;color:{_CREAM};'>"
        f"{summary.total_active_jobs}</div>"
        f"<div style='font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;"
        "margin-top:6px;font-weight:600;'>Active jobs scanned</div></td>"
        f"<td style='padding-left:32px;'>"
        f"<div style='font-size:32px;font-weight:800;line-height:1;color:#ffffff;'>"
        f"{summary.selected_jobs_count}</div>"
        f"<div style='font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;"
        "margin-top:6px;font-weight:600;'>Handpicked roles</div></td>"
        "</tr></table>"
        f"{hero_cta_html}"
        "</div>"
    )


def _kpi_card(value: int, label: str, bg: str, width: str) -> str:
    return (
        f"<td style='background:{bg};border:1px solid {_BORDER};border-radius:10px;"
        f"padding:14px 8px;text-align:center;width:{width};'>"
        f"<div style='font-size:22px;font-weight:800;color:{_NAVY};line-height:1;'>{value}</div>"
        f"<div style='font-size:10px;font-weight:600;color:{_MUTED};text-transform:uppercase;"
        f"letter-spacing:0.05em;margin-top:6px;line-height:1.3;'>{label}</div></td>"
    )


def _kpi_cards(summary: DigestSummary) -> str:
    """Five KPI tiles in a compact email-safe grid."""
    row1 = (
        "<tr>"
        + _kpi_card(summary.total_active_jobs, "Active Jobs", "#eef4ff", "33%")
        + _kpi_card(summary.selected_jobs_count, "Handpicked Roles", "#ecfdf5", "33%")
        + _kpi_card(summary.recent_jobs_count, "Fresh This Week", "#fffbeb", "33%")
        + "</tr>"
    )
    row2 = (
        "<tr>"
        + _kpi_card(summary.internships_24h, "Internships Today", "#f0f9ff", "50%")
        + _kpi_card(summary.freshers_24h, "Fresher Roles Today", "#fdf2f8", "50%")
        + "</tr>"
    )
    return (
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' "
        f"style='border-collapse:separate;border-spacing:8px;margin:0 0 8px;'>{row1}{row2}</table>"
    )


def _insight_card(title: str, items: list[tuple[str, int]], accent: str) -> str:
    if not items:
        return ""
    rows = [
        f"<div style='font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;"
        f"color:{accent};margin:0 0 14px;'>{html.escape(title)}</div>"
    ]
    for name, count in items[:5]:
        rows.append(
            f"<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='margin:0 0 10px;'>"
            f"<tr><td style='font-size:13px;color:{_INK_SOFT};padding:0;line-height:1.4;'>"
            f"{html.escape(name)}</td>"
            f"<td align='right' style='font-size:12px;font-weight:700;color:{accent};"
            f"white-space:nowrap;padding-left:8px;'>{count}</td></tr></table>"
        )
    return (
        f"<td style='vertical-align:top;width:33%;padding:0 5px;'>"
        f"<div style='background:{_CREAM};border:1px solid {_BORDER};border-radius:12px;"
        "padding:16px;height:100%;'>"
        + "".join(rows)
        + "</div></td>"
    )


def _insights_section(
    role_counts: list[tuple[str, int]],
    city_counts: list[tuple[str, int]],
    company_counts: list[tuple[str, int]],
) -> str:
    cells = (
        _insight_card("Top Roles", role_counts, _ACCENT)
        + _insight_card("Hot Cities", city_counts, "#d97706")
        + _insight_card("Hiring Companies", company_counts, "#059669")
    )
    if not cells:
        return ""
    return (
        f"<h2 style='font-family:Georgia,Times New Roman,serif;font-size:18px;font-weight:700;"
        f"color:{_NAVY};margin:28px 0 14px;'>Market insights</h2>"
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' "
        f"style='border-collapse:separate;border-spacing:0;'><tr>{cells}</tr></table>"
    )


def _why_section(topic: str, loc: str) -> str:
    return (
        f"<div style='background:{_NAVY};border-radius:12px;padding:20px 22px;margin:28px 0 0;'>"
        f"<div style='font-size:14px;font-weight:700;color:{_CREAM};margin:0 0 8px;'>"
        "Why these roles?</div>"
        f"<p style='font-size:13px;line-height:1.65;color:#cbd5e1;margin:0;'>"
        f"We scan public job boards daily for <strong style='color:#ffffff;'>{topic}</strong> roles across "
        f"<strong style='color:#ffffff;'>{loc}</strong>, filter for intern, fresher and early-career openings, "
        "drop expired links, and deduplicate so you only see fresh, live postings worth your time.</p></div>"
    )


def _source_badge(source: str) -> str:
    colors = {
        "indeed": ("#eef4ff", "#1d4ed8"),
        "google": ("#ecfdf5", "#047857"),
        "linkedin": ("#eff6ff", "#0369a1"),
        "naukri": ("#fff7ed", "#c2410c"),
    }
    bg, fg = colors.get(source.lower(), ("#f1f5f9", _MUTED))
    return (
        f"<span style='display:inline-block;background:{bg};color:{fg};font-size:10px;"
        "font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding:3px 9px;"
        f"border-radius:999px;'>{html.escape(source)}</span>"
    )


def _featured_two_col(selected: list[dict[str, Any]], default_loc: str) -> str:
    """Render featured roles in an email-safe 2-column job-card grid."""
    if not selected:
        return ""

    def card(job: dict[str, Any]) -> str:
        title = html.escape(job.get("title") or "Untitled")
        company = html.escape(job.get("company") or "Company not listed")
        job_loc = html.escape(job.get("location") or default_loc)
        posted = _format_job_date(job)
        source = (job.get("source") or "").strip()
        apply_url = html.escape(str(job.get("applyUrl") or job.get("jobUrl") or "#"), quote=True)
        snippet = html.escape(_short_description(job.get("description"), 100))

        badge_html = _source_badge(source) if source else ""
        date_html = (
            f"<span style='color:{_FAINT};font-size:11px;'>{html.escape(posted)}</span>" if posted else ""
        )
        meta_row = ""
        if badge_html or date_html:
            sep = (
                f"<span style='color:{_FAINT};font-size:11px;margin:0 6px;'>&middot;</span>"
                if badge_html and date_html
                else ""
            )
            meta_row = f"<div style='margin:10px 0 0;'>{badge_html}{sep}{date_html}</div>"

        desc_html = ""
        if snippet:
            desc_html = (
                f"<p style='margin:10px 0 0;font-size:12px;line-height:1.5;color:{_MUTED};'>{snippet}</p>"
            )

        return (
            f"<div style='border:1px solid {_BORDER};border-left:4px solid {_ACCENT};border-radius:12px;"
            f"padding:16px 18px;background:{_WHITE};height:100%;'>"
            f"<div style='font-family:Georgia,Times New Roman,serif;font-weight:700;font-size:16px;"
            f"margin:0 0 6px;color:{_NAVY};line-height:1.35;'>{title}</div>"
            f"<div style='color:{_INK_SOFT};font-size:13px;font-weight:600;'>{company}</div>"
            f"<div style='color:{_MUTED};font-size:12px;margin-top:3px;'>{job_loc}</div>"
            f"{desc_html}"
            f"{meta_row}"
            f"<p style='margin:14px 0 0;'><a href='{apply_url}' "
            f"style='display:inline-block;background:{_NAVY};color:#ffffff;font-weight:700;"
            "text-decoration:none;font-size:13px;padding:9px 18px;border-radius:999px;'>Apply &rarr;</a></p>"
            "</div>"
        )

    rows: list[str] = []
    for i in range(0, len(selected), 2):
        left = card(selected[i])
        right = card(selected[i + 1]) if i + 1 < len(selected) else "<div></div>"
        rows.append(
            "<tr>"
            f"<td style='width:50%;vertical-align:top;padding:0 6px 14px 0;'>{left}</td>"
            f"<td style='width:50%;vertical-align:top;padding:0 0 14px 6px;'>{right}</td>"
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
