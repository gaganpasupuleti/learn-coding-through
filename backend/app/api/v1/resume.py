import io
import json
from datetime import datetime

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import Resume, Role, User


router = APIRouter(prefix="/resume", tags=["Resume"])


# ── Schemas ───────────────────────────────────────────────────────────


class PersonalInfo(BaseModel):
    name: str = ""
    title: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    website: str | None = None
    linkedin: str | None = None
    github: str | None = None


class ExperienceItem(BaseModel):
    id: int | None = None
    job_title: str = ""
    company: str = ""
    location: str = ""
    start_date: str = ""
    end_date: str = ""
    bullets: list[str] = Field(default_factory=list)


class EducationItem(BaseModel):
    id: int | None = None
    institution: str = ""
    degree: str = ""
    field: str = ""
    start_date: str = ""
    end_date: str = ""
    description: str = ""


class ProjectItem(BaseModel):
    id: int | None = None
    name: str = ""
    role: str = ""
    dates: str = ""
    url: str = ""
    bullets: list[str] = Field(default_factory=list)


class CertificationItem(BaseModel):
    id: int | None = None
    name: str = ""
    issuer: str = ""
    date: str = ""
    url: str = ""


class ResumeCreateRequest(BaseModel):
    title: str = "Untitled Resume"
    template: str = "modern"
    personal_info: PersonalInfo = Field(default_factory=PersonalInfo)
    summary: str = ""
    skills: list[str] = Field(default_factory=list)
    experience: list[ExperienceItem] = Field(default_factory=list)
    education: list[EducationItem] = Field(default_factory=list)
    projects: list[ProjectItem] = Field(default_factory=list)
    certifications: list[CertificationItem] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)
    role_id: int | None = None


class ResumeUpdateRequest(BaseModel):
    title: str | None = None
    template: str | None = None
    personal_info: PersonalInfo | None = None
    summary: str | None = None
    skills: list[str] | None = None
    experience: list[ExperienceItem] | None = None
    education: list[EducationItem] | None = None
    projects: list[ProjectItem] | None = None
    certifications: list[CertificationItem] | None = None
    languages: list[str] | None = None
    role_id: int | None = None
    is_primary: bool | None = None


class ResumeResponse(BaseModel):
    id: int
    title: str
    template: str
    personal_info: dict
    summary: str
    skills: list
    experience: list
    education: list
    projects: list
    certifications: list
    languages: list
    custom_sections: dict
    role_id: int | None
    ats_score: int
    is_primary: bool
    created_at: str
    updated_at: str


class ResumeListItem(BaseModel):
    id: int
    title: str
    template: str
    ats_score: int
    is_primary: bool
    updated_at: str


# ── Helpers ───────────────────────────────────────────────────────────


def _serialize_resume(r: Resume) -> dict:
    return {
        "id": r.id,
        "title": r.title,
        "template": r.template,
        "personal_info": json.loads(r.personal_info or "{}"),
        "summary": r.summary,
        "skills": json.loads(r.skills or "[]"),
        "experience": json.loads(r.experience or "[]"),
        "education": json.loads(r.education or "[]"),
        "projects": json.loads(r.projects or "[]"),
        "certifications": json.loads(r.certifications or "[]"),
        "languages": json.loads(r.languages or "[]"),
        "custom_sections": json.loads(r.custom_sections or "{}"),
        "role_id": r.role_id,
        "ats_score": r.ats_score,
        "is_primary": r.is_primary,
        "created_at": r.created_at.isoformat() if r.created_at else "",
        "updated_at": r.updated_at.isoformat() if r.updated_at else "",
    }


def _calculate_ats_score(role_skills: list[str], user_skills: list[str]) -> int:
    if not role_skills:
        return 0
    normalized_role = {s.strip().lower() for s in role_skills}
    normalized_user = {s.strip().lower() for s in user_skills}
    matched = len(normalized_role & normalized_user)
    return int((matched / len(normalized_role)) * 100)


