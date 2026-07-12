# Study Report: Agentic AI Engineer — Career Path & Core Skills

*Written by Gagan Pasupuleti*

## Summary

This report covers the Agentic AI Engineer role for 2025-2026: autonomous agents, tool calling, LangGraph state machines, MCP (Model Context Protocol), multi-agent orchestration, human-in-the-loop approval gates, observability, and secure deployment of agent systems.

## Learning tracks

**Levels covered:** Beginner, Intermediate, Advanced

## Skill stack by level

### Beginner
- Agents vs chatbots distinction
- OpenAI function / tool calling
- ReAct reasoning loop pattern
- JSON schema tool definitions
- State and memory basics
- Error handling in agent loops
- Human approval for risky actions

### Intermediate
- LangGraph nodes and edges
- MCP client and server basics
- Multi-step plan execution
- Persistent checkpointing
- LangSmith tracing
- Prompt injection defenses
- Parallel tool calls
- Supervisor multi-agent patterns

### Advanced
- Custom MCP server development
- Long-horizon workflow durability
- Enterprise agent governance
- Agent eval harnesses (task success rate)
- Cost caps and budget-aware routing
- Cross-agent security boundaries
- Human-in-the-loop SLA design
- Agent platform architecture (2026)

## Recommended books (read alongside this report)

### 1. AI Agents in Action — Michael Lanham
- **Level:** Intermediate
- **Focus:** Agent loops, tool use, planning, and multi-step reasoning.
- **Link:** https://www.manning.com/books/ai-agents-in-action

### 2. Building LLM Powered Applications — Valentina Alto
- **Level:** Intermediate
- **Focus:** Production LLM apps: RAG, agents, guardrails, and scaling.
- **Link:** https://www.oreilly.com/library/view/building-llm-powered/9781098152918/

### 3. LangGraph Documentation — LangChain *(free online)*
- **Level:** Advanced
- **Focus:** State graphs, cycles, human-in-the-loop, and agent orchestration.
- **Link:** https://langchain-ai.github.io/langgraph/

### 4. Model Context Protocol — Anthropic *(free online)*
- **Level:** Advanced
- **Focus:** MCP standard for connecting LLMs to tools and data sources.
- **Link:** https://modelcontextprotocol.io/

### 5. Multi-Agent Systems — Gerhard Weiss
- **Level:** Advanced
- **Focus:** Theory and design of coordinated autonomous agent systems.
- **Link:** https://mitpress.mit.edu/9780262737317/multiagent-systems/

## End-to-end projects

### Project 1: Research Agent with Web Search
- **Level:** Beginner | **Duration:** 2 weeks
- **Overview:** LangChain agent that searches the web, summarizes findings, and cites sources.
- **Objectives:**
  - Define 3 tools (search, summarize, save)
  - Agent loop with max 5 steps
  - Output markdown report with citations
- **Phases:**
  - **Tools:** Implement tool functions. Tasks: Web search API, File writer. Deliverable: Tool schemas.
  - **Agent:** ReAct agent loop. Tasks: System prompt, Step limit. Deliverable: Agent running.
  - **Output:** Markdown report. Tasks: Citations, Summary sections. Deliverable: Sample research report.
  - **Test:** 5 benchmark queries. Tasks: Accuracy check, Source verify. Deliverable: Test results doc.
- **Final deliverables:** Agent code; Sample reports; Test results

### Project 2: CodeQuest Grading Agent
- **Level:** Intermediate | **Duration:** 3–4 weeks
- **Overview:** Agent reads student report submission, checks rubric criteria, drafts feedback — human approves before publish.
- **Objectives:**
  - Tools: load_report, check_rubric, draft_feedback
  - LangGraph state machine
  - Human-in-the-loop approval step
  - Audit log of all agent actions
- **Phases:**
  - **Tools:** Report + rubric tools. Tasks: JSON report loader, Rubric scorer. Deliverable: Tool unit tests.
  - **Graph:** LangGraph workflow. Tasks: Agent → Tools → Review node. Deliverable: Graph diagram.
  - **HITL:** Approval gate. Tasks: Teacher confirm UI, Reject/revise loop. Deliverable: Approval flow demo.
  - **Audit:** Log every action. Tasks: Tool calls, Prompts, Outputs. Deliverable: Audit log sample.
- **Final deliverables:** Grading agent; Graph diagram; Approval demo; Audit log

