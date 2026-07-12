# Study Report: Business Analyst — Career Path & Core Skills

*Written by Gagan Pasupuleti*

## Summary

Business analysis career path aligned to BABOK v3: elicitation, requirements lifecycle, user stories and acceptance criteria, BPMN process modeling, backlog refinement, UAT planning, and Agile stakeholder facilitation. Combines IIBA guidance with practical Agile delivery for software, operations, and digital transformation initiatives.

## Learning tracks

**Levels covered:** Beginner, Intermediate, Advanced

## Skill stack by level

## Recommended books (read alongside this report)

### 1. Business Analysis Body of Knowledge (BABOK v3) — IIBA
- **Level:** Intermediate
- **Focus:** Industry standard for requirements, elicitation, and solution evaluation.
- **Link:** https://www.iiba.org/business-analysis-standards/business-analysis-body-of-knowledge/

### 2. User Story Mapping — Jeff Patton
- **Level:** Beginner
- **Focus:** Visual backlog design and release planning with user stories.
- **Link:** https://www.jpattonassociates.com/user-story-mapping/

### 3. Writing Effective Use Cases — Alistair Cockburn
- **Level:** Intermediate
- **Focus:** Use case structure for clear functional requirements.
- **Link:** https://www.oreilly.com/library/view/writing-effective-use/9780131422284/

### 4. Agile Estimating and Planning — Mike Cohn
- **Level:** Intermediate
- **Focus:** Story points, velocity, and sprint planning for BAs in Agile teams.
- **Link:** https://www.mountaingoatsoftware.com/books/agile-estimating-and-planning

### 5. BPMN Method and Style — Bruce Silver
- **Level:** Beginner
- **Focus:** Process modeling notation for workflow and approval diagrams.
- **Link:** https://www.bpmswatch.com/bpmn-method-and-style/

## End-to-end projects

### Project 1: Requirements Doc for Mobile App Feature
- **Level:** Beginner | **Duration:** 2 weeks
- **Overview:** Elicit requirements for a 'dark mode' feature: interviews, user stories, acceptance criteria, mock wireframe.
- **Objectives:**
  - 2 stakeholder interview summaries
  - 5 user stories with acceptance criteria
  - Wireframe mockup
  - Requirements traceability matrix
- **Phases:**
  - **Elicit:** Stakeholder interviews. Tasks: Question guide, Notes. Deliverable: Interview summaries.
  - **Stories:** User stories + AC. Tasks: Given/When/Then, Priority. Deliverable: Backlog document.
  - **Wireframe:** Low-fi mockup. Tasks: Figma/Balsamiq, Annotations. Deliverable: Wireframe PDF.
  - **RTM:** Traceability matrix. Tasks: Story → AC → Test. Deliverable: RTM spreadsheet.
- **Final deliverables:** Requirements doc; User stories; Wireframe; RTM

### Project 2: CodeQuest Marking Workflow Analysis
- **Level:** Intermediate | **Duration:** 3 weeks
- **Overview:** Map current vs future state with BPMN, define requirements for teacher marking feature, write UAT plan.
- **Objectives:**
  - As-is and to-be BPMN diagrams
  - 15 functional requirements
  - UAT test plan with 10 cases
  - Stakeholder sign-off template
- **Phases:**
  - **As-Is:** Current process map. Tasks: Pain points, Bottlenecks. Deliverable: As-is BPMN.
  - **To-Be:** Future state design. Tasks: Automation points, Roles. Deliverable: To-be BPMN.
  - **Requirements:** Functional + non-functional. Tasks: FR-001 to FR-015, NFRs. Deliverable: Requirements spec.
  - **UAT:** Test plan. Tasks: 10 test cases, Sign-off form. Deliverable: UAT plan PDF.
- **Final deliverables:** BPMN diagrams; Requirements spec; UAT plan

### Project 3: ERP Replacement Business Case
- **Level:** Advanced | **Duration:** 4–5 weeks
- **Overview:** Full business case: cost-benefit analysis, risk register, implementation roadmap, and executive presentation.
- **Objectives:**
  - Cost-benefit analysis (3-year TCO)
  - Risk register with mitigations
  - Phased implementation roadmap
  - Executive summary presentation
