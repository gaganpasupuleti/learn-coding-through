# Study Report: Salesforce CRM Developer / Administrator — Career Path & Core Skills

*Written by Gagan Pasupuleti*

## Summary

Salesforce CRM career path from Trailhead fundamentals through declarative automation (Flows), Apex and triggers, Lightning Web Components, security model, data model design, and integration patterns. Targets Admin, Platform Developer, and Consultant roles using official Salesforce documentation and Well-Architected guidance.

## Learning tracks

**Levels covered:** Beginner, Intermediate, Advanced

## Skill stack by level

## Recommended books (read alongside this report)

### 1. Salesforce Admins Handbook — Paul M. Kowalski
- **Level:** Beginner
- **Focus:** Objects, fields, security, flows, and Lightning App Builder.
- **Link:** https://www.packtpub.com/en-us/product/salesforce-admins-handbook-9781803232165

### 2. Trailhead — Admin Beginner Trail — Salesforce *(free online)*
- **Level:** Beginner
- **Focus:** Free interactive modules for CRM admin certification path.
- **Link:** https://trailhead.salesforce.com/content/learn/trails/force_com_admin_beginner

### 3. Advanced Apex Programming — Dan Appleman
- **Level:** Advanced
- **Focus:** Bulk-safe Apex, triggers, and governor limit patterns.
- **Link:** https://www.salesforce.com/blog/advanced-apex-programming/

### 4. Salesforce Lightning Web Components — Salesforce Developers *(free online)*
- **Level:** Intermediate
- **Focus:** Official LWC guide for custom UI on the Salesforce platform.
- **Link:** https://developer.salesforce.com/docs/component-library/documentation/en/lwc

### 5. Salesforce Certified Administrator Study Guide — Salesforce Ben *(free online)*
- **Level:** Intermediate
- **Focus:** Exam-focused admin prep: security, automation, and reports.
- **Link:** https://www.salesforceben.com/salesforce-admin-certification-guide/

## End-to-end projects

### Project 1: Nonprofit Donor Tracker
- **Level:** Beginner | **Duration:** 2–3 weeks
- **Overview:** Custom objects for Donors and Donations, page layouts, reports, and a simple Flow for thank-you email.
- **Objectives:**
  - Custom Donor and Donation objects
  - Page layouts and list views
  - Donation summary report
  - Record-triggered thank-you email Flow
- **Phases:**
  - **Objects:** Donor + Donation custom objects. Tasks: Fields, Lookup relationship. Deliverable: Object schema doc.
  - **UI:** Page layouts. Tasks: Related lists, Compact layout. Deliverable: Layout screenshots.
  - **Report:** Donation dashboard. Tasks: Total by month, Top donors. Deliverable: Report + dashboard.
  - **Flow:** Thank-you email. Tasks: Record-triggered, Email template. Deliverable: Flow demo video.
- **Final deliverables:** DE org config; Report screenshots; Flow demo

### Project 2: Sales Pipeline Automation
- **Level:** Intermediate | **Duration:** 3–4 weeks
- **Overview:** Lead conversion, opportunity stages, approval process for discounts, and Lightning dashboard.
- **Objectives:**
  - Lead conversion process
  - Opportunity stage validation rules
  - Discount approval process
  - Sales manager Lightning dashboard
- **Phases:**
  - **Leads:** Conversion mapping. Tasks: Lead → Account/Contact/Opp, Required fields. Deliverable: Conversion demo.
  - **Pipeline:** Stage gates. Tasks: Validation rules, Probability. Deliverable: Stage config doc.
  - **Approval:** Discount approval. Tasks: >20% needs manager, Email alerts. Deliverable: Approval demo video.
  - **Dashboard:** Sales KPIs. Tasks: Pipeline value, Win rate, Forecast. Deliverable: Dashboard screenshot.
- **Final deliverables:** DE config; Approval demo; Dashboard screenshot

### Project 3: LWC Custom Component Suite
- **Level:** Advanced | **Duration:** 4–5 weeks
- **Overview:** Build 3 Lightning Web Components with Apex controllers, Jest tests, and deploy via Salesforce CLI.
- **Objectives:**
  - 3 LWC components (lookup, datatable, chart)
  - Apex controllers with SOQL
  - Jest unit tests
  - CI deploy with sf CLI
