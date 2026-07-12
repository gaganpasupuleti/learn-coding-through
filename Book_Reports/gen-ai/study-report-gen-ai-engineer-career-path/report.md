# Study Report: Generative AI Engineer — Career Path & Core Skills

*Written by Gagan Pasupuleti*

## Summary

This report maps the Generative AI Engineer role for 2024-2026: LLM fundamentals, prompt engineering, RAG pipelines, vector databases, OpenAI and Hugging Face APIs, evaluation (RAGAS), safety guardrails, and cost/latency optimization for production copilots.

## Learning tracks

**Levels covered:** Beginner, Intermediate, Advanced

## Skill stack by level

### Beginner
- LLM tokens and context windows
- Prompt structure (role, task, format)
- OpenAI Chat Completions API
- Hugging Face pipeline basics
- Embeddings and cosine similarity
- Chunking strategies for documents
- Basic Python async for APIs

### Intermediate
- RAG retrieval architecture
- Vector DBs (Chroma, Pinecone, pgvector)
- LangChain / LlamaIndex patterns
- Hybrid search (BM25 + vectors)
- RAG evaluation with RAGAS
- Guardrails and output validation
- Caching and batching for cost
- Fine-tuning vs RAG decision matrix

### Advanced
- Multimodal models (vision + text)
- Production RAG with re-ranking
- Enterprise GenAI governance
- Red teaming and jailbreak defense
- Speculative decoding / latency tricks
- Multi-tenant vector isolation
- GenAI platform architecture
- EU AI Act documentation patterns

## Recommended books (read alongside this report)

### 1. Build a Large Language Model (From Scratch) — Sebastian Raschka
- **Level:** Advanced
- **Focus:** Transformer architecture, training, and inference from first principles.
- **Link:** https://www.manning.com/books/build-a-large-language-model-from-scratch

### 2. Prompt Engineering for Generative AI — James Phoenix & Mike Taylor
- **Level:** Beginner
- **Focus:** Prompt patterns, few-shot, chain-of-thought, and evaluation.
- **Link:** https://www.oreilly.com/library/view/prompt-engineering-for/9781098153434/

### 3. Generative AI with LangChain — Ben Auffarth & Laura Trotta
- **Level:** Intermediate
- **Focus:** LangChain chains, RAG, agents, and LLM application structure.
- **Link:** https://www.packtpub.com/en-us/product/generative-ai-with-langchain-9781835084848

### 4. Natural Language Processing with Transformers — Lewis Tunstall et al.
- **Level:** Advanced
- **Focus:** Hugging Face transformers, fine-tuning, and NLP tasks.
- **Link:** https://www.oreilly.com/library/view/natural-language-processing/9781098136789/

### 5. OpenAI API Documentation — OpenAI *(free online)*
- **Level:** Beginner
- **Focus:** Chat completions, embeddings, function calling, and best practices.
- **Link:** https://platform.openai.com/docs/

## End-to-end projects

### Project 1: PDF Q&A Chatbot with RAG
- **Level:** Beginner | **Duration:** 2–3 weeks
- **Overview:** Upload PDFs, chunk and embed with OpenAI/HuggingFace, answer questions with retrieved context.
- **Objectives:**
  - PDF text extraction and chunking
  - Vector store (Chroma/FAISS)
  - RAG prompt pipeline
  - Simple Streamlit or Gradio UI
- **Phases:**
  - **Ingest:** PDF → chunks. Tasks: LangChain loader, Splitter config. Deliverable: Indexed documents.
  - **Embed:** Vector store setup. Tasks: OpenAI embeddings, Similarity search. Deliverable: Working retrieval.
  - **RAG:** Prompt with context. Tasks: System prompt, Source citations. Deliverable: Q&A demo.
  - **UI:** Streamlit chat interface. Tasks: Upload PDF, Chat history. Deliverable: Deployed app URL.
- **Final deliverables:** GitHub repo; Demo video; Sample Q&A log

### Project 2: CodeQuest Study Report Tutor
- **Level:** Intermediate | **Duration:** 3–4 weeks
- **Overview:** RAG over study report JSON/Markdown; structured prompts return chapter summaries and quiz questions.
- **Objectives:**
  - Index Role_Reports catalog and chapters
  - Structured JSON output for quizzes
  - Rate limiting and cost tracking
  - Evaluation set with 20 benchmark questions
