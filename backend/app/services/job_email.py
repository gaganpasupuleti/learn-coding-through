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
    top_roles: list[str] = field(default_factory=list)
    top_companies: list[str] = field(default_factory=list)
    top_locations: list[str] = field(default_factory=list)
    source_split: dict[str, int] = field(default_factory=dict)

    def as_dict(self) -> dict[str, Any]:
        return {
            "totalActiveJobs": self.total_active_jobs,
            "selectedJobsCount": self.selected_jobs_count,
            "recentJobsCount": self.recent_jobs_count,
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


def _top_values(jobs: list[dict[str, Any]], key: str, limit: int = 5) -> list[str]:
    counter: Counter[str] = Counter()
    for job in jobs:
        raw = (job.get(key) or "").strip()
        if raw:
            counter[raw] += 1
    return [name for name, _ in counter.most_common(limit)]


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
) -> DigestSummary:
    return DigestSummary(
        total_active_jobs=total_active_jobs,
        selected_jobs_count=len(selected),
        recent_jobs_count=_recent_jobs_count(selected),
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
    subject_override: str | None = None,
    intro_message: str | None = None,
    cta_label: str | None = None,
    cta_url: str | None = None,
) -> DigestContent:
    """Build client-ready digest HTML/text with summary insights."""
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
    summary = build_digest_summary(jobs, total_active_jobs=total, selected=selected)

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

    cta_html = ""
    cta_text = ""
    if opts.cta_url and (opts.cta_label or True):
        label = html.escape(opts.cta_label or "Browse jobs on Code Quest")
        safe_url = html.escape(opts.cta_url, quote=True)
        cta_html = (
            f"<p style='text-align:center;margin:28px 0 8px;'>"
            f"<a href='{safe_url}' style='display:inline-block;background:#4f46e5;color:#fff;"
            f"font-weight:600;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;'>"
            f"{label}</a></p>"
        )
        cta_text = f"{opts.cta_label or 'Browse jobs on Code Quest'}: {opts.cta_url}\n\n"

    summary_cards = (
        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' "
        "style='margin:0 0 20px;border-collapse:separate;border-spacing:8px;'>"
        "<tr>"
        f"<td style='background:#eef2ff;border-radius:10px;padding:12px;text-align:center;width:33%;'>"
        f"<div style='font-size:22px;font-weight:700;color:#312e81;'>{summary.total_active_jobs}</div>"
        f"<div style='font-size:11px;color:#6366f1;text-transform:uppercase;'>Active jobs</div></td>"
        f"<td style='background:#f0fdf4;border-radius:10px;padding:12px;text-align:center;width:33%;'>"
        f"<div style='font-size:22px;font-weight:700;color:#14532d;'>{summary.selected_jobs_count}</div>"
        f"<div style='font-size:11px;color:#16a34a;text-transform:uppercase;'>In digest</div></td>"
        f"<td style='background:#fff7ed;border-radius:10px;padding:12px;text-align:center;width:33%;'>"
        f"<div style='font-size:22px;font-weight:700;color:#9a3412;'>{summary.recent_jobs_count}</div>"
        f"<div style='font-size:11px;color:#ea580c;text-transform:uppercase;'>New (7d)</div></td>"
        "</tr></table>"
    )

    insights_html = _insights_section(summary, topic, loc)

    job_cards_html: list[str] = []
    text_lines = [
        f"Code Quest Job Alert — {opts.search_term} in {opts.location}",
        f"Active: {summary.total_active_jobs} | In digest: {summary.selected_jobs_count} | New (7d): {summary.recent_jobs_count}",
        "",
    ]
    if opts.intro_message:
        text_lines.insert(2, opts.intro_message)

    for job in selected:
        title = job.get("title") or "Untitled"
        company = job.get("company") or "Company not listed"
        job_loc = job.get("location") or opts.location
        source = job.get("source") or "job board"
        apply_url = job.get("applyUrl") or job.get("jobUrl") or "#"
        desc = _short_description(job.get("description"))

        text_lines.extend([f"• {title}", f"  {company} · {job_loc} · {source}", f"  {apply_url}"])
        if desc:
            text_lines.append(f"  {desc}")
        text_lines.append("")

        card = (
            "<div style='border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:12px;background:#fff;'>"
            f"<div style='font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;'>{html.escape(str(source))}</div>"
            f"<div style='font-weight:600;font-size:16px;margin:6px 0 4px;color:#0f172a;'>{html.escape(title)}</div>"
            f"<div style='color:#475569;font-size:14px;'>{html.escape(company)} · {html.escape(job_loc)}</div>"
        )
        if desc:
            card += f"<p style='color:#64748b;font-size:13px;margin:10px 0 0;line-height:1.5;'>{html.escape(desc)}</p>"
        card += (
            f"<p style='margin:14px 0 0;'><a href='{html.escape(str(apply_url), quote=True)}' "
            "style='color:#4f46e5;font-weight:600;text-decoration:none;font-size:14px;'>Apply →</a></p></div>"
        )
        job_cards_html.append(card)

    html_body = (
        "<div style='font-family:system-ui,-apple-system,sans-serif;max-width:640px;margin:0 auto;color:#0f172a;'>"
        "<div style='background:linear-gradient(135deg,#312e81,#4f46e5);border-radius:12px 12px 0 0;padding:24px;color:#fff;'>"
        "<div style='font-size:11px;text-transform:uppercase;letter-spacing:0.1em;opacity:0.85;'>Code Quest</div>"
        "<h1 style='margin:8px 0 0;font-size:22px;font-weight:700;'>Job Alert Digest</h1>"
        f"<p style='margin:8px 0 0;opacity:0.9;font-size:14px;'>{topic} · {loc}</p>"
        "</div>"
        "<div style='background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;'>"
        f"{intro_html}{summary_cards}{insights_html}"
        "<h2 style='font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;margin:0 0 12px;'>Featured roles</h2>"
        f"{''.join(job_cards_html)}"
        f"{cta_html}"
        "<p style='color:#94a3b8;font-size:11px;margin-top:24px;line-height:1.5;border-top:1px solid #e2e8f0;padding-top:16px;'>"
        "This is a <strong>Code Quest</strong> job alert. Listings are scraped from public job boards. "
        "Apply via the original posting links.</p>"
        "</div></div>"
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


def _insights_section(summary: DigestSummary, topic: str, loc: str) -> str:
    parts: list[str] = [
        "<div style='background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:20px;'>",
        "<h2 style='font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;margin:0 0 12px;'>Top insights</h2>",
        "<table role='presentation' width='100%' style='font-size:13px;color:#334155;'>",
    ]

    def row(label: str, items: list[str]) -> None:
        if not items:
            return
        parts.append(
            f"<tr><td style='padding:4px 0;vertical-align:top;width:110px;font-weight:600;color:#475569;'>{label}</td>"
            f"<td style='padding:4px 0;'>{html.escape(', '.join(items[:5]))}</td></tr>"
        )

    row("Top roles", summary.top_roles)
    row("Top companies", summary.top_companies)
    row("Locations", summary.top_locations)
    if summary.source_split:
        split = ", ".join(f"{k}: {v}" for k, v in summary.source_split.items())
        parts.append(
            f"<tr><td style='padding:4px 0;vertical-align:top;font-weight:600;color:#475569;'>Sources</td>"
            f"<td style='padding:4px 0;'>{html.escape(split)}</td></tr>"
        )
    parts.append("</table></div>")
    return "".join(parts)


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