### Project 3: Multi-Agent DevOps Copilot
- **Level:** Advanced | **Duration:** 5–6 weeks
- **Overview:** Planner + executor + reviewer agents orchestrate deployment tasks via MCP tools with safety constraints.
- **Objectives:**
  - 3 specialized agents (plan, execute, review)
  - MCP tools for git, CI, and logs
  - Safety: block destructive ops without approval
  - Full trace visualization
- **Phases:**
  - **MCP:** Connect MCP servers. Tasks: Git tools, CI API, Log reader. Deliverable: MCP tool catalog.
  - **Agents:** Multi-agent graph. Tasks: Planner, Executor, Reviewer. Deliverable: Agent interaction diagram.
  - **Safety:** Destructive op gate. Tasks: Block list, Approval flow. Deliverable: Safety test cases passed.
  - **Trace:** Full run visualization. Tasks: LangSmith/Langfuse, Step replay. Deliverable: Trace walkthrough video.
- **Final deliverables:** Multi-agent system; MCP config; Safety tests; Trace demo video

## Chapters

---

### Track: Beginner

#### Chapter 1: Agentic AI Engineer Role Overview *(Level: Beginner)*

**Chapter focus: Agentic AI Engineer Role Overview** *(Level: Beginner)*

Agentic AI engineers build systems that plan, call tools, and act over multiple steps — not single-shot chat. 2025-2026 stacks center on LangGraph, MCP, and vendor tool APIs. Safety and human oversight are first-class, not afterthoughts.

Code Reference:
```markdown
# Agent loop
# 1. Observe user goal
# 2. Plan steps
# 3. Call tools
# 4. Reflect and continue or finish
```
What it shows: Loop structure distinguishes agents from one-turn completions.

### What it actually is
An agentic AI engineer designs autonomous workflows with tools and guardrails.

### When to use it
When tasks require multiple API calls, code execution, or document retrieval.

### Where to use it
DevOps copilots, sales research agents, and support automation.

### Real use example
CodeQuest grading agent fetches rubric, runs tests, drafts feedback — teacher approves send.

**Key takeaways**
- An agentic AI engineer designs autonomous workflows with tools and guardrails.
- When tasks require multiple API calls, code execution, or document retrieval.
- CodeQuest grading agent fetches rubric, runs tests, drafts feedback — teacher approves send.

#### Chapter 2: Agents vs Chatbots *(Level: Beginner)*

**Chapter focus: Agents vs Chatbots** *(Level: Beginner)*

Chatbots respond once per message. Agents maintain state, choose tools, and iterate until a stop condition. Extra failure modes: infinite loops, wrong tool args, cascading errors.

Code Reference:
```markdown
CHATBOT: user -> LLM -> reply
AGENT: user -> LLM -> tool -> result -> LLM -> ... -> final reply
```
What it shows: Diagram shows agent's extra tool feedback edges.

### What it actually is
Agents extend LLMs with action loops and environment interaction.

### When to use it
Multi-step workflows exceeding one prompt's capability.

### Where to use it
Ticket triage, data analysis requests, and deployment assistants.

### Real use example
Chatbot can't query DB; agent runs SQL tool then summarizes — correct answer.

**Key takeaways**
- Agents extend LLMs with action loops and environment interaction.
- Multi-step workflows exceeding one prompt's capability.
- Chatbot can't query DB; agent runs SQL tool then summarizes — correct answer.

#### Chapter 3: Tool Calling with OpenAI API *(Level: Beginner)*

**Chapter focus: Tool Calling with OpenAI API** *(Level: Beginner)*

Define tools with JSON Schema parameters. Model returns tool_calls; you execute and append tool role messages. Parallel tool calls supported in GPT-4o+.

Code Reference:
```python
tools = [{
  'type': 'function',
  'function': {
    'name': 'get_weather',
    'parameters': {'type':'object','properties':{'city':{'type':'string'}},'required':['city']}
  }
}]
```
What it shows: Schema tells model argument names and types — reduces malformed calls.

### What it actually is
Tool calling lets LLMs invoke your code and external APIs safely.

### When to use it
Any agent needing live data or side effects.

### Where to use it
Calendar booking, CRM updates, and warehouse queries.

### Real use example
Agent calls get_order_count(customer_id) — factual answer not hallucinated revenue.

**Key takeaways**
- Tool calling lets LLMs invoke your code and external APIs safely.
- Any agent needing live data or side effects.
- Agent calls get_order_count(customer_id) — factual answer not hallucinated revenue.

#### Chapter 4: ReAct: Reason and Act Loop *(Level: Beginner)*

