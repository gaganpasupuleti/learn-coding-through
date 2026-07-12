# Study Report: Data Analyst — Career Path & Core Skills

*Written by Gagan Pasupuleti*

## Summary

This report maps the modern Data Analyst role using SQL, Excel, pandas, statistics, visualization, and data storytelling. It covers querying warehouses, cleaning messy spreadsheets, exploratory analysis, dashboard design, A/B testing, and presenting actionable insights to stakeholders — aligned with 2024-2026 analytics tooling and practices.

## Learning tracks

**Levels covered:** Beginner, Intermediate, Advanced

## Skill stack by level

### Beginner
- SQL SELECT, WHERE, GROUP BY
- Excel tables, pivot tables, XLOOKUP
- pandas read_csv and DataFrame basics
- Descriptive statistics (mean, median, std)
- Bar/line charts with matplotlib
- Data dictionary documentation
- Basic data cleaning (nulls, dtypes)

### Intermediate
- SQL JOINs, CTEs, window functions
- pandas groupby, merge, pivot
- Hypothesis testing and confidence intervals
- seaborn/plotly interactive charts
- Power Query in Excel
- Cohort and funnel analysis
- Stakeholder slide narratives
- dbt-style metric definitions

### Advanced
- Semantic layers and metrics governance
- A/B test design and power analysis
- dbt + warehouse analytics engineering
- Executive dashboard UX patterns
- Causal inference basics (DiD, matching)
- Python automation for recurring reports
- Data quality SLAs for analytics
- Self-serve BI enablement

## Recommended books (read alongside this report)

### 1. Python for Data Analysis — Wes McKinney
- **Level:** Beginner
- **Focus:** pandas, NumPy, and data wrangling — the analyst's core toolkit.
- **Link:** https://wesmckinney.com/book/

### 2. Storytelling with Data — Cole Nussbaumer Knaflic
- **Level:** Beginner
- **Focus:** Design charts and narratives that executives understand.
- **Link:** https://www.storytellingwithdata.com/book

### 3. Naked Statistics — Charles Wheelan
- **Level:** Beginner
- **Focus:** Statistics explained without heavy math — perfect for analysts.
- **Link:** https://charleswheelan.com/naked-statistics/

### 4. SQL for Data Analysis — Cathy Tanimura
- **Level:** Intermediate
- **Focus:** Advanced SQL patterns for analytics in PostgreSQL and warehouses.
- **Link:** https://www.advanced-sql.com/

### 5. Lean Analytics — Alistair Croll & Benjamin Yoskovitz
- **Level:** Intermediate
- **Focus:** KPIs, funnels, and metrics that drive business decisions.
- **Link:** https://leananalyticsbook.com/

## End-to-end projects

### Project 1: Sales Dashboard from CSV
- **Level:** Beginner | **Duration:** 1–2 weeks
- **Overview:** Clean a messy sales CSV with pandas, analyze trends, and build charts in Excel + matplotlib.
- **Objectives:**
  - Load and clean CSV data
  - Calculate KPIs (revenue, growth)
  - Create 5 charts
  - Write 2-page summary report
- **Phases:**
  - **Clean:** Handle missing values and types. Tasks: dropna, astype. Deliverable: clean_sales.csv.
  - **Analyze:** Groupby and pivot tables. Tasks: Monthly revenue, Top products. Deliverable: KPI spreadsheet.
  - **Visualize:** Bar, line, pie charts. Tasks: matplotlib, Excel charts. Deliverable: Chart pack PDF.
  - **Report:** Executive summary. Tasks: Findings, Recommendations. Deliverable: Final report PDF.
- **Final deliverables:** Clean dataset; Chart pack; Executive summary PDF

### Project 2: SQL + Python Customer Churn Analysis
- **Level:** Intermediate | **Duration:** 3 weeks
- **Overview:** Query PostgreSQL warehouse, join customer data in pandas, analyze churn drivers, present to stakeholders.
- **Objectives:**
  - Write 10+ SQL queries with JOINs and window functions
  - Identify churn predictors
  - Build cohort analysis
  - Present findings with storytelling framework
