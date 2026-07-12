# Study Report: Building LLM Powered Applications — Agentic AI Engineer

*Written by Gagan Pasupuleti*
*Book study report | Building LLM Powered Applications by Valentina Alto*

## Summary

Study report for *Building LLM Powered Applications* by Valentina Alto (Intermediate level) mapped to the Agentic AI Engineer role. Production LLM apps: RAG, agents, guardrails, and scaling.

## Chapters

---

### Track: Book-Intro

#### Chapter 1: About Building LLM Powered Applications *(Level: Intermediate)*

**Chapter focus: About Building LLM Powered Applications** *(Level: Intermediate)*

This study report summarizes *Building LLM Powered Applications* by Valentina Alto for the Agentic AI Engineer role. The resource is rated Intermediate level. Production LLM apps: RAG, agents, guardrails, and scaling. Use this report alongside the official material to prepare for CodeQuest review.

Code Reference:
```text
# Building LLM Powered Applications
# Author: Valentina Alto
# Role: Agentic AI Engineer
# Level: Intermediate
```
What it shows: Metadata block records the source book and target role family.

### What it actually is
A structured study report based on Building LLM Powered Applications.

### When to use it
When learning Agentic AI Engineer skills at Intermediate level.

### Where to use it
Agentic AI Engineer training paths and certification prep.

### Real use example
A learner reads this report before starting the full book or free online guide.

**Key takeaways**
- A structured study report based on Building LLM Powered Applications.
- When learning Agentic AI Engineer skills at Intermediate level.
- A learner reads this report before starting the full book or free online guide.

---

### Track: Book-Context

#### Chapter 2: Why This Book Matters for Your Role *(Level: Intermediate)*

**Chapter focus: Why This Book Matters for Your Role** *(Level: Intermediate)*

Agentic AI Engineer professionals use ideas from Building LLM Powered Applications to solve real workplace problems. Production LLM apps: RAG, agents, guardrails, and scaling. This chapter explains how the book fits into your learning path and what you should be able to do after studying it.

Code Reference:
```text
Role: Agentic AI Engineer
Book focus: Production LLM apps: RAG, agents, guardrails, and scaling.
Recommended level: Intermediate
```
What it shows: Connects the book topic to the job role outcomes.

### What it actually is
Role-aligned learning connects theory to job tasks.

### When to use it
During career planning and syllabus design.

### Where to use it
Agentic AI Engineer bootcamps and CodeQuest teacher assignments.

### Real use example
A teacher assigns this book report before a intermediate skills checkpoint.

**Key takeaways**
- Role-aligned learning connects theory to job tasks.
- During career planning and syllabus design.
- A teacher assigns this book report before a intermediate skills checkpoint.

---

### Track: Book-Topics

#### Chapter 3: Key Topics Covered *(Level: Intermediate)*

**Chapter focus: Key Topics Covered** *(Level: Intermediate)*

The main topics in Building LLM Powered Applications include practical concepts described as: Production LLM apps: RAG, agents, guardrails, and scaling. Study each topic with hands-on practice. Take notes on definitions, workflows, and examples that match tools used in Agentic AI Engineer jobs today.

Code Reference:
```text
- Topic 1: core concept
- Topic 2: core concept
- Topic 3: core concept
- Topic 4: core concept
```
What it shows: Topic list guides what to study chapter-by-chapter in the source.

### What it actually is
Topic maps turn a book into actionable learning objectives.

### When to use it
Before reading and while building chapter summaries.

### Where to use it
Self-study, flipped classroom, and revision.

### Real use example
A student maps each book chapter to a CodeQuest report section.

**Key takeaways**
- Topic maps turn a book into actionable learning objectives.
- Before reading and while building chapter summaries.
- A student maps each book chapter to a CodeQuest report section.

---

### Track: Book-Applied

#### Chapter 4: Applied: LangGraph StateGraph Fundamentals *(Level: Intermediate)*

**Chapter focus: LangGraph StateGraph Fundamentals** *(Level: Intermediate)*

LangGraph models agents as graphs: nodes mutate shared state; edges route conditionally. Supports cycles, persistence, and interrupts — unlike DAG-only chains.

