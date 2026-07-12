# Study Report: Lean Analytics — Data Analyst

*Written by Gagan Pasupuleti*
*Book study report | Lean Analytics by Alistair Croll & Benjamin Yoskovitz*

## Summary

Study report for *Lean Analytics* by Alistair Croll & Benjamin Yoskovitz (Intermediate level) mapped to the Data Analyst role. KPIs, funnels, and metrics that drive business decisions.

## Chapters

---

### Track: Book-Intro

#### Chapter 1: About Lean Analytics *(Level: Intermediate)*

**Chapter focus: About Lean Analytics** *(Level: Intermediate)*

This study report summarizes *Lean Analytics* by Alistair Croll & Benjamin Yoskovitz for the Data Analyst role. The resource is rated Intermediate level. KPIs, funnels, and metrics that drive business decisions. Use this report alongside the official material to prepare for CodeQuest review.

Code Reference:
```text
# Lean Analytics
# Author: Alistair Croll & Benjamin Yoskovitz
# Role: Data Analyst
# Level: Intermediate
```
What it shows: Metadata block records the source book and target role family.

### What it actually is
A structured study report based on Lean Analytics.

### When to use it
When learning Data Analyst skills at Intermediate level.

### Where to use it
Data Analyst training paths and certification prep.

### Real use example
A learner reads this report before starting the full book or free online guide.

**Key takeaways**
- A structured study report based on Lean Analytics.
- When learning Data Analyst skills at Intermediate level.
- A learner reads this report before starting the full book or free online guide.

---

### Track: Book-Context

#### Chapter 2: Why This Book Matters for Your Role *(Level: Intermediate)*

**Chapter focus: Why This Book Matters for Your Role** *(Level: Intermediate)*

Data Analyst professionals use ideas from Lean Analytics to solve real workplace problems. KPIs, funnels, and metrics that drive business decisions. This chapter explains how the book fits into your learning path and what you should be able to do after studying it.

Code Reference:
```text
Role: Data Analyst
Book focus: KPIs, funnels, and metrics that drive business decisions.
Recommended level: Intermediate
```
What it shows: Connects the book topic to the job role outcomes.

### What it actually is
Role-aligned learning connects theory to job tasks.

### When to use it
During career planning and syllabus design.

### Where to use it
Data Analyst bootcamps and CodeQuest teacher assignments.

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

The main topics in Lean Analytics include practical concepts described as: KPIs, funnels, and metrics that drive business decisions. Study each topic with hands-on practice. Take notes on definitions, workflows, and examples that match tools used in Data Analyst jobs today.

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

#### Chapter 4: Applied: SQL JOINs and Multi-Table Logic *(Level: Intermediate)*

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

#### Chapter 5: Applied: CTEs and Window Functions *(Level: Intermediate)*

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

#### Chapter 6: Applied: pandas groupby, merge, and pivot *(Level: Intermediate)*

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

---

### Track: Book-Plan

#### Chapter 7: Study Plan and Practice *(Level: Intermediate)*

**Chapter focus: Study Plan and Practice** *(Level: Intermediate)*

Finish Lean Analytics with a weekly plan: read one section, write a summary, complete one exercise, and reflect on how it applies to Data Analyst. If a free edition exists, practice every example. Submit your notes and one mini-project demo for teacher review.

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

*Family: Data Analyst | Level: Intermediate*

**Official sources & free libraries**
- https://leananalyticsbook.com/