- **Phases:**
  - **Index:** Load report corpus. Tasks: JSON + MD parsers, Metadata filters. Deliverable: Vector index.
  - **Prompts:** Tutor persona prompts. Tasks: Summary template, Quiz template. Deliverable: Prompt library.
  - **Eval:** 20 benchmark Q&A. Tasks: Accuracy scoring, Hallucination check. Deliverable: Eval spreadsheet.
  - **API:** FastAPI wrapper. Tasks: /summarize, /quiz. Deliverable: Live tutor API.
- **Final deliverables:** Tutor API; Eval report; Prompt library doc; Demo video

### Project 3: Enterprise Document Intelligence Platform
- **Level:** Advanced | **Duration:** 5–6 weeks
- **Overview:** Multi-tenant RAG with hybrid search, reranking, guardrails, and admin analytics dashboard.
- **Objectives:**
  - Hybrid search (BM25 + vector)
  - Cross-encoder reranking
  - PII redaction guardrails
  - Admin dashboard with usage analytics
- **Phases:**
  - **Hybrid:** BM25 + vector fusion. Tasks: Reciprocal rank fusion, Tuning. Deliverable: Search quality benchmark.
  - **Rerank:** Cross-encoder reranker. Tasks: Top-20 → Top-5, Latency test. Deliverable: Reranker eval.
  - **Guardrails:** PII filter + topic block. Tasks: Regex + LLM check, Audit log. Deliverable: Safety test cases.
  - **Admin:** Usage dashboard. Tasks: Token costs, Query logs. Deliverable: Admin UI screenshot.
- **Final deliverables:** Platform demo; Search benchmark; Safety test report; Admin dashboard

## Chapters

---

### Track: Beginner

#### Chapter 1: Generative AI Engineer Role Overview *(Level: Beginner)*

**Chapter focus: Generative AI Engineer Role Overview** *(Level: Beginner)*

GenAI engineers build LLM-powered products: copilots, search, summarization, and codegen assistants. Skills span prompting, retrieval, evaluation, and safety — not just calling an API. 2025-2026 teams ship RAG before fine-tuning unless domain gap is proven.

Code Reference:
```python
response = client.chat.completions.create(
  model='gpt-4o-mini',
  messages=[{'role':'system','content':'You are a helpful tutor.'},
            {'role':'user','content':'Explain SQL JOINs briefly.'}]
)
```
What it shows: System + user messages frame behavior — cheapest path to useful apps.

### What it actually is
A GenAI engineer integrates LLMs into reliable user-facing applications.

### When to use it
When unstructured knowledge or language tasks dominate the product.

### Where to use it
Support bots, doc search, content generation, and code assistants.

### Real use example
CodeQuest study copilot answers from official docs only — you own retrieval quality.

**Key takeaways**
- A GenAI engineer integrates LLMs into reliable user-facing applications.
- When unstructured knowledge or language tasks dominate the product.
- CodeQuest study copilot answers from official docs only — you own retrieval quality.

#### Chapter 2: LLM Fundamentals: Tokens and Context *(Level: Beginner)*

**Chapter focus: LLM Fundamentals: Tokens and Context** *(Level: Beginner)*

Models read text as tokens (~4 chars English). Context window limits total input+output (128k+ on flagship 2025 models). Long prompts cost money and latency — summarize or retrieve instead of stuffing context.

Code Reference:
```python
import tiktoken
enc = tiktoken.encoding_for_model('gpt-4o')
print(len(enc.encode('Hello, how many tokens am I?')))
```
What it shows: tiktoken estimates billable tokens before sending requests.

### What it actually is
Tokenization and context limits shape every LLM application design.

### When to use it
Sizing prompts, choosing models, and estimating cost.

### Where to use it
All Chat Completions and embedding workloads.

### Real use example
A 200-page PDF won't fit — chunking + RAG is mandatory not optional.

**Key takeaways**
- Tokenization and context limits shape every LLM application design.
- Sizing prompts, choosing models, and estimating cost.
- A 200-page PDF won't fit — chunking + RAG is mandatory not optional.

#### Chapter 3: Prompt Engineering Patterns *(Level: Beginner)*

**Chapter focus: Prompt Engineering Patterns** *(Level: Beginner)*

Patterns: zero-shot, few-shot, chain-of-thought, JSON mode, structured outputs (2024+). Be explicit about format, length, and refusal conditions. Version prompts in Git.