- **Phases:**
  - **LWC:** Build 3 components. Tasks: lookupSearch, dataTable, chartWidget. Deliverable: Components in org.
  - **Apex:** Controllers + tests. Tasks: @AuraEnabled, Test classes 75%+. Deliverable: Apex test results.
  - **Jest:** LWC Jest tests. Tasks: Mock data, Event tests. Deliverable: Jest coverage report.
  - **CI:** GitHub Actions deploy. Tasks: sf project deploy, Scratch org test. Deliverable: CI pipeline green.
- **Final deliverables:** GitHub repo; Deployed components; Test reports; CI pipeline

## Chapters

---

### Track: Beginner

#### Chapter 1: Salesforce Platform and Trailhead Navigation *(Level: Beginner)*

**Chapter focus: Salesforce Platform and Trailhead Navigation** *(Level: Beginner)*

Salesforce is a multi-tenant cloud CRM platform. Orgs contain standard and custom objects, apps, tabs, and setup menus. Trailhead modules provide free hands-on learning with playgrounds. Understand production vs sandbox vs scratch org lifecycle.

Code Reference:
```javascript
// Open Developer Console: Setup -> Developer Console
// Query: SELECT Id, Name FROM Account LIMIT 5
```
What it shows: SOQL in Developer Console validates data during admin tasks.

### What it actually is
Salesforce is the leading cloud CRM and low-code app platform.

### When to use it
Sales, service, marketing, and custom business app delivery.

### Where to use it
Enterprises, nonprofits, and ed-tech companies running student CRM.

### Real use example
CodeQuest learner completes Admin Beginner trail before touching client sandbox.

**Key takeaways**
- Salesforce is the leading cloud CRM and low-code app platform.
- Sales, service, marketing, and custom business app delivery.
- CodeQuest learner completes Admin Beginner trail before touching client sandbox.

#### Chapter 2: Standard Objects and Data Model *(Level: Beginner)*

**Chapter focus: Standard Objects and Data Model** *(Level: Beginner)*

Core objects: Lead, Account, Contact, Opportunity, Case, Campaign. Relationships: lookup vs master-detail (rollup implications). Activities (Tasks, Events) polymorphically relate to parents. Design for reporting—excessive lookups hurt performance.

Code Reference:
```javascript
SELECT Id, Name, (SELECT Id, LastName FROM Contacts) FROM Account WHERE Industry = 'Education'
```
What it shows: Subqueries retrieve related contacts for account hierarchy reports.

### What it actually is
The data model structures how business entities relate in CRM.

### When to use it
Every Salesforce implementation and integration mapping exercise.

### Where to use it
B2B sales, customer support, and partner management.

### Real use example
Education Account links Contacts (teachers) and Opportunities (district deals).

**Key takeaways**
- The data model structures how business entities relate in CRM.
- Every Salesforce implementation and integration mapping exercise.
- Education Account links Contacts (teachers) and Opportunities (district deals).

#### Chapter 3: Security Model: Profiles and Permission Sets *(Level: Beginner)*

**Chapter focus: Security Model: Profiles and Permission Sets** *(Level: Beginner)*

Profiles define baseline object and field permissions; permission sets grant additive access. Use permission set groups for role bundles. Field-Level Security hides sensitive columns; UI does not bypass FLS—Apex must enforce stripInaccessible.

Code Reference:
```javascript
// Check FLS in Apex:
// SObjectAccessDecision decision = Security.stripInaccessible(AccessType.READABLE, records);
```
What it shows: stripInaccessible enforces field-level security in Apex queries.

### What it actually is
Salesforce security is layered: org, object, field, record.

### When to use it
User onboarding, compliance, and least-privilege reviews.

### Where to use it
Every org with more than one user persona.

### Real use example
Finance permission set grants invoice fields without cloning admin profile.

**Key takeaways**
- Salesforce security is layered: org, object, field, record.
- User onboarding, compliance, and least-privilege reviews.
- Finance permission set grants invoice fields without cloning admin profile.