**Chapter focus: ReAct: Reason and Act Loop** *(Level: Beginner)*

ReAct interleaves Thought, Action, Observation text or structured tool calls. Cap max iterations; detect repeated actions as loop guard.

Code Reference:
```python
for step in range(MAX_STEPS):
    action = llm.choose_tool(messages)
    if action.name == 'finish': break
    result = run_tool(action)
    messages.append(tool_result(result))
```
What it shows: MAX_STEPS prevents runaway token spend on confused agents.

### What it actually is
ReAct is the foundational pattern for LLM agents before graph frameworks.

### When to use it
Teaching agents, prototypes, and simple automation.

### Where to use it
Research summarizers and internal ops bots.

### Real use example
Agent tries search twice, gets same snippet — loop guard triggers human escalation.

**Key takeaways**
- ReAct is the foundational pattern for LLM agents before graph frameworks.
- Teaching agents, prototypes, and simple automation.
- Agent tries search twice, gets same snippet — loop guard triggers human escalation.

#### Chapter 5: Designing Tool Schemas *(Level: Beginner)*

**Chapter focus: Designing Tool Schemas** *(Level: Beginner)*

One tool = one clear action. Required fields explicit; enums for allowed values. Write descriptions models read — 'Use only when user asks about orders'.

Code Reference:
```json
{
  'name': 'run_sql_readonly',
  'description': 'Run SELECT query on analytics warehouse. Never INSERT.',
  'parameters': {'type':'object','properties':{'query':{'type':'string'}},'required':['query']}
}
```
What it shows: Description constrains when model invokes SQL — reduces destructive mistakes.

### What it actually is
Tool schemas are the API contract between LLM and your backend.

### When to use it
Designing every agent tool surface.

### Where to use it
SQL agents, Git agents, and ticketing integrations.

### Real use example
Enum status filter prevents agent inventing invalid order status values.

**Key takeaways**
- Tool schemas are the API contract between LLM and your backend.
- Designing every agent tool surface.
- Enum status filter prevents agent inventing invalid order status values.

#### Chapter 6: Human-in-the-Loop Basics *(Level: Beginner)*

**Chapter focus: Human-in-the-Loop Basics** *(Level: Beginner)*

Irreversible actions (send email, charge card, delete row) require human approval. Pause agent, surface proposed action in UI, resume on approve/reject.

Code Reference:
```python
if tool_name in NEEDS_APPROVAL:
    pending = request_human_approval(tool_args)
    if not pending.approved:
        return 'Action cancelled by user'
```
What it shows: Approval gate blocks autonomous sends — compliance requirement in many domains.

### What it actually is
Human-in-the-loop keeps agents accountable for high-impact actions.

### When to use it
Before any irreversible side effect executes in an agent workflow.

### Where to use it
Finance, healthcare, external communications, and prod deploys.

### Real use example
Teacher approves batch feedback emails before agent sends to 200 students.

**Key takeaways**
- Human-in-the-loop keeps agents accountable for high-impact actions.
- Before any irreversible side effect executes in an agent workflow.
- Teacher approves batch feedback emails before agent sends to 200 students.

---

### Track: Intermediate

#### Chapter 7: LangGraph StateGraph Fundamentals *(Level: Intermediate)*

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

#### Chapter 8: MCP: Model Context Protocol *(Level: Intermediate)*

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

#### Chapter 9: Building an MCP Server *(Level: Intermediate)*

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

#### Chapter 10: Multi-Agent Supervisor Pattern *(Level: Intermediate)*

**Chapter focus: Multi-Agent Supervisor Pattern** *(Level: Intermediate)*

Supervisor agent delegates to specialists (researcher, coder, reviewer). Workers return concise results; supervisor maintains global plan. Avoid chatty inter-agent loops.

Code Reference:
```python
SUPERVISOR_PROMPT = """Break task into subtasks. Delegate to researcher or coder.
Merge results. Stop when acceptance criteria met."""
```
What it shows: Supervisor prompt enforces delegation discipline — reduces token waste.

### What it actually is
Multi-agent splits complex work across focused prompts and tools.

### When to use it
Large tasks: feature specs, incident response, market research reports.

### Where to use it
Consulting research, software feature shipping, security triage.

### Real use example
Supervisor sends coder only the API snippet — not entire 50-page spec.

**Key takeaways**
- Multi-agent splits complex work across focused prompts and tools.
- Large tasks: feature specs, incident response, market research reports.
- Supervisor sends coder only the API snippet — not entire 50-page spec.