Code Reference:
```python
SYSTEM = """Answer using only provided context. If unsure, say I don't know.
Respond as JSON: {"answer": str, "citations": [int]}"""
```
What it shows: JSON schema reduces parsing bugs vs free-form answers.

### What it actually is
Prompt engineering steers model behavior without weight updates.

### When to use it
Every LLM feature before investing in fine-tuning.

### Where to use it
Extraction, classification, tutoring, and support macros.

### Real use example
Few-shot examples fix date format inconsistencies in invoice parsing.

**Key takeaways**
- Prompt engineering steers model behavior without weight updates.
- Every LLM feature before investing in fine-tuning.
- Few-shot examples fix date format inconsistencies in invoice parsing.

#### Chapter 4: OpenAI API and Chat Completions *(Level: Beginner)*

**Chapter focus: OpenAI API and Chat Completions** *(Level: Beginner)*

Use official SDK; set temperature low (0-0.3) for factual tasks. Stream responses for UX; handle rate limits with tenacity retries. Never log API keys.

Code Reference:
```python
from openai import OpenAI
client = OpenAI()
for chunk in client.chat.completions.create(model='gpt-4o-mini', messages=msgs, stream=True):
    print(chunk.choices[0].delta.content or '', end='')
```
What it shows: Streaming prints tokens as generated — feels instant to users.

### What it actually is
Hosted LLM APIs provide state-of-the-art models without GPU ops.

### When to use it
Prototypes and production when data can leave VPC policy.

### Where to use it
Copilots, summarizers, and codegen tools.

### Real use example
Retry wrapper handles 429 rate limit during launch traffic spike.

**Key takeaways**
- Hosted LLM APIs provide state-of-the-art models without GPU ops.
- Prototypes and production when data can leave VPC policy.
- Retry wrapper handles 429 rate limit during launch traffic spike.

#### Chapter 5: Hugging Face Transformers Basics *(Level: Beginner)*

**Chapter focus: Hugging Face Transformers Basics** *(Level: Beginner)*

Run open models locally or on HF Inference Endpoints. pipeline() abstracts tokenization + model. Model cards document bias and intended use — read before production.

Code Reference:
```python
from transformers import pipeline
clf = pipeline('text-classification', model='distilbert-base-uncased-finetuned-sst-2-english')
print(clf('I love this course!'))
```
What it shows: pipeline returns label + score without manual tensor code.

### What it actually is
Hugging Face hosts open weights and standardized inference APIs.

### When to use it
When data residency or cost rules out closed APIs.

### Where to use it
On-prem sentiment, NER, and embedding models.

### Real use example
DistilBERT sentiment runs on CPU for PII-sensitive support ticket routing.

**Key takeaways**
- Hugging Face hosts open weights and standardized inference APIs.
- When data residency or cost rules out closed APIs.
- DistilBERT sentiment runs on CPU for PII-sensitive support ticket routing.

#### Chapter 6: Embeddings and Vector Search Intro *(Level: Beginner)*

**Chapter focus: Embeddings and Vector Search Intro** *(Level: Beginner)*

Embeddings map text to dense vectors; similar meaning → nearby vectors. Cosine similarity ranks matches. Normalize vectors for fair comparison.

Code Reference:
```python
import numpy as np

def cosine(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# higher cosine = more similar chunks
```
What it shows: Cosine is standard for OpenAI and sentence-transformer embeddings.

### What it actually is
Vector search finds relevant passages for RAG retrieval.

### When to use it
Document Q&A, duplicate detection, and recommendations.

### Where to use it
Knowledge bases, policy manuals, and course content.

### Real use example
Top-3 chunks about 'window functions' retrieved for SQL tutor prompt.

**Key takeaways**
- Vector search finds relevant passages for RAG retrieval.
- Document Q&A, duplicate detection, and recommendations.
- Top-3 chunks about 'window functions' retrieved for SQL tutor prompt.

---

### Track: Intermediate

#### Chapter 7: RAG Pipeline Architecture *(Level: Intermediate)*

**Chapter focus: RAG Pipeline Architecture** *(Level: Intermediate)*

RAG = Retrieve relevant chunks → Augment prompt → Generate answer. Components: ingest, chunk, embed, index, retrieve, rerank, generate, cite. Failure modes: wrong retrieval, hallucination despite context, stale index.

