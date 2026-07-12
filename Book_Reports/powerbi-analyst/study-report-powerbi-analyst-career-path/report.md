# Study Report: Power BI Analyst — Career Path & Core Skills

*Written by Gagan Pasupuleti*

## Summary

This report covers the Power BI Analyst role with Power BI Desktop, Power Query (M), DAX, dimensional modeling, and Microsoft Fabric fundamentals (2024+). Topics include semantic models, time intelligence, incremental refresh, lakehouse integration, deployment pipelines, and enterprise governance for self-serve analytics.

## Learning tracks

**Levels covered:** Beginner, Intermediate, Advanced

## Skill stack by level

### Beginner
- Power BI Desktop interface
- Import vs DirectQuery modes
- Power Query basic transforms
- Star schema modeling
- Basic DAX measures (SUM, DIVIDE)
- Chart and slicer design
- Publish to Power BI Service

### Intermediate
- Advanced Power Query (M) patterns
- DAX CALCULATE and time intelligence
- Row-level security (RLS)
- Incremental refresh policies
- Microsoft Fabric Lakehouse (2024+)
- Deployment pipelines (dev/test/prod)
- Performance Analyzer and DAX Studio
- XMLA endpoint connectivity

### Advanced
- Composite models and aggregation tables
- Fabric Data Factory pipelines
- Real-Time Intelligence (KQL, 2024+)
- Power BI Embedded and REST APIs
- Purview lineage and governance
- Premium capacity sizing
- CI/CD with Tabular Editor 3
- Enterprise certification workflows

## Recommended books (read alongside this report)

### 1. Beginning Power BI — Mark Pagani
- **Level:** Beginner
- **Focus:** Power BI Desktop basics: import, model, visualize, publish.
- **Link:** https://www.apress.com/gp/book/9781484298794

### 2. The Definitive Guide to DAX — Marco Russo & Alberto Ferrari
- **Level:** Intermediate
- **Focus:** DAX measures, CALCULATE, time intelligence, and filter context.
- **Link:** https://www.sqlbi.com/books/definitive-guide-to-dax/

### 3. M Is for (Data) Monkey — Ken Puls & Miguel Escobar
- **Level:** Intermediate
- **Focus:** Power Query M language for data transformation.
- **Link:** https://www.misforthedatamonkey.com/

### 4. Microsoft Fabric Fundamentals — Microsoft Learn *(free online)*
- **Level:** Intermediate
- **Focus:** Unified analytics: lakehouse, pipelines, and Power BI in Fabric.
- **Link:** https://learn.microsoft.com/fabric/get-started/

### 5. Analyzing Data with Power BI and Power Pivot — Marco Russo & Alberto Ferrari
- **Level:** Advanced
- **Focus:** Data modeling and DAX for complex enterprise models.
- **Link:** https://www.sqlbi.com/books/analyzing-data-with-power-bi-and-power-pivot/

## End-to-end projects

### Project 1: Retail Sales Dashboard
- **Level:** Beginner | **Duration:** 2 weeks
- **Overview:** Power BI report from Excel/CSV: Power Query cleanup, star schema, DAX measures, published to Service.
- **Objectives:**
  - Import and transform with Power Query
  - Build star schema model
  - Create 6 visuals + slicers
  - Publish and share
- **Phases:**
  - **Import:** Connect to sales data. Tasks: Remove errors, Change types. Deliverable: Clean query.
  - **Model:** Fact + dimension tables. Tasks: Relationships, Hide keys. Deliverable: Validated model.
  - **DAX:** Revenue, YoY, margin measures. Tasks: CALCULATE, TOTALYTD. Deliverable: Measure list doc.
  - **Publish:** Share on Power BI Service. Tasks: Refresh schedule, Mobile layout. Deliverable: Live dashboard URL.
- **Final deliverables:** PBIX file; Published report link; DAX measure documentation

