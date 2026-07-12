# Study Report: Dynamics 365 CRM Consultant — Career Path & Core Skills

*Written by Gagan Pasupuleti*

## Summary

Microsoft Dynamics 365 career path covering Sales and Customer Service apps, Dataverse tables and relationships, model-driven app design, business process flows, Power Automate cloud flows, security roles, ALM with solutions, and official Microsoft Learn modules for MB-910 and PL-200 alignment.

## Learning tracks

**Levels covered:** Beginner, Intermediate, Advanced

## Skill stack by level

## Recommended books (read alongside this report)

### 1. Microsoft Dynamics 365 Documentation — Microsoft Learn *(free online)*
- **Level:** Beginner
- **Focus:** Official guides for Sales, Customer Service, and Dataverse.
- **Link:** https://learn.microsoft.com/dynamics365/

### 2. Mastering Microsoft Dynamics 365 Development — Packt
- **Level:** Advanced
- **Focus:** Plugins, custom APIs, and Dataverse extension patterns.
- **Link:** https://www.packtpub.com/en-us/product/mastering-microsoft-dynamics-365-development-9781803232165

### 3. Dynamics 365 For Dummies — Renato Fajdiga
- **Level:** Beginner
- **Focus:** CRM concepts, leads, opportunities, and customer service cases.
- **Link:** https://www.wiley.com/en-us/Dynamics+365+For+Dummies-p-9781119863747

### 4. Microsoft Power Platform Enterprise Architecture — Microsoft Press *(free online)*
- **Level:** Advanced
- **Focus:** ALM, environments, and solution layering for Dynamics + Power Platform.
- **Link:** https://learn.microsoft.com/power-platform/guidance/adoption/enterprise

### 5. MB-910 Study Guide — Microsoft Learn *(free online)*
- **Level:** Beginner
- **Focus:** Free learning path for Dynamics 365 Fundamentals CRM exam.
- **Link:** https://learn.microsoft.com/certifications/exams/mb-910

## End-to-end projects

### Project 1: Contact Management App
- **Level:** Beginner | **Duration:** 2 weeks
- **Overview:** Model-driven app for contacts and accounts with custom views, forms, and business rules on Dataverse.
- **Objectives:**
  - Custom views for active contacts
  - Form customization with business rules
  - Business rule for required phone
  - Quick create form for accounts
- **Phases:**
  - **Tables:** Contact + Account setup. Tasks: Custom fields, Relationships. Deliverable: Schema screenshot.
  - **Forms:** Main + quick create. Tasks: Sections, Business rules. Deliverable: Form screenshots.
  - **Views:** Filtered views. Tasks: Active contacts, My accounts. Deliverable: View list screenshot.
  - **App:** Model-driven app. Tasks: Sitemap, Dashboard. Deliverable: Published app URL.
- **Final deliverables:** App screenshot; Schema doc; Published app link

### Project 2: Customer Service Case Management
- **Level:** Intermediate | **Duration:** 3–4 weeks
- **Overview:** Case entity with queues, SLAs, routing rules, knowledge articles, and Power Automate notifications.
- **Objectives:**
  - Case queues by priority
  - SLA timers on cases
  - Routing rules to teams
  - Power Automate Teams notification on case creation
- **Phases:**
  - **Cases:** Case entity config. Tasks: Categories, Priority, Stages. Deliverable: Case form screenshot.
  - **SLA:** Response/resolution KPIs. Tasks: Timer, Warning actions. Deliverable: SLA config doc.
  - **Routing:** Queue + routing rules. Tasks: Skill-based, Round robin. Deliverable: Routing test cases.
  - **Automate:** Teams notification flow. Tasks: Trigger on create, Adaptive card. Deliverable: Flow demo video.
- **Final deliverables:** Case config doc; SLA setup; Flow demo video