- **Phases:**
  - **SQL:** Extract cohorts from warehouse. Tasks: CTE queries, Window functions. Deliverable: SQL script file.
  - **Python:** pandas analysis on extract. Tasks: Feature correlation, Cohort retention. Deliverable: Jupyter notebook.
  - **Story:** Apply Storytelling with Data. Tasks: 3 key charts, So what? narrative. Deliverable: Slide deck.
  - **Present:** Mock stakeholder review. Tasks: Q&A prep, Appendix tables. Deliverable: Recorded presentation.
- **Final deliverables:** SQL scripts; Jupyter notebook; Slide deck; Presentation recording

### Project 3: End-to-End Business Metrics Platform
- **Level:** Advanced | **Duration:** 4–5 weeks
- **Overview:** Automated weekly KPI report: SQL extraction, Python pipeline, validation checks, and email delivery.
- **Objectives:**
  - Automate data extraction with Python
  - Data quality validation rules
  - Scheduled report generation
  - Document data dictionary
- **Phases:**
  - **Pipeline:** Extract-transform-load script. Tasks: SQL → pandas, Schedule cron. Deliverable: pipeline.py.
  - **Quality:** Great Expectations checks. Tasks: Null rate, Row count. Deliverable: Quality report.
  - **Report:** Auto-generate PDF/HTML. Tasks: Jinja template, Charts embedded. Deliverable: Sample weekly report.
  - **Docs:** Data dictionary and lineage. Tasks: Column definitions, Source mapping. Deliverable: Data catalog doc.
- **Final deliverables:** Pipeline code; Quality report; Sample weekly report; Data dictionary

## Chapters

---

### Track: Beginner

#### Chapter 1: Data Analyst Role in 2024-2026 *(Level: Beginner)*

**Chapter focus: Data Analyst Role in 2024-2026** *(Level: Beginner)*

Data analysts turn raw business data into decisions. Modern teams expect SQL fluency, spreadsheet agility, Python/pandas for heavier work, and clear communication. You partner with product, marketing, and finance — not just build charts.

Code Reference:
```python
SELECT COUNT(*) AS total_orders
FROM orders
WHERE order_date >= '2025-01-01';
```
What it shows: A simple count query answers 'how many orders this year?' — the bread-and-butter analyst task.

### What it actually is
A data analyst queries, cleans, analyzes, and explains data to drive business action.

### When to use it
When stakeholders need metrics, trends, or evidence for a decision.

### Where to use it
SaaS dashboards, retail sales reviews, healthcare operations, and ed-tech reporting.

### Real use example
A CodeQuest teacher asks 'which learning path has the highest completion rate?' — you answer with SQL and a one-slide chart.

**Key takeaways**
- A data analyst queries, cleans, analyzes, and explains data to drive business action.
- When stakeholders need metrics, trends, or evidence for a decision.
- A CodeQuest teacher asks 'which learning path has the highest completion rate?' — you answer with SQL and a one-slide chart.

#### Chapter 2: SQL SELECT, FILTER, and GROUP BY *(Level: Beginner)*

**Chapter focus: SQL SELECT, FILTER, and GROUP BY** *(Level: Beginner)*

SQL is the analyst's primary language for warehouse data. SELECT picks columns; WHERE filters rows; GROUP BY aggregates by category. Always alias expressions and comment non-obvious business logic.

Code Reference:
```sql
SELECT region,
       COUNT(*) AS orders,
       SUM(amount) AS revenue
FROM sales
WHERE status = 'completed'
GROUP BY region
ORDER BY revenue DESC;
```
What it shows: GROUP BY region rolls up revenue per region; ORDER BY surfaces top performers first.

### What it actually is
SQL is a declarative language for querying relational tables.

### When to use it
Whenever data lives in PostgreSQL, BigQuery, Snowflake, or DuckDB.

### Where to use it
Revenue reports, user counts, inventory snapshots, and audit extracts.