### Project 2: Multi-Source Finance Model
- **Level:** Intermediate | **Duration:** 3–4 weeks
- **Overview:** Merge SQL Server + Excel + API data; complex DAX time intelligence; row-level security by department.
- **Objectives:**
  - Merge 3 data sources in Power Query
  - Implement RLS by department
  - YTD/QoQ DAX measures
  - Performance tune with DAX Studio
- **Phases:**
  - **ETL:** Power Query merge queries. Tasks: API connector, SQL direct query. Deliverable: Combined dataset.
  - **RLS:** Department filter roles. Tasks: DAX USERPRINCIPALNAME, Test roles. Deliverable: RLS test matrix.
  - **Time Intel:** YTD, YoY, rolling averages. Tasks: DATEADD, SAMEPERIODLASTYEAR. Deliverable: Finance KPI page.
  - **Tune:** DAX Studio query plans. Tasks: Remove iterators, Variables. Deliverable: Before/after perf screenshot.
- **Final deliverables:** PBIX; RLS documentation; Performance comparison; User guide

### Project 3: Microsoft Fabric Lakehouse Analytics
- **Level:** Advanced | **Duration:** 5–6 weeks
- **Overview:** Build Fabric lakehouse: ingest raw data, transform in notebooks, semantic model, and executive dashboard.
- **Objectives:**
  - Create Fabric workspace and lakehouse
  - Ingest CSV/Parquet with pipelines
  - Build semantic model in Direct Lake mode
  - Executive dashboard with drill-through
- **Phases:**
  - **Lakehouse:** OneLake setup. Tasks: Shortcuts, Tables. Deliverable: Lakehouse schema.
  - **Pipeline:** Data Factory pipeline. Tasks: Schedule refresh, Error handling. Deliverable: Pipeline run history.
  - **Semantic:** Direct Lake model. Tasks: Relationships, Aggregations. Deliverable: Semantic model.
  - **Dashboard:** Executive landing page. Tasks: KPI cards, Drill-through. Deliverable: Published Fabric report.
- **Final deliverables:** Fabric workspace; Pipeline definition; Published report; Architecture diagram

## Chapters

---

### Track: Beginner

#### Chapter 1: Power BI Analyst Role Overview *(Level: Beginner)*

**Chapter focus: Power BI Analyst Role Overview** *(Level: Beginner)*

Power BI analysts bridge data engineering and business users. You model data, write DAX, design reports, and publish to the Power BI Service. With Microsoft Fabric (2024+), the role extends into lakehouse ingestion — still centered on trusted semantic models.

Code Reference:
```text
-- Power BI connects to hundreds of sources
-- Typical flow: Get Data -> Transform -> Model -> Report -> Publish
```
What it shows: The analyst workflow is linear but iterative — model changes ripple to all reports.

### What it actually is
A Power BI analyst builds self-serve analytics on Microsoft's BI stack.

### When to use it
Organizations standardized on Microsoft 365, Azure, and Fabric.

### Where to use it
Finance reporting, sales ops, HR analytics, and operational KPIs.

### Real use example
A regional manager filters a published report by territory without emailing IT for a CSV.

**Key takeaways**
- A Power BI analyst builds self-serve analytics on Microsoft's BI stack.
- Organizations standardized on Microsoft 365, Azure, and Fabric.
- A regional manager filters a published report by territory without emailing IT for a CSV.

#### Chapter 2: Connecting to Data Sources *(Level: Beginner)*

**Chapter focus: Connecting to Data Sources** *(Level: Beginner)*

Power BI connects to Excel, SQL Server, Snowflake, SharePoint, and Fabric OneLake. Choose Import for speed, DirectQuery for real-time, or Direct Lake (Fabric) for large Delta tables. Document gateway requirements for on-prem sources.

Code Reference:
```powerquery
let
    Source = Sql.Database("server", "dw"),
    Sales = Source{[Schema="dbo", Item="fact_sales"]}[Data]
in
    Sales
```
What it shows: Power Query M loads SQL table fact_sales — first step in most enterprise models.

