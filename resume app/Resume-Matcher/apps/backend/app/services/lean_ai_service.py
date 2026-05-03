"""
lean_ai_service.py – Hybrid local / cloud AI suggestion generator.

Sends a minimal prompt (job role + missing skills only) to either a
local Ollama instance or the Hugging Face Serverless Inference API,
controlled by the USE_LOCAL_AI environment variable.

No resume text is included in the prompt.
"""

from __future__ import annotations

import json
import logging
import os
import urllib.error
import urllib.request

logger = logging.getLogger(__name__)

# ── Configuration ────────────────────────────────────────────────────

# Local Ollama endpoint (Gemma 3 4B is already running on this box).
_OLLAMA_URL = "http://localhost:11434/api/generate"
_OLLAMA_MODEL = "gemma3:4b"
_TIMEOUT_SECONDS = 30

# Hugging Face Serverless Inference
_HF_MODEL = "HuggingFaceH4/zephyr-7b-beta"

_FALLBACK_MESSAGE = (
    "AI suggestions are temporarily unavailable. "
    "Please review the missing skills list above and consider adding "
    "relevant projects or certifications to strengthen your resume."
)

_HF_FALLBACK_MESSAGE = (
    "Consider updating your experience section to explicitly mention "
    "the missing skills identified in the ATS scan."
)


def _build_prompt(job_role: str, missing_skills: list[str]) -> str:
    """Build a lean prompt that avoids sending any resume text."""
    skills_str = ", ".join(missing_skills[:15])  # cap to control token usage
    return (
        f"A candidate is applying for a {job_role} role. "
        f"Their resume is missing these skills: {skills_str}.\n\n"
        "Give exactly 3 short bullet points (one sentence each) on how "
        "the candidate can add or demonstrate these skills on their resume. "
        "Do not repeat the skills verbatim; give actionable advice."
    )


# ── Ollama (local) ──────────────────────────────────────────────────

def _get_suggestions_ollama(prompt: str) -> str:
    payload = json.dumps({
        "model": _OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.4,
            "num_predict": 200,
        },
    }).encode()

    req = urllib.request.Request(
        _OLLAMA_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=_TIMEOUT_SECONDS) as resp:
            body = json.loads(resp.read().decode())
            return body.get("response", _FALLBACK_MESSAGE).strip()
    except urllib.error.URLError as exc:
        logger.warning("Local AI server unreachable: %s", exc)
        return _FALLBACK_MESSAGE
    except Exception as exc:
        logger.warning("Unexpected error calling local AI: %s", exc)
        return _FALLBACK_MESSAGE


# ── Hugging Face (cloud) ────────────────────────────────────────────

def _get_suggestions_huggingface(prompt: str) -> str:
    try:
        from huggingface_hub import InferenceClient
        from app.config import settings

        hf_token = settings.huggingface_api_key or os.getenv("HF_API_KEY")
        if not hf_token:
            logger.warning("Hugging Face API key is missing. Using fallback message.")
            return _HF_FALLBACK_MESSAGE
            
        client = InferenceClient(token=hf_token)
        response = client.text_generation(
            prompt,
            model=_HF_MODEL,
            max_new_tokens=200,
            temperature=0.4,
        )
        return response.strip() if response else _HF_FALLBACK_MESSAGE
    except Exception as exc:
        logger.warning("Hugging Face API error: %s", exc)
        return _HF_FALLBACK_MESSAGE


# ── Public API ───────────────────────────────────────────────────────

def get_suggestions(job_role: str, missing_skills: list[str]) -> str:
    """Return AI-generated improvement suggestions.

    Parameters
    ----------
    job_role:
        The target job title (e.g. "Backend Engineer").
    missing_skills:
        List of skills/keywords absent from the resume.

    Returns
    -------
    str
        Three bullet-point suggestions, or a fallback message if the
        AI backend is unreachable.
    """
    if not missing_skills:
        return "Your resume already covers the key skills for this role."

    prompt = _build_prompt(job_role, missing_skills)

    use_local = os.getenv("USE_LOCAL_AI", "true").lower() == "true"
    if use_local:
        return _get_suggestions_ollama(prompt)
    return _get_suggestions_huggingface(prompt)
