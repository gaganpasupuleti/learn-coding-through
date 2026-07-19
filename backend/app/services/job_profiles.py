"""Predefined India job scrape profiles for Code Quest."""

from __future__ import annotations

from dataclasses import dataclass

FIXED_LOCATION = "India"

# Internal safety caps (not exposed in UI)
MAX_PER_SOURCE_PER_QUERY = 15
MAX_TOTAL_JOBS_PER_RUN = 100
DEFAULT_HOURS_OLD = 48
AUTO_OVERLAP_BUFFER_HOURS = 12
MAX_MANUAL_RANGE_DAYS = 14
MAX_HOURS_OLD = MAX_MANUAL_RANGE_DAYS * 24
ALLOWED_MANUAL_RANGE_DAYS = (1, 3, 7, 14)
DEFAULT_MANUAL_RANGE_DAYS = 3
DEFAULT_SOURCES = ["indeed", "google", "linkedin"]

AUTO_PROFILES = (
    "internship_india",
    "fresher_india",
    "entry_level_india",
    "platform_crm_india",
    "ai_india",
)


@dataclass(frozen=True)
class ScrapeProfile:
    key: str
    label: str
    search_terms: tuple[str, ...]
    auto_enabled: bool
    experience_tier: str  # intern_fresher | entry | experienced


SCRAPE_PROFILES: dict[str, ScrapeProfile] = {
    "internship_india": ScrapeProfile(
        key="internship_india",
        label="Internships",
        search_terms=(
            "internship",
            "software engineer intern",
            "data analyst intern",
            "graduate intern india",
            "cyber security intern",
            "salesforce intern",
            "power apps intern",
            "gen ai intern",
            "ai intern india",
        ),
        auto_enabled=True,
        experience_tier="intern_fresher",
    ),
    "fresher_india": ScrapeProfile(
        key="fresher_india",
        label="Fresher Jobs",
        search_terms=(
            "fresher",
            "graduate trainee",
            "python developer fresher",
            "software engineer fresher",
            "react developer fresher",
            "salesforce fresher",
            "power apps fresher",
            "cyber security fresher",
            "gen ai fresher",
            "llm engineer fresher",
        ),
        auto_enabled=True,
        experience_tier="intern_fresher",
    ),
    "entry_level_india": ScrapeProfile(
        key="entry_level_india",
        label="Entry Level",
        search_terms=(
            "entry level",
            "junior developer",
            "data analyst fresher",
            "associate software engineer",
            "frontend developer fresher",
            "soc analyst fresher",
            "machine learning fresher",
            "ai engineer fresher",
        ),
        auto_enabled=True,
        experience_tier="entry",
    ),
    "experienced_manual_india": ScrapeProfile(
        key="experienced_manual_india",
        label="1+ Experience (manual)",
        search_terms=(
            "software developer 1 year experience",
            "data analyst 2 years experience",
            "python developer 3 years",
        ),
        auto_enabled=False,
        experience_tier="experienced",
    ),
    "platform_crm_india": ScrapeProfile(
        key="platform_crm_india",
        label="CRM & Low-Code Platform",
        search_terms=(
            "salesforce fresher",
            "salesforce developer fresher",
            "power apps fresher",
            "power platform fresher",
            "dynamics 365 fresher",
            "cyber security fresher",
            "soc analyst fresher",
            "information security fresher",
        ),
        auto_enabled=True,
        experience_tier="intern_fresher",
    ),
    "ai_india": ScrapeProfile(
        key="ai_india",
        label="AI / Gen AI / Agentic",
        search_terms=(
            "gen ai fresher",
            "generative ai fresher",
            "llm engineer fresher",
            "prompt engineer fresher",
            "agentic ai fresher",
            "ai agent developer fresher",
            "machine learning fresher",
            "data science fresher",
        ),
        auto_enabled=True,
        experience_tier="intern_fresher",
    ),
}


def get_profile(key: str) -> ScrapeProfile | None:
    return SCRAPE_PROFILES.get(key)


def auto_profile_keys() -> list[str]:
    return [k for k, p in SCRAPE_PROFILES.items() if p.auto_enabled]