### What it actually is
Get Data establishes the pipeline from source systems into Power BI.

### When to use it
Every new dashboard starts with source connections.

### Where to use it
SQL warehouses, Excel finance files, and OData APIs.

### Real use example
Analyst connects Snowflake marketing spend to internal CRM for unified campaign ROI.

**Key takeaways**
- Get Data establishes the pipeline from source systems into Power BI.
- Every new dashboard starts with source connections.
- Analyst connects Snowflake marketing spend to internal CRM for unified campaign ROI.

#### Chapter 3: Power Query Transformations *(Level: Beginner)*

**Chapter focus: Power Query Transformations** *(Level: Beginner)*

Power Query is click-first ETL: remove columns, filter rows, split columns, unpivot. Applied Steps are reproducible — rename steps clearly. Prefer Table.Buffer for small lookups, not million-row tables.

Code Reference:
```powerquery
let
    Source = Csv.Document(File.Contents("orders.csv")),
    Promoted = Table.PromoteHeaders(Source),
    Typed = Table.TransformColumnTypes(Promoted, {{"amount", type number}})
in
    Typed
```
What it shows: PromoteHeaders + type coercion prevents DAX treating amounts as text.

### What it actually is
Power Query cleans and shapes data before modeling.

### When to use it
When source exports need cleansing every refresh.

### Where to use it
Weekly CSV drops, API JSON flattening, and Excel consolidation.

### Real use example
Unpivoting wide month columns turns twelve columns into a tidy date/value pair for charting.

**Key takeaways**
- Power Query cleans and shapes data before modeling.
- When source exports need cleansing every refresh.
- Unpivoting wide month columns turns twelve columns into a tidy date/value pair for charting.

#### Chapter 4: Star Schema Data Modeling *(Level: Beginner)*

**Chapter focus: Star Schema Data Modeling** *(Level: Beginner)*

Star schemas place metrics in fact tables and descriptors in dimensions. Use surrogate keys, conformed date tables, and single-direction relationships. Avoid snowflaking unless saving meaningful memory — simplicity aids DAX.

Code Reference:
```markdown
# Model checklist
# - One date table marked as date table
# - Facts at transaction grain
# - No bi-directional unless expert reason
```
What it shows: A checklist prevents relationship mistakes that inflate totals.

### What it actually is
Dimensional modeling organizes data for fast filtering and correct aggregation.

### When to use it
Import and Direct Lake semantic models in Power BI.

### Where to use it
Retail sales, subscription billing, and inventory snapshots.

### Real use example
A single fact_orders connects to dim_customer and dim_date — slicers filter revenue correctly.

**Key takeaways**
- Dimensional modeling organizes data for fast filtering and correct aggregation.
- Import and Direct Lake semantic models in Power BI.
- A single fact_orders connects to dim_customer and dim_date — slicers filter revenue correctly.

#### Chapter 5: Report Design and UX Basics *(Level: Beginner)*

**Chapter focus: Report Design and UX Basics** *(Level: Beginner)*

Use consistent fonts, 8-12 visuals per page max, and purposeful color. Slicers sync across pages via Sync Slicers pane. Bookmarks capture narrative states for guided storytelling in executive reviews.

Code Reference:
```markdown
# Visual hierarchy
# 1. KPI card (big number)
# 2. Trend line (context)
# 3. Breakdown bar (driver)
```
What it shows: Hierarchy guides the eye — biggest number answers the headline question first.

### What it actually is
Report design translates the model into decisions.

### When to use it
Every published Power BI report and paginated export.

### Where to use it
Sales flash, pipeline reviews, and classroom analytics.

### Real use example
Bookmark toggles 'by region' vs 'by product' without duplicating pages.

**Key takeaways**
- Report design translates the model into decisions.
- Every published Power BI report and paginated export.
- Bookmark toggles 'by region' vs 'by product' without duplicating pages.

#### Chapter 6: Introduction to DAX Measures *(Level: Beginner)*