def _apply_payload_to_resume(resume: Resume, payload: ResumeCreateRequest | ResumeUpdateRequest, db: Session) -> None:
    field_map = {
        "title": "title",
        "template": "template",
        "summary": "summary",
        "role_id": "role_id",
    }
    json_fields = {
        "personal_info": lambda v: v.model_dump() if v else {},
        "skills": lambda v: v if v is not None else [],
        "experience": lambda v: [i.model_dump() for i in v] if v else [],
        "education": lambda v: [i.model_dump() for i in v] if v else [],
        "projects": lambda v: [i.model_dump() for i in v] if v else [],
        "certifications": lambda v: [i.model_dump() for i in v] if v else [],
        "languages": lambda v: v if v is not None else [],
    }

    for attr, col in field_map.items():
        val = getattr(payload, attr, None)
        if val is not None:
            setattr(resume, col, val)

    for attr, serializer in json_fields.items():
        val = getattr(payload, attr, None)
        if val is not None:
            setattr(resume, attr, json.dumps(serializer(val)))

    if hasattr(payload, "is_primary") and getattr(payload, "is_primary", None) is not None:
        resume.is_primary = payload.is_primary

    # Recalculate ATS score
    skills = json.loads(resume.skills or "[]")
    rid = resume.role_id
    if rid:
        role = db.query(Role).filter(Role.id == rid).first()
        role_skills = json.loads(role.skills_required) if role else []
        resume.ats_score = _calculate_ats_score(role_skills, skills)


# ── Endpoints ─────────────────────────────────────────────────────────


@router.get("/list")
def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.updated_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "title": r.title,
            "template": r.template,
            "ats_score": r.ats_score,
            "is_primary": r.is_primary,
            "updated_at": r.updated_at.isoformat() if r.updated_at else "",
        }
        for r in resumes
    ]