- **Phases:**
  - **Analysis:** Current state costs. Tasks: License, Maintenance, Labor. Deliverable: Cost baseline.
  - **Business Case:** ROI and benefits. Tasks: Efficiency gains, Risk reduction. Deliverable: Business case doc.
  - **Roadmap:** 3-phase implementation. Tasks: Pilot, Rollout, Optimize. Deliverable: Gantt roadmap.
  - **Present:** Executive deck. Tasks: Recommendation, Ask. Deliverable: Board presentation PDF.
- **Final deliverables:** Business case document; Risk register; Roadmap; Executive deck

## Chapters

---

### Track: Beginner

#### Chapter 1: Business Analyst Role and BABOK Overview *(Level: Beginner)*

**Chapter focus: Business Analyst Role and BABOK Overview** *(Level: Beginner)*

Business analysts bridge business problems and technical solutions. BABOK v3 defines six knowledge areas: planning, elicitation, requirements life cycle, strategy analysis, design definition, and solution evaluation. BAs facilitate—they rarely dictate. Success is measured by delivered outcomes and stakeholder satisfaction, not document page count.

Code Reference:
```python
# BABOK knowledge areas
areas = ['Planning', 'Elicitation', 'Requirements', 'Strategy',
         'Design', 'Evaluation']
```
What it shows: Listing BABOK areas frames your study plan for IIBA certifications.

### What it actually is
A business analyst clarifies needs and translates them into actionable requirements.

### When to use it
New product features, process improvements, and system replacements.

### Where to use it
Software teams, banks, healthcare IT, and public-sector digital services.

### Real use example
CodeQuest hires a BA to interview instructors about grading pain before developers write code.

**Key takeaways**
- A business analyst clarifies needs and translates them into actionable requirements.
- New product features, process improvements, and system replacements.
- CodeQuest hires a BA to interview instructors about grading pain before developers write code.

#### Chapter 2: Stakeholder Identification and RACI *(Level: Beginner)*

**Chapter focus: Stakeholder Identification and RACI** *(Level: Beginner)*

Map stakeholders by influence and interest. RACI charts assign Responsible, Accountable, Consulted, and Informed roles per deliverable. Executive sponsors need concise updates; end users need empathy and jargon-free language. Maintain a stakeholder register with communication preferences.

Code Reference:
```python
stakeholders = {
  'Product Owner': 'Accountable',
  'Lead Teacher': 'Consulted',
  'Dev Team': 'Responsible',
  'Compliance': 'Informed'
}
```
What it shows: RACI dictionaries prevent approval bottlenecks during delivery.

### What it actually is
Stakeholder analysis ensures the right voices are heard at the right time.

### When to use it
Project kickoff and whenever scope or org changes.

### Where to use it
Cross-functional Agile squads and PMO-led programs.

### Real use example
RACI clarifies who approves scope changes when legal must be Consulted on student data features.

**Key takeaways**
- Stakeholder analysis ensures the right voices are heard at the right time.
- Project kickoff and whenever scope or org changes.
- RACI clarifies who approves scope changes when legal must be Consulted on student data features.

#### Chapter 3: Elicitation Techniques *(Level: Beginner)*

**Chapter focus: Elicitation Techniques** *(Level: Beginner)*

Techniques include interviews, workshops, observation, document analysis, prototyping, and surveys. Combine methods—workshops surface alignment; interviews reveal nuance. Prepare open-ended questions, paraphrase answers, and validate with 'Did I understand correctly?'

Code Reference:
```python
questions = [
  'What triggers this process today?',
  'What breaks most often?',
  'How do you measure success?'
]
```
What it shows: Open questions uncover root needs instead of confirming biases.

### What it actually is
Elicitation gathers tacit and explicit business knowledge.

### When to use it
Discovery phases before committing to solutions.

### Where to use it
Any project with human workflows and policy constraints.

### Real use example
Workshop reveals teachers export CSV manually weekly—hidden step never in original RFP.

**Key takeaways**
- Elicitation gathers tacit and explicit business knowledge.
- Discovery phases before committing to solutions.
- Workshop reveals teachers export CSV manually weekly—hidden step never in original RFP.

#### Chapter 4: User Stories and INVEST Criteria *(Level: Beginner)*

**Chapter focus: User Stories and INVEST Criteria** *(Level: Beginner)*

