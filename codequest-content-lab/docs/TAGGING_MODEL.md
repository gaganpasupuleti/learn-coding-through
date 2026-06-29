# Tagging Model

**Phase:** 26b — Isolated Content Lab
**Status:** Draft

---

## Overview

Every content item carries one primary domain and zero or more free-form tags. Domains are fixed and seeded. Tags are free-form and created on demand.

---

## Primary Domains

Domains are the top-level classification axis. Each content item has exactly one primary domain. Items can be associated with secondary domains via tags if needed.

| Display name | Slug | Description |
|---|---|---|
| Mathematics | `maths` | Calculus, statistics, linear algebra, discrete math |
| Data Science | `data-science` | Data analysis, visualization, modeling, pipelines |
| Engineering | `engineering` | Software engineering, system design, architecture |
| Frontend | `frontend` | HTML, CSS, JavaScript, React, UI/UX |
| Backend | `backend` | Node, Python backend, APIs, databases, auth |
| Python | `python` | Python language, libraries, scripting |
| SQL | `sql` | SQL queries, database design, PostgreSQL, MySQL |
| Power BI | `power-bi` | Power BI reports, DAX, data modeling |
| Aptitude | `aptitude` | Quantitative reasoning, logical reasoning, verbal |
| Data Structures & Algorithms | `dsa` | Arrays, trees, graphs, sorting, dynamic programming |
| AI / Machine Learning | `ai-ml` | ML models, deep learning, NLP, computer vision |
| Cloud | `cloud` | AWS, GCP, Azure, DevOps, containers, CI/CD |
| Career | `career` | Job search, networking, soft skills, growth |
| Resume | `resume` | Resume writing, formatting, ATS optimization |
| Interview Prep | `interview-prep` | Coding interviews, system design interviews, behavioral |

---

## Tags

Tags are free-form and provide finer-grained classification within a domain.

**Tag rules:**
- Lowercase, hyphenated slugs only (e.g., `neural-networks`, `sql-joins`)
- Tags are shared across all content types
- Any admin can add a new tag; tags are reusable
- Tags complement the domain; they do not replace it

**Example tags by domain:**

| Domain | Example tags |
|---|---|
| `python` | `numpy`, `pandas`, `fastapi`, `django`, `asyncio`, `type-hints` |
| `dsa` | `binary-search`, `dynamic-programming`, `graphs`, `hash-maps`, `recursion` |
| `ai-ml` | `neural-networks`, `transformers`, `nlp`, `computer-vision`, `scikit-learn` |
| `sql` | `sql-joins`, `indexing`, `window-functions`, `query-optimization`, `normalization` |
| `frontend` | `react`, `typescript`, `css-grid`, `accessibility`, `web-performance` |
| `backend` | `rest-api`, `authentication`, `microservices`, `caching`, `message-queues` |
| `career` | `job-search`, `networking`, `linkedin`, `soft-skills`, `salary-negotiation` |
| `resume` | `ats-optimization`, `resume-format`, `cover-letter`, `portfolio` |
| `interview-prep` | `system-design`, `behavioral`, `leetcode`, `whiteboarding` |
| `cloud` | `aws`, `docker`, `kubernetes`, `ci-cd`, `serverless` |
| `data-science` | `pandas`, `visualization`, `feature-engineering`, `model-evaluation` |

---

## Difficulty levels

Every content item may optionally carry a difficulty level:

| Value | Meaning |
|---|---|
| `beginner` | No prior knowledge required |
| `intermediate` | Assumes foundational knowledge |
| `advanced` | Requires strong domain expertise |
| `null` | Not specified |

---

## Source types

| Value | Meaning |
|---|---|
| `rss` | Ingested from RSS feed |
| `atom` | Ingested from Atom feed |
| `arxiv` | Ingested from arXiv API |
| `openalex` | Ingested from OpenAlex API |
| `gutenberg` | Ingested from Project Gutenberg / Gutendex |
| `standard-ebooks` | Sourced from Standard Ebooks |
| `internet-archive` | Sourced from Internet Archive |
| `manual` | Created manually by admin or instructor |

---

## Tagging rules

1. Every item must have a primary domain before it can move to `pending_review`.
2. Tags are optional but encouraged for search and discovery.
3. Tags must be slugified (lowercase, hyphens, no spaces).
4. No offensive, misleading, or irrelevant tags.
5. Admin can edit tags during review.
6. Tags are not visible to students as a filter axis in Phase 26e — domain filtering is primary. Tag-based search may be added in a later phase.