### Real use example
Marketing wants top 5 regions by Q1 revenue — one GROUP BY query exports to Excel in seconds.

**Key takeaways**
- SQL is a declarative language for querying relational tables.
- Whenever data lives in PostgreSQL, BigQuery, Snowflake, or DuckDB.
- Marketing wants top 5 regions by Q1 revenue — one GROUP BY query exports to Excel in seconds.

#### Chapter 3: Excel Tables, Pivot Tables, and XLOOKUP *(Level: Beginner)*

**Chapter focus: Excel Tables, Pivot Tables, and XLOOKUP** *(Level: Beginner)*

Excel remains the universal analyst interface. Convert ranges to Tables for auto-expansion; PivotTables summarize exports; XLOOKUP replaces brittle VLOOKUP. Use Power Query when files repeat weekly.

Code Reference:
```excel
=XLOOKUP(A2, Products[SKU], Products[Price], "Not found")
```
What it shows: XLOOKUP finds price by SKU with a clear not-found fallback.

### What it actually is
Excel is a spreadsheet tool for exploration, ad-hoc analysis, and stakeholder handoffs.

### When to use it
For quick what-if models, finance-friendly formats, and non-technical audiences.

### Where to use it
Budget trackers, campaign ROI sheets, and executive one-pagers.

### Real use example
Finance shares a CSV export — you build a pivot by department and month before the standup.

**Key takeaways**
- Excel is a spreadsheet tool for exploration, ad-hoc analysis, and stakeholder handoffs.
- For quick what-if models, finance-friendly formats, and non-technical audiences.
- Finance shares a CSV export — you build a pivot by department and month before the standup.

#### Chapter 4: pandas DataFrames: Load, Inspect, Slice *(Level: Beginner)*

**Chapter focus: pandas DataFrames: Load, Inspect, Slice** *(Level: Beginner)*

pandas brings spreadsheet power to Python. read_csv loads files; head/describe/profile inspect shape; boolean indexing filters rows. Use copy() when transforming to avoid SettingWithCopy warnings.

Code Reference:
```python
import pandas as pd

df = pd.read_csv('orders.csv', parse_dates=['order_date'])
print(df.shape)
print(df['amount'].describe())
recent = df[df['order_date'] >= '2025-06-01']
```
What it shows: parse_dates makes time filters reliable; describe shows mean/std instantly.

### What it actually is
pandas is Python's tabular data library built on NumPy.

### When to use it
When files exceed Excel limits or you need reproducible cleaning scripts.

### Where to use it
Log analysis, survey data, API exports, and notebook-based reporting.

### Real use example
A 2M-row export crashes Excel — pandas loads it, drops duplicates, and saves a clean parquet file.

**Key takeaways**
- pandas is Python's tabular data library built on NumPy.
- When files exceed Excel limits or you need reproducible cleaning scripts.
- A 2M-row export crashes Excel — pandas loads it, drops duplicates, and saves a clean parquet file.

#### Chapter 5: Descriptive Statistics for Analysts *(Level: Beginner)*

**Chapter focus: Descriptive Statistics for Analysts** *(Level: Beginner)*

Mean, median, and standard deviation summarize distributions. Percentiles show tails; coefficient of variation compares volatility across scales. Always pair numbers with sample size — small n means wide uncertainty.

Code Reference:
```python
import pandas as pd
df = pd.read_csv('scores.csv')
print(df['score'].agg(['count','mean','median','std']))
print(df['score'].quantile([0.25, 0.5, 0.75]))
```
What it shows: agg bundles summary stats; quantiles reveal skew better than mean alone.

### What it actually is
Descriptive statistics summarize datasets without assuming a model.

### When to use it
In every exploratory analysis before inferential tests or modeling.

### Where to use it
Grades, NPS, session duration, and pricing experiments.

### Real use example
Product asks if new onboarding helped — you report median time-to-first-lesson dropped 18% with n=4,200.

