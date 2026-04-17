"""
local_extractor.py – Extract raw text from PDF and DOCX files locally.

Uses pdfplumber for PDFs and python-docx for Word documents.
No LLM calls are made; all processing is local.
"""

from pathlib import Path

import pdfplumber
from docx import Document


SUPPORTED_TYPES = {"pdf", "docx"}


class ExtractionError(Exception):
    """Raised when text extraction fails."""


def extract_text(file_path: str, file_type: str | None = None) -> str:
    """Return raw text from a PDF or DOCX file.

    Parameters
    ----------
    file_path:
        Absolute or relative path to the document.
    file_type:
        One of ``"pdf"`` or ``"docx"``.  If *None*, inferred from the
        file extension.

    Returns
    -------
    str
        The extracted plain text.

    Raises
    ------
    ExtractionError
        If the file cannot be read or the type is unsupported.
    """
    path = Path(file_path)

    if not path.exists():
        raise ExtractionError(f"File not found: {file_path}")

    if file_type is None:
        file_type = path.suffix.lstrip(".").lower()

    if file_type not in SUPPORTED_TYPES:
        raise ExtractionError(
            f"Unsupported file type '{file_type}'. Supported: {SUPPORTED_TYPES}"
        )

    try:
        if file_type == "pdf":
            return _extract_pdf(path)
        return _extract_docx(path)
    except ExtractionError:
        raise
    except Exception as exc:
        raise ExtractionError(f"Failed to extract text from {path.name}: {exc}") from exc


def _extract_pdf(path: Path) -> str:
    pages: list[str] = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                pages.append(text)
    if not pages:
        raise ExtractionError(f"No extractable text found in PDF: {path.name}")
    return "\n".join(pages)


def _extract_docx(path: Path) -> str:
    doc = Document(str(path))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    if not paragraphs:
        raise ExtractionError(f"No extractable text found in DOCX: {path.name}")
    return "\n".join(paragraphs)