User stories follow: As a <role>, I want <capability>, so that <benefit>. INVEST: Independent, Negotiable, Valuable, Estimable, Small, Testable. Split epics vertically by user outcome, not horizontally by technical layer. Definition of Ready gates sprint planning.

Code Reference:
```python
story = '''As a student, I want to resume a quiz after logout,
so that I do not lose progress during network drops.'''
```
What it shows: Well-formed stories anchor refinement and acceptance testing.

### What it actually is
User stories express requirements in user-value language for Agile teams.

### When to use it
Product backlog creation and sprint refinement.

### Where to use it
Scrum teams, Kanban boards, and hybrid Agile-Waterfall.

### Real use example
Epic 'Analytics' splits into stories for filters, export, and role-based dashboards.

**Key takeaways**
- User stories express requirements in user-value language for Agile teams.
- Product backlog creation and sprint refinement.
- Epic 'Analytics' splits into stories for filters, export, and role-based dashboards.

#### Chapter 5: Acceptance Criteria and Gherkin *(Level: Beginner)*

**Chapter focus: Acceptance Criteria and Gherkin** *(Level: Beginner)*

Acceptance criteria define done from the business perspective. Gherkin Given-When-Then scenarios become automated tests in Cucumber or SpecFlow. Write positive, negative, and edge cases. Avoid technical implementation in criteria—focus on observable behavior.

Code Reference:
```python
Scenario: Resume quiz
  Given a student started quiz Q7
  When they log in within 24 hours
  Then they continue at Q7
```
What it shows: Gherkin bridges BA specs and QA automation.

### What it actually is
Acceptance criteria are testable conditions for story completion.

### When to use it
Refinement, sprint planning, and UAT script authoring.

### Where to use it
Agile software delivery and regulated industries needing audit trails.

### Real use example
Criteria catch ambiguous 'fast loading' by specifying '< 2s at p95 on 4G'.

**Key takeaways**
- Acceptance criteria are testable conditions for story completion.
- Refinement, sprint planning, and UAT script authoring.
- Criteria catch ambiguous 'fast loading' by specifying '< 2s at p95 on 4G'.

#### Chapter 6: Requirements Documentation Types *(Level: Beginner)*

**Chapter focus: Requirements Documentation Types** *(Level: Beginner)*

BAs produce business requirements documents (BRD), functional specs, wireframes, data dictionaries, and context diagrams. Tailor depth to methodology—Agile favors living wiki pages over shelf-ware. Version everything; trace IDs link stories to regulations.

Code Reference:
```python
req = {'id': 'BR-014', 'text': 'Export grades CSV', 'source': 'Sponsor interview 2026-03-01'}
```
What it shows: Structured requirement objects support traceability matrices.

### What it actually is
Documentation types communicate needs to distinct audiences.

### When to use it
Handoffs to developers, vendors, auditors, and operations.

### Where to use it
Waterfall RFPs, compliance projects, and enterprise SaaS configs.

### Real use example
BRD section maps GDPR Article 17 to deletion user story DEV-221.

**Key takeaways**
- Documentation types communicate needs to distinct audiences.
- Handoffs to developers, vendors, auditors, and operations.
- BRD section maps GDPR Article 17 to deletion user story DEV-221.

---

### Track: Intermediate

#### Chapter 7: BPMN 2.0 Process Modeling *(Level: Intermediate)*

**Chapter focus: BPMN 2.0 Process Modeling** *(Level: Intermediate)*

BPMN uses pools, lanes, tasks, gateways (XOR, AND, OR), events, and message flows. AS-IS models document reality including workarounds; TO-BE models target automation. Keep diagrams readable—split into subprocesses when pages exceed one screen.

Code Reference:
```python
# BPMN elements (conceptual)
# Start -> User Task -> XOR gateway -> Service Task -> End
```
What it shows: Gateway notation shows decision branching for developers and ops.

### What it actually is
BPMN is the standard notation for business process analysis.

### When to use it
Process reengineering, RPA discovery, and ERP implementations.

### Where to use it
Finance, HR onboarding, claims processing, and IT service workflows.

### Real use example
TO-BE model replaces three email handoffs with ServiceNow catalog flow.

**Key takeaways**
- BPMN is the standard notation for business process analysis.
- Process reengineering, RPA discovery, and ERP implementations.
- TO-BE model replaces three email handoffs with ServiceNow catalog flow.