**Key takeaways**
- Descriptive statistics summarize datasets without assuming a model.
- In every exploratory analysis before inferential tests or modeling.
- Product asks if new onboarding helped — you report median time-to-first-lesson dropped 18% with n=4,200.

#### Chapter 6: Charts with matplotlib: Tell One Story per Chart *(Level: Beginner)*

**Chapter focus: Charts with matplotlib: Tell One Story per Chart** *(Level: Beginner)*

Good charts remove clutter: labeled axes, readable fonts, honest baselines. Bar charts compare categories; line charts show trends. Avoid pie charts for more than three slices — use bars instead.

Code Reference:
```python
import matplotlib.pyplot as plt
import pandas as pd
df = pd.read_csv('monthly.csv')
plt.bar(df['month'], df['revenue'])
plt.title('Monthly Revenue 2025')
plt.ylabel('USD')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('revenue.png', dpi=150)
```
What it shows: tight_layout prevents clipped labels; dpi=150 is presentation-ready.

### What it actually is
matplotlib is Python's foundational plotting library.

### When to use it
When you need publication-quality static charts in reports.

### Where to use it
Board decks, PDF reports, and notebook exports.

### Real use example
You replace a cluttered default chart with a sorted bar chart — executives grasp the top driver in 5 seconds.

**Key takeaways**
- matplotlib is Python's foundational plotting library.
- When you need publication-quality static charts in reports.
- You replace a cluttered default chart with a sorted bar chart — executives grasp the top driver in 5 seconds.

---

### Track: Intermediate

#### Chapter 7: SQL JOINs and Multi-Table Logic *(Level: Intermediate)*

**Chapter focus: SQL JOINs and Multi-Table Logic** *(Level: Intermediate)*

JOINs combine facts with dimensions. INNER keeps matches only; LEFT keeps all left rows. Qualify ambiguous columns (orders.customer_id). Watch fan-out: joining orders to line-items multiplies rows — aggregate before join when needed.

Code Reference:
```sql
SELECT c.country,
       SUM(o.amount) AS revenue
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'paid'
GROUP BY c.country;
```
What it shows: JOIN links orders to customers so revenue rolls up by country.

### What it actually is
JOINs merge related tables on key columns.

### When to use it
Any analysis spanning users, orders, products, or campaigns.

### Where to use it
CRM exports, e-commerce warehouses, and subscription billing.

### Real use example
Support tickets joined to account tier show churn risk concentrates in 'free' tier accounts.

**Key takeaways**
- JOINs merge related tables on key columns.
- Any analysis spanning users, orders, products, or campaigns.
- Support tickets joined to account tier show churn risk concentrates in 'free' tier accounts.

#### Chapter 8: CTEs and Window Functions *(Level: Intermediate)*

**Chapter focus: CTEs and Window Functions** *(Level: Intermediate)*

Common Table Expressions (WITH) break complex SQL into readable steps. Window functions (ROW_NUMBER, LAG, SUM OVER) compute metrics without collapsing rows — essential for funnels, running totals, and period-over-period growth.

Code Reference:
```sql
WITH daily AS (
  SELECT order_date, SUM(amount) AS revenue
  FROM orders GROUP BY 1
)
SELECT order_date, revenue,
       revenue - LAG(revenue) OVER (ORDER BY order_date) AS day_change
FROM daily;
```
What it shows: LAG compares each day to the previous — spot spikes without a self-join.

### What it actually is
CTEs name subqueries; window functions aggregate over ordered partitions.

### When to use it
Funnels, retention, rankings, and moving averages in SQL.

### Where to use it
BigQuery, Snowflake, PostgreSQL, and DuckDB analytics.

### Real use example
ROW_NUMBER deduplicates latest subscription per user before computing MRR.

**Key takeaways**
- CTEs name subqueries; window functions aggregate over ordered partitions.
- Funnels, retention, rankings, and moving averages in SQL.
- ROW_NUMBER deduplicates latest subscription per user before computing MRR.

#### Chapter 9: pandas groupby, merge, and pivot *(Level: Intermediate)*