### Project 3: Sales Pipeline with Power Platform ALM
- **Level:** Advanced | **Duration:** 4–5 weeks
- **Overview:** Full sales solution in managed solution: dev → test → prod with plugins, flows, and security roles.
- **Objectives:**
  - Managed solution with all customizations
  - Plugin for opportunity validation
  - ALM pipeline across 3 environments
  - Security roles for sales rep and manager
- **Phases:**
  - **Solution:** Unmanaged dev solution. Tasks: Entities, Forms, Views. Deliverable: Solution export.
  - **Plugin:** Opportunity validation. Tasks: Pre-create plugin, Unit tests. Deliverable: Plugin + tests.
  - **ALM:** Dev → Test → Prod. Tasks: Export/import, Connection refs. Deliverable: ALM pipeline doc.
  - **Security:** Role-based access. Tasks: Sales Rep, Manager roles. Deliverable: Security test matrix.
- **Final deliverables:** Managed solution; Plugin code; ALM doc; Security matrix

## Chapters

---

### Track: Beginner

#### Chapter 1: Dynamics 365 and Power Platform Overview *(Level: Beginner)*

**Chapter focus: Dynamics 365 and Power Platform Overview** *(Level: Beginner)*

Dynamics 365 Customer Engagement apps run on Dataverse—a cloud database with APIs, security, and metadata. Power Apps, Power Automate, and Power BI share the platform. Model-driven apps auto-generate UI from Dataverse schema; canvas apps offer pixel control.

Code Reference:
```powershell
# pac auth create --url https://org.crm.dynamics.com
# pac org list
```
What it shows: PAC CLI authenticates to environments for ALM automation.

### What it actually is
Dynamics 365 is Microsoft's cloud CRM and ERP suite on Dataverse.

### When to use it
Sales, service, marketing, and field service implementations.

### Where to use it
Microsoft-centric enterprises and partners.

### Real use example
CodeQuest partner provisions Sales trial environment via Microsoft 365 tenant.

**Key takeaways**
- Dynamics 365 is Microsoft's cloud CRM and ERP suite on Dataverse.
- Sales, service, marketing, and field service implementations.
- CodeQuest partner provisions Sales trial environment via Microsoft 365 tenant.

#### Chapter 2: Dataverse Tables and Columns *(Level: Beginner)*

**Chapter focus: Dataverse Tables and Columns** *(Level: Beginner)*

Tables (entities) store rows (records). Columns have types: text, choice, lookup, currency, datetime. Lookups create relationships; 1:N and N:N need intersect tables. Use solutions to package customizations for promotion.

Code Reference:
```powershell
# Display name: Course Enrollment | Schema name: cq_enrollment
# Lookup to Contact and Course tables
```
What it shows: Naming comments document custom table design for team alignment.

### What it actually is
Dataverse is the metadata-driven data layer for Power Platform.

### When to use it
Every CRM customization and integration project.

### Where to use it
Sales pipelines, case management, and custom LOB apps.

### Real use example
Custom cq_enrollment table links students (contacts) to CodeQuest courses.

**Key takeaways**
- Dataverse is the metadata-driven data layer for Power Platform.
- Every CRM customization and integration project.
- Custom cq_enrollment table links students (contacts) to CodeQuest courses.

#### Chapter 3: Model-Driven App Design *(Level: Beginner)*

**Chapter focus: Model-Driven App Design** *(Level: Beginner)*

Model-driven apps compose sitemap, forms, views, charts, and business process flows. Main form tabs organize fields; quick create forms speed inline entry. Unified interface is mandatory for new apps. Test with multiple security roles.

Code Reference:
```powershell
# App module: Sales Hub -> Accounts, Contacts, Opportunities, custom Enrollments
```
What it shows: Sitemap comments map navigation structure for makers.

### What it actually is
Model-driven apps deliver consistent CRM UX from metadata.

### When to use it
Internal sales and service teams needing standardized processes.

### Where to use it
Dynamics 365 Sales and Customer Service out-of-box apps.

### Real use example
Enrollment table added to Sales Hub sitemap under Accounts area.