**Chapter focus: Introduction to DAX Measures** *(Level: Beginner)*

DAX calculates on the model, not cell-by-cell like Excel. Measures evaluate in filter context. Start with SUM, AVERAGE, DISTINCTCOUNT; always use DIVIDE for ratios to handle divide-by-zero.

Code Reference:
```dax
Total Sales = SUM ( Sales[Amount] )
Margin % = DIVIDE ( [Total Sales] - [Total Cost], [Total Sales] )
```
What it shows: DIVIDE returns blank instead of error when sales are zero.

### What it actually is
DAX is the formula language for Power BI and Analysis Services tabular models.

### When to use it
Whenever Excel-style calculated columns are too heavy or inflexible.

### Where to use it
KPI cards, matrix visuals, and time comparisons.

### Real use example
Margin % measure works on any visual — one definition, consistent boardroom numbers.

**Key takeaways**
- DAX is the formula language for Power BI and Analysis Services tabular models.
- Whenever Excel-style calculated columns are too heavy or inflexible.
- Margin % measure works on any visual — one definition, consistent boardroom numbers.

---

### Track: Intermediate

#### Chapter 7: Advanced Power Query (M) Patterns *(Level: Intermediate)*

**Chapter focus: Advanced Power Query (M) Patterns** *(Level: Intermediate)*

Parameterize file paths and server names for portability. Use List.Generate for pagination APIs; Table.NestedJoin for complex merges. Enable query folding — check View Native Query to push work to SQL.

Code Reference:
```powerquery
let
    Page = (n as number) => Json.Document(Web.Contents("https://api.example.com/items?page=" & Text.From(n))),
    Pages = List.Generate(() => [i=1, data=Page(1)], each [data] <> null, each [i=[i]+1, data=Page([i]+1)])
in
    Table.FromList(Pages, each [data][items])
```
What it shows: List.Generate loops API pages — common pattern for marketing APIs.

### What it actually is
Advanced M handles APIs, parameters, and folding-aware transforms.

### When to use it
Refreshing models from REST APIs or multi-file folders.

### Where to use it
Marketing spend APIs, blob folders, and incremental file drops.

### Real use example
Parameterized server name lets dev/test/prod switch without rewriting queries.

**Key takeaways**
- Advanced M handles APIs, parameters, and folding-aware transforms.
- Refreshing models from REST APIs or multi-file folders.
- Parameterized server name lets dev/test/prod switch without rewriting queries.

#### Chapter 8: DAX CALCULATE and Filter Context *(Level: Intermediate)*

**Chapter focus: DAX CALCULATE and Filter Context** *(Level: Intermediate)*

CALCULATE modifies filter context — the heart of DAX. Sales YTD = TOTALYTD ( [Total Sales], 'Date'[Date] ). Understand row context vs filter context before iterator functions (SUMX).

Code Reference:
```dax
Sales CY = CALCULATE ( [Total Sales], 'Date'[Year] = 2025 )
Sales PY = CALCULATE ( [Total Sales], SAMEPERIODLASTYEAR ( 'Date'[Date] ) )
YoY % = DIVIDE ( [Sales CY] - [Sales PY], [Sales PY] )
```
What it shows: SAMEPERIODLASTYEAR shifts the date filter for year-over-year comparisons.

### What it actually is
CALCULATE applies filters to measures dynamically.

### When to use it
Time intelligence, conditional KPIs, and % of total metrics.

### Where to use it
Finance close packs, retail comps, and subscription growth boards.

### Real use example
YoY % measure works on any visual slice — region, product, or rep.

**Key takeaways**
- CALCULATE applies filters to measures dynamically.
- Time intelligence, conditional KPIs, and % of total metrics.
- YoY % measure works on any visual slice — region, product, or rep.

#### Chapter 9: Row-Level Security (RLS) *(Level: Intermediate)*

**Chapter focus: Row-Level Security (RLS)** *(Level: Intermediate)*