Code Reference:
```markdown
# RAG flow
# query -> embed -> top_k retrieve -> build prompt with context -> LLM -> answer + cites
```
What it shows: Explicit flow diagram helps debug which stage failed.

### What it actually is
RAG grounds LLM answers in private or fresh documents.

### When to use it
Enterprise knowledge assistants and support bots.

### Where to use it
Legal, HR policy, and technical documentation copilots.

### Real use example
Teacher asks about grading rubric — RAG pulls 2025 PDF not outdated blog.

**Key takeaways**
- RAG grounds LLM answers in private or fresh documents.
- Enterprise knowledge assistants and support bots.
- Teacher asks about grading rubric — RAG pulls 2025 PDF not outdated blog.

#### Chapter 8: Chunking and Metadata Strategies *(Level: Intermediate)*

**Chapter focus: Chunking and Metadata Strategies** *(Level: Intermediate)*

Chunk size 500-1000 tokens with 10-20% overlap preserves continuity. Attach metadata (source, page, section) for citations and filtered retrieval.

Code Reference:
```python
from langchain_text_splitters import RecursiveCharacterTextSplitter
splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=120)
chunks = splitter.split_documents(docs)
```
What it shows: Recursive splitter respects paragraph boundaries better than fixed char cuts.

### What it actually is
Smart chunking balances retrieval precision and context completeness.

### When to use it
Indexing long PDFs, wikis, and API docs.

### Where to use it
Any RAG system over heterogeneous documents.

### Real use example
Smaller chunks improved recall on API reference; larger chunks helped narrative guides.

**Key takeaways**
- Smart chunking balances retrieval precision and context completeness.
- Indexing long PDFs, wikis, and API docs.
- Smaller chunks improved recall on API reference; larger chunks helped narrative guides.

#### Chapter 9: Vector Databases: Chroma, Pinecone, pgvector *(Level: Intermediate)*

**Chapter focus: Vector Databases: Chroma, Pinecone, pgvector** *(Level: Intermediate)*

Chroma is local/dev-friendly; Pinecone managed scale; pgvector keeps vectors in Postgres. Use namespaces per tenant; HNSW indexes trade memory for speed.

Code Reference:
```sql
# pgvector
CREATE EXTENSION vector;
CREATE TABLE chunks (id serial, content text, embedding vector(1536));
CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);
```
What it shows: HNSW index accelerates similarity search on millions of vectors.

### What it actually is
Vector DBs persist embeddings with fast approximate nearest neighbor search.

### When to use it
Production RAG at scale with filtered metadata queries.

### Where to use it
SaaS copilots, semantic search, and recommendation recall.

### Real use example
pgvector co-locates vectors with OLTP data — simpler ops for mid-size teams.

**Key takeaways**
- Vector DBs persist embeddings with fast approximate nearest neighbor search.
- Production RAG at scale with filtered metadata queries.
- pgvector co-locates vectors with OLTP data — simpler ops for mid-size teams.

#### Chapter 10: LangChain and LlamaIndex Patterns *(Level: Intermediate)*

**Chapter focus: LangChain and LlamaIndex Patterns** *(Level: Intermediate)*

Frameworks wire retrievers, memory, and tools. LlamaIndex excels at indexing; LangChain at composable chains. Don't over-abstract — understand raw retrieval calls underneath.

Code Reference:
```python
from langchain_openai import ChatOpenAI
from langchain.chains import RetrievalQA

qa = RetrievalQA.from_chain_type(llm=ChatOpenAI(model='gpt-4o-mini'), retriever=vectordb.as_retriever(search_kwargs={'k': 5}))
```
What it shows: RetrievalQA wires retriever + LLM in few lines — swap components easily.

### What it actually is
Orchestration libraries speed RAG prototyping with swappable parts.

### When to use it
Rapid POCs and standard integration patterns.

### Where to use it
Internal tools teams shipping copilots in weeks.

### Real use example
Swap OpenAI for local Llama by changing llm class — chain unchanged.

**Key takeaways**
- Orchestration libraries speed RAG prototyping with swappable parts.
- Rapid POCs and standard integration patterns.
- Swap OpenAI for local Llama by changing llm class — chain unchanged.

#### Chapter 11: RAG Evaluation with RAGAS *(Level: Intermediate)*

