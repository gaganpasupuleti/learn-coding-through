# Study Report: ServiceNow Developer / Administrator — Career Path & Core Skills

*Written by Gagan Pasupuleti*

## Summary

ServiceNow career path covering ITSM incident, problem, and change workflows, CMDB foundation data, Flow Designer automation, GlideRecord server-side scripting, Service Portal widgets, REST integrations, and scoped application development. Built from ServiceNow Developer documentation, Now Learning, and CSA/CIS certification objectives.

## Learning tracks

**Levels covered:** Beginner, Intermediate, Advanced

## Skill stack by level

## Recommended books (read alongside this report)

### 1. Learning ServiceNow — Tim Woodruff
- **Level:** Beginner
- **Focus:** Platform navigation, incidents, CMDB, and admin fundamentals.
- **Link:** https://www.packtpub.com/en-us/product/learning-servicenow-9781785885815

### 2. ServiceNow Development Handbook — Tim Woodruff
- **Level:** Intermediate
- **Focus:** GlideRecord, business rules, script includes, and integrations.
- **Link:** https://www.packtpub.com/en-us/product/servicenow-development-handbook-9781803232165

### 3. ServiceNow Documentation — ServiceNow *(free online)*
- **Level:** Beginner
- **Focus:** Official ITSM, Flow Designer, and developer references.
- **Link:** https://docs.servicenow.com/

### 4. ServiceNow Certified System Administrator — ServiceNow Learning *(free online)*
- **Level:** Intermediate
- **Focus:** Official CSA exam path and platform configuration skills.
- **Link:** https://learning.servicenow.com/lxp/en/pages/landing/certification

### 5. ServiceNow IT Operations Management — Packt
- **Level:** Advanced
- **Focus:** Event management, discovery, and operational workflows.
- **Link:** https://www.packtpub.com/en-us/product/servicenow-it-operations-management-9781803232165

## End-to-end projects

### Project 1: ITSM Incident Management Setup
- **Level:** Beginner | **Duration:** 2–3 weeks
- **Overview:** Configure incident table, assignment groups, SLAs, and email-to-incident on Personal Developer Instance.
- **Objectives:**
  - Configure assignment groups
  - Set SLA definitions
  - Email-to-incident inbound action
  - Create 5 test incidents
- **Phases:**
  - **Groups:** Assignment groups + roles. Tasks: Service Desk, Network Team. Deliverable: Group structure.
  - **SLA:** Response + resolution SLAs. Tasks: P1 1hr, P3 8hr. Deliverable: SLA records active.
  - **Email:** Inbound email action. Tasks: Parse subject/body, Auto-assign. Deliverable: Email creates incident demo.
  - **Test:** 5 incident scenarios. Tasks: Assign, Resolve, Close. Deliverable: Test incident screenshots.
- **Final deliverables:** PDI config export; SLA doc; Test screenshots

### Project 2: Employee Onboarding Flow
- **Level:** Intermediate | **Duration:** 3–4 weeks
- **Overview:** Flow Designer automation: new hire triggers tasks for IT, HR, and facilities with approval steps.
- **Objectives:**
  - Record-triggered flow on new hire
  - Parallel tasks for IT/HR/Facilities
  - Manager approval step
  - Dashboard showing onboarding status
- **Phases:**
  - **Flow:** Record-triggered flow. Tasks: Trigger conditions, Variables. Deliverable: Flow diagram export.
  - **Tasks:** Parallel subflows. Tasks: Laptop request, Badge, Accounts. Deliverable: Task templates.
  - **Approval:** Manager sign-off. Tasks: Approval action, Rejection path. Deliverable: Approval demo video.
  - **Dashboard:** Onboarding tracker. Tasks: Reports, Metrics. Deliverable: Dashboard screenshot.
- **Final deliverables:** Flow export XML; Demo video; Dashboard screenshot