RLS restricts data rows per audience. Define roles with DAX filters on tables: [Email] = USERPRINCIPALNAME(). Test with View as Role before publish. Dynamic RLS via security bridge tables scales to thousands of users.

Code Reference:
```dax
[Region] = LOOKUPVALUE ( Users[Region], Users[Email], USERPRINCIPALNAME() )
```
What it shows: LOOKUPVALUE maps the logged-in user to their allowed region.

### What it actually is
RLS enforces data access inside the semantic model.

### When to use it
Multi-tenant SaaS analytics and regional sales reports.

### Where to use it
Franchise dashboards, partner portals, and HR sensitive metrics.

### Real use example
A store manager sees only their district — same report, different rows.

**Key takeaways**
- RLS enforces data access inside the semantic model.
- Multi-tenant SaaS analytics and regional sales reports.
- A store manager sees only their district — same report, different rows.

#### Chapter 10: Incremental Refresh and Performance *(Level: Intermediate)*

**Chapter focus: Incremental Refresh and Performance** *(Level: Intermediate)*

Incremental refresh loads only new/changed partitions — essential for large facts. Requires date column, RangeStart/RangeEnd parameters, and Premium capacity. Use Performance Analyzer and DAX Studio to find slow visuals.

Code Reference:
```powerquery
let
    Filtered = Table.SelectRows(Source, each [OrderDate] >= RangeStart and [OrderDate] < RangeEnd)
in
    Filtered
```
What it shows: Range parameters align Power Query filter with incremental policy windows.

### What it actually is
Incremental refresh keeps large models fast and refresh windows small.

### When to use it
Fact tables with millions+ rows and daily append patterns.

### Where to use it
E-commerce orders, clickstream aggregates, and IoT telemetry.

### Real use example
Daily refresh drops from 2 hours to 12 minutes after partitioning by order_date.

**Key takeaways**
- Incremental refresh keeps large models fast and refresh windows small.
- Fact tables with millions+ rows and daily append patterns.
- Daily refresh drops from 2 hours to 12 minutes after partitioning by order_date.

#### Chapter 11: Microsoft Fabric Lakehouse Basics (2024+) *(Level: Intermediate)*

**Chapter focus: Microsoft Fabric Lakehouse Basics (2024+)** *(Level: Intermediate)*

Fabric unifies data engineering and BI on OneLake. A Lakehouse stores Delta/Parquet files with SQL analytics endpoint. Shortcuts attach ADLS/S3 without copying data. Power BI Direct Lake queries Delta files in place — near Import speed.

Code Reference:
```sql
-- Fabric SQL endpoint
SELECT product_id, SUM(quantity) AS units
FROM silver.fact_orders
GROUP BY product_id;
```
What it shows: SQL endpoint lets analysts validate silver tables before modeling.

### What it actually is
Fabric Lakehouse is Microsoft's open-format storage layer for analytics.

### When to use it
Greenfield analytics platforms on Microsoft cloud (2024+).

### Where to use it
Replacing fragmented ADF + AS + Power BI setups.

### Real use example
Marketing uploads CSV to Files area; notebook promotes to silver; Power BI reads via Direct Lake.

**Key takeaways**
- Fabric Lakehouse is Microsoft's open-format storage layer for analytics.
- Greenfield analytics platforms on Microsoft cloud (2024+).
- Marketing uploads CSV to Files area; notebook promotes to silver; Power BI reads via Direct Lake.

#### Chapter 12: Fabric Real-Time Intelligence Preview *(Level: Intermediate)*

**Chapter focus: Fabric Real-Time Intelligence Preview** *(Level: Intermediate)*

Fabric Real-Time Intelligence (2024-2025) adds Eventstreams and KQL Database for streaming logs. Power BI can query hot cache for operational dashboards. Pair with Activator for threshold alerts.

Code Reference:
```kql
.create table pageviews (timestamp: datetime, user_id: string, path: string)
```
What it shows: KQL table schema defines streaming events landing from Eventstream.