**Key takeaways**
- Model-driven apps deliver consistent CRM UX from metadata.
- Internal sales and service teams needing standardized processes.
- Enrollment table added to Sales Hub sitemap under Accounts area.

#### Chapter 4: Forms, Views, and Dashboards *(Level: Beginner)*

**Chapter focus: Forms, Views, and Dashboards** *(Level: Beginner)*

Forms use sections, tabs, and controls (subgrids, timelines). Views define filtered columns for grids; system views ship with apps. Dashboards combine charts and lists for role-based landing experiences.

Code Reference:
```powershell
# View: Active District Opportunities | Filter: Status = Open | Sort: Est. Close Date
```
What it shows: View definitions document saved queries for makers.

### What it actually is
Forms and views shape daily user productivity in CRM.

### When to use it
Every user-facing CRM customization.

### Where to use it
Sales managers, service agents, and executives.

### Real use example
Service dashboard shows open P1 cases by account for morning standup.

**Key takeaways**
- Forms and views shape daily user productivity in CRM.
- Every user-facing CRM customization.
- Service dashboard shows open P1 cases by account for morning standup.

#### Chapter 5: Security Roles and Teams *(Level: Beginner)*

**Chapter focus: Security Roles and Teams** *(Level: Beginner)*

Security roles grant table privileges: Create, Read, Write, Delete, Append, Assign, Share. Teams own records for collaborative access. Field security profiles mask sensitive columns. Hierarchy security restricts manager visibility down org chart.

Code Reference:
```powershell
# Role: CodeQuest Sales Rep -> Account: Read/Write Organization, Contact: Read/Write User
```
What it shows: Privilege comments clarify role design worksheets.

### What it actually is
Dataverse security enforces least privilege at row and column level.

### When to use it
New implementations and access reviews.

### Where to use it
Multi-department Dynamics deployments.

### Real use example
Agent role cannot delete cases; only managers can reassign queues.

**Key takeaways**
- Dataverse security enforces least privilege at row and column level.
- New implementations and access reviews.
- Agent role cannot delete cases; only managers can reassign queues.

#### Chapter 6: Dynamics 365 Sales Essentials *(Level: Beginner)*

**Chapter focus: Dynamics 365 Sales Essentials** *(Level: Beginner)*

Sales tracks leads (optional), accounts, contacts, opportunities with stages and forecasts. Activities log calls and emails. Integration with Outlook and Teams embeds CRM in daily flow. Revenue forecasting uses opportunity categories and pipeline views.

Code Reference:
```powershell
# Opportunity stages: Qualify -> Develop -> Propose -> Close
# Close as Won triggers enrollment provisioning flow
```
What it shows: Stage comments tie BPF design to revenue process.

### What it actually is
Dynamics 365 Sales manages B2B relationship and pipeline lifecycle.

### When to use it
B2B sales teams and partner co-selling.

### Where to use it
Technology, education, and professional services firms.

### Real use example
District opportunity Won triggers Power Automate to provision sandbox org.

**Key takeaways**
- Dynamics 365 Sales manages B2B relationship and pipeline lifecycle.
- B2B sales teams and partner co-selling.
- District opportunity Won triggers Power Automate to provision sandbox org.

---

### Track: Intermediate

#### Chapter 7: Business Process Flows *(Level: Intermediate)*

**Chapter focus: Business Process Flows** *(Level: Intermediate)*

BPFs guide users stage-by-stage with required steps and field visibility. Use branching BPF for different paths. BPFs stored as Dataverse components—version with solutions. Combine with Power Automate for stage-entry automation.

Code Reference:
```powershell
# BPF: Case Resolution | Stages: Identify -> Research -> Resolve -> Review
```
What it shows: Stage pipeline mirrors service desk standard operating procedure.

### What it actually is
BPFs enforce process discipline without custom code.

### When to use it
Qualification, case resolution, and onboarding processes.

### Where to use it
Regulated workflows needing audit trails.

### Real use example
Case stuck in Research stage highlights bottleneck in weekly ops review.