### Project 3: CMDB + Event Management Integration
- **Level:** Advanced | **Duration:** 4–5 weeks
- **Overview:** Populate CMDB with server CIs, integrate monitoring alerts to auto-create incidents with enrichment.
- **Objectives:**
  - CMDB CI classes and relationships
  - Discovery or manual CI import
  - Event rules for alert → incident
  - CI impact analysis on changes
- **Phases:**
  - **CMDB:** CI model setup. Tasks: Server class, Relationships. Deliverable: CMDB populated.
  - **Discovery:** Import/discover CIs. Tasks: CSV import, Relationship map. Deliverable: CMDB diagram.
  - **Events:** Alert integration. Tasks: Event rules, Severity mapping. Deliverable: Auto-incident demo.
  - **Impact:** Change impact check. Tasks: Affected CIs, Business services. Deliverable: Impact analysis report.
- **Final deliverables:** CMDB export; Event rule config; Impact analysis demo; Architecture doc

## Chapters

---

### Track: Beginner

#### Chapter 1: ServiceNow Platform and Instance Navigation *(Level: Beginner)*

**Chapter focus: ServiceNow Platform and Instance Navigation** *(Level: Beginner)*

ServiceNow is a cloud platform built on a single data model with tables, records, and roles. Administrators use Application Navigator, lists, forms, and filters daily. Personal Developer Instances (PDIs) let you practice without risking production. Understand global vs scoped applications and the difference between configuration and customization.

Code Reference:
```javascript
gs.info('CodeQuest learner exploring instance: ' + gs.getSession().getClientIP());
// Application Navigator -> Incident -> Open
```
What it shows: Server-side gs.info logs help trace script execution in System Logs.

### What it actually is
The Now Platform is a low-code enterprise workflow and data platform.

### When to use it
When organizations standardize ITSM, HR, or customer service on one system of record.

### Where to use it
Fortune 500 IT departments, MSPs, universities, and government agencies.

### Real use example
A CodeQuest cohort provisions PDIs, favorites the Incident app, and completes the 'Welcome to ServiceNow' guided setup before touching production-like data.

**Key takeaways**
- The Now Platform is a low-code enterprise workflow and data platform.
- When organizations standardize ITSM, HR, or customer service on one system of record.
- A CodeQuest cohort provisions PDIs, favorites the Incident app, and completes the 'Welcome to ServiceNow' guided setup before touching production-like data.

#### Chapter 2: ITSM Incident Management Fundamentals *(Level: Beginner)*

**Chapter focus: ITSM Incident Management Fundamentals** *(Level: Beginner)*

Incidents restore normal service quickly. Core fields: caller, category, priority (impact × urgency), assignment group, and state (New → In Progress → Resolved → Closed). SLAs attach response and resolution clocks. Major incident management coordinates war rooms for widespread outages.

Code Reference:
```javascript
var gr = new GlideRecord('incident');
gr.addQuery('priority', '1');
gr.query();
while (gr.next()) {
  gs.info('P1: ' + gr.number);
}
```
What it shows: GlideRecord queries open P1 incidents for morning standup dashboards.

### What it actually is
Incident management is the reactive restore-service ITIL practice on ServiceNow.

### When to use it
When users report broken services: VPN down, email bounce, portal 500 errors.

### Where to use it
Service desk, NOC, and application support queues.

### Real use example
During finals week a learning portal returns 503; P1 incident auto-assigns to Web-Ops with executive notification from a Flow Designer trigger.

**Key takeaways**
- Incident management is the reactive restore-service ITIL practice on ServiceNow.
- When users report broken services: VPN down, email bounce, portal 500 errors.
- During finals week a learning portal returns 503; P1 incident auto-assigns to Web-Ops with executive notification from a Flow Designer trigger.

#### Chapter 3: Problem, Change, and Request Fulfillment *(Level: Beginner)*

**Chapter focus: Problem, Change, and Request Fulfillment** *(Level: Beginner)*