**Chapter focus: pandas groupby, merge, and pivot** *(Level: Intermediate)*

groupby.agg computes segment metrics; merge joins DataFrames on keys (validate cardinality); pivot_table reshapes for heatmaps. Use categorical dtypes for faster groupby on large data.

Code Reference:
```python
summary = (df.groupby('region')['amount']
             .agg(orders='count', revenue='sum', aov='mean')
             .sort_values('revenue', ascending=False))
merged = orders.merge(customers, on='customer_id', how='left')
```
What it shows: Named aggregations keep output columns clear for downstream charts.

### What it actually is
pandas transforms mirror SQL but excel at notebook iteration.

### When to use it
Between SQL export and visualization in a Python workflow.

### Where to use it
Survey cross-tabs, SKU profitability, and multi-source blends.

### Real use example
merge flags orphan orders (no matching customer) for data quality follow-up.

**Key takeaways**
- pandas transforms mirror SQL but excel at notebook iteration.
- Between SQL export and visualization in a Python workflow.
- merge flags orphan orders (no matching customer) for data quality follow-up.

#### Chapter 10: Data Cleaning Patterns *(Level: Intermediate)*

**Chapter focus: Data Cleaning Patterns** *(Level: Intermediate)*

Real data is messy: mixed date formats, trailing spaces, sentinel values (-1 = unknown). Standardize early; log every drop; never silent-delete without audit counts. Great Expectations or simple assert checks catch regressions.

Code Reference:
```python
df['email'] = df['email'].str.strip().str.lower()
df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
before = len(df)
df = df.dropna(subset=['amount'])
print(f'Dropped {before - len(df)} rows with invalid amount')
```
What it shows: errors='coerce' turns bad numbers into NaN for transparent filtering.

### What it actually is
Data cleaning makes raw inputs trustworthy for analysis.

### When to use it
Before any metric hits a dashboard or executive email.

### Where to use it
CRM imports, web analytics, and third-party API feeds.

### Real use example
Trimming emails reveals 3% duplicates that inflated active-user counts.

**Key takeaways**
- Data cleaning makes raw inputs trustworthy for analysis.
- Before any metric hits a dashboard or executive email.
- Trimming emails reveals 3% duplicates that inflated active-user counts.

#### Chapter 11: Hypothesis Testing Basics *(Level: Intermediate)*

**Chapter focus: Hypothesis Testing Basics** *(Level: Intermediate)*

A/B tests compare variants with statistical rigor. State null/alternative hypotheses; pick test (t-test, chi-square); check sample size and alpha (often 0.05). Report confidence intervals, not just p-values — business cares about magnitude.

Code Reference:
```python
from scipy import stats
t_stat, p_val = stats.ttest_ind(group_a, group_b, equal_var=False)
print(f'p-value: {p_val:.4f}')
print(f'mean diff: {group_a.mean() - group_b.mean():.2f}')
```
What it shows: Welch's t-test handles unequal variances common in web experiments.

### What it actually is
Hypothesis tests quantify whether differences are likely random noise.

### When to use it
After running controlled experiments or comparing segments.

### Where to use it
Product growth, pricing tests, and email campaign analysis.

### Real use example
New checkout layout lifts conversion 0.4pp — significant but tiny; PM decides it's not worth rollout cost.

**Key takeaways**
- Hypothesis tests quantify whether differences are likely random noise.
- After running controlled experiments or comparing segments.
- New checkout layout lifts conversion 0.

#### Chapter 12: seaborn and plotly for Interactive Dashboards *(Level: Intermediate)*

**Chapter focus: seaborn and plotly for Interactive Dashboards** *(Level: Intermediate)*

seaborn adds statistical aesthetics (boxen, regression lines); plotly enables hover tooltips and drill-down for HTML dashboards. Keep color palettes colorblind-safe (viridis, ColorBrewer).

Code Reference:
```python
import seaborn as sns
import matplotlib.pyplot as plt
sns.boxplot(data=df, x='plan', y='session_mins')
plt.title('Session Duration by Plan')
plt.show()
```
What it shows: boxplot shows median and outliers per plan — better than mean-only bar charts.

