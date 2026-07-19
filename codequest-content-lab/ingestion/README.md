# Study Materials Ingestion MVP

**Phase:** 26d — Isolated lab ingestion  
**Branch:** `phase-26d-study-materials-ingestion-mvp`  
**Scope:** `codequest-content-lab/ingestion/` only

---

## What this does

Runs metadata-only ingestion for three P0 Study Materials sources:

| Source | Connector | Content type |
|---|---|---|
| Gutendex / Project Gutenberg | `connectors/gutendex_books.py` | `book` |
| LibriVox API | `connectors/librivox_audiobooks.py` | `audiobook` |
| RSS feeds | `connectors/rss_articles.py` | `article` |

Output is normalized JSON written to `output/`. No database writes. No file downloads.

---

## Safety rules (MVP)

- **Fixture mode first** — default; uses `fixtures/` only
- **Live mode** — optional metadata fetch via Python stdlib (`urllib`); no book/audio/PDF downloads
- **No full copyrighted article bodies** — RSS stores title + short description only
- **`file_path`, `audio_file_path`, `sha256_hash`** — always `null`
- **`downloaded_file_count`** — always `0`
- **No external repos copied** — Gutendex/LibriVox/RSS are API references only
- **No new dependencies** — stdlib only (no `feedparser` install in this phase)

---

## Folder layout

```
ingestion/
  README.md
  run_ingestion.py
  license_guard.py
  normalizer.py
  connectors/
    gutendex_books.py
    librivox_audiobooks.py
    rss_articles.py
  fixtures/
    gutendex_books.fixture.json
    librivox_audiobooks.fixture.json
    rss_feed.fixture.xml
  output/              ← gitignored except .gitkeep
  run-log.sample.json
```

---

## Usage

From `codequest-content-lab/ingestion/`:

```bash
# Default: fixture mode, all sources
python run_ingestion.py

# Explicit fixture run
python run_ingestion.py --mode fixture --sources all --limit 5

# Single source
python run_ingestion.py --mode fixture --sources gutendex

# Live metadata only (optional; requires network; Gutendex needs User-Agent)
python run_ingestion.py --mode live --sources gutendex --limit 3
python run_ingestion.py --mode live --sources librivox --limit 3
python run_ingestion.py --mode live --sources rss --feed-url "https://example.com/feed.xml"
```

---

## Normalized item schema

Every accepted item includes:

| Field | Notes |
|---|---|
| `title` | Required |
| `content_type` | `book`, `audiobook`, or `article` |
| `source_type` | `gutenberg`, `librivox`, or `rss` |
| `source_name` | Connector display name |
| `source_url` | Canonical outbound link |
| `author_or_creator` | Author or narrator |
| `summary` | Short text only; not full article body |
| `domains` | Array of domain slugs |
| `tags` | Array of tag strings |
| `license_status` | `public-domain` (books/audio) or `no-full-text` (articles) |
| `review_status` | Always `pending_review` in MVP |
| `file_path` | Always `null` |
| `audio_file_path` | Always `null` |
| `sha256_hash` | Always `null` |

---

## Output proof

Each run prints and writes:

- command run
- input count
- normalized count
- rejected count
- rejection reasons
- generated JSON path
- sample normalized item
- `downloaded_file_count: 0`

Run logs are saved beside normalized output in `output/run-log-<timestamp>.json`.

See `run-log.sample.json` for the expected shape.

---

## What this does NOT do

- No production DB connection
- No backend/API integration
- No admin UI
- No student-visible routes
- No EPUB/PDF/MP3 storage
- No `requirements.txt` changes

See `../docs/SOURCE_CONNECTORS.md` and `../docs/SOURCE_PRIORITY_MVP.md` for connector planning context.