Problems investigate root cause behind recurring incidents. Changes control risk through CAB approval, schedules, and backout plans. Service Catalog and Request items fulfill standard offerings like laptop requests. Link records: incident → problem → change → knowledge article.

Code Reference:
```javascript
// Change state workflow: New -> Assess -> Authorize -> Scheduled -> Implement -> Review
// Request: sc_req_item table
```
What it shows: ITIL practice tables interconnect for traceable service lifecycle.

### What it actually is
These practices move teams from firefighting to controlled improvement.

### When to use it
Mature IT organizations with CAB meetings and known error databases.

### Where to use it
Enterprise change windows, hardware refresh programs, and software rollouts.

### Real use example
Repeated Moodle login failures spawn a problem record; authorized change adds SSO patch Saturday 2 AM.

**Key takeaways**
- These practices move teams from firefighting to controlled improvement.
- Mature IT organizations with CAB meetings and known error databases.
- Repeated Moodle login failures spawn a problem record; authorized change adds SSO patch Saturday 2 AM.

#### Chapter 4: Users, Groups, Roles, and ACLs *(Level: Beginner)*

**Chapter focus: Users, Groups, Roles, and ACLs** *(Level: Beginner)*

Security in ServiceNow is role-based. Groups bundle users; roles grant table and field access. ACLs (Access Control Lists) evaluate create/read/update/delete row and field conditions. Always apply least privilege: grant itil role to agents, not admin, unless justified.

Code Reference:
```javascript
// ACL example condition script:
// answer = current.assigned_to == gs.getUserID();
```
What it shows: ACL condition scripts restrict records to assignee or group members.

### What it actually is
ACLs enforce who sees which records at the database layer.

### When to use it
Every table with sensitive HR, security, or financial data.

### Where to use it
Multi-department instances sharing incident data but isolating salary tables.

### Real use example
Student workers get scoped read on their own incidents via ACL and cannot view executive tickets.

**Key takeaways**
- ACLs enforce who sees which records at the database layer.
- Every table with sensitive HR, security, or financial data.
- Student workers get scoped read on their own incidents via ACL and cannot view executive tickets.

#### Chapter 5: Lists, Filters, and Reporting Basics *(Level: Beginner)*

**Chapter focus: Lists, Filters, and Reporting Basics** *(Level: Beginner)*

Lists display query results; filters save conditions for reuse and dashboards. Reporting supports bar, pie, trend, and heat maps. ServiceNow Performance Analytics adds indicators and breakdowns. Export responsibly—PII in CSV exports violates policy.

Code Reference:
```javascript
var ga = new GlideAggregate('incident');
ga.addAggregate('COUNT');
ga.groupBy('category');
ga.query();
while (ga.next()) {
  gs.info(ga.category + ': ' + ga.getAggregate('COUNT'));
}
```
What it shows: GlideAggregate counts incidents by category for weekly management reports.

### What it actually is
Lists and reports turn ticket data into operational insight.

### When to use it
Weekly service review meetings and SLA compliance tracking.

### Where to use it
Manager dashboards, team standups, and executive QBR decks.

### Real use example
CodeQuest mentor reviews category breakdown showing 35% password-reset tickets—drives KB investment.

**Key takeaways**
- Lists and reports turn ticket data into operational insight.
- Weekly service review meetings and SLA compliance tracking.
- CodeQuest mentor reviews category breakdown showing 35% password-reset tickets—drives KB investment.

#### Chapter 6: Service Portal Introduction *(Level: Beginner)*

**Chapter focus: Service Portal Introduction** *(Level: Beginner)*

Service Portal delivers branded self-service with pages, widgets, and themes. Employees search knowledge, submit requests, and track incidents without calling the desk. Widgets use AngularJS client controllers and server scripts. UI Builder is the modern successor for Experience workflows.

Code Reference:
```javascript
// Client controller snippet
function($scope, spUtil) {
  $scope.submit = function() {
    spUtil.update('incident');
  };
}
```
What it shows: Client controllers bind form actions to Service Portal record producers.