**Key takeaways**
- BPFs enforce process discipline without custom code.
- Qualification, case resolution, and onboarding processes.
- Case stuck in Research stage highlights bottleneck in weekly ops review.

#### Chapter 8: Power Automate Cloud Flows for CRM *(Level: Intermediate)*

**Chapter focus: Power Automate Cloud Flows for CRM** *(Level: Intermediate)*

Cloud flows trigger on Dataverse row create/update, schedules, or HTTP requests. Use connection references in solutions for ALM. Implement error scopes, retries, and environment variable secrets—not hardcoded credentials.

Code Reference:
```powershell
# Trigger: When a row is added or modified (Case)
# Condition: Priority = Critical -> Post adaptive card to Teams
```
What it shows: Flow outline documents trigger-condition-action pattern.

### What it actually is
Power Automate connects CRM events to Microsoft 365 and external APIs.

### When to use it
Notifications, approvals, sync jobs, and case routing.

### Where to use it
Every Dynamics implementation beyond out-of-box.

### Real use example
Critical case flow pages on-call engineer and creates Planner task automatically.

**Key takeaways**
- Power Automate connects CRM events to Microsoft 365 and external APIs.
- Notifications, approvals, sync jobs, and case routing.
- Critical case flow pages on-call engineer and creates Planner task automatically.

#### Chapter 9: Customer Service and SLAs *(Level: Intermediate)*

**Chapter focus: Customer Service and SLAs** *(Level: Intermediate)*

Customer Service manages cases, queues, entitlements, and SLAs with KPI timers (first response, resolve by). Unified Routing assigns to agents by skills. IoT and Field Service extend for device-triggered cases.

Code Reference:
```powershell
# SLA KPI: First Response in 1 hour | Warning at 45 min | Failure escalates
```
What it shows: SLA timer configuration prevents silent breaches.

### What it actually is
Customer Service app handles post-sale support operations.

### When to use it
Help desks, product support, and managed services.

### Where to use it
SaaS vendors supporting education customers.

### Real use example
SLA failure on district outage case auto-escalates to major incident queue.

**Key takeaways**
- Customer Service app handles post-sale support operations.
- Help desks, product support, and managed services.
- SLA failure on district outage case auto-escalates to major incident queue.

#### Chapter 10: Plugins and Custom APIs (Overview) *(Level: Intermediate)*

**Chapter focus: Plugins and Custom APIs (Overview)** *(Level: Intermediate)*

Plugins are .NET assemblies registered on Dataverse messages (Create, Update). Synchronous plugins run in transaction; async in queue. Prefer low-code before code—use plugins for complex validation, integration, or pre/post images.

Code Reference:
```powershell
// Plugin: PreOperation on Opportunity Update validates discount threshold
```
What it shows: Plugin stage comment clarifies when logic executes in pipeline.

### What it actually is
Server-side extensions implement logic Flow cannot handle.

### When to use it
Complex validations, integrations, and performance-critical rules.

### Where to use it
Enterprise Dynamics teams with developers.

### Real use example
Plugin blocks unauthorized discount >30% before save completes.

**Key takeaways**
- Server-side extensions implement logic Flow cannot handle.
- Complex validations, integrations, and performance-critical rules.
- Plugin blocks unauthorized discount >30% before save completes.

#### Chapter 11: Integrations and Dual-Write *(Level: Intermediate)*

**Chapter focus: Integrations and Dual-Write** *(Level: Intermediate)*

Dataverse Web API and SDK enable CRUD from external systems. Dual-write syncs Finance and Operations tables with CE in real time. Azure Service Bus and Logic Apps provide enterprise messaging patterns.

Code Reference:
```powershell
Invoke-RestMethod -Uri '$org/api/data/v9.2/accounts' -Headers $headers -Method Get
```
What it shows: PowerShell calls Dataverse Web API for admin automation scripts.

### What it actually is
Integrations connect CRM to ERP, marketing, and analytics platforms.