### What it actually is
Real-Time Intelligence handles sub-minute latency analytics in Fabric.

### When to use it
Ops monitoring, fraud signals, and live campaign tracking.

### Where to use it
Web telemetry, manufacturing sensors, and support queue depth.

### Real use example
Activator emails on-call when error rate > 2% in rolling 15 minutes.

**Key takeaways**
- Real-Time Intelligence handles sub-minute latency analytics in Fabric.
- Ops monitoring, fraud signals, and live campaign tracking.
- Activator emails on-call when error rate > 2% in rolling 15 minutes.

#### Chapter 13: Deployment Pipelines and ALM *(Level: Intermediate)*

**Chapter focus: Deployment Pipelines and ALM** *(Level: Intermediate)*

Deployment pipelines promote content dev → test → prod with diff review. Pair with Git integration (2024+) for source control. Tabular Editor scripts automate measure renames across environments.

Code Reference:
```markdown
# Promotion checklist
# 1. Run BPA rules in Tabular Editor
# 2. Compare schema diff
# 3. Deploy with notes
```
What it shows: Best Practice Analyzer catches modeling issues before production.

### What it actually is
ALM governs how reports and datasets move across environments.

### When to use it
Any team with multiple analysts and production subscribers.

### Where to use it
Enterprise BI centers of excellence.

### Real use example
A breaking relationship change is caught in test — prod subscribers never see blank KPIs.

**Key takeaways**
- ALM governs how reports and datasets move across environments.
- Any team with multiple analysts and production subscribers.
- A breaking relationship change is caught in test — prod subscribers never see blank KPIs.

---

### Track: Advanced

#### Chapter 14: Composite Models and Aggregations *(Level: Advanced)*

**Chapter focus: Composite Models and Aggregations** *(Level: Advanced)*

Composite models mix Import and DirectQuery tables. Aggregation tables pre-summarize facts for drill-down performance. User hierarchies hit agg first, then detail — transparent to report users.

Code Reference:
```dax
Sales Agg = SUMMARIZE ( Sales, Date[Month], Product[Category], "Amount", SUM ( Sales[Amount] ) )
```
What it shows: SUMMARIZE builds an aggregation table DAX engine can substitute automatically.

### What it actually is
Composite + aggregation optimizes large models without losing detail.

### When to use it
When Import models exceed memory or DirectQuery is too slow for drill-down.

### Where to use it
Global retail chains and multi-year telemetry models.

### Real use example
Retail BI team uses agg table for monthly scans — detail loads only on drill-through.

**Key takeaways**
- Composite + aggregation optimizes large models without losing detail.
- When Import models exceed memory or DirectQuery is too slow for drill-down.
- Retail BI team uses agg table for monthly scans — detail loads only on drill-through.

#### Chapter 15: Advanced DAX: Context Transition *(Level: Advanced)*

**Chapter focus: Advanced DAX: Context Transition** *(Level: Advanced)*

Calculated columns evaluate row-by-row; measures use filter context. Context transition occurs when CALCULATE iterates — a common source of bugs. Use variables (VAR) for readability and single evaluation.

Code Reference:
```dax
Rank in Category =
VAR CatSales = CALCULATE ( [Total Sales], ALLEXCEPT ( Product, Product[Category] ) )
RETURN RANKX ( ALL ( Product[Product] ), CatSales, , DESC, Dense )
```
What it shows: VAR stores intermediate results — easier to debug than nested CALCULATE.

### What it actually is
Advanced DAX handles ranking, moving averages, and dynamic segmentation.

### When to use it
When CALCULATE-heavy measures misbehave or rankings are needed in visuals.

### Where to use it
Subscription analytics with tiered discount logic.

### Real use example
VAR-based rank measure finally matches Excel prototype after context transition fix.

**Key takeaways**
- Advanced DAX handles ranking, moving averages, and dynamic segmentation.
- When CALCULATE-heavy measures misbehave or rankings are needed in visuals.
- VAR-based rank measure finally matches Excel prototype after context transition fix.

