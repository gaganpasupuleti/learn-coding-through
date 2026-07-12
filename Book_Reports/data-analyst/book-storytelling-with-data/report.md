# Study Report: Storytelling with Data — Data Analyst

*Written by Gagan Pasupuleti*
*Book study report | Storytelling with Data by Cole Nussbaumer Knaflic*

## Summary

Study report for *Storytelling with Data* by Cole Nussbaumer Knaflic (Beginner level) mapped to the Data Analyst role. Design charts and narratives that executives understand.

## Chapters

---

### Track: Book-Intro

#### Chapter 1: About Storytelling with Data *(Level: Beginner)*

**Chapter focus: About Storytelling with Data** *(Level: Beginner)*

This study report summarizes *Storytelling with Data* by Cole Nussbaumer Knaflic for the Data Analyst role. The resource is rated Beginner level. Design charts and narratives that executives understand. Use this report alongside the official material to prepare for CodeQuest review.

Code Reference:
```text
# Storytelling with Data
# Author: Cole Nussbaumer Knaflic
# Role: Data Analyst
# Level: Beginner
```
What it shows: Metadata block records the source book and target role family.

### What it actually is
A structured study report based on Storytelling with Data.

### When to use it
When learning Data Analyst skills at Beginner level.

### Where to use it
Data Analyst training paths and certification prep.

### Real use example
A learner reads this report before starting the full book or free online guide.

**Key takeaways**
- A structured study report based on Storytelling with Data.
- When learning Data Analyst skills at Beginner level.
- A learner reads this report before starting the full book or free online guide.

---

### Track: Book-Context

#### Chapter 2: Why This Book Matters for Your Role *(Level: Beginner)*

**Chapter focus: Why This Book Matters for Your Role** *(Level: Beginner)*

Data Analyst professionals use ideas from Storytelling with Data to solve real workplace problems. Design charts and narratives that executives understand. This chapter explains how the book fits into your learning path and what you should be able to do after studying it.

Code Reference:
```text
Role: Data Analyst
Book focus: Design charts and narratives that executives understand.
Recommended level: Beginner
```
What it shows: Connects the book topic to the job role outcomes.

### What it actually is
Role-aligned learning connects theory to job tasks.

### When to use it
During career planning and syllabus design.

### Where to use it
Data Analyst bootcamps and CodeQuest teacher assignments.

### Real use example
A teacher assigns this book report before a beginner skills checkpoint.

**Key takeaways**
- Role-aligned learning connects theory to job tasks.
- During career planning and syllabus design.
- A teacher assigns this book report before a beginner skills checkpoint.

---

### Track: Book-Topics

#### Chapter 3: Key Topics Covered *(Level: Beginner)*

**Chapter focus: Key Topics Covered** *(Level: Beginner)*

The main topics in Storytelling with Data include practical concepts described as: Design charts and narratives that executives understand. Study each topic with hands-on practice. Take notes on definitions, workflows, and examples that match tools used in Data Analyst jobs today.

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

#### Chapter 4: Applied: Data Analyst Role in 2024-2026 *(Level: Beginner)*

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

#### Chapter 5: Applied: SQL SELECT, FILTER, and GROUP BY *(Level: Beginner)*

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

#### Chapter 6: Applied: Excel Tables, Pivot Tables, and XLOOKUP *(Level: Beginner)*

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

---

### Track: Book-Plan

#### Chapter 7: Study Plan and Practice *(Level: Beginner)*

**Chapter focus: Study Plan and Practice** *(Level: Beginner)*

Finish Storytelling with Data with a weekly plan: read one section, write a summary, complete one exercise, and reflect on how it applies to Data Analyst. If a free edition exists, practice every example. Submit your notes and one mini-project demo for teacher review.

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
A learner completes the study plan and uploads a beginner project screenshot.

**Key takeaways**
- Structured study plans improve retention and portfolio outcomes.
- After finishing the key topics chapters.
- A learner completes the study plan and uploads a beginner project screenshot.

---

*Family: Data Analyst | Level: Beginner*

**Official sources & free libraries**
- https://www.storytellingwithdata.com/book