#### Chapter 4: Sharing Rules and Record Access *(Level: Beginner)*

**Chapter focus: Sharing Rules and Record Access** *(Level: Beginner)*

OWD (org-wide defaults) set baseline private/public read/write. Sharing rules, roles, teams, and manual sharing widen access. Apex sharing keywords: with sharing, without sharing, inherited sharing. Run sharing recalc after bulk loads.

Code Reference:
```javascript
SELECT Id, Name, AccessLevel FROM AccountShare WHERE AccountId = '001...'
```
What it shows: AccountShare queries debug why users cannot see records.

### What it actually is
Record-level sharing controls who sees which rows.

### When to use it
Private sales orgs, partner portals, and case segregation.

### Where to use it
Multi-region sales teams and support queues.

### Real use example
APAC reps see only APAC accounts via role hierarchy and territory rules.

**Key takeaways**
- Record-level sharing controls who sees which rows.
- Private sales orgs, partner portals, and case segregation.
- APAC reps see only APAC accounts via role hierarchy and territory rules.

#### Chapter 5: Reports, Dashboards, and List Views *(Level: Beginner)*

**Chapter focus: Reports, Dashboards, and List Views** *(Level: Beginner)*

Reports summarize CRM data; dashboards visualize KPIs for executives. Report types define join paths. Subscribe to dashboard refreshes. List views power daily rep workflows—pin favorites for My Open Opportunities.

Code Reference:
```javascript
SELECT StageName, COUNT(Id) cnt FROM Opportunity GROUP BY StageName
```
What it shows: Aggregate SOQL mirrors report summarization logic.

### What it actually is
Reports translate CRM data into decisions without code.

### When to use it
Pipeline reviews, service level reviews, and campaign ROI.

### Where to use it
Sales managers, support leads, and marketing ops.

### Real use example
Dashboard shows CodeQuest pilot conversion rate dropped—triggers campaign review.

**Key takeaways**
- Reports translate CRM data into decisions without code.
- Pipeline reviews, service level reviews, and campaign ROI.
- Dashboard shows CodeQuest pilot conversion rate dropped—triggers campaign review.

#### Chapter 6: Validation Rules and Page Layouts *(Level: Beginner)*

**Chapter focus: Validation Rules and Page Layouts** *(Level: Beginner)*

Validation rules block bad data at save time with formula errors. Page layouts control field visibility per profile. Dynamic forms (UI API) modernize layout per record type. Combine validation with Flow for cross-field checks.

Code Reference:
```javascript
AND(ISBLANK(Phone), ISBLANK(Email))
// Error: Provide Phone or Email
```
What it shows: Validation formulas enforce contactability on lead capture.

### What it actually is
Declarative validation prevents garbage data entering CRM.

### When to use it
Data quality initiatives and required field policies.

### Where to use it
Lead capture forms, opportunity closure gates.

### Real use example
Cannot close Won opportunity without Contract signed checkbox—validation enforces.

**Key takeaways**
- Declarative validation prevents garbage data entering CRM.
- Data quality initiatives and required field policies.
- Cannot close Won opportunity without Contract signed checkbox—validation enforces.

---

### Track: Intermediate

#### Chapter 7: Flow Builder and Automation Strategy *(Level: Intermediate)*

**Chapter focus: Flow Builder and Automation Strategy** *(Level: Intermediate)*

Record-triggered Flows replace Workflow Rules and Process Builder. Use before-save flows for field updates without extra DML. Screen flows guide users through multi-step wizards. Document automation inventory—overlapping flows cause recursion errors.

Code Reference:
```javascript
// Flow: Record-Triggered After Save on Opportunity
// Decision: Stage = Closed Won -> Create Task
```
What it shows: Flow decision elements branch automation without Apex.

### What it actually is
Flow is the primary declarative automation tool on Salesforce.

### When to use it
Assignment, notifications, approvals, and integrations.

### Where to use it
Most admin and consultant day-to-day configuration.

### Real use example
Closed Won flow creates onboarding task and emails customer success.

