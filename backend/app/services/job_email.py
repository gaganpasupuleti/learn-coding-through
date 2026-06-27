"""Job digest email preview and send for Code Quest jobs feature."""

from __future__ import annotations

import html
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

from app.core.config import settings
from app.services.email_brevo import send_brevo_email

logger = logging.getLogger(__name__)

FOOTER_TEXT = (
    "This is a Code Quest job alert. Listings are scraped from public job boards for practice and discovery. "
    "Apply via the original posting links."
)
FOOTER_HTML = (
    "<p style='color:#64748b;font-size:12px;margin-top:24px;'>"
    "This is a <strong>Code Quest</strong> job alert. Listings are scraped from public job boards. "
    "Apply via the original posting links."
    "</p>"
)


def _short_description(text: str | None, limit: int = 200) -> str:
    if not text:
        return ""
    cleaned = " ".join(text.split())
    if len(cleaned) <= limit:
        return cleaned
    return cleaned[: limit - 1].rstrip() + "…"


def build_digest(
    jobs: list[dict[str, Any]],
    *,
    search_term: str = "python developer",
    location: str = "India",
    max_jobs: int = 20,
) -> tuple[str, str, str]:
    """Return (subject, html, text) for up to max_jobs listings."""
    top = jobs[:max_jobs]
    subject = f"Code Quest Job Alert: {search_term} in {location} ({len(top)} roles)"

    text_lines = [
        f"Code Quest Job Alert — {search_term} in {location}",
        "",
    ]
    html_parts = [
        "<div style='font-family:system-ui,sans-serif;max-width:640px;color:#0f172a;'>",
        f"<h2 style='margin:0 0 8px;'>Code Quest Job Alert</h2>",
        f"<p style='color:#475569;margin:0 0 20px;'>{html.escape(search_term)} in {html.escape(location)}</p>",
        "<ul style='padding:0;list-style:none;'>",
    ]

    for job in top:
        title = job.get("title") or "Untitled"
        company = job.get("company") or "Company not listed"
        loc = job.get("location") or location
        source = job.get("source") or "job board"
        apply_url = job.get("applyUrl") or job.get("jobUrl") or "#"
        desc = _short_description(job.get("description"))

        text_lines.extend(
            [
                f"• {title}",
                f"  {company} · {loc} · {source}",
                f"  {apply_url}",
            ]
        )
        if desc:
            text_lines.append(f"  {desc}")
        text_lines.append("")

        html_parts.append(
            "<li style='border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:12px;'>"
            f"<div style='font-size:11px;color:#64748b;text-transform:uppercase;'>{html.escape(str(source))}</div>"
            f"<div style='font-weight:600;font-size:16px;margin:4px 0;'>{html.escape(title)}</div>"
            f"<div style='color:#475569;font-size:14px;'>{html.escape(company)} · {html.escape(loc)}</div>"
        )
        if desc:
            html_parts.append(f"<p style='color:#64748b;font-size:13px;margin:8px 0 0;'>{html.escape(desc)}</p>")
        html_parts.append(
            f"<p style='margin:12px 0 0;'><a href='{html.escape(str(apply_url), quote=True)}' "
            "style='color:#2563eb;font-weight:600;'>Apply →</a></p></li>"
        )

    html_parts.append("</ul>")
    html_parts.append(FOOTER_HTML)
    html_parts.append("</div>")
    text_lines.append(FOOTER_TEXT)

    return subject, "".join(html_parts), "\n".join(text_lines)


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