### What it actually is
seaborn builds on matplotlib; plotly adds interactivity for web sharing.

### When to use it
When stakeholders explore segments without re-running SQL.

### Where to use it
Product analytics portals, Jupyter dashboards, and Streamlit apps.

### Real use example
plotly dropdown filters region — PM self-serves during live review.

**Key takeaways**
- seaborn builds on matplotlib; plotly adds interactivity for web sharing.
- When stakeholders explore segments without re-running SQL.
- plotly dropdown filters region — PM self-serves during live review.

#### Chapter 13: Data Storytelling Framework *(Level: Intermediate)*

**Chapter focus: Data Storytelling Framework** *(Level: Intermediate)*

Structure: context → complication → resolution. Lead with the answer; one chart per message; annotate the 'so what'. Anticipate objections with appendix tables. Cole Knaflic's approach: declutter, focus attention, think like your audience.

Code Reference:
```markdown
# Slide outline
# 1. Headline insight (one sentence)
# 2. Chart proving insight
# 3. Recommended action + owner
# 4. Appendix: methodology
```
What it shows: A slide outline forces one headline — prevents data dumps.

### What it actually is
Data storytelling translates analysis into decisions.

### When to use it
Every presentation to non-analyst stakeholders.

### Where to use it
Board meetings, sprint reviews, and customer success QBRs.

### Real use example
Instead of 12 charts, you show 'Completion up 9% after reminder email' with one annotated line chart.

**Key takeaways**
- Data storytelling translates analysis into decisions.
- Every presentation to non-analyst stakeholders.
- Instead of 12 charts, you show 'Completion up 9% after reminder email' with one annotated line chart.

---

### Track: Advanced

#### Chapter 14: Cohort and Funnel Analysis at Scale *(Level: Advanced)*

**Chapter focus: Cohort and Funnel Analysis at Scale** *(Level: Advanced)*

Funnels measure step conversion; cohorts track behavior from a start event (signup week). Define anchors carefully — changing cohort definition shifts retention curves. Use SQL windows for scalable cohort matrices on millions of events.

Code Reference:
```sql
SELECT signup_week, weeks_since,
       COUNT(DISTINCT user_id) AS active_users
FROM user_activity
GROUP BY 1, 2
ORDER BY 1, 2;
```
What it shows: signup_week × weeks_since forms the retention grid analysts heatmap.

### What it actually is
Cohort/funnel analysis reveals where users drop and whether they return.

### When to use it
When measuring retention, conversion, and drop-off across large event tables.

### Where to use it
Subscription products, learning platforms, and mobile apps.

### Real use example
CodeQuest measures week-4 report submission retention by signup cohort.

**Key takeaways**
- Cohort/funnel analysis reveals where users drop and whether they return.
- When measuring retention, conversion, and drop-off across large event tables.
- CodeQuest measures week-4 report submission retention by signup cohort.

#### Chapter 15: A/B Test Design and Power Analysis *(Level: Advanced)*

**Chapter focus: A/B Test Design and Power Analysis** *(Level: Advanced)*

Before launching tests, estimate required sample size (power analysis) for minimum detectable effect. Guard against peeking, multiple comparisons, and Simpson's paradox. Use sequential testing or fixed horizon per 2024 experimentation best practices.

Code Reference:
```python
from statsmodels.stats.power import zt_ind_solve_power
effect = 0.02  # 2pp lift
n = zt_ind_solve_power(effect_size=effect, alpha=0.05, power=0.8)
print(f'Need ~{int(n)} users per variant')
```
What it shows: Power analysis prevents under-powered tests that waste traffic.

### What it actually is
Experiment design ensures tests can detect meaningful lifts.

### When to use it
Before allocating traffic to product experiments.

### Where to use it
Growth teams, pricing labs, and UX research programs.

### Real use example
You block a 3-day test — power calc shows 2 weeks needed for 1pp MDE.

