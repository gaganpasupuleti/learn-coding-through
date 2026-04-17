"""
ats_scorer.py – Local ATS scoring via keyword intersection.

Compares resume text against a job description using basic NLP
tokenisation (spaCy when available, regex fallback) to produce a
match score, matching skills, and missing skills.

No LLM calls are made; all processing is local.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

try:
    import spacy

    try:
        _nlp = spacy.load("en_core_web_sm")
    except OSError:
        _nlp = None
except ImportError:
    _nlp = None


# ── Helpers ──────────────────────────────────────────────────────────

_TOKEN_RE = re.compile(r"[a-zA-Z#+\-\.]{2,}")

# Common English stop-words (kept small so we don't need NLTK).
_STOP_WORDS: set[str] = {
    "a", "an", "the", "and", "or", "but", "is", "are", "was", "were",
    "in", "on", "at", "to", "for", "of", "with", "by", "from", "as",
    "it", "that", "this", "be", "have", "has", "had", "do", "does",
    "did", "will", "would", "could", "should", "may", "can", "not",
    "so", "if", "then", "than", "no", "yes", "we", "you", "i", "my",
    "our", "your", "they", "their", "its", "he", "she", "about",
    "also", "been", "being", "more", "such", "into", "over", "after",
    "each", "all", "any", "most", "other", "some", "very", "up",
}


def _tokenise(text: str) -> set[str]:
    """Extract meaningful lowercase tokens from *text*."""
    if _nlp is not None:
        doc = _nlp(text)
        return {
            token.lemma_.lower()
            for token in doc
            if not token.is_stop and not token.is_punct and len(token.text) >= 2
        }
    # Regex fallback when spaCy model is not installed.
    return {
        tok.lower()
        for tok in _TOKEN_RE.findall(text)
        if tok.lower() not in _STOP_WORDS
    }


# ── Public API ───────────────────────────────────────────────────────

@dataclass
class ATSResult:
    ats_score: int
    matching_skills: list[str] = field(default_factory=list)
    missing_skills: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "ats_score": self.ats_score,
            "matching_skills": self.matching_skills,
            "missing_skills": self.missing_skills,
        }


def score_resume(resume_text: str, job_description_text: str) -> ATSResult:
    """Score a resume against a job description.

    Parameters
    ----------
    resume_text:
        Plain text extracted from the candidate's resume.
    job_description_text:
        Plain text of the target job description.

    Returns
    -------
    ATSResult
        Contains ``ats_score`` (0-100), ``matching_skills``, and
        ``missing_skills``.
    """
    resume_tokens = _tokenise(resume_text)
    jd_tokens = _tokenise(job_description_text)

    if not jd_tokens:
        return ATSResult(ats_score=0, matching_skills=[], missing_skills=[])

    matching = sorted(resume_tokens & jd_tokens)
    missing = sorted(jd_tokens - resume_tokens)

    score = round((len(matching) / len(jd_tokens)) * 100)
    score = min(score, 100)

    return ATSResult(
        ats_score=score,
        matching_skills=matching,
        missing_skills=missing,
    )
