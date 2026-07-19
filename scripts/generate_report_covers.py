"""Generate SVG cover art for Book_Reports study reports (ponytail: stdlib only)."""
from __future__ import annotations

import json
import re
import textwrap
import xml.sax.saxutils as xml
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "Book_Reports" / "catalog.json"

NAVY = "#0A1020"
CREAM = "#FAF3E0"

FAMILY_STYLE: dict[str, tuple[str, str, str]] = {
    "java-backend": ("#EA580C", "#FFF7ED", "Java Backend"),
    "python-dev": ("#2563EB", "#EFF6FF", "Python Dev"),
    "frontend-react": ("#06B6D4", "#ECFEFF", "Frontend React"),
    "fullstack-web": ("#4F46E5", "#EEF2FF", "Full Stack"),
    "qa-testing": ("#16A34A", "#F0FDF4", "QA & Testing"),
    "data-analyst": ("#0D9488", "#F0FDFA", "Data Analyst"),
    "powerbi-analyst": ("#F59E0B", "#FFFBEB", "Power BI"),
    "data-engineer": ("#0891B2", "#ECFEFF", "Data Engineer"),
    "ml-ai": ("#9333EA", "#FAF5FF", "ML / AI"),
    "gen-ai": ("#DB2777", "#FDF2F8", "Gen AI"),
    "agentic-ai": ("#7C3AED", "#F5F3FF", "Agentic AI"),
    "it-support": ("#64748B", "#F8FAFC", "IT Support"),
    "servicenow": ("#059669", "#ECFDF5", "ServiceNow"),
    "business-analyst": ("#CA8A04", "#FEFCE8", "Business Analyst"),
    "cyber-security": ("#DC2626", "#FEF2F2", "Cyber Security"),
    "salesforce-crm": ("#0284C7", "#F0F9FF", "Salesforce CRM"),
    "dynamics-crm": ("#1D4ED8", "#EFF6FF", "Dynamics CRM"),
    "power-platform": ("#7E22CE", "#FAF5FF", "Power Platform"),
}

REPORT_TYPE_LABEL = {
    "role_career_path": "Career path",
    "role_book_study": "Book study",
    "role_project": "Project",
}


def clean_title(title: str) -> str:
    t = re.sub(r"^(Study|Project) Report:\s*", "", title, flags=re.I).strip()
    return t[:100]


def svg_cover(title: str, family_id: str, level: str, author: str, report_type: str = "") -> str:
    accent, bg, family_label = FAMILY_STYLE.get(family_id, ("#2563EB", CREAM, "Study Report"))
    type_label = REPORT_TYPE_LABEL.get(report_type, "Study report")
    lines = textwrap.wrap(clean_title(title), width=22)[:6]
    if not lines:
        lines = ["Study Report"]
    y = 108
    title_nodes = []
    for line in lines:
        title_nodes.append(
            f'<text x="20" y="{y}" font-family="Georgia, serif" font-size="16" font-weight="700" fill="{NAVY}">{xml.escape(line)}</text>'
        )
        y += 22
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="320" height="440" viewBox="0 0 320 440" role="img" aria-label="Cover">
  <rect width="320" height="440" rx="10" fill="{bg}"/>
  <rect width="320" height="80" rx="10" fill="{NAVY}"/>
  <rect y="70" width="320" height="10" fill="{NAVY}"/>
  <text x="20" y="34" font-family="Arial, sans-serif" font-size="11" font-weight="700" letter-spacing="0.08em" fill="{CREAM}">CODE QUEST</text>
  <text x="20" y="58" font-family="Arial, sans-serif" font-size="10" fill="{accent}">{xml.escape(family_label)}</text>
  <rect x="20" y="92" width="40" height="3" rx="1.5" fill="{accent}"/>
  {''.join(title_nodes)}
  <text x="20" y="{y + 20}" font-family="Arial, sans-serif" font-size="11" font-weight="600" fill="{accent}">{xml.escape(level)}</text>
  <line x1="20" y1="380" x2="300" y2="380" stroke="{NAVY}" stroke-opacity="0.12" stroke-width="1"/>
  <text x="20" y="404" font-family="Arial, sans-serif" font-size="10" fill="#64748B">{xml.escape(author)}</text>
  <text x="20" y="422" font-family="Arial, sans-serif" font-size="9" fill="#94A3B8">{xml.escape(type_label)}</text>
</svg>"""


def main() -> None:
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    count = 0
    for report in catalog.get("reports", []):
        path = ROOT / report["path"]
        out = path.parent / "cover.svg"
        svg = svg_cover(
            report.get("title", "Study Report"),
            report.get("family_id", ""),
            report.get("level", "Mixed"),
            report.get("author", "Gagan Pasupuleti"),
            report.get("report_type", ""),
        )
        out.write_text(svg, encoding="utf-8")
        count += 1
    print(f"Generated {count} cover.svg files")


if __name__ == "__main__":
    main()
