# Source Connectors

**Phase:** 26c — Study Materials source connector planning
**Branch:** `phase-26c-study-materials-articles-books-audio-sources`
**Status:** Draft — documentation and sample data only

---

## Purpose

This document is the master index for external source connectors planned for the Study Materials content lab. Phase 26c defines connector contracts, license rules, and MVP priority. No ingestion scripts, network calls, file downloads, or dependency installs happen in this branch.

Connector detail lives in:

| Document | Content types |
|---|---|
| [ARTICLE_SOURCES.md](./ARTICLE_SOURCES.md) | Articles (RSS, web metadata, HN, DEV) |
| [BOOK_SOURCES.md](./BOOK_SOURCES.md) | Books and ebooks (public-domain) |
| [AUDIOBOOK_SOURCES.md](./AUDIOBOOK_SOURCES.md) | Audiobooks (LibriVox, future Internet Archive) |
| [SOURCE_PRIORITY_MVP.md](./SOURCE_PRIORITY_MVP.md) | MVP rollout order and deferrals |

Sample connector registry: `../sample-data/source-connectors.sample.json`
Sample ingestion run logs: `../sample-data/source-ingestion-runs.sample.json`

---

## Global rules (all connectors)

1. **Do not fork. Do not merge.** Every external repo or API listed here is a reference or future Python dependency only. No external repository is copied into Code Quest.
2. **No real ingestion in this branch.** Connectors are planned contracts only.
3. **No file downloads in this branch.** Book, ebook, and audiobook files must not be downloaded until a later approved phase with license proof.
4. **No full copyrighted article bodies.** Default storage is title, short summary, and `source_url` only (`license_type = no-full-text`).
5. **All ingested items start as `pending_review`.** Nothing is student-visible until admin approval (Phase 26d+).
6. **Reject unknown licenses when storing content.** Link-only metadata is acceptable; populated `content_body` or local files require confirmed license fields.

---

## Connector field schema

Every source connector record uses these fields:

| Field | Description |
|---|---|
| `source_name` | Human-readable connector name |
| `source_type` | `rss`, `web-api`, `metadata-api`, `library`, `research-api` |
| `repo_or_api_name` | GitHub repo or public API identifier |
| `purpose` | What metadata or files this connector provides |
| `allowed_content` | Content that may be ingested under lab rules |
| `forbidden_content` | Content that must never be ingested or stored |
| `license_safety_rule` | Minimum license checks before insert or download |
| `fork_merge_decision` | Always: **Do not fork. Do not merge.** |
| `mvp_priority` | `P0` (first), `P1`, `P2`, `P3`, or `deferred` |
| `future_ingestion_fields` | Fields written to `content_items` / `content_sources` in Phase 26c+ |
| `output_proof_required` | Counts and sample record shape required after a real run |

---

## Connector inventory by content type

### Articles (see [ARTICLE_SOURCES.md](./ARTICLE_SOURCES.md))

| source_name | repo_or_api_name | mvp_priority |
|---|---|---|
| RSS / Atom feeds | `kurtmckee/feedparser` | **P0** |
| Web article extraction | `adbar/trafilatura` | P2 |
| Web article extraction | `AndyTheFactory/newspaper4k` | P2 |
| Hacker News | `HackerNews/API` | P1 |
| DEV Community | `Forem/DEV API` | P1 |

### Books / ebooks (see [BOOK_SOURCES.md](./BOOK_SOURCES.md))

| source_name | repo_or_api_name | mvp_priority |
|---|---|---|
| Gutendex | `garethbjohnson/gutendex` | **P0** |
| Project Gutenberg | via Gutendex API | **P0** |
| Standard Ebooks tooling | `standardebooks/tools` | P2 |
| Standard Ebooks catalog | Standard Ebooks public repos | P1 |
| Open Library | Open Library API | P1 |

### Audiobooks (see [AUDIOBOOK_SOURCES.md](./AUDIOBOOK_SOURCES.md))

| source_name | repo_or_api_name | mvp_priority |
|---|---|---|
| LibriVox | LibriVox API | **P0** |
| Internet Archive | `jjjake/internetarchive` | deferred |

### Research papers — optional later

| source_name | repo_or_api_name | mvp_priority |
|---|---|---|
| arXiv | `lukasschwab/arxiv.py` | P1 |
| OpenAlex (Python) | `J535D165/pyalex` | P2 |
| OpenAlex (REST) | OpenAlex API | P2 |

Research connectors reuse patterns from [FUTURE_INGESTION_PLAN.md](./FUTURE_INGESTION_PLAN.md). They are out of scope for the articles/books/audiobooks MVP slice but share the same license and review rules.

---

## Planned connector lifecycle (Phase 26c+)

```
content_sources row (connector config)
        │
        ▼
ingestion script (lab-only, dev DB)
        │
        ├── fetch metadata from external API / feed
        ├── apply license_safety_rule
        ├── dedupe by (external_id, source_id)
        ├── insert content_items (pending_review)
        └── log content_ingestion_runs with output_proof_required counts
```

No step in this branch executes the lifecycle above.

---

## Sample data

- `source-connectors.sample.json` — placeholder connector registry entries
- `source-ingestion-runs.sample.json` — placeholder run logs with required proof fields

All sample values use placeholders (`example-*`, `PLACEHOLDER-*`, null file paths). No real downloads or copyrighted text.

---

## Related docs

- [LAB_SCOPE.md](./LAB_SCOPE.md) — isolation boundaries
- [CONTENT_TYPES.md](./CONTENT_TYPES.md) — per-type storage rules
- [FUTURE_INGESTION_PLAN.md](./FUTURE_INGESTION_PLAN.md) — script contracts for Phase 26c+