### What it actually is
Service Portal is the employee-facing front door to ITSM.

### When to use it
When deflecting Tier 1 tickets through self-service and knowledge.

### Where to use it
Corporate intranets, university IT portals, and HR service centers.

### Real use example
Faculty portal adds 'Report Wi-Fi Issue' widget; submissions create pre-categorized incidents.

**Key takeaways**
- Service Portal is the employee-facing front door to ITSM.
- When deflecting Tier 1 tickets through self-service and knowledge.
- Faculty portal adds 'Report Wi-Fi Issue' widget; submissions create pre-categorized incidents.

---

### Track: Intermediate

#### Chapter 7: CMDB and Configuration Items *(Level: Intermediate)*

**Chapter focus: CMDB and Configuration Items** *(Level: Intermediate)*

The CMDB stores Configuration Items (CIs)—servers, databases, applications—with attributes and relationships. Accurate CI data powers change impact analysis and incident assignment. Identification rules reconcile duplicates; baselines track drift. Avoid garbage-in by governing manual CI creation.

Code Reference:
```javascript
var rel = new GlideRecord('cmdb_rel_ci');
rel.addQuery('parent', serverSysId);
rel.query();
while (rel.next()) {
  gs.info('Depends on: ' + rel.child.name);
}
```
What it shows: Relationship queries reveal downstream CIs before server patching.

### What it actually is
CMDB is the technical inventory graph underpinning IT operations.

### When to use it
Change planning, outage communication, and root cause mapping.

### Where to use it
Data centers, hybrid cloud estates, and application portfolios.

### Real use example
Planned DB maintenance queries CMDB to notify all apps depending on SQL-PROD-03.

**Key takeaways**
- CMDB is the technical inventory graph underpinning IT operations.
- Change planning, outage communication, and root cause mapping.
- Planned DB maintenance queries CMDB to notify all apps depending on SQL-PROD-03.

#### Chapter 8: Flow Designer vs Workflow Editor *(Level: Intermediate)*

**Chapter focus: Flow Designer vs Workflow Editor** *(Level: Intermediate)*

Flow Designer is the modern, low-code automation tool with triggers, conditions, and actions across tables. Legacy Workflow Editor still exists on older instances—know both. Flows can call subflows, ask for approval, invoke scripts, and integrate via spokes. Test in subprod with rollback plans before production promotion.

Code Reference:
```javascript
// Flow trigger: Record Created on incident
// Action: If priority == 1 -> Send Email + Create Major Incident task
```
What it shows: Declarative flows replace hundreds of lines of custom workflow code.

### What it actually is
Flow Designer automates multi-step business processes with observability.

### When to use it
SLA breaches, approvals, notifications, and cross-table updates.

### Where to use it
HR onboarding, access provisioning, and major incident orchestration.

### Real use example
New-hire flow creates AD request, hardware catalog item, and Slack notification automatically.

**Key takeaways**
- Flow Designer automates multi-step business processes with observability.
- SLA breaches, approvals, notifications, and cross-table updates.
- New-hire flow creates AD request, hardware catalog item, and Slack notification automatically.

#### Chapter 9: GlideRecord Server-Side Scripting *(Level: Intermediate)*

**Chapter focus: GlideRecord Server-Side Scripting** *(Level: Intermediate)*

GlideRecord is the primary API for querying and mutating records server-side. Use addQuery, setLimit, chooseFields, and getValue/setValue. Avoid GlideRecord in client scripts—use GlideAjax instead. Performance matters: nested loops on large tables cause transaction timeouts.

Code Reference:
```javascript
var gr = new GlideRecord('incident');
gr.addEncodedQuery('active=true^priorityIN1,2');
gr.orderBy('opened_at');
gr.setLimit(100);
gr.query();
```
What it shows: Encoded queries mirror list filter syntax for maintainable scripts.