#### Chapter 11: Checkpointing and Durable Execution *(Level: Intermediate)*

**Chapter focus: Checkpointing and Durable Execution** *(Level: Intermediate)*

LangGraph checkpointers (SQLite, Postgres) save state per thread_id. Enables pause/resume, crash recovery, and human approval mid-flight.

Code Reference:
```python
from langgraph.checkpoint.sqlite import SqliteSaver
memory = SqliteSaver.from_conn_string('checkpoints.db')
app = graph.compile(checkpointer=memory)
app.invoke(input, config={'configurable': {'thread_id': 'job-42'}})
```
What it shows: thread_id keys state — same user continues conversation days later.

### What it actually is
Durable execution makes agents reliable for long-running work.

### When to use it
Approvals spanning hours; workflows surviving deploys.

### Where to use it
Loan processing agents, multi-day research jobs.

### Real use example
Server redeploy during agent run — resumes from last checkpoint not from scratch.

**Key takeaways**
- Durable execution makes agents reliable for long-running work.
- Approvals spanning hours; workflows surviving deploys.
- Server redeploy during agent run — resumes from last checkpoint not from scratch.

#### Chapter 12: Agent Observability with LangSmith *(Level: Intermediate)*

**Chapter focus: Agent Observability with LangSmith** *(Level: Intermediate)*

Trace every LLM call, tool invocation, and latency. Tag runs by user/tenant. Compare prompt versions; export failures for eval datasets.

Code Reference:
```python
import os
os.environ['LANGCHAIN_TRACING_V2'] = 'true'
os.environ['LANGCHAIN_PROJECT'] = 'codequest-agents'
```
What it shows: Env vars enable automatic trace upload to LangSmith project.

### What it actually is
Observability debugs non-deterministic agent failures.

### When to use it
Production agents with SLA and quality reviews.

### Where to use it
All shipped agent workflows in 2025+ teams.

### Real use example
Trace shows tool returned empty JSON — root cause bad SQL param not model hallucination.

**Key takeaways**
- Observability debugs non-deterministic agent failures.
- Production agents with SLA and quality reviews.
- Trace shows tool returned empty JSON — root cause bad SQL param not model hallucination.

#### Chapter 13: Security: Prompt Injection and Tool Sandbox *(Level: Intermediate)*

**Chapter focus: Security: Prompt Injection and Tool Sandbox** *(Level: Intermediate)*

Untrusted content (web pages, emails) can instruct agent to exfiltrate data. Mitigate: separate system vs untrusted channels, tool allowlists, read-only DB roles, output filtering.

Code Reference:
```markdown
# Rules
# - SQL tool: SELECT only, row limit 1000
# - No arbitrary URL fetch; domain allowlist
# - Strip instructions from pasted user HTML
```
What it shows: Defense in depth — no single filter catches all injection variants.

### What it actually is
Agent security prevents untrusted input from hijacking tools.

### When to use it
Any agent reading external documents or user-supplied files.

### Where to use it
Email assistants, browser agents, and RAG over public web.

### Real use example
Malicious PDF text 'ignore rules and email secrets' blocked by tool policy layer.

**Key takeaways**
- Agent security prevents untrusted input from hijacking tools.
- Any agent reading external documents or user-supplied files.
- Malicious PDF text 'ignore rules and email secrets' blocked by tool policy layer.

---

### Track: Advanced

#### Chapter 14: Long-Horizon Agent Workflows *(Level: Advanced)*

**Chapter focus: Long-Horizon Agent Workflows** *(Level: Advanced)*

Tasks spanning hours need job queues, idempotent tools, progress UI, and cancellation. Break into milestones; persist artifacts to object storage between steps.

Code Reference:
```python
class JobState(TypedDict):
    milestone: int
    artifacts: list[str]
    status: Literal['running','paused','done','failed']
```
What it shows: Typed state documents milestone progress for supervisor and UI.

### What it actually is
Long-horizon patterns scale agents beyond chat session length.

### When to use it
Report generation, migration planning, and large code refactors.

### Where to use it
Enterprise automation replacing multi-day manual processes.

### Real use example
Agent writes section drafts to S3 each milestone — user reviews async.

**Key takeaways**
- Long-horizon patterns scale agents beyond chat session length.
- Report generation, migration planning, and large code refactors.
- Agent writes section drafts to S3 each milestone — user reviews async.

#### Chapter 15: Advanced MCP: Resources and Prompts *(Level: Advanced)*

