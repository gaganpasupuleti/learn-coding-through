"""LLM Semantic Coercion service via Hugging Face Inference API."""

from __future__ import annotations

import asyncio
import json
import os

from huggingface_hub import InferenceClient

from app.services.deterministic_formatter import format_parsed_data


client = InferenceClient(token=os.getenv("HUGGINGFACE_API_KEY"))


def _normalize_coercion_output(candidate: object, raw_text_dict: dict) -> dict:
    """Return a schema-safe resume payload or deterministic fallback."""
    fallback = format_parsed_data(raw_text_dict)
    if not isinstance(candidate, dict):
        return fallback

    merged = {
        "contact_info": candidate.get("contact_info", fallback["contact_info"]),
        "summary": candidate.get("summary", fallback["summary"]),
        "skills": candidate.get("skills", fallback["skills"]),
        "projects": candidate.get("projects", fallback["projects"]),
        "experience": candidate.get("experience", fallback["experience"]),
        "education": candidate.get("education", fallback["education"]),
    }

    if not isinstance(merged["contact_info"], str):
        merged["contact_info"] = fallback["contact_info"]
    if not isinstance(merged["summary"], str):
        merged["summary"] = fallback["summary"]

    if not isinstance(merged["skills"], list):
        merged["skills"] = fallback["skills"]
    else:
        merged["skills"] = [str(item).strip() for item in merged["skills"] if str(item).strip()]

    def _normalize_project(item: object) -> dict | None:
        if not isinstance(item, dict):
            return None
        return {
            "title": str(item.get("title", "")).strip(),
            "description": str(item.get("description", "")).strip(),
        }

    def _normalize_experience(item: object) -> dict | None:
        if not isinstance(item, dict):
            return None
        return {
            "company": str(item.get("company", "")).strip(),
            "role": str(item.get("role", "")).strip(),
            "duration": str(item.get("duration", "")).strip(),
            "description": str(item.get("description", "")).strip(),
        }

    if not isinstance(merged["projects"], list):
        merged["projects"] = fallback["projects"]
    else:
        merged_projects = [_normalize_project(item) for item in merged["projects"]]
        merged["projects"] = [item for item in merged_projects if item is not None] or fallback["projects"]

    if not isinstance(merged["experience"], list):
        merged["experience"] = fallback["experience"]
    else:
        merged_experience = [_normalize_experience(item) for item in merged["experience"]]
        merged["experience"] = [item for item in merged_experience if item is not None] or fallback["experience"]

    if not isinstance(merged["education"], list):
        merged["education"] = fallback["education"]
    else:
        merged_education = [_normalize_experience(item) for item in merged["education"]]
        merged["education"] = [item for item in merged_education if item is not None] or fallback["education"]

    return merged


def _strip_markdown_fences(text: str) -> str:
    """Strip common markdown code fence wrappers from model output."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:].strip()
    return cleaned.strip()


def _extract_json_object(text: str) -> str:
    """Extract the outermost JSON object if the response includes extra text."""
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end < start:
        return text
    return text[start : end + 1]


async def coerce_resume_json(raw_text_dict: dict) -> dict:
    """Coerce categorized resume text into strict structured JSON using HF.

    Falls back to deterministic formatting if model output is not valid JSON.
    """
    model = "mistralai/Mistral-7B-Instruct-v0.3"

    prompt = f"""
You are a strict data formatting API.
Convert the following categorized text into a strict JSON object matching this schema:
{{
  "skills": ["skill1", "skill2"],
  "projects": [{{"title": "Project Name", "description": "Project details"}}],
  "experience": [{{"company": "Company", "role": "Role", "duration": "Duration", "description": "Details"}}]
}}

Data to format:
{raw_text_dict}

RETURN ONLY VALID JSON. DO NOT INCLUDE MARKDOWN FORMATTING OR BACKTICKS. DO NOT SAY "Here is your JSON".
"""

    try:
        response = await asyncio.to_thread(
            client.text_generation,
            prompt,
            max_new_tokens=2000,
            model=model,
        )

        return _normalize_coercion_output(json.loads(response), raw_text_dict)
    except json.JSONDecodeError:
        try:
            cleaned = _strip_markdown_fences(response if "response" in locals() else "")
            return _normalize_coercion_output(json.loads(cleaned), raw_text_dict)
        except json.JSONDecodeError:
            try:
                extracted = _extract_json_object(cleaned)
                return _normalize_coercion_output(json.loads(extracted), raw_text_dict)
            except Exception:
                return format_parsed_data(raw_text_dict)
    except Exception:
        return format_parsed_data(raw_text_dict)