### What it actually is
GlideRecord is the server-side database access layer.

### When to use it
Business rules, scheduled jobs, script includes, and fix scripts.

### Where to use it
Any automation touching multiple records or complex conditions.

### Real use example
Scheduled job reopens stale P2 incidents lacking updates after 48 hours for manager review.

**Key takeaways**
- GlideRecord is the server-side database access layer.
- Business rules, scheduled jobs, script includes, and fix scripts.
- Scheduled job reopens stale P2 incidents lacking updates after 48 hours for manager review.

#### Chapter 10: Business Rules, Client Scripts, and UI Policies *(Level: Intermediate)*

**Chapter focus: Business Rules, Client Scripts, and UI Policies** *(Level: Intermediate)*

Business rules run server-side on insert/update/delete (before or after). Client scripts react in the browser—onLoad, onChange, onSubmit. UI policies show/hide mandatory fields without code when possible. Order of execution matters: UI Policy → Client Script → Business Rule → Flow.

Code Reference:
```javascript
// Business Rule (before): if (current.priority == 1) current.assignment_group = 'Major Incident';
```
What it shows: Before business rules mutate records prior to database commit.

### What it actually is
These artifacts implement field logic and data integrity at multiple tiers.

### When to use it
Form behavior, validation, and auto-population scenarios.

### Where to use it
Incident categorization, change risk scoring, and catalog variable logic.

### Real use example
Changing category to 'Network' auto-assigns Network-Ops via onChange client script and business rule.

**Key takeaways**
- These artifacts implement field logic and data integrity at multiple tiers.
- Form behavior, validation, and auto-population scenarios.
- Changing category to 'Network' auto-assigns Network-Ops via onChange client script and business rule.

#### Chapter 11: Service Catalog and Record Producers *(Level: Intermediate)*

**Chapter focus: Service Catalog and Record Producers** *(Level: Intermediate)*

Service Catalog presents orderable items with variables, workflows, and fulfillment tasks. Record producers create records (often incidents) from portal forms. Variable sets reuse common questions. Price and recurring price fields support chargeback reporting.

Code Reference:
```javascript
// Catalog item variables: u_device_type, u_justification
// Produces: sc_req_item -> requested item tasks
```
What it shows: Catalog variables map to task and CI fields downstream.

### What it actually is
Service Catalog standardizes fulfillment for repeated requests.

### When to use it
Hardware refresh, software licenses, access grants, and facilities.

### Where to use it
Employee self-service and CodeQuest sandbox 'request sandbox VM' lab item.

### Real use example
Developer requests cloud sandbox; catalog flow creates approval, provisioning task, and closure survey.

**Key takeaways**
- Service Catalog standardizes fulfillment for repeated requests.
- Hardware refresh, software licenses, access grants, and facilities.
- Developer requests cloud sandbox; catalog flow creates approval, provisioning task, and closure survey.

#### Chapter 12: Integration Hub and REST Messages *(Level: Intermediate)*

**Chapter focus: Integration Hub and REST Messages** *(Level: Intermediate)*

Integration Hub provides spokes and connections to external systems (Jira, Azure, Slack). REST Message defines endpoints, headers, and authentication. MID Server reaches on-prem targets. Log integration errors to dedicated tables and build retry subflows for resilience.

Code Reference:
```javascript
var rm = new sn_ws.RESTMessageV2('CodeQuest_Asset_API', 'get_assets');
var response = rm.execute();
var body = response.getBody();
```
What it shows: RESTMessageV2 calls external asset APIs from a scheduled data pull.

### What it actually is
Integrations connect ServiceNow to the wider enterprise toolchain.

### When to use it
Bi-directional ticket sync, CMDB enrichment, and chatops alerts.

### Where to use it
Multi-tool IT stacks where ServiceNow remains the system of engagement.

### Real use example
Jira defect linked to ServiceNow incident via Integration Hub spoke keeps dev and ops aligned.

