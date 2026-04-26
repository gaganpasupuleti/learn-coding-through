"""
deterministic_formatter.py – Pure-Python formatting layer.

Converts the flat string dict from ``parse_resume_structure`` into
structured JSON arrays.  No AI, LLMs, or external API calls.
"""

from __future__ import annotations

import re


def format_parsed_data(parsed_data: dict) -> dict:
    """Cast raw parsed strings into the ``FinalStructuredResume`` shape.

    Parameters
    ----------
    parsed_data:
        Dictionary returned by ``parse_resume_structure`` with keys
        *contact_info*, *summary*, *experience*, *education*, *projects*,
        *skills*.

    Returns
    -------
    dict
        Deterministically structured version with lists/dicts where
        appropriate.
    """
    return {
        "contact_info": (parsed_data.get("contact_info") or "").strip(),
        "summary": (parsed_data.get("summary") or "").strip(),
        "skills": _format_skills(parsed_data.get("skills", "")),
        "projects": _format_projects(parsed_data.get("projects", "")),
        "experience": _format_blocks(parsed_data.get("experience", "")),
        "education": _format_blocks(parsed_data.get("education", "")),
    }


# ── Skills ───────────────────────────────────────────────────────────

def _format_skills(raw: str) -> list[str]:
    """Split by newlines, commas, or bullet characters and return a
    deduplicated, non-empty list of skill strings."""
    if not raw or not raw.strip():
        return []
    parts = re.split(r"[\n,•\-]+", raw)
    seen: set[str] = set()
    result: list[str] = []
    for p in parts:
        cleaned = p.strip()
        if cleaned and cleaned.lower() not in seen:
            seen.add(cleaned.lower())
            result.append(cleaned)
    return result


# ── Projects ─────────────────────────────────────────────────────────

def _format_projects(raw: str) -> list[dict]:
    """Each non-trivial line becomes a project dict with *title* and
    *description*."""
    if not raw or not raw.strip():
        return []
    projects: list[dict] = []
    for line in raw.split("\n"):
        stripped = line.strip()
        if len(stripped) > 3:
            title = stripped.lstrip("•-– ").strip()
            projects.append({"title": title, "description": ""})
    return projects


# ── Experience / Education blocks ────────────────────────────────────

def _format_blocks(raw: str) -> list[dict]:
    """Split on double newlines; each block is treated as one entry."""
    if not raw or not raw.strip():
        return []
    blocks = re.split(r"\n{2,}", raw.strip())
    result: list[dict] = []
    for block in blocks:
        block = block.strip()
        if not block:
            continue
        lines = block.split("\n")
        heading = lines[0].lstrip("•-– ").strip()
        description = "\n".join(lines[1:]).strip() if len(lines) > 1 else ""
        result.append({
            "company": heading,
            "role": "",
            "duration": "",
            "description": description,
        })
    return result
