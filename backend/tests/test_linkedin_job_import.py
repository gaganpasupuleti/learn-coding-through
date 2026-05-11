import json

from app.services.job_import import parse_linkedin_jobs_json


def test_parse_linkedin_jobs_json_minimal():
    raw = json.dumps(
        [
            {
                "title": "Backend Engineer",
                "company": "Acme",
                "location": "Remote",
                "jobUrl": "https://example.com/j/1",
                "seniorityLevel": "Mid-Senior",
                "employmentType": "Full-time",
            }
        ]
    ).encode()
    rows, errors, skipped = parse_linkedin_jobs_json(raw)
    assert not errors
    assert skipped == 0
    assert len(rows) == 1
    assert rows[0]["title"] == "Backend Engineer"
    assert rows[0]["company_name"] == "Acme"
    assert rows[0]["external_apply_url"] == "https://example.com/j/1"
    assert rows[0]["listing_metadata"]["source"] == "linkedin_scrape"
    assert rows[0]["listing_metadata"]["seniorityLevel"] == "Mid-Senior"


def test_parse_linkedin_jobs_json_duplicate_url_skipped():
    raw = json.dumps(
        [
            {"title": "Role One", "company": "Co A", "location": "Loc X", "jobUrl": "https://x/u"},
            {"title": "Role Two", "company": "Co B", "location": "Loc Y", "jobUrl": "https://x/u"},
        ]
    ).encode()
    rows, errors, skipped = parse_linkedin_jobs_json(raw)
    assert len(rows) == 1
    assert skipped == 1


def test_parse_linkedin_jobs_json_invalid_root():
    raw = b'{"not": "array"}'
    rows, errors, skipped = parse_linkedin_jobs_json(raw)
    assert rows == []
    assert skipped == 0
    assert any("array" in d for _, d in errors)


def test_parse_linkedin_jobs_json_wrapped_items():
    raw = json.dumps(
        {
            "items": [
                {
                    "jobTitle": "Engineer",
                    "companyName": "Acme Ltd",
                    "location": {"name": "Berlin"},
                    "link": "https://example.com/j",
                }
            ]
        }
    ).encode()
    rows, errors, skipped = parse_linkedin_jobs_json(raw)
    assert not errors
    assert len(rows) == 1
    assert rows[0]["title"] == "Engineer"
    assert rows[0]["company_name"] == "Acme Ltd"
    assert rows[0]["location"] == "Berlin"
    assert rows[0]["external_apply_url"] == "https://example.com/j"


def test_parse_linkedin_jobs_json_utf8_bom():
    payload = [{"title": "X Role", "company": "Y Co", "location": "Z City"}]
    raw = json.dumps(payload).encode("utf-8-sig")
    rows, errors, skipped = parse_linkedin_jobs_json(raw)
    assert not errors
    assert len(rows) == 1