**Key takeaways**
- Integrations connect ServiceNow to the wider enterprise toolchain.
- Bi-directional ticket sync, CMDB enrichment, and chatops alerts.
- Jira defect linked to ServiceNow incident via Integration Hub spoke keeps dev and ops aligned.

#### Chapter 13: Update Sets and Deployment Pipeline *(Level: Intermediate)*

**Chapter focus: Update Sets and Deployment Pipeline** *(Level: Intermediate)*

Update Sets capture configuration changes for promotion across instances (dev → test → prod). Scoped apps use source control and pipelines in modern shops. Preview conflicts before merge. Never edit prod directly—route through change control with peer review.

Code Reference:
```javascript
// Compare Update Sets: Incidents_Flow_v2
// Pipeline: Dev PDI -> Team Dev -> QA -> Prod (Change CHG001234)
```
What it shows: Promotion path mirrors software delivery lifecycle.

### What it actually is
Controlled promotion prevents untested changes in production.

### When to use it
Every enterprise with segregated ServiceNow instances.

### Where to use it
Agile product teams shipping weekly catalog improvements.

### Real use example
Flow fix tested in QA update set; CAB-approved change deploys Saturday with rollback set ready.

**Key takeaways**
- Controlled promotion prevents untested changes in production.
- Every enterprise with segregated ServiceNow instances.
- Flow fix tested in QA update set; CAB-approved change deploys Saturday with rollback set ready.

---

### Track: Advanced

#### Chapter 14: Scoped Application Development *(Level: Advanced)*

**Chapter focus: Scoped Application Development** *(Level: Advanced)*

Scoped applications isolate code and data with application-specific tables and ACLs. Use ServiceNow Studio, application files, and ATF tests. Script Includes encapsulate reusable logic. Follow ServiceNow JavaScript APIs—avoid unsupported DOM hacks.

Code Reference:
```javascript
var AssetUtils = Class.create();
AssetUtils.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
  process: function() { return this.getParameter('sysparm_query'); }
});
```
What it shows: Script Includes extend AbstractAjaxProcessor for GlideAjax endpoints.

### What it actually is
Scoped apps package maintainable custom solutions on the platform.

### When to use it
ISVs, internal platform teams, and complex custom processes.

### Where to use it
Custom vendor management app with own tables, modules, and portal.

### Real use example
CodeQuest capstone ships scoped inventory app through store-ready checklist and ATF suite.

**Key takeaways**
- Scoped apps package maintainable custom solutions on the platform.
- ISVs, internal platform teams, and complex custom processes.
- CodeQuest capstone ships scoped inventory app through store-ready checklist and ATF suite.

#### Chapter 15: Performance and GlideAggregate Optimization *(Level: Advanced)*

**Chapter focus: Performance and GlideAggregate Optimization** *(Level: Advanced)*

Slow queries hurt UX and batch jobs. Use indexes, avoid dot-walking in large loops, prefer GlideAggregate to manual counting. Enable Debug Business Rule and SQL explain plans in non-prod. Partition long-running jobs with setLimit and resume markers.

Code Reference:
```javascript
var ga = new GlideAggregate('task');
ga.addAggregate('COUNT');
ga.addQuery('assignment_group', groupId);
ga.setGroup(false);
ga.query();
var count = ga.next() ? ga.getAggregate('COUNT') : 0;
```
What it shows: Aggregate queries replace thousands of getRowCount loops.

### What it actually is
Performance tuning keeps instances responsive at enterprise scale.

### When to use it
Instances exceeding millions of task rows or heavy integrations.

### Where to use it
Global enterprises and high-volume MSP instances.

### Real use example
Dashboard widget refactored from GlideRecord loop to GlideAggregate—load time drops 18s to 0.4s.

**Key takeaways**
- Performance tuning keeps instances responsive at enterprise scale.
- Instances exceeding millions of task rows or heavy integrations.
- Dashboard widget refactored from GlideRecord loop to GlideAggregate—load time drops 18s to 0.