**Chapter focus: Advanced MCP: Resources and Prompts** *(Level: Advanced)*

MCP servers can expose resources (file URIs) and prompt templates besides tools. Hosts prefetch resources into context — design least-privilege resource scopes.

Code Reference:
```json
{
  "method": "resources/read",
  "params": {"uri": "file:///policy/handbook.md"}
}
```
What it shows: resources/read returns content host may inject before agent acts.

### What it actually is
Full MCP surface enables richer integrations than tools alone.

### When to use it
IDE and ops agents needing structured context injection.

### Where to use it
Policy handbooks, runbooks, and schema catalogs.

### Real use example
Agent pulls latest on-call runbook resource URI — always current version.

**Key takeaways**
- Full MCP surface enables richer integrations than tools alone.
- IDE and ops agents needing structured context injection.
- Agent pulls latest on-call runbook resource URI — always current version.

#### Chapter 16: Evaluating Agent Reliability *(Level: Advanced)*

**Chapter focus: Evaluating Agent Reliability** *(Level: Advanced)*

Define task success criteria per scenario (tool called, correct arg, final answer contains X). Run nightly regression; track success rate, steps-to-complete, cost per task.

Code Reference:
```python
def eval_task(run):
    assert run.tool_calls[0].name == 'search'
    assert 'Q3 revenue' in run.final_answer
    assert run.steps <= 8
```
What it shows: Assert-style evals codify pass/fail for CI agent regression.

### What it actually is
Agent evals measure reliability beyond single-turn LLM benchmarks.

### When to use it
Before promoting agent prompt or tool changes.

### Where to use it
Platform teams and regulated agent deployments.

### Real use example
Success rate drops from 92% to 81% after model swap — rollback triggered.

**Key takeaways**
- Agent evals measure reliability beyond single-turn LLM benchmarks.
- Before promoting agent prompt or tool changes.
- Success rate drops from 92% to 81% after model swap — rollback triggered.

#### Chapter 17: Enterprise Agent Governance (2025-2026) *(Level: Advanced)*

**Chapter focus: Enterprise Agent Governance (2025-2026)** *(Level: Advanced)*

Register agents with owner, allowed tools, data classes, and blast radius. Require security sign-off for write tools; audit every tool call; per-tenant isolation.

Code Reference:
```markdown
# Agent registry fields
# id, owner, tools[], data_classification, max_cost_usd, requires_hitl
```
What it shows: Registry blocks deploy if write tool enabled without HITL flag.

### What it actually is
Governance scales agent adoption without shadow IT bots.

### When to use it
Enterprises with hundreds of employees using AI assistants.

### Where to use it
Banks, insurers, and global SaaS vendors.

### Real use example
New sales agent can't access prod DB — registry enforces read replica tool only.

**Key takeaways**
- Governance scales agent adoption without shadow IT bots.
- Enterprises with hundreds of employees using AI assistants.
- New sales agent can't access prod DB — registry enforces read replica tool only.

#### Chapter 18: Agentic Platform Architecture *(Level: Advanced)*

**Chapter focus: Agentic Platform Architecture** *(Level: Advanced)*

Platform provides: agent runtime, MCP registry, secrets, HITL inbox, eval CI, and cost dashboard. Product teams deploy graphs like microservices with standard auth and logging.

Code Reference:
```markdown
# Platform map
# gateway | graph-runtime | mcp-registry | hitl-service | eval-runner | billing
```
What it shows: Gateway enforces ACLs before any tool executes — single security choke point.

### What it actually is
Agent platforms industrialize agents like microservices platforms did for APIs.

### When to use it
Organizations running 10+ distinct agent workflows.

### Where to use it
Internal developer platforms and customer-facing agent marketplaces.

### Real use example
Team ships incident-response graph to platform — inherits SSO, traces, and budgets day one.

**Key takeaways**
- Agent platforms industrialize agents like microservices platforms did for APIs.
- Organizations running 10+ distinct agent workflows.
- Team ships incident-response graph to platform — inherits SSO, traces, and budgets day one.

---

*Family: Agentic AI Engineer | Level: Beginner to Advanced*

**Official sources & free libraries**
- https://langchain-ai.github.io/langgraph/
- https://modelcontextprotocol.io/docs
- https://platform.openai.com/docs/guides/function-calling
- https://docs.anthropic.com/en/docs/build-with-claude/tool-use
- https://docs.smith.langchain.com/
- https://google.github.io/adk-docs/