### When to use it
Order-to-cash, customer 360, and billing alignment.

### Where to use it
Manufacturing and retail with D365 Finance + CE.

### Real use example
Dual-write keeps account credit limit from Finance visible to sales reps.

**Key takeaways**
- Integrations connect CRM to ERP, marketing, and analytics platforms.
- Order-to-cash, customer 360, and billing alignment.
- Dual-write keeps account credit limit from Finance visible to sales reps.

#### Chapter 12: Reports and Power BI for CRM *(Level: Intermediate)*

**Chapter focus: Reports and Power BI for CRM** *(Level: Intermediate)*

FetchXML queries feed SSRS and Power BI datasets. Use Dataverse connector in Power BI with row-level security mirroring CRM roles. Embedded analytics surface KPIs inside model-driven apps.

Code Reference:
```powershell
# FetchXML aggregate opportunity revenue by owner
# Power BI dataset refresh via data gateway
```
What it shows: FetchXML and Power BI comments link reporting layers.

### What it actually is
CRM analytics turn pipeline and case data into executive insight.

### When to use it
QBRs, service reviews, and sales commission reporting.

### Where to use it
Organizations standardizing on Microsoft data stack.

### Real use example
Embedded pipeline chart in Sales app shows rep attainment vs quota.

**Key takeaways**
- CRM analytics turn pipeline and case data into executive insight.
- QBRs, service reviews, and sales commission reporting.
- Embedded pipeline chart in Sales app shows rep attainment vs quota.

#### Chapter 13: Solutions and Environment Strategy *(Level: Intermediate)*

**Chapter focus: Solutions and Environment Strategy** *(Level: Intermediate)*

Default solution is scratchpad; use publisher-named solutions for ALM. Managed solutions lock metadata in target environments. Environment groups and pipelines automate promotion.

Code Reference:
```powershell
pac solution export --path ./out --managed true --name CodeQuestCore
```
What it shows: PAC exports managed solution artifact for pipeline deploy.

### What it actually is
Solution strategy prevents unmanaged customization sprawl.

### When to use it
Multi-environment Dynamics programs.

### Where to use it
Partners and IT departments with formal release cadence.

### Real use example
Unmanaged hotfixes merged back into dev solution before next managed release.

**Key takeaways**
- Solution strategy prevents unmanaged customization sprawl.
- Multi-environment Dynamics programs.
- Unmanaged hotfixes merged back into dev solution before next managed release.

---

### Track: Advanced

#### Chapter 14: Performance Tuning and Throttling *(Level: Advanced)*

**Chapter focus: Performance Tuning and Throttling** *(Level: Advanced)*

Avoid plugin recursion and nested sync workflows. Batch plugins should use ExecuteMultiple. Monitor API service protection limits. Index alternate keys for integration idempotency. Archive old cases to maintain performance.

Code Reference:
```powershell
# Service protection API limit: 429 Too Many Requests -> exponential backoff
```
What it shows: Throttling guidance informs integration retry policies.

### What it actually is
Performance tuning keeps CRM responsive at enterprise scale.

### When to use it
High-volume portals and integration-heavy orgs.

### Where to use it
Global service teams with millions of cases yearly.

### Real use example
Archive job moves closed cases >2 years to long-term storage—grid load improves 40%.

**Key takeaways**
- Performance tuning keeps CRM responsive at enterprise scale.
- High-volume portals and integration-heavy orgs.
- Archive job moves closed cases >2 years to long-term storage—grid load improves 40%.

#### Chapter 15: Power Pages and External Portals *(Level: Advanced)*

**Chapter focus: Power Pages and External Portals** *(Level: Advanced)*

Power Pages (formerly portals) expose Dataverse data externally with authentication, entity lists, forms, and Web API. Configure table permissions and web roles carefully—portal security misconfigurations are common breach vectors.

Code Reference:
```powershell
# Web role: District Admin | Table permission: Account Read scope Parent
```
What it shows: Portal permission comments document external access model.