Code Reference:
```python
from langgraph.graph import StateGraph, END

graph = StateGraph(AgentState)
graph.add_node('plan', plan_node)
graph.add_node('act', act_node)
graph.add_edge('plan', 'act')
graph.add_conditional_edges('act', should_continue, {'continue': 'plan', 'end': END})
```
What it shows: conditional_edges implement loop-or-stop logic declaratively.

### What it actually is
LangGraph is a framework for durable, stateful agent workflows.

### When to use it
Production agents needing checkpoints and branching.

### Where to use it
Support automation, coding agents, and ops runbooks.

### Real use example
Graph resumes from checkpoint after server restart mid-workflow.

**Key takeaways**
- LangGraph is a framework for durable, stateful agent workflows.
- Production agents needing checkpoints and branching.
- Graph resumes from checkpoint after server restart mid-workflow.

#### Chapter 5: Applied: MCP: Model Context Protocol *(Level: Intermediate)*

**Chapter focus: MCP: Model Context Protocol** *(Level: Intermediate)*

MCP (Anthropic, 2024-2025) standardizes how hosts connect to tools/data via JSON-RPC. Servers expose resources, prompts, and tools — Cursor and Claude Desktop use MCP today.

Code Reference:
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {"name": "query_db", "arguments": {"sql": "SELECT 1"}}
}
```
What it shows: tools/call invokes MCP server capability with typed args.

### What it actually is
MCP is an open protocol for portable tool integrations across LLM hosts.

### When to use it
Building reusable connectors instead of one-off agent hacks.

### Where to use it
IDE assistants, enterprise copilots, and shared data access layers.

### Real use example
Railway MCP server deploys services — agent uses same tool in Cursor and internal bot.

**Key takeaways**
- MCP is an open protocol for portable tool integrations across LLM hosts.
- Building reusable connectors instead of one-off agent hacks.
- Railway MCP server deploys services — agent uses same tool in Cursor and internal bot.

#### Chapter 6: Applied: Building an MCP Server *(Level: Intermediate)*

**Chapter focus: Building an MCP Server** *(Level: Intermediate)*

Python MCP SDK: define @server.list_tools and @server.call_tool handlers. Run stdio for local hosts or SSE for remote. Validate inputs; never expose raw shell.

Code Reference:
```python
from mcp.server import Server
server = Server('docs-search')

@server.list_tools()
async def list_tools():
    return [Tool(name='search', description='Search internal wiki', inputSchema={...})]
```
What it shows: list_tools advertises capabilities; call_tool executes with validation.

### What it actually is
Custom MCP servers package domain tools for any compatible host.

### When to use it
Shared internal tools across Claude, Cursor, and custom agents.

### Where to use it
Wiki search, Jira, and data catalog integrations.

### Real use example
Docs MCP server powers both IDE and Slack agent with one codebase.

**Key takeaways**
- Custom MCP servers package domain tools for any compatible host.
- Shared internal tools across Claude, Cursor, and custom agents.
- Docs MCP server powers both IDE and Slack agent with one codebase.

---

### Track: Book-Plan

#### Chapter 7: Study Plan and Practice *(Level: Intermediate)*

**Chapter focus: Study Plan and Practice** *(Level: Intermediate)*

Finish Building LLM Powered Applications with a weekly plan: read one section, write a summary, complete one exercise, and reflect on how it applies to Agentic AI Engineer. If a free edition exists, practice every example. Submit your notes and one mini-project demo for teacher review.

Code Reference:
```text
Week 1: Read + notes
Week 2: Exercises
Week 3: Mini project
Week 4: Review + quiz
```
What it shows: A 4-week plan turns reading into demonstrable skill.

### What it actually is
Structured study plans improve retention and portfolio outcomes.

### When to use it
After finishing the key topics chapters.

### Where to use it
CodeQuest end-of-unit assessments.

### Real use example
A learner completes the study plan and uploads a intermediate project screenshot.

**Key takeaways**
- Structured study plans improve retention and portfolio outcomes.
- After finishing the key topics chapters.
- A learner completes the study plan and uploads a intermediate project screenshot.

---

*Family: Agentic AI Engineer | Level: Intermediate*

**Official sources & free libraries**
- https://www.oreilly.com/library/view/building-llm-powered/9781098152918/