#### Chapter 16: Scripted REST APIs and OAuth *(Level: Advanced)*

**Chapter focus: Scripted REST APIs and OAuth** *(Level: Advanced)*

Scripted REST APIs expose custom endpoints with scripted processing and ACL enforcement. Define resources, HTTP verbs, and API security profiles. OAuth 2.0 and JWT bearer tokens gate access for mobile apps and external dashboards.

Code Reference:
```javascript
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  var body = request.body.dataString;
  response.setStatus(200);
  response.setBody({status: 'ok'});
})(request, response);
```
What it shows: Scripted REST handlers validate payloads and return JSON responses.

### What it actually is
Scripted REST enables platform-as-backend for custom experiences.

### When to use it
Mobile apps, partner portals, and machine-to-machine automation.

### Where to use it
Secure external integrations without sharing user credentials.

### Real use example
CodeQuest mobile app fetches open incidents via OAuth-secured Scripted REST for student interns.

**Key takeaways**
- Scripted REST enables platform-as-backend for custom experiences.
- Mobile apps, partner portals, and machine-to-machine automation.
- CodeQuest mobile app fetches open incidents via OAuth-secured Scripted REST for student interns.

#### Chapter 17: Domain Separation and Enterprise Scale *(Level: Advanced)*

**Chapter focus: Domain Separation and Enterprise Scale** *(Level: Advanced)*

Domain separation partitions data for MSPs or conglomerates. Domain visibility rules control cross-domain access. Process separation duplicates tables per domain—heavyweight. Design domains early; retrofits are painful.

Code Reference:
```javascript
gs.getSession().setDomainID(domainSysId);
var gr = new GlideRecord('incident');
gr.query(); // returns only domain-visible records
```
What it shows: Session domain context filters queries automatically.

### What it actually is
Domain separation multi-tenants one instance safely.

### When to use it
MSPs managing hundreds of customers on shared infrastructure.

### Where to use it
Global companies with regional IT autonomy.

### Real use example
MSP adds new school district domain; agents see only that district's incidents and CIs.

**Key takeaways**
- Domain separation multi-tenants one instance safely.
- MSPs managing hundreds of customers on shared infrastructure.
- MSP adds new school district domain; agents see only that district's incidents and CIs.

#### Chapter 18: Event Management and ITOM *(Level: Advanced)*

**Chapter focus: Event Management and ITOM** *(Level: Advanced)*

Event Management correlates monitoring alerts into actionable incidents. Connectors ingest from SolarWinds, Datadog, or Nagios. MOGs group related events; CI binding ties alerts to CMDB. Threshold rules reduce noise before ticket spam.

Code Reference:
```javascript
// Event rule: 3+ CPU alerts on same CI in 10 min -> create incident P2
```
What it shows: Correlation rules prevent alert storms from flooding the desk.

### What it actually is
ITOM practices bridge monitoring tools and ServiceNow workflow.

### When to use it
NOC environments with thousands of daily monitoring events.

### Where to use it
Hybrid cloud shops with tool sprawl.

### Real use example
Database failover generates 50 alerts; correlation opens one major incident with linked events.

**Key takeaways**
- ITOM practices bridge monitoring tools and ServiceNow workflow.
- NOC environments with thousands of daily monitoring events.
- Database failover generates 50 alerts; correlation opens one major incident with linked events.

---

*Family: ServiceNow Developer / Administrator | Level: Beginner to Advanced*

**Official sources & free libraries**
- https://developer.servicenow.com/dev.do
- https://docs.servicenow.com/
- https://learning.servicenow.com/
- https://www.servicenow.com/products/itsm.html
- https://www.servicenow.com/community/developer-articles/
- https://docs.servicenow.com/bundle/zurich-api-reference/page/script/server-scripting/concept/c_GlideRecordAPI.html