**Key takeaways**
- Flow is the primary declarative automation tool on Salesforce.
- Assignment, notifications, approvals, and integrations.
- Closed Won flow creates onboarding task and emails customer success.

#### Chapter 8: Apex Triggers and Bulkification *(Level: Intermediate)*

**Chapter focus: Apex Triggers and Bulkification** *(Level: Intermediate)*

Triggers fire before/after insert/update/delete. Bulkify: never SOQL or DML inside loops over Trigger.new. Use handler pattern separating logic from trigger stub. Governor limits: 100 SOQL, 150 DML rows per transaction—design accordingly.

Code Reference:
```javascript
trigger OpportunityTrigger on Opportunity (after update) {
  OpportunityHandler.onAfterUpdate(Trigger.new, Trigger.oldMap);
}
```
What it shows: One-line trigger delegates to testable handler class.

### What it actually is
Apex triggers implement complex logic Flow cannot express.

### When to use it
Cross-object updates, callouts, and fine-grained control.

### Where to use it
Enterprise orgs with custom business rules.

### Real use example
Handler aggregates opportunity line changes—one DML update for 200 rows.

**Key takeaways**
- Apex triggers implement complex logic Flow cannot express.
- Cross-object updates, callouts, and fine-grained control.
- Handler aggregates opportunity line changes—one DML update for 200 rows.

#### Chapter 9: SOQL, SOSL, and Governor Limits *(Level: Intermediate)*

**Chapter focus: SOQL, SOSL, and Governor Limits** *(Level: Intermediate)*

SOQL queries structured data; SOSL searches text across objects. Selective queries use indexed fields (Id, Name, foreign keys). Avoid selective filter failures on custom fields without indexes. Query plan tool explains performance.

Code Reference:
```javascript
List<Account> accts = [SELECT Id, Name FROM Account WHERE Industry = 'Education' LIMIT 200];
```
What it shows: LIMIT clause prevents accidental full-table scans in loops.

### What it actually is
Efficient queries keep Apex within governor limits.

### When to use it
Every Apex class touching database records.

### Where to use it
Triggers, batch jobs, and LWC @wire adapters.

### Real use example
Unindexed filter on custom status field times out—admin requests custom index.

**Key takeaways**
- Efficient queries keep Apex within governor limits.
- Every Apex class touching database records.
- Unindexed filter on custom status field times out—admin requests custom index.

#### Chapter 10: Lightning Web Components Basics *(Level: Intermediate)*

**Chapter focus: Lightning Web Components Basics** *(Level: Intermediate)*

LWC uses HTML templates, JavaScript modules, and CSS scoped to components. @api exposes properties; @track reactive state. Use lightning-datatable, navigation mixin, and lightning/uiRecordApi for standard UX consistency.

Code Reference:
```javascript
import { LightningElement, api } from 'lwc';
export default class CourseCard extends LightningElement {
  @api courseName;
}
```
What it shows: @api properties pass data from parent App Builder pages.

### What it actually is
LWC is Salesforce's modern UI framework for custom UX.

### When to use it
Custom record actions, dashboards, and Experience Cloud.

### Where to use it
Replacing legacy Visualforce and Aura components.

### Real use example
CourseCard LWC embeds on Account page showing enrolled CodeQuest modules.

**Key takeaways**
- LWC is Salesforce's modern UI framework for custom UX.
- Custom record actions, dashboards, and Experience Cloud.
- CourseCard LWC embeds on Account page showing enrolled CodeQuest modules.

#### Chapter 11: Integration with REST and Bulk API *(Level: Intermediate)*

**Chapter focus: Integration with REST and Bulk API** *(Level: Intermediate)*

REST API handles CRUD on sObjects with OAuth JWT or username-password flow (discouraged). Bulk API 2.0 ingests millions of rows asynchronously. Composite API batches dependent requests. Respect API limits and idempotency for retries.

Code Reference:
```javascript
HttpRequest req = new HttpRequest();
req.setEndpoint('callout:ERP_Named_Credential/accounts');
req.setMethod('GET');
```
What it shows: Named Credentials store auth for secure callouts from Apex.