**Key takeaways**
- Experiment design ensures tests can detect meaningful lifts.
- Before allocating traffic to product experiments.
- You block a 3-day test — power calc shows 2 weeks needed for 1pp MDE.

#### Chapter 16: Semantic Layer and Metric Governance *(Level: Advanced)*

**Chapter focus: Semantic Layer and Metric Governance** *(Level: Advanced)*

A semantic layer defines MRR, DAU, and churn once — analysts query certified metrics. Document grain, filters, and edge cases (refunds, trials). dbt metrics / LookML / Cube.dev patterns reduce conflicting numbers in meetings.

Code Reference:
```yaml
# metrics.yml excerpt
# name: mrr
# description: Sum of active subscription MRR at month end
# filters: status = 'active', exclude comp accounts
```
What it shows: YAML metric definitions are version-controlled like code.

### What it actually is
Semantic layers centralize business logic away from ad-hoc SQL.

### When to use it
When multiple teams report the same KPI differently.

### Where to use it
Scale-ups adopting self-serve BI and analytics engineering.

### Real use example
One certified 'active learner' metric ends the weekly debate between product and finance.

**Key takeaways**
- Semantic layers centralize business logic away from ad-hoc SQL.
- When multiple teams report the same KPI differently.
- One certified 'active learner' metric ends the weekly debate between product and finance.

#### Chapter 17: Executive Dashboard UX *(Level: Advanced)*

**Chapter focus: Executive Dashboard UX** *(Level: Advanced)*

Executive dashboards answer: are we on track? what broke? what next? Use scorecards with targets, sparklines for trend, and alerts — not 40 filters. Mobile-friendly layouts matter for 2025+ leadership workflows.

Code Reference:
```markdown
# Layout principles
# - 3 KPI tiles above fold
# - Red only for true exceptions
# - Link to detail in self-serve tool
```
What it shows: Layout principles prevent vanity dashboards nobody opens.

### What it actually is
Executive UX prioritizes decision speed over exploration depth.

### When to use it
C-suite weekly business reviews and investor updates.

### Where to use it
ARR dashboards, ops command centers, and regional performance walls.

### Real use example
CEO opens mobile view — three KPIs load in <2s with exception callout on EU churn.

**Key takeaways**
- Executive UX prioritizes decision speed over exploration depth.
- C-suite weekly business reviews and investor updates.
- CEO opens mobile view — three KPIs load in <2s with exception callout on EU churn.

#### Chapter 18: Production Analytics Pipelines *(Level: Advanced)*

**Chapter focus: Production Analytics Pipelines** *(Level: Advanced)*

Mature analysts automate recurring reports: scheduled SQL → dbt → notebook → Slack/email. Add data quality checks, idempotent runs, and ownership on-call. Treat dashboards as products with SLAs and changelog.

Code Reference:
```yaml
# .github/workflows/weekly_report.yml
# schedule: cron '0 6 * * 1'
# steps: dbt run && python render_report.py && upload artifact
```
What it shows: CI-scheduled reports replace manual Monday morning copy-paste.

### What it actually is
Production pipelines deliver trusted metrics on a cadence.

### When to use it
When leadership relies on weekly/monthly reporting packages.

### Where to use it
Revenue flash reports, compliance packs, and board metrics.

### Real use example
Failed freshness test pauses publish — team fixes upstream ETL before bad numbers reach Slack.

**Key takeaways**
- Production pipelines deliver trusted metrics on a cadence.
- When leadership relies on weekly/monthly reporting packages.
- Failed freshness test pauses publish — team fixes upstream ETL before bad numbers reach Slack.

---

*Family: Data Analyst | Level: Beginner to Advanced*

**Official sources & free libraries**
- https://pandas.pydata.org/docs/
- https://www.postgresql.org/docs/current/tutorial.html
- https://support.microsoft.com/en-us/excel
- https://matplotlib.org/stable/users/index.html
- https://www.storytellingwithdata.com/
- https://duckdb.org/docs/