#### Chapter 16: Fabric Data Factory Pipelines *(Level: Advanced)*

**Chapter focus: Fabric Data Factory Pipelines** *(Level: Advanced)*

Fabric Data Factory (successor patterns to ADF in Fabric) orchestrates copy, notebook, and Dataflow Gen2 activities on OneLake. Schedule pipelines for bronze ingestion before semantic refresh.

Code Reference:
```markdown
# Pipeline: Copy blob -> Notebook cleanse -> Refresh dataset
# Trigger: daily 05:00 UTC
```
What it shows: Orchestration ensures silver tables update before Power BI refresh fires.

### What it actually is
Data Factory pipelines automate lakehouse ingestion in Fabric.

### When to use it
When bronze/silver loads must run before semantic model refresh on OneLake.

### Where to use it
Nightly ERP extracts and multi-source consolidation.

### Real use example
Pipeline failure blocks dataset refresh — ops gets alert before executives see stale KPIs.

**Key takeaways**
- Data Factory pipelines automate lakehouse ingestion in Fabric.
- When bronze/silver loads must run before semantic model refresh on OneLake.
- Pipeline failure blocks dataset refresh — ops gets alert before executives see stale KPIs.

#### Chapter 17: Power BI Embedded and REST API *(Level: Advanced)*

**Chapter focus: Power BI Embedded and REST API** *(Level: Advanced)*

Embed reports in customer-facing apps with app-owns-data or user-owns-data models. REST API automates workspace management, refresh triggers, and export to PDF. Service principals require tenant admin approval — document security review.

Code Reference:
```http
POST https://api.powerbi.com/v1.0/myorg/groups/{id}/datasets/{id}/refreshes
Authorization: Bearer {token}
```
What it shows: Refresh API kicks dataset update after upstream pipeline completes.

### What it actually is
Embedded analytics puts Power BI inside SaaS products.

### When to use it
When customers need in-app dashboards without separate Power BI licenses per user.

### Where to use it
B2B SaaS dashboards, partner extranets, and mobile app WebViews.

### Real use example
SaaS embeds revenue dashboard — tenant isolation enforced via RLS embed token.

**Key takeaways**
- Embedded analytics puts Power BI inside SaaS products.
- When customers need in-app dashboards without separate Power BI licenses per user.
- SaaS embeds revenue dashboard — tenant isolation enforced via RLS embed token.

#### Chapter 18: Enterprise Governance with Microsoft Purview *(Level: Advanced)*

**Chapter focus: Enterprise Governance with Microsoft Purview** *(Level: Advanced)*

Purview scans Fabric items for lineage and sensitivity labels. Endorse datasets as Certified after BPA pass and owner sign-off. Monitor Premium capacity via Fabric Capacity Metrics app (2024+).

Code Reference:
```markdown
# Certified dataset requirements
# - Owner assigned
# - Description on all tables
# - RLS tested
# - Refresh SLA documented
```
What it shows: Certification signals trust — analysts stop rebuilding the same model.

### What it actually is
Governance ensures trustworthy, discoverable BI at scale.

### When to use it
When workspace sprawl creates duplicate datasets and compliance questions.

### Where to use it
Regulated industries and global rollouts.

### Real use example
Purview lineage proves revenue metric traces to audited Fabric lakehouse table.

**Key takeaways**
- Governance ensures trustworthy, discoverable BI at scale.
- When workspace sprawl creates duplicate datasets and compliance questions.
- Purview lineage proves revenue metric traces to audited Fabric lakehouse table.

---

*Family: Power BI Analyst | Level: Beginner to Advanced*

**Official sources & free libraries**
- https://learn.microsoft.com/en-us/power-bi/
- https://learn.microsoft.com/en-us/power-query/
- https://dax.guide/
- https://learn.microsoft.com/en-us/fabric/
- https://www.sqlbi.com/articles/
- https://learn.microsoft.com/en-us/power-bi/guidance/