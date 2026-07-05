# Source Priority — MVP Rollout

**Phase:** 26c — Study Materials source connector planning
**Status:** Draft — priority order only, no implementation

---

## Goal

Define the minimum viable connector set for Study Materials articles, books/ebooks, and audiobooks inside `codequest-content-lab/` only. This branch stops at docs and sample JSON. Real scripts and dependencies arrive in a later approved phase.

---

## Priority tiers

| Tier | Meaning |
|---|---|
| **P0** | First connector per content type; required for MVP ingestion slice |
| **P1** | Second wave; adds high-value metadata sources with low license risk |
| **P2** | Enrichment, prototypes, or alternate formats — opt-in per source |
| **P3** | Nice-to-have; no MVP blocker |
| **deferred** | Explicitly out of MVP; strict gates before any work |

---

## P0 — MVP first connectors

These three connectors unlock metadata-only ingestion for the three primary content types:

| Order | Content type | Connector | repo_or_api_name | Why first |
|---|---|---|---|---|
| 1 | Article | RSS / Atom Feed Parser | `kurtmckee/feedparser` | Stable, license-safe default (`no-full-text`); no page scraping |
| 2 | Book / ebook | Gutendex | `garethbjohnson/gutendex` | Structured Gutenberg metadata; clear public-domain status |
| 3 | Audiobook | LibriVox API | LibriVox API | Public-domain readings; structured project metadata |

**P0 rules:**
- Metadata and links only in MVP planning
- No book, ebook, or audiobook file downloads
- No full copyrighted article bodies
- Every external source: **Do not fork. Do not merge.**

---

## P1 — Second wave

| Content type | Connector | repo_or_api_name | Notes |
|---|---|---|---|
| Article | Hacker News Public API | `HackerNews/API` | Story metadata + outbound links only |
| Article | DEV Community API | `Forem/DEV API` | Short description as summary; no post body |
| Book / ebook | Standard Ebooks Catalog | Standard Ebooks public repos | EPUB metadata; link-only in MVP |
| Book / ebook | Open Library API | Open Library API | Enrichment; PD must be confirmed |
| Research (optional) | arXiv | `lukasschwab/arxiv.py` | Abstract + link; see FUTURE_INGESTION_PLAN |

---

## P2 — Enrichment and prototypes

| Content type | Connector | repo_or_api_name | Notes |
|---|---|---|---|
| Article | Trafilatura Web Extractor | `adbar/trafilatura` | Opt-in full text only with license proof |
| Article | Newspaper4k Article Parser | `AndyTheFactory/newspaper4k` | Metadata enrichment prototype |
| Book / ebook | Standard Ebooks Tools | `standardebooks/tools` | Reference for EPUB pipeline — not vendored |
| Research (optional) | OpenAlex Python | `J535D165/pyalex` | Scholarly metadata |
| Research (optional) | OpenAlex REST | OpenAlex API | Scholarly metadata |

---

## Deferred — not in articles/books/audiobooks MVP

| Connector | repo_or_api_name | Gate |
|---|---|---|
| Internet Archive Audiobooks | `jjjake/internetarchive` | Requires strict `licenseurl` filtering, CDL exclusion, admin review; no audio download until proof workflow exists |

---

## MVP slice definition

The Phase 26c+ MVP ingestion slice (when approved) should prove end-to-end metadata flow for:

```
feedparser  → article metadata  → pending_review
Gutendex    → book metadata     → pending_review
LibriVox    → audiobook metadata → pending_review
```

Each run must emit `output_proof_required` counts documented in [SOURCE_CONNECTORS.md](./SOURCE_CONNECTORS.md).

---

## Explicit non-goals (this branch)

- [ ] No pip installs or lab `requirements.txt` changes
- [ ] No ingestion scripts under `scripts/`
- [ ] No network calls to external APIs
- [ ] No book, ebook, or audiobook file downloads
- [ ] No storage of full copyrighted article text
- [ ] No forks or merges of external repos
- [ ] No changes outside `codequest-content-lab/`

---

## Suggested implementation order (future phase)

When real ingestion is approved:

1. Register P0 connectors in `content_sources` (sample shape in `source-connectors.sample.json`)
2. Implement `ingest_rss.py` (feedparser)
3. Implement `ingest_gutenberg.py` (Gutendex — metadata only first)
4. Implement `ingest_librivox.py` (LibriVox — metadata only)
5. Add P1 connectors one at a time with smoke proofs
6. Defer Internet Archive until license filter tests pass in isolation

See [FUTURE_INGESTION_PLAN.md](./FUTURE_INGESTION_PLAN.md) for script contracts and run logging.
