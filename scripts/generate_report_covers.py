"""Generate SVG cover art for Book_Reports study reports (ponytail: stdlib only)."""
from __future__ import annotations

import json
import re
import textwrap
import xml.sax.saxutils as xml
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "Book_Reports" / "catalog.json"

FAMILY_STYLE: dict[str, tuple[str, str, str]] = {
    "01-python-beginners-core": ("#2563eb", "#dbeafe", "Python Core"),
    "02-python-crash-courses": ("#ea580c", "#ffedd5", "Crash Course"),
    "03-combo-crash-paths": ("#0d9488", "#ccfbf1", "Combo Path"),
    "04-data-analysis": ("#16a34a", "#dcfce7", "Data Analysis"),
    "05-data-science": ("#4f46e5", "#e0e7ff", "Data Science"),
    "06-machine-learning": ("#9333ea", "#f3e8ff", "Machine Learning"),
    "07-deep-learning-and-ai": ("#db2777", "#fce7f3", "Deep Learning"),
    "08-multi-language-programming": ("#d97706", "#fef3c7", "Multi-Language"),
    "09-kids-and-makers": ("#65a30d", "#ecfccb", "Kids & Makers"),
    "10-comprehensive-and-projects": ("#0f172a", "#e2e8f0", "Projects"),
}


def clean_title(title: str) -> str:
    t = re.sub(r"^Study Report:\s*", "", title, flags=re.I).strip()
    return t[:120]


def svg_cover(title: str, family_id: str, level: str, author: str) -> str:
    accent, bg, family_label = FAMILY_STYLE.get(family_id, ("#0f172a", "#f1f5f9", "Study Report"))
    lines = textwrap.wrap(clean_title(title), width=28)[:5]
    if not lines:
        lines = ["Study Report"]
    y = 88
    title_nodes = []
    for line in lines:
        title_nodes.append(
            f'<text x="24" y="{y}" font-family="Georgia, serif" font-size="17" font-weight="700" fill="#0f172a">{xml.escape(line)}</text>'
        )
        y += 24
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="320" height="440" viewBox="0 0 320 440" role="img">
  <rect width="320" height="440" rx="12" fill="{bg}"/>
  <rect width="320" height="72" fill="{accent}"/>
  <text x="24" y="44" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="700" fill="#ffffff">Code Quest</text>
  <text x="296" y="44" text-anchor="end" font-family="Inter, Arial, sans-serif" font-size="11" fill="#ffffff">{xml.escape(family_label)}</text>
  {''.join(title_nodes)}
  <text x="24" y="{y + 18}" font-family="Inter, Arial, sans-serif" font-size="12" fill="#475569">{xml.escape(level)}</text>
  <text x="24" y="408" font-family="Inter, Arial, sans-serif" font-size="11" fill="#64748b">{xml.escape(author)}</text>
  <rect x="24" y="420" width="72" height="4" rx="2" fill="{accent}"/>
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
        )
        out.write_text(svg, encoding="utf-8")
        count += 1
    print(f"Generated {count} cover.svg files")


if __name__ == "__main__":
    main()