#### Chapter 8: Backlog Refinement and Prioritization *(Level: Intermediate)*

**Chapter focus: Backlog Refinement and Prioritization** *(Level: Intermediate)*

Refinement decomposes epics, estimates collaboratively, and clarifies dependencies. Prioritization frameworks: MoSCoW, WSJF (SAFe), Kano, and value vs effort matrices. Product Owner owns order; BA ensures each item is ready with clear value hypothesis.

Code Reference:
```python
items = [('Must', 'SSO login'), ('Should', 'Dark mode'), ('Could', 'Badge export')]
for m, title in sorted(items):
    print(f'{m}: {title}')
```
What it shows: MoSCoW buckets communicate release scope to executives quickly.

### What it actually is
Backlog refinement keeps delivery focused on highest business value.

### When to use it
Every sprint cycle in Agile product development.

### Where to use it
SaaS roadmaps, internal tools, and transformation backlogs.

### Real use example
WSJF elevates regulatory reporting over cosmetic UI in Q3 planning.

**Key takeaways**
- Backlog refinement keeps delivery focused on highest business value.
- Every sprint cycle in Agile product development.
- WSJF elevates regulatory reporting over cosmetic UI in Q3 planning.

#### Chapter 9: Data Analysis for Business Decisions *(Level: Intermediate)*

**Chapter focus: Data Analysis for Business Decisions** *(Level: Intermediate)*

BAs analyze spreadsheets, survey results, and product telemetry. Python pandas loads CSV exports for pivot tables, cohort analysis, and anomaly detection. Visualize with simple charts—stakeholders grasp trends faster than raw tables.

Code Reference:
```python
import pandas as pd
df = pd.read_csv('quiz_completions.csv')
print(df.groupby('course')['score'].mean().sort_values(ascending=False))
```
What it shows: pandas groupby surfaces course-level performance for prioritization workshops.

### What it actually is
Data analysis grounds requirements in evidence not opinions.

### When to use it
When stakeholders disagree or volume hides patterns.

### Where to use it
EdTech metrics, sales funnels, and operations KPI reviews.

### Real use example
Completion data shows mobile users abandon at Q3—drives responsive UI story.

**Key takeaways**
- Data analysis grounds requirements in evidence not opinions.
- When stakeholders disagree or volume hides patterns.
- Completion data shows mobile users abandon at Q3—drives responsive UI story.

#### Chapter 10: Wireframes and Prototyping *(Level: Intermediate)*

**Chapter focus: Wireframes and Prototyping** *(Level: Intermediate)*

Low-fidelity wireframes align layout before expensive build. Clickable prototypes in Figma validate flows with users. Annotate accessibility, validation rules, and empty states. Prototype tests reduce rework—one hour of testing saves days of dev churn.

Code Reference:
```python
# Wireframe checklist: primary CTA, error state, loading, mobile breakpoint
```
What it shows: Checklists ensure prototypes cover non-happy paths.

### What it actually is
Wireframes communicate UI requirements without final visual design.

### When to use it
New screens, portal redesigns, and mobile-first initiatives.

### Where to use it
Web apps, admin consoles, and customer-facing portals.

### Real use example
Figma prototype test exposes confusing 'Submit' vs 'Save draft'—story rewritten before sprint.

**Key takeaways**
- Wireframes communicate UI requirements without final visual design.
- New screens, portal redesigns, and mobile-first initiatives.
- Figma prototype test exposes confusing 'Submit' vs 'Save draft'—story rewritten before sprint.

#### Chapter 11: Non-Functional Requirements *(Level: Intermediate)*

**Chapter focus: Non-Functional Requirements** *(Level: Intermediate)*

NFRs cover performance, security, availability, scalability, compliance, and usability. Make them measurable: '99.9% uptime', 'WCAG 2.1 AA', 'p95 < 500ms'. Link NFRs to architecture decisions and test plans—they are not optional nice-to-haves.

Code Reference:
```python
nfrs = {'performance': 'p95 API < 300ms at 500 RPS',
        'security': 'OWASP ASVS L2',
        'a11y': 'WCAG 2.1 AA'}
```
What it shows: Quantified NFRs become acceptance tests and monitoring alerts.

### What it actually is
Non-functional requirements define how well the system must behave.

### When to use it
Enterprise procurement, regulated systems, and scale-up products.