**Chapter focus: RAG Evaluation with RAGAS** *(Level: Intermediate)*

RAGAS scores faithfulness, answer relevance, context precision/recall without human labels for every row. Build golden set of 50-100 QA pairs; run on every prompt/index change.

Code Reference:
```python
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy
result = evaluate(dataset=eval_ds, metrics=[faithfulness, answer_relevancy])
```
What it shows: faithfulness catches hallucinations not supported by retrieved context.

### What it actually is
Automated RAG eval prevents silent quality regressions.

### When to use it
Before promoting index or prompt changes to production.

### Where to use it
CI gates for enterprise copilots.

### Real use example
Faithfulness drops 0.12 after chunk size change — PR blocked until fixed.

**Key takeaways**
- Automated RAG eval prevents silent quality regressions.
- Before promoting index or prompt changes to production.
- Faithfulness drops 0.

#### Chapter 12: Safety, Guardrails, and Red Teaming *(Level: Intermediate)*

**Chapter focus: Safety, Guardrails, and Red Teaming** *(Level: Intermediate)*

Validate outputs with Pydantic/JSON schema; filter PII; block jailbreak patterns. Red team with adversarial prompts monthly. Log refusals for review.

Code Reference:
```python
from guardrails import Guard
guard = Guard().use_many(Validators...)
validated = guard.parse(llm_output)
```
What it shows: Guardrails reject malformed or policy-violating LLM outputs.

### What it actually is
Safety layers reduce legal, privacy, and brand risk.

### When to use it
Customer-facing and employee-facing copilots.

### Where to use it
Healthcare, finance, and education assistants.

### Real use example
Output filter strips SSN pattern before showing answer to support agent.

**Key takeaways**
- Safety layers reduce legal, privacy, and brand risk.
- Customer-facing and employee-facing copilots.
- Output filter strips SSN pattern before showing answer to support agent.

#### Chapter 13: Cost and Latency Optimization *(Level: Intermediate)*

**Chapter focus: Cost and Latency Optimization** *(Level: Intermediate)*

Use smaller models for routing; cache embeddings; batch embed jobs; set max_tokens; semantic cache returns prior answers for similar queries (2024+ libs).

Code Reference:
```markdown
# Cost tactics
# - gpt-4o-mini for draft, gpt-4o for escalate
# - Redis semantic cache
# - Precompute embeddings nightly
```
What it shows: Tiered models cut bill 60% with quality guard on escalate path.

### What it actually is
Optimization keeps GenAI economically viable at scale.

### When to use it
High-traffic copilots with finance scrutiny.

### Where to use it
Support chat, search autocomplete, and codegen.

### Real use example
Semantic cache hit rate 35% — p95 latency 1.2s → 0.4s.

**Key takeaways**
- Optimization keeps GenAI economically viable at scale.
- High-traffic copilots with finance scrutiny.
- Semantic cache hit rate 35% — p95 latency 1.

---

### Track: Advanced

#### Chapter 14: Multimodal Models (Vision + Text) *(Level: Advanced)*

**Chapter focus: Multimodal Models (Vision + Text)** *(Level: Advanced)*

GPT-4o, Claude 3.5+, and Gemini accept images + text. Use for diagram explanation, receipt OCR, and UI screenshot debugging. Watch image token pricing.

Code Reference:
```python
response = client.chat.completions.create(
  model='gpt-4o',
  messages=[{'role':'user','content':[
    {'type':'text','text':'What error is shown?'},
    {'type':'image_url','image_url':{'url': 'data:image/png;base64,...'}}
  ]}]
)
```
What it shows: image_url content block sends screenshot with question in one call.

### What it actually is
Multimodal LLMs reason over pixels and text jointly.

### When to use it
Visual troubleshooting, document understanding, and accessibility.

### Where to use it
Ed-tech diagram help, insurance claims, and field service apps.

### Real use example
Student uploads stats plot — tutor explains axis mislabel from vision input.

**Key takeaways**
- Multimodal LLMs reason over pixels and text jointly.
- Visual troubleshooting, document understanding, and accessibility.
- Student uploads stats plot — tutor explains axis mislabel from vision input.

#### Chapter 15: Production RAG with Re-Ranking *(Level: Advanced)*

**Chapter focus: Production RAG with Re-Ranking** *(Level: Advanced)*

