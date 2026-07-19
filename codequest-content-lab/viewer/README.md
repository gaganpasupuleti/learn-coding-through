# Study Materials Lab Viewer

**Phase:** 26e — Isolated lab preview  
**Branch:** `phase-26e-study-materials-lab-viewer`  
**Scope:** `codequest-content-lab/viewer/` only

---

## What this is

A static, lab-only viewer for normalized Study Materials ingestion output. It loads `sample-normalized-content.json` and renders metadata cards for books, articles, and audiobooks.

**Not connected to the main Code Quest app.**  
**No backend. No database. No API calls.**

---

## Features

- Cards for `book`, `article`, and `audiobook` content types
- Filters: content type, domain, license status, review status
- Search by title, author, or tag
- Safety fields on every card: source URL, license, review status, `file_path` / `audio_file_path` (null)
- Empty state when filters/search match nothing
- Error state when JSON fails to load (e.g. opened via `file://`)

---

## Run locally

Browsers block `fetch()` for local files opened directly. Use a simple static server:

```bash
cd codequest-content-lab/viewer
python -m http.server 8765
```

Open: http://localhost:8765/

---

## Sample data

`sample-normalized-content.json` mirrors the normalized schema from `../ingestion/run_ingestion.py`:

- 6 items (2 books, 2 audiobooks, 2 articles)
- Metadata only — no full text, no downloaded files
- Placeholder article URLs (`example-*.invalid`)

To preview fresh ingestion output, copy a generated `../ingestion/output/normalized-*.json` over the sample file (keep the `items` array shape).

---

## Manual smoke checklist

- [ ] Page loads without error state
- [ ] Stats show **6 of 6** items initially
- [ ] Filter by content type `article` → 2 items
- [ ] Filter by domain `python` → 1 item
- [ ] Search `Einstein` → 1 item
- [ ] Impossible filter combo → empty state
- [ ] Source links render on cards
- [ ] Safety fields show `file_path: null` and `audio_file_path: null`

---

## What this does NOT do

- No main app routes or `src/` integration
- No npm dependencies or `requirements.txt`
- No real content downloads
- No copyrighted full text display

See `../ingestion/README.md` for the ingestion MVP that produces normalized JSON.