### Where to use it
Healthcare LMS, payment portals, and public-sector services.

### Real use example
NFR workshop adds audit logging before CodeQuest handles payment data.

**Key takeaways**
- Non-functional requirements define how well the system must behave.
- Enterprise procurement, regulated systems, and scale-up products.
- NFR workshop adds audit logging before CodeQuest handles payment data.

#### Chapter 12: Agile Ceremonies from a BA Lens *(Level: Intermediate)*

**Chapter focus: Agile Ceremonies from a BA Lens** *(Level: Intermediate)*

In Scrum, BAs often partner with PO on backlog, facilitate refinement, clarify stories during planning, demo business scenarios in review, and capture improvement actions in retro. Prepare concise talking points—ceremonies are time-boxed.

Code Reference:
```python
sprint_events = ['Planning', 'Daily', 'Refinement', 'Review', 'Retro']
```
What it shows: Knowing ceremony purpose prevents BA work happening in wrong forum.

### What it actually is
Agile ceremonies synchronize team and stakeholder expectations.

### When to use it
Ongoing delivery cadence in Scrum and Kanban teams.

### Where to use it
Product engineering orgs and digital agencies.

### Real use example
Sprint review demo uses real teacher data scenario—stakeholder signs off increment.

**Key takeaways**
- Agile ceremonies synchronize team and stakeholder expectations.
- Ongoing delivery cadence in Scrum and Kanban teams.
- Sprint review demo uses real teacher data scenario—stakeholder signs off increment.

#### Chapter 13: Requirements Traceability Matrix *(Level: Intermediate)*

**Chapter focus: Requirements Traceability Matrix** *(Level: Intermediate)*

RTM links business requirements → user stories → test cases → releases. Essential for audits, regulated industries, and scope change impact analysis. Automate links in Jira/Azure DevOps when possible; manual spreadsheets rot quickly.

Code Reference:
```python
rtm_row = {'BR': 'BR-009', 'Story': 'CQ-142', 'Test': 'TC-088', 'Release': 'R2.3'}
```
What it shows: RTM rows prove coverage for compliance sign-off.

### What it actually is
Traceability shows every requirement is built and verified.

### When to use it
FDA, SOX, GDPR, and government contract deliveries.

### Where to use it
Enterprise QA and formal PMO governance.

### Real use example
Auditor requests proof of password policy—RTM points to stories and penetration test.

**Key takeaways**
- Traceability shows every requirement is built and verified.
- FDA, SOX, GDPR, and government contract deliveries.
- Auditor requests proof of password policy—RTM points to stories and penetration test.

---

### Track: Advanced

#### Chapter 14: Strategy Analysis and Business Cases *(Level: Advanced)*

**Chapter focus: Strategy Analysis and Business Cases** *(Level: Advanced)*

Strategy analysis frames problems, assesses capabilities, and defines solution scope. Business cases weigh costs, benefits, risks, and alternatives. Use ROI, NPV, and qualitative strategic fit. Executives need one-page decision summaries with clear ask.

Code Reference:
```python
benefits = 120_000
costs = 85_000
roi = (benefits - costs) / costs
print(f'ROI: {roi:.0%}')
```
What it shows: Simple ROI models support build-vs-buy workshops.

### What it actually is
Strategy analysis aligns initiatives with enterprise goals.

### When to use it
Portfolio prioritization and funding approval gates.

### Where to use it
CIO offices, transformation PMOs, and startup board reviews.

### Real use example
BA recommends buying LMS integration over custom build—NPV positive in year two.

**Key takeaways**
- Strategy analysis aligns initiatives with enterprise goals.
- Portfolio prioritization and funding approval gates.
- BA recommends buying LMS integration over custom build—NPV positive in year two.

#### Chapter 15: Solution Evaluation and Benefits Realization *(Level: Advanced)*

**Chapter focus: Solution Evaluation and Benefits Realization** *(Level: Advanced)*

Post-launch, BAs measure outcomes against success metrics. Define KPIs upfront: adoption, cycle time, error rate, NPS. Benefits realization tracks value through 6–12 months, not just go-live. Feed learnings into backlog for continuous improvement.

Code Reference:
```python
kpis = {'adoption': 0.78, 'avg_grade_time_hrs': 1.2, 'support_tickets': -35}
```
What it shows: KPI dictionaries compare baseline vs post-release targets.