@router.post("/create")
def create_resume(
    payload: ResumeCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = Resume(user_id=current_user.id)
    _apply_payload_to_resume(resume, payload, db)
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return _serialize_resume(resume)


@router.get("/{resume_id}")
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return _serialize_resume(resume)


@router.patch("/{resume_id}")
def update_resume(
    resume_id: int,
    payload: ResumeUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    _apply_payload_to_resume(resume, payload, db)
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return _serialize_resume(resume)


@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    db.delete(resume)
    db.commit()
    return {"detail": "Resume deleted"}


@router.post("/{resume_id}/set-primary")
def set_primary_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    # Unset all other primaries
    db.query(Resume).filter(Resume.user_id == current_user.id, Resume.id != resume_id).update({"is_primary": False})
    resume.is_primary = True
    db.add(resume)
    db.commit()
    return {"detail": "Primary resume set"}


@router.post("/{resume_id}/duplicate")
def duplicate_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    source = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Resume not found")

    copy = Resume(
        user_id=current_user.id,
        title=f"{source.title} (Copy)",
        template=source.template,
        personal_info=source.personal_info,
        summary=source.summary,
        skills=source.skills,
        experience=source.experience,
        education=source.education,
        projects=source.projects,
        certifications=source.certifications,
        languages=source.languages,
        custom_sections=source.custom_sections,
        role_id=source.role_id,
        ats_score=source.ats_score,
        is_primary=False,
    )
    db.add(copy)
    db.commit()
    db.refresh(copy)
    return _serialize_resume(copy)


# ── Upload & extract text ─────────────────────────────────────────────

_MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB


def _extract_text_from_pdf(data: bytes) -> str:
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(io.BytesIO(data))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages).strip()
    except Exception:
        return ""


def _extract_text_from_docx(data: bytes) -> str:
    try:
        from docx import Document
        doc = Document(io.BytesIO(data))
        return "\n".join(p.text for p in doc.paragraphs).strip()
    except Exception:
        return ""


# ── Rule-based resume parser ─────────────────────────────────────────

import re

_SECTION_HEADINGS = {
    "summary": [
        r"summary", r"profile", r"about\s*me", r"objective", r"professional\s*summary",
        r"career\s*summary", r"career\s*objective", r"personal\s*statement",
    ],
    "experience": [
        r"experience", r"work\s*experience", r"professional\s*experience",
        r"employment", r"work\s*history", r"career\s*history", r"internship",
    ],
    "education": [
        r"education", r"academic", r"academics", r"qualification",
        r"educational\s*background", r"academic\s*background",
    ],
    "skills": [
        r"skills", r"technical\s*skills", r"core\s*competencies",
        r"competencies", r"technologies", r"tools", r"expertise",
        r"areas\s*of\s*expertise", r"proficiencies",
    ],
    "projects": [
        r"projects", r"personal\s*projects", r"academic\s*projects",
        r"key\s*projects", r"notable\s*projects",
    ],
    "certifications": [
        r"certifications?", r"licenses?", r"credentials",
        r"professional\s*certifications?", r"courses?",
        r"training", r"professional\s*development",
    ],
    "languages": [
        r"languages?", r"language\s*proficiency",
    ],
}

_EMAIL_RE = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
_PHONE_RE = re.compile(
    r"(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}"
)
_LINKEDIN_RE = re.compile(r"linkedin\.com/in/[a-zA-Z0-9_-]+", re.I)
_GITHUB_RE = re.compile(r"github\.com/[a-zA-Z0-9_-]+", re.I)
_URL_RE = re.compile(r"https?://[^\s,;]+")

_DATE_RANGE_RE = re.compile(
    r"(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{2,4}|"
    r"\d{1,2}/\d{2,4}|\d{4})"
    r"\s*(?:[-–—]|to)\s*"
    r"(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{2,4}|"
    r"\d{1,2}/\d{2,4}|\d{4}|[Pp]resent|[Cc]urrent|[Nn]ow)",
    re.I,
)

_SINGLE_DATE_RE = re.compile(
    r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{2,4}|\d{4}",
    re.I,
)

_DEGREE_KEYWORDS = [
    r"B\.?S\.?c?", r"M\.?S\.?c?", r"B\.?A\.?", r"M\.?A\.?", r"B\.?E\.?", r"M\.?E\.?",
    r"Ph\.?D\.?", r"MBA", r"B\.?Tech", r"M\.?Tech", r"Bachelor", r"Master",
    r"Associate", r"Diploma", r"Doctor",
]
_DEGREE_RE = re.compile(r"\b(?:" + "|".join(_DEGREE_KEYWORDS) + r")\b", re.I)


def _identify_sections(text: str) -> dict[str, str]:
    """Split raw text into named sections based on heading detection."""
    lines = text.split("\n")
    section_boundaries: list[tuple[int, str]] = []

    heading_patterns: dict[str, re.Pattern] = {}
    for section_key, patterns in _SECTION_HEADINGS.items():
        combined = "|".join(patterns)
        heading_patterns[section_key] = re.compile(
            r"^\s*(?:" + combined + r")\s*:?\s*$", re.I
        )

    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped or len(stripped) > 80:
            continue
        for section_key, pat in heading_patterns.items():
            if pat.match(stripped):
                section_boundaries.append((i, section_key))
                break

    result: dict[str, str] = {}
    if not section_boundaries:
        result["_raw"] = text
        return result

    # Content before the first heading → "header"
    first_heading_line = section_boundaries[0][0]
    header_lines = lines[:first_heading_line]
    if header_lines:
        result["header"] = "\n".join(header_lines).strip()

    for idx, (line_no, section_key) in enumerate(section_boundaries):
        next_line = (
            section_boundaries[idx + 1][0] if idx + 1 < len(section_boundaries) else len(lines)
        )
        content = "\n".join(lines[line_no + 1 : next_line]).strip()
        if section_key in result:
            result[section_key] += "\n" + content
        else:
            result[section_key] = content

    return result


def _parse_personal_info(header_text: str) -> dict:
    """Extract name, email, phone, linkedin, github, website, location from header."""
    info: dict = {
        "name": "", "title": "", "email": "", "phone": "",
        "location": "", "website": None, "linkedin": None, "github": None,
    }

    lines = [l.strip() for l in header_text.split("\n") if l.strip()]

    # Email
    em = _EMAIL_RE.search(header_text)
    if em:
        info["email"] = em.group()

    # Phone
    ph = _PHONE_RE.search(header_text)
    if ph:
        info["phone"] = ph.group().strip()

    # LinkedIn
    li = _LINKEDIN_RE.search(header_text)
    if li:
        info["linkedin"] = li.group()

    # GitHub
    gh = _GITHUB_RE.search(header_text)
    if gh:
        info["github"] = gh.group()

    # Website (first URL that isn't linkedin or github)
    for u in _URL_RE.finditer(header_text):
        url = u.group()
        if "linkedin.com" not in url and "github.com" not in url:
            info["website"] = url
            break

    # Name is typically the first non-empty line that doesn't look like contact info
    for l in lines:
        if _EMAIL_RE.search(l) or _PHONE_RE.fullmatch(l.strip()) or _URL_RE.search(l):
            continue
        if len(l) < 60 and not any(c.isdigit() for c in l[:5]):
            info["name"] = l.strip()
            break

    # Location: look for common patterns like "City, State" or "City, Country"
    for l in lines:
        if l == info["name"]:
            continue
        cleaned = l
        # Remove emails, phones, URLs
        cleaned = _EMAIL_RE.sub("", cleaned)
        cleaned = _PHONE_RE.sub("", cleaned)
        cleaned = _URL_RE.sub("", cleaned)
        cleaned = cleaned.strip(" |·•,\t-–—")
        # A short remaining segment with a comma might be location
        parts = [p.strip() for p in cleaned.split("|")]
        parts = [p.strip() for p in sum((x.split("·") for x in parts), [])]
        for part in parts:
            part = part.strip(" ,\t-–—•")
            if 3 < len(part) < 50 and "," in part and not _EMAIL_RE.search(part):
                info["location"] = part
                break
        if info["location"]:
            break

    return info


def _parse_skills(text: str) -> list[str]:
    """Extract skills list from text — split by commas, pipes, bullets, or newlines."""
    # Remove bullet characters
    text = re.sub(r"[•●◦▪▸►‣⁃]", ",", text)
    text = text.replace("|", ",").replace(";", ",").replace("\t", ",")
    # Split on commas and newlines
    parts = re.split(r"[,\n]+", text)
    skills = []
    for p in parts:
        s = p.strip().strip("- ").strip()
        if s and len(s) < 80:
            skills.append(s)
    return skills


def _parse_experience(text: str) -> list[dict]:
    """Parse experience section into structured entries."""
    entries: list[dict] = []
    lines = text.split("\n")
    current: dict | None = None

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        date_match = _DATE_RANGE_RE.search(stripped)

        # If line contains a date range, it's likely a new entry header
        if date_match:
            if current:
                entries.append(current)

            date_str = date_match.group()
            parts = re.split(r"\s*[-–—]\s*|\s+to\s+", date_str, maxsplit=1)
            start_date = parts[0].strip() if parts else ""
            end_date = parts[1].strip() if len(parts) > 1 else ""

            remaining = stripped[:date_match.start()].strip().rstrip("|,·-–—").strip()

            job_title = ""
            company = ""
            location = ""

            # Try splitting by common separators
            segments = re.split(r"\s*[|,·]\s*|\s+at\s+|\s+@\s+", remaining)
            segments = [s.strip() for s in segments if s.strip()]

            if len(segments) >= 3:
                job_title = segments[0]
                company = segments[1]
                location = segments[2]
            elif len(segments) == 2:
                job_title = segments[0]
                company = segments[1]
            elif len(segments) == 1:
                job_title = segments[0]

            current = {
                "job_title": job_title,
                "company": company,
                "location": location,
                "start_date": start_date,
                "end_date": end_date,
                "bullets": [],
            }
        elif current is not None:
            # Treat as bullet point
            bullet = re.sub(r"^[•●◦▪▸►‣⁃\-]\s*", "", stripped)
            if bullet:
                current["bullets"].append(bullet)
        else:
            # Line before any date range — might be a title/company on its own line
            if not entries and not current:
                current = {
                    "job_title": stripped,
                    "company": "",
                    "location": "",
                    "start_date": "",
                    "end_date": "",
                    "bullets": [],
                }

    if current:
        entries.append(current)

    return entries


def _parse_education(text: str) -> list[dict]:
    """Parse education section into structured entries."""
    entries: list[dict] = []
    lines = text.split("\n")
    current: dict | None = None

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        has_degree = bool(_DEGREE_RE.search(stripped))
        has_date = bool(_DATE_RANGE_RE.search(stripped) or _SINGLE_DATE_RE.search(stripped))

        if has_degree or has_date:
            if current and (current.get("degree") or current.get("institution")):
                entries.append(current)

            date_match = _DATE_RANGE_RE.search(stripped)
            start_date = ""
            end_date = ""
            if date_match:
                date_str = date_match.group()
                parts = re.split(r"\s*[-–—]\s*|\s+to\s+", date_str, maxsplit=1)
                start_date = parts[0].strip() if parts else ""
                end_date = parts[1].strip() if len(parts) > 1 else ""
                stripped_no_date = (stripped[:date_match.start()] + stripped[date_match.end():]).strip()
            else:
                single_date = _SINGLE_DATE_RE.search(stripped)
                if single_date:
                    end_date = single_date.group()
                    stripped_no_date = (stripped[:single_date.start()] + stripped[single_date.end():]).strip()
                else:
                    stripped_no_date = stripped

            stripped_no_date = stripped_no_date.strip(" ,|·-–—")

            degree = ""
            field = ""
            institution = ""

            deg_match = _DEGREE_RE.search(stripped_no_date)
            if deg_match:
                # Try to split "B.S. in Computer Science" style
                after_degree = stripped_no_date[deg_match.end():].strip()
                before_degree = stripped_no_date[:deg_match.start()].strip()
                degree = deg_match.group()

                in_match = re.match(r"\s*(?:in|of)\s+(.+)", after_degree, re.I)
                if in_match:
                    rest = in_match.group(1).strip()
                    # Split by comma/pipe for field vs institution
                    seg = re.split(r"\s*[,|·]\s*", rest)
                    field = seg[0].strip() if seg else ""
                    if len(seg) > 1:
                        institution = seg[1].strip()
                elif after_degree:
                    seg = re.split(r"\s*[,|·]\s*", after_degree)
                    field = seg[0].strip() if seg else ""
                    if len(seg) > 1:
                        institution = seg[1].strip()

                if before_degree and not institution:
                    institution = before_degree.strip(" ,|·-–—")
            else:
                institution = stripped_no_date

            if not current:
                current = {}
            current = {
                "institution": institution or (current.get("institution", "") if current else ""),
                "degree": degree,
                "field": field,
                "start_date": start_date,
                "end_date": end_date,
                "description": "",
            }
        elif current is not None:
            # Additional info line → could be institution or description
            if not current.get("institution"):
                current["institution"] = stripped
            elif not current.get("description"):
                current["description"] = stripped
            else:
                current["description"] += " " + stripped
        else:
            current = {
                "institution": stripped,
                "degree": "",
                "field": "",
                "start_date": "",
                "end_date": "",
                "description": "",
            }

    if current and (current.get("degree") or current.get("institution")):
        entries.append(current)

    return entries


def _parse_projects(text: str) -> list[dict]:
    """Parse projects section."""
    entries: list[dict] = []
    lines = text.split("\n")
    current: dict | None = None

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        is_bullet = bool(re.match(r"^[•●◦▪▸►‣⁃\-]\s", stripped))

        if not is_bullet and current is not None and len(stripped) < 120:
            # Likely a new project heading
            entries.append(current)
            url_match = _URL_RE.search(stripped)
            url = url_match.group() if url_match else ""
            name_part = _URL_RE.sub("", stripped).strip(" |·,\t-–—")

            date_match = _DATE_RANGE_RE.search(name_part)
            dates = date_match.group() if date_match else ""
            if date_match:
                name_part = (name_part[:date_match.start()] + name_part[date_match.end():]).strip(" |·,\t-–—")

            current = {"name": name_part, "role": "", "dates": dates, "url": url, "bullets": []}
        elif not is_bullet and current is None:
            url_match = _URL_RE.search(stripped)
            url = url_match.group() if url_match else ""
            name_part = _URL_RE.sub("", stripped).strip(" |·,\t-–—")

            date_match = _DATE_RANGE_RE.search(name_part)
            dates = date_match.group() if date_match else ""
            if date_match:
                name_part = (name_part[:date_match.start()] + name_part[date_match.end():]).strip(" |·,\t-–—")

            current = {"name": name_part, "role": "", "dates": dates, "url": url, "bullets": []}
        elif current is not None:
            bullet = re.sub(r"^[•●◦▪▸►‣⁃\-]\s*", "", stripped)
            if bullet:
                current["bullets"].append(bullet)

    if current:
        entries.append(current)

    return entries


def _parse_certifications(text: str) -> list[dict]:
    """Parse certifications / courses."""
    entries: list[dict] = []
    for line in text.split("\n"):
        stripped = line.strip()
        if not stripped:
            continue
        stripped = re.sub(r"^[•●◦▪▸►‣⁃\-]\s*", "", stripped)
        if not stripped:
            continue

        date_match = _SINGLE_DATE_RE.search(stripped)
        date_val = date_match.group() if date_match else ""
        rest = _SINGLE_DATE_RE.sub("", stripped).strip(" ,|·-–—") if date_match else stripped

        parts = re.split(r"\s*[-–—|,]\s*", rest, maxsplit=1)
        name = parts[0].strip() if parts else rest
        issuer = parts[1].strip() if len(parts) > 1 else ""

        if name:
            entries.append({"name": name, "issuer": issuer, "date": date_val, "url": ""})

    return entries


def _parse_languages(text: str) -> list[str]:
    """Parse languages list."""
    text = re.sub(r"[•●◦▪▸►‣⁃]", ",", text)
    text = text.replace("|", ",").replace(";", ",").replace("\n", ",")
    parts = re.split(r"[,\n]+", text)
    langs = []
    for p in parts:
        s = p.strip().strip("- ").strip()
        # Remove proficiency qualifiers
        s = re.sub(r"\s*\(.*?\)\s*$", "", s).strip()
        if s and len(s) < 40:
            langs.append(s)
    return langs


def _parse_resume_text(raw_text: str) -> dict:
    """Parse raw resume text into structured sections. Returns a dict ready to store."""
    sections = _identify_sections(raw_text)

    header = sections.get("header", sections.get("_raw", ""))
    pi = _parse_personal_info(header)

    summary = sections.get("summary", "")
    skills = _parse_skills(sections.get("skills", ""))
    experience = _parse_experience(sections.get("experience", ""))
    education = _parse_education(sections.get("education", ""))
    projects = _parse_projects(sections.get("projects", ""))
    certifications = _parse_certifications(sections.get("certifications", ""))
    languages = _parse_languages(sections.get("languages", ""))

    # If no sections were detected, put text in summary as fallback
    if "_raw" in sections and not any([summary, skills, experience, education]):
        summary = raw_text[:4000]

    return {
        "personal_info": json.dumps(pi),
        "summary": summary[:4000],
        "skills": json.dumps(skills),
        "experience": json.dumps(experience),
        "education": json.dumps(education),
        "projects": json.dumps(projects),
        "certifications": json.dumps(certifications),
        "languages": json.dumps(languages),
    }


@router.post("/upload")
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ("pdf", "docx"):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")

    data = file.file.read()
    if len(data) > _MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="File too large (max 5 MB)")

    extracted = ""
    if ext == "pdf":
        extracted = _extract_text_from_pdf(data)
    elif ext == "docx":
        extracted = _extract_text_from_docx(data)

    if not extracted.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from file")

    parsed = _parse_resume_text(extracted)
    title = file.filename.rsplit(".", 1)[0] if "." in file.filename else file.filename

    resume = Resume(
        user_id=current_user.id,
        title=title,
        template="modern",
        personal_info=parsed["personal_info"],
        summary=parsed["summary"],
        skills=parsed["skills"],
        experience=parsed["experience"],
        education=parsed["education"],
        projects=parsed["projects"],
        certifications=parsed["certifications"],
        languages=parsed["languages"],
        custom_sections="{}",
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return _serialize_resume(resume)


# Legacy compatibility
@router.post("/build")
def build_resume(
    payload: ResumeCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = Resume(user_id=current_user.id)
    _apply_payload_to_resume(resume, payload, db)
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return {"resume_id": resume.id, "ats_score": resume.ats_score}