### What it actually is
APIs connect Salesforce to ERP, LMS, and data warehouses.

### When to use it
Nightly syncs, real-time notifications, and MDM integrations.

### Where to use it
Bi-directional student enrollment between LMS and Salesforce.

### Real use example
Bulk API loads 500k nightly rows from data lake into custom staging object.

**Key takeaways**
- APIs connect Salesforce to ERP, LMS, and data warehouses.
- Nightly syncs, real-time notifications, and MDM integrations.
- Bulk API loads 500k nightly rows from data lake into custom staging object.

#### Chapter 12: Experience Cloud and Portals *(Level: Intermediate)*

**Chapter focus: Experience Cloud and Portals** *(Level: Intermediate)*

Experience Cloud sites expose CRM data to partners and customers with branded UX. Configure sharing sets, guest user record access (tighten carefully), and CMS content. LWC runs in Experience Builder pages.

Code Reference:
```javascript
// Guest user: minimal object access + CAPTCHA on public forms
```
What it shows: Security comments remind architects of guest user risks.

### What it actually is
Experience Cloud delivers external-facing CRM experiences.

### When to use it
Partner deal registration, customer support, and student portals.

### Where to use it
B2B ecosystems and education community sites.

### Real use example
District admins view support cases in portal without full internal license.

**Key takeaways**
- Experience Cloud delivers external-facing CRM experiences.
- Partner deal registration, customer support, and student portals.
- District admins view support cases in portal without full internal license.

#### Chapter 13: Deployment with Salesforce DX *(Level: Intermediate)*

**Chapter focus: Deployment with Salesforce DX** *(Level: Intermediate)*

SFDX uses source control, scratch orgs, and manifest package.xml. sf project deploy start pushes metadata; CI runs Apex tests on pull requests. Never change prod directly—pipeline promotes dev → UAT → prod with change sets or pipelines.

Code Reference:
```javascript
sf org login web --alias uat
sf project deploy start --target-org uat --test-level RunLocalTests
```
What it shows: CLI deploy with tests mirrors enterprise ALM gates.

### What it actually is
Salesforce DX modernizes metadata lifecycle management.

### When to use it
Team development and regulated release processes.

### Where to use it
ISVs and internal centers of excellence.

### Real use example
Pull request fails on 78% coverage—developer adds handler tests before merge.

**Key takeaways**
- Salesforce DX modernizes metadata lifecycle management.
- Team development and regulated release processes.
- Pull request fails on 78% coverage—developer adds handler tests before merge.

---

### Track: Advanced

#### Chapter 14: Asynchronous Apex Patterns *(Level: Advanced)*

**Chapter focus: Asynchronous Apex Patterns** *(Level: Advanced)*

Queueable, Batch Apex, and Schedulable process large volumes beyond synchronous limits. Batch implements Database.Batchable with scope chunks. Platform Events decouple publishers and subscribers for event-driven scale.

Code Reference:
```javascript
public class EnrollmentBatch implements Database.Batchable<SObject> {
  public Database.QueryLocator start(Database.BatchableContext bc) {
    return Database.getQueryLocator('SELECT Id FROM Enrollment__c');
  }
}
```
What it shows: Batch skeleton processes custom enrollment objects nightly.

### What it actually is
Async Apex handles enterprise data volume outside user transactions.

### When to use it
Nightly syncs, rollups, and data archival.

### Where to use it
Orgs exceeding synchronous governor thresholds.

### Real use example
Batch recalculates district utilization scores for 2M child records.

**Key takeaways**
- Async Apex handles enterprise data volume outside user transactions.
- Nightly syncs, rollups, and data archival.
- Batch recalculates district utilization scores for 2M child records.

#### Chapter 15: Enterprise Integration Architecture *(Level: Advanced)*

**Chapter focus: Enterprise Integration Architecture** *(Level: Advanced)*

Apply Salesforce Well-Architected: reliable, secure, adaptable. Use anti-corruption layers, outbox patterns, and idempotent consumers. MuleSoft or Event Relay for hybrid buses.