Bi-encoder retrieval is fast but coarse; cross-encoder rerankers (Cohere rerank v3, bge-reranker) rescore top-50 to top-5 precisely. Latency tradeoff ~100-200ms.

Code Reference:
```python
from cohere import Client
r = cohere_client.rerank(model='rerank-v3.5', query=q, documents=chunks, top_n=5)
```
What it shows: Rerank pushes truly relevant chunk to top for generation.

### What it actually is
Re-ranking dramatically improves answer quality on noisy corpora.

### When to use it
Large wikis and multi-topic enterprise search.

### Where to use it
Compliance corpora where wrong paragraph is costly.

### Real use example
Rerank fixes case where BM25 top hit was glossary not procedure.

**Key takeaways**
- Re-ranking dramatically improves answer quality on noisy corpora.
- Large wikis and multi-topic enterprise search.
- Rerank fixes case where BM25 top hit was glossary not procedure.

#### Chapter 16: Fine-Tuning vs RAG vs Prompting *(Level: Advanced)*

**Chapter focus: Fine-Tuning vs RAG vs Prompting** *(Level: Advanced)*

Prompt when model knows task; RAG when knowledge is private/fresh; fine-tune when style/format/tool-use must be consistent and data is labeled. RLHF/DPO is vendor territory for most teams.

Code Reference:
```markdown
# Decision matrix
# Private docs -> RAG
# Brand tone / JSON tool style -> fine-tune LoRA
# General reasoning -> prompt + best model
```
What it shows: Matrix prevents expensive fine-tune on problems RAG solves.

### What it actually is
Architecture choice affects cost, maintenance, and quality ceiling.

### When to use it
Greenfield GenAI feature planning.

### Where to use it
Support tone fine-tune + policy RAG is common hybrid.

### Real use example
LoRA on 2k examples fixes JSON extraction; RAG still supplies facts.

**Key takeaways**
- Architecture choice affects cost, maintenance, and quality ceiling.
- Greenfield GenAI feature planning.
- LoRA on 2k examples fixes JSON extraction; RAG still supplies facts.

#### Chapter 17: Enterprise GenAI Governance *(Level: Advanced)*

**Chapter focus: Enterprise GenAI Governance** *(Level: Advanced)*

Catalog models, prompts, and datasets. Require security review for PII flows; data processing agreements with vendors; retention policies on logs.

Code Reference:
```markdown
# Governance artifacts
# - AI use case registry
# - DPIA for student data
# - Prompt version control
# - Incident response playbook
```
What it shows: Registry proves which model processed which data class.

### What it actually is
Governance makes GenAI deployable in regulated enterprises.

### When to use it
EU AI Act readiness and SOC2 customer questionnaires.

### Where to use it
Ed-tech, health, and financial services.

### Real use example
DPIA documents copilot uses anonymized snippets only — legal approves launch.

**Key takeaways**
- Governance makes GenAI deployable in regulated enterprises.
- EU AI Act readiness and SOC2 customer questionnaires.
- DPIA documents copilot uses anonymized snippets only — legal approves launch.

#### Chapter 18: GenAI Platform Architecture *(Level: Advanced)*

**Chapter focus: GenAI Platform Architecture** *(Level: Advanced)*

Platform exposes ingest API, embed jobs, chat API, eval hooks, and admin. Shared services: auth, rate limits, metering, vector isolation, observability (LangSmith/Langfuse).

Code Reference:
```markdown
# Services
# ingest | embed-worker | retriever | chat-api | eval-runner | admin-ui
```
What it shows: Horizontal services let product teams ship vertical copilots faster.

### What it actually is
GenAI platforms prevent one-off copilots with divergent security postures.

### When to use it
Companies with 5+ LLM features.

### Where to use it
Shopify Sidekick-style internal platforms.

### Real use example
New 'HR policy bot' uses platform auth and metering — shipped in 1 sprint not 3.

**Key takeaways**
- GenAI platforms prevent one-off copilots with divergent security postures.
- Companies with 5+ LLM features.
- New 'HR policy bot' uses platform auth and metering — shipped in 1 sprint not 3.

---

*Family: Generative AI Engineer | Level: Beginner to Advanced*

**Official sources & free libraries**
- https://platform.openai.com/docs/
- https://huggingface.co/docs/transformers/
- https://python.langchain.com/docs/
- https://docs.llamaindex.ai/
- https://docs.ragas.io/
- https://www.anthropic.com/research