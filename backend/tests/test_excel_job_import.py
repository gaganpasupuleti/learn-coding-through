import io

from openpyxl import Workbook

from app.services.job_import import parse_job_import_xlsx


class _FakeSession:
    """Minimal stub: no eligible_batch rows."""

    def query(self, _model):
        return self

    def filter(self, *_a, **_kw):
        return self

    def first(self):
        return None


def test_parse_job_import_xlsx_friendly_headers():
    wb = Workbook()
    ws = wb.active
    ws.append(["Job Title", "Company", "City", "Employment type"])
    ws.append(["Backend Engineer", "Acme Inc", "Bengaluru", "Full-time"])
    buf = io.BytesIO()
    wb.save(buf)
    rows, errors, skipped = parse_job_import_xlsx(buf.getvalue(), _FakeSession())  # type: ignore[arg-type]
    assert not errors
    assert skipped == 0
    assert len(rows) == 1
    assert rows[0]["title"] == "Backend Engineer"
    assert rows[0]["company_name"] == "Acme Inc"
    assert rows[0]["location"] == "Bengaluru"