Code Reference:
```javascript
// Change Data Capture subscriber processes Account updates to ERP
```
What it shows: CDC comment illustrates event-driven integration style.

### What it actually is
Integration architecture prevents brittle point-to-point spaghetti.

### When to use it
Multi-system landscapes with ERP, LMS, and billing.

### Where to use it
Large enterprises and acquisition-heavy portfolios.

### Real use example
CDC streams opportunity wins to provisioning microservice within seconds.

**Key takeaways**
- Integration architecture prevents brittle point-to-point spaghetti.
- Multi-system landscapes with ERP, LMS, and billing.
- CDC streams opportunity wins to provisioning microservice within seconds.

#### Chapter 16: Advanced Security and Shield *(Level: Advanced)*

**Chapter focus: Advanced Security and Shield** *(Level: Advanced)*

Shield Platform Encryption, Event Monitoring, and Field Audit Trail address compliance. Transaction Security policies block CSV exports by profile. Monitor Login Forensics for credential stuffing. Tenant secret rotation requires planning.

Code Reference:
```javascript
// Event Monitoring: ReportEvent for bulk data export detection
```
What it shows: ReportEvent tracks who exported large contact lists.

### What it actually is
Advanced security features protect regulated CRM data.

### When to use it
Healthcare, financial services, and public sector CRM.

### Where to use it
Orgs under HIPAA, PCI, or FedRAMP requirements.

### Real use example
Transaction Security blocks guest user SOQL injection attempt.

**Key takeaways**
- Advanced security features protect regulated CRM data.
- Healthcare, financial services, and public sector CRM.
- Transaction Security blocks guest user SOQL injection attempt.

#### Chapter 17: Performance Optimization and Caching *(Level: Advanced)*

**Chapter focus: Performance Optimization and Caching** *(Level: Advanced)*

Optimize LWC with lazy load and wire cacheable Apex. Server-side: selective SOQL, custom indexes, skinny triggers. Use debug logs and Apex Profiler. Platform Cache stores session and org cache partitions for hot data.

Code Reference:
```javascript
@AuraEnabled(cacheable=true)
public static List<Metric> getMetrics(Id accountId) { ... }
```
What it shows: Cacheable Apex reduces redundant database hits for dashboards.

### What it actually is
Performance tuning keeps UX snappy at enterprise user counts.

### When to use it
Slow pages, timeout errors, and large-data Lightning apps.

### Where to use it
Global sales teams with heavy custom UIs.

### Real use example
Cacheable metrics API drops LWC load from 4s to 400ms.

**Key takeaways**
- Performance tuning keeps UX snappy at enterprise user counts.
- Slow pages, timeout errors, and large-data Lightning apps.
- Cacheable metrics API drops LWC load from 4s to 400ms.

#### Chapter 18: Einstein and AI on Salesforce *(Level: Advanced)*

**Chapter focus: Einstein and AI on Salesforce** *(Level: Advanced)*

Einstein Lead Scoring, Case Classification, and Prompt Builder bring AI into CRM workflows. Understand model bias, human review gates, and data grounding. Agentforce orchestrates actions with audit trails for compliance.

Code Reference:
```javascript
// Einstein Case Classification suggests Reason field on new cases
```
What it shows: Classification suggestions speed agent triage with human override.

### What it actually is
Salesforce AI augments reps and agents with predictive and generative features.

### When to use it
High-volume service queues and inside sales teams.

### Where to use it
Orgs adopting CRM-embedded AI instead of bolt-on tools.

### Real use example
Einstein summarizes long Case email threads before CodeQuest agent responds.

**Key takeaways**
- Salesforce AI augments reps and agents with predictive and generative features.
- High-volume service queues and inside sales teams.
- Einstein summarizes long Case email threads before CodeQuest agent responds.

---

*Family: Salesforce CRM Developer / Administrator | Level: Beginner to Advanced*

**Official sources & free libraries**
- https://trailhead.salesforce.com/
- https://developer.salesforce.com/docs
- https://help.salesforce.com/s/
- https://architect.salesforce.com/well-architected
- https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/
- https://developer.salesforce.com/docs/component-library/documentation/en/lwc