### What it actually is
Solution evaluation proves the delivery actually solved the problem.

### When to use it
After major releases and transformation program stage gates.

### Where to use it
Program management offices and product operations.

### Real use example
Three months post-launch, quiz analytics cuts grading time 40%—validates original hypothesis.

**Key takeaways**
- Solution evaluation proves the delivery actually solved the problem.
- After major releases and transformation program stage gates.
- Three months post-launch, quiz analytics cuts grading time 40%—validates original hypothesis.

#### Chapter 16: Facilitating Conflict and Scope Negotiation *(Level: Advanced)*

**Chapter focus: Facilitating Conflict and Scope Negotiation** *(Level: Advanced)*

Conflicts arise on scope, timelines, and trade-offs. Use interest-based negotiation, document decisions in ADRs, and escalate with data not drama. MVP mindset defers low-value gold plating while protecting regulatory must-haves.

Code Reference:
```python
# ADR: Defer gamification badges to R3; ship SSO in R2 for contract deadline
```
What it shows: Architecture Decision Records capture scope trade-offs for audit.

### What it actually is
Facilitation skills keep delivery moving when stakeholders disagree.

### When to use it
Scope creep, resource cuts, and cross-department priority clashes.

### Where to use it
Complex programs with multiple funding sources.

### Real use example
Legal mandates SSO by July; BA negotiates badge delay without losing sponsor trust.

**Key takeaways**
- Facilitation skills keep delivery moving when stakeholders disagree.
- Scope creep, resource cuts, and cross-department priority clashes.
- Legal mandates SSO by July; BA negotiates badge delay without losing sponsor trust.

#### Chapter 17: Enterprise Analysis and Capability Mapping *(Level: Advanced)*

**Chapter focus: Enterprise Analysis and Capability Mapping** *(Level: Advanced)*

Capability maps show what the organization does vs how systems support it. Gap heatmaps highlight invest-or-outsource decisions. Link capabilities to OKRs so technology spend maps to measurable business outcomes.

Code Reference:
```python
capabilities = {'Assessment': 'Weak', 'Reporting': 'Strong', 'Integration': 'Gap'}
```
What it shows: Heatmaps visualize investment priorities for steering committees.

### What it actually is
Enterprise analysis connects architecture to business strategy.

### When to use it
Digital transformation, mergers, and platform rationalization.

### Where to use it
Large edu-tech providers and multi-brand corporations.

### Real use example
Capability map shows reporting strong but integration gap—prioritizes API program.

**Key takeaways**
- Enterprise analysis connects architecture to business strategy.
- Digital transformation, mergers, and platform rationalization.
- Capability map shows reporting strong but integration gap—prioritizes API program.

#### Chapter 18: AI-Augmented BA Workflow *(Level: Advanced)*

**Chapter focus: AI-Augmented BA Workflow** *(Level: Advanced)*

Modern BAs use AI to draft story variants, summarize workshops, and generate test ideas—always validating for bias and hallucination. Maintain human accountability for sign-offs. Prompt libraries accelerate repetitive artifacts while preserving domain judgment.

Code Reference:
```python
prompt = 'Summarize interview themes; list risks as bullets; cite quotes'
# Human reviews before Jira paste
```
What it shows: Human-in-the-loop review prevents bad AI output entering backlog.

### What it actually is
AI augments throughput on documentation-heavy BA tasks.

### When to use it
High-volume backlogs and distributed stakeholder interviews.

### Where to use it
Remote-first product teams using CodeQuest-style async collaboration.

### Real use example
BA uses AI transcript summary, manually verifies quotes, saves 4 hours per workshop.

**Key takeaways**
- AI augments throughput on documentation-heavy BA tasks.
- High-volume backlogs and distributed stakeholder interviews.
- BA uses AI transcript summary, manually verifies quotes, saves 4 hours per workshop.

---

*Family: Business Analyst | Level: Beginner to Advanced*

**Official sources & free libraries**
- https://www.iiba.org/standards-and-resources/babok/
- https://www.agilealliance.org/glossary/
- https://www.omg.org/spec/BPMN/
- https://cucumber.io/docs/gherkin/
- https://learn.microsoft.com/azure/devops/boards/
- https://www.scrum.org/resources