### What it actually is
Power Pages deliver secure customer and partner self-service.

### When to use it
Case submission, knowledge bases, and partner registration.

### Where to use it
Education districts accessing support without full CRM license.

### Real use example
District admin submits case via portal—creates CRM case with correct entitlement.

**Key takeaways**
- Power Pages deliver secure customer and partner self-service.
- Case submission, knowledge bases, and partner registration.
- District admin submits case via portal—creates CRM case with correct entitlement.

#### Chapter 16: Event Framework and Async Processing *(Level: Advanced)*

**Chapter focus: Event Framework and Async Processing** *(Level: Advanced)*

Use async plugins and Azure Functions triggered by Dataverse events for heavy processing. Service Bus topics decouple publishers. Custom APIs provide typed operations for LWC/canvas clients needing transactional bundles.

Code Reference:
```powershell
// Custom API: cq_ProvisionTenant bundles 5 internal operations atomically
```
What it shows: Custom API comment shows operation bundling pattern.

### What it actually is
Event-driven extensions scale beyond synchronous limits.

### When to use it
Provisioning, ERP sync, and ML inference side effects.

### Where to use it
Large SaaS operators on Dynamics platform.

### Real use example
Tenant provision API rolls back all steps if sandbox creation fails.

**Key takeaways**
- Event-driven extensions scale beyond synchronous limits.
- Provisioning, ERP sync, and ML inference side effects.
- Tenant provision API rolls back all steps if sandbox creation fails.

#### Chapter 17: Center of Excellence and Governance *(Level: Advanced)*

**Chapter focus: Center of Excellence and Governance** *(Level: Advanced)*

Establish COE with DLP policies, environment routing, maker onboarding, and solution review boards. Monitor tenant analytics for orphan flows and overprivileged connectors.

Code Reference:
```powershell
Get-AdminPowerApp | Where-Object {$_.OwnerName -eq 'Departed User'}
```
What it shows: PowerShell identifies orphaned apps for governance cleanup.

### What it actually is
Governance keeps Power Platform tenant secure and manageable.

### When to use it
Enterprises with citizen developers and pro developers.

### Where to use it
Multi-business-unit Microsoft tenants.

### Real use example
COE blocks consumer OneDrive connector in production DLP policy.

**Key takeaways**
- Governance keeps Power Platform tenant secure and manageable.
- Enterprises with citizen developers and pro developers.
- COE blocks consumer OneDrive connector in production DLP policy.

#### Chapter 18: Copilot and AI in Dynamics 365 *(Level: Advanced)*

**Chapter focus: Copilot and AI in Dynamics 365** *(Level: Advanced)*

Copilot in Sales and Service summarizes records, drafts emails, and suggests knowledge articles. Understand data residency, prompt logging, and human review for regulated industries. Extend with plugins to ground responses in Dataverse data.

Code Reference:
```powershell
# Copilot Studio agent grounded on Knowledge articles + Dataverse FAQ table
```
What it shows: Grounding comment stresses verified data sources for AI answers.

### What it actually is
Dynamics AI features accelerate reps while requiring governance.

### When to use it
High-touch sales and service teams adopting Microsoft Copilot.

### Where to use it
Organizations already on M365 Copilot roadmap.

### Real use example
Agent drafts case summary from email thread—human verifies before sending to district.

**Key takeaways**
- Dynamics AI features accelerate reps while requiring governance.
- High-touch sales and service teams adopting Microsoft Copilot.
- Agent drafts case summary from email thread—human verifies before sending to district.

---

*Family: Dynamics 365 CRM Consultant | Level: Beginner to Advanced*

**Official sources & free libraries**
- https://learn.microsoft.com/training/dynamics365/
- https://learn.microsoft.com/power-apps/maker/data-platform/
- https://learn.microsoft.com/dynamics365/customerengagement/
- https://learn.microsoft.com/power-automate/
- https://learn.microsoft.com/power-platform/alm/
- https://learn.microsoft.com/dynamics365/release-plan/