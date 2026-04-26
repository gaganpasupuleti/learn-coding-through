"""
structured_parser.py – Hybrid Heuristic Resume Parser.

Pass 1: Regex-based matching for standard section headers.
Pass 2: spaCy semantic similarity fallback for non-standard headers.

Requires ``en_core_web_md`` (or larger) for meaningful similarity scores.
"""

from __future__ import annotations

import logging
import re

import spacy

logger = logging.getLogger(__name__)

# ── Load spaCy model (md required for word vectors) ─────────────────

try:
    _nlp = spacy.load("en_core_web_md")
except OSError:
    try:
        _nlp = spacy.load("en_core_web_sm")
        logger.warning(
            "en_core_web_md not found; falling back to en_core_web_sm "
            "(semantic similarity will be degraded)"
        )
    except OSError:
        _nlp = None
        logger.error("No spaCy model available – structured parsing will be limited")

# ── Baseline target vectors for semantic similarity ──────────────────

_TARGETS: dict[str, object] = {}
if _nlp is not None:
    _TARGETS = {
        "contact_info": _nlp("contact information phone email address"),
        "summary": _nlp("summary profile objective about me"),
        "experience": _nlp("experience employment work history professional background"),
        "education": _nlp("education academic qualifications degree university"),
        "projects": _nlp("projects portfolio personal projects student projects"),
        "skills": _nlp("skills competencies technologies technical skills tools"),
    }

# ── Pass 1: Regex patterns for standard headers ─────────────────────

_HEADER_PATTERNS: dict[str, re.Pattern[str]] = {
    "contact_info": re.compile(
        r"^(?:CONTACT\s+(?:INFO(?:RMATION)?|DETAILS)|PERSONAL\s+(?:INFO(?:RMATION)?|DETAILS))\b",
        re.IGNORECASE,
    ),
    "summary": re.compile(
        r"^(?:(?:PROFESSIONAL|CAREER|EXECUTIVE)\s+)?(?:SUMMARY|PROFILE|OBJECTIVE|ABOUT\s+ME)\b",
        re.IGNORECASE,
    ),
    "experience": re.compile(
        r"^(?:[\w\s]+)?(?:EXPERIENCE|WORK\s+HISTORY|EMPLOYMENT)(?:\s+[\w\s\-\d]+)?\b",
        re.IGNORECASE,
    ),
    "education": re.compile(
        r"^(?:[\w\s]+)?(?:EDUCATION|ACADEMIC\s+BACKGROUND)(?:\s+[\w\s\-\d]+)?\b",
        re.IGNORECASE,
    ),
    "projects": re.compile(
        r"^(?:(?:STUDENT|PERSONAL|ACADEMIC|KEY)\s+)?PROJECTS?\b",
        re.IGNORECASE,
    ),
    "skills": re.compile(
        r"^(?:(?:TECHNICAL|CORE|KEY)\s+)?(?:SKILLS|COMPETENCIES|TECHNOLOGIES|EXPERTISE)\b",
        re.IGNORECASE,
    ),
}

_SIMILARITY_THRESHOLD = 0.70
_MAX_HEADER_WORDS = 5


# ── Helpers ──────────────────────────────────────────────────────────

def _looks_like_header(line: str) -> bool:
    """Heuristic: short line that is mostly uppercase or title-case."""
    words = line.split()
    if not words or len(words) > _MAX_HEADER_WORDS:
        return False
    upper_count = sum(1 for w in words if w[0].isupper())
    return upper_count / len(words) >= 0.6


def _regex_match(line: str) -> str | None:
    """Return the section key if *line* matches a known regex header."""
    stripped = line.strip()
    for key, pattern in _HEADER_PATTERNS.items():
        if pattern.search(stripped):
            return key
    return None


def _similarity_match(line: str) -> str | None:
    """Return the section key if *line* is semantically close to a target."""
    if _nlp is None or not _TARGETS:
        return None
    doc = _nlp(line.strip())
    if not doc.vector_norm:
        return None
    best_key: str | None = None
    best_score = _SIMILARITY_THRESHOLD
    for key, target_doc in _TARGETS.items():
        score = doc.similarity(target_doc)
        if score > best_score:
            best_score = score
            best_key = key
    return best_key


# ── Public API ───────────────────────────────────────────────────────

def parse_resume_structure(raw_text: str) -> dict[str, str]:
    """Parse raw resume text into structured sections.

    Uses a two-pass approach:
      1. Regex matching for standard section headers.
      2. spaCy semantic similarity for non-standard headers.

    Returns a dict with keys: ``contact_info``, ``summary``,
    ``experience``, ``education``, ``projects``, ``skills``.
    """
    sections: dict[str, list[str]] = {
        "contact_info": [],
        "summary": [],
        "experience": [],
        "education": [],
        "projects": [],
        "skills": [],
    }

    current_section: str | None = None
    lines = raw_text.splitlines()

    # First few lines (before any header) are typically contact info
    preamble_consumed = False

    for line in lines:
        stripped = line.strip()
        if not stripped:
            # Blank line while in summary → stop accumulating summary
            if current_section == "summary":
                current_section = None
            continue

        # ── Summary bleed guard ──────────────────────────────────
        # Short non-sentence lines while in summary likely belong to next section
        if current_section == "summary":
            if len(stripped) < 50 and not stripped.endswith((".", "!", "?", ":")):
                current_section = None
                # Fall through to header detection below

        # ── Try regex first ──────────────────────────────────────
        matched = _regex_match(stripped)
        if matched:
            current_section = matched
            preamble_consumed = True
            continue

        # ── Try semantic similarity for short, header-like lines ─
        if _looks_like_header(stripped) and not matched:
            sem_match = _similarity_match(stripped)
            if sem_match:
                current_section = sem_match
                preamble_consumed = True
                continue

        # ── Assign content to current section ────────────────────
        if current_section:
            sections[current_section].append(stripped)
        elif not preamble_consumed:
            # Pre-header content → contact info
            sections["contact_info"].append(stripped)

    return {key: "\n".join(lines_list) for key, lines_list in sections.items()}
