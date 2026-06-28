"""Brevo (Sendinblue) transactional email via HTTPS API."""

from __future__ import annotations

import logging

import requests

from app.core.config import settings

logger = logging.getLogger(__name__)

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def brevo_configured() -> bool:
    return bool(settings.brevo_api_key and settings.email_from_address)


def send_brevo_email(
    *,
    to_addrs: list[str],
    subject: str,
    html_body: str,
    text_body: str,
) -> tuple[int, list[str]]:
    """Send one transactional message per recipient. Returns (sent_count, failed_emails)."""
    if not settings.brevo_api_key:
        raise ValueError("Brevo is not configured (BREVO_API_KEY required)")
    if not settings.email_from_address:
        raise ValueError("Brevo sender not configured (EMAIL_FROM_ADDRESS required)")

    sender = {
        "email": settings.email_from_address,
        "name": settings.email_from_name or "Code Quest",
    }
    headers = {
        "api-key": settings.brevo_api_key,
        "Content-Type": "application/json",
        "accept": "application/json",
    }

    sent = 0
    failed: list[str] = []
    for addr in to_addrs:
        payload = {
            "sender": sender,
            "to": [{"email": addr}],
            "subject": subject,
            "htmlContent": html_body,
            "textContent": text_body,
        }
        try:
            resp = requests.post(BREVO_API_URL, json=payload, headers=headers, timeout=30)
            if resp.status_code >= 400:
                detail = _safe_brevo_error(resp)
                failed.append(f"{addr}: {detail}")
                logger.warning("Brevo send failed for %s: %s", addr, detail)
                continue
            sent += 1
            logger.info("Job digest sent via Brevo to %s", addr)
        except requests.RequestException as exc:
            logger.exception("Brevo request failed for %s", addr)
            failed.append(f"{addr}: Brevo request failed ({type(exc).__name__})")

    return sent, failed


def _safe_brevo_error(resp: requests.Response) -> str:
    """Return a provider error string without leaking API keys."""
    try:
        body = resp.json()
        message = body.get("message") or body.get("code") or ""
        if message:
            return f"Brevo send failed ({message})"
    except ValueError:
        pass
    return f"Brevo send failed (HTTP {resp.status_code})"
