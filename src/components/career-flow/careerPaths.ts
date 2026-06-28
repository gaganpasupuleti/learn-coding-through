export type StageStatus = 'completed' | 'current' | 'locked'
export type CheckpointType = 'quiz' | 'exam' | 'project' | 'interview'

export interface CheckpointBadge {
  type: CheckpointType
  label: string
}

export interface CareerStage {
  id: string
  title: string
  subtitle: string
  skills: string[]
  lessons: string[]
  tools: string[]
  practiceTasks: string[]
  checkpoints: CheckpointBadge[]
  expectedOutcome: string
  durationWeeks: number
  isCapstone?: boolean
  isInterviewPrep?: boolean
}

export interface PathTheme {
  primary: string
  primaryLight: string
  bg: string
  nodeBg: string
  currentRing: string
  connectorColor: string
  badgeClass: string
  tabActive: string
  tabHover: string
  progressBar: string
}

export interface CareerPath {
  id: 'data-analytics' | 'data-science' | 'data-engineering'
  title: string
  subtitle: string
  description: string
  roleLabel: string
  salaryRange: string
  duration: string
  theme: PathTheme
  stages: CareerStage[]
}

export const PATH_THEMES: Record<CareerPath['id'], PathTheme> = {
  'data-analytics': {
    primary: 'text-sky-700',
    primaryLight: 'text-sky-500',
    bg: 'bg-sky-50',
    nodeBg: 'bg-sky-600',
    currentRing: 'ring-sky-300',
    connectorColor: 'bg-sky-200',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    tabActive: 'bg-sky-600 text-white shadow-sky-200',
    tabHover: 'hover:bg-sky-50 hover:text-sky-700',
    progressBar: 'bg-sky-500',
  },
  'data-science': {
    primary: 'text-violet-700',
    primaryLight: 'text-violet-500',
    bg: 'bg-violet-50',
    nodeBg: 'bg-violet-600',
    currentRing: 'ring-violet-300',
    connectorColor: 'bg-violet-200',
    badgeClass: 'bg-violet-100 text-violet-800 border-violet-200',
    tabActive: 'bg-violet-600 text-white shadow-violet-200',
    tabHover: 'hover:bg-violet-50 hover:text-violet-700',
    progressBar: 'bg-violet-500',
  },
  'data-engineering': {
    primary: 'text-emerald-700',
    primaryLight: 'text-emerald-500',
    bg: 'bg-emerald-50',
    nodeBg: 'bg-emerald-600',
    currentRing: 'ring-emerald-300',
    connectorColor: 'bg-emerald-200',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    tabActive: 'bg-emerald-600 text-white shadow-emerald-200',
    tabHover: 'hover:bg-emerald-50 hover:text-emerald-700',
    progressBar: 'bg-emerald-500',
  },
}

export const CAREER_PATHS: CareerPath[] = [
  {
    id: 'data-analytics',
    title: 'Data Analytics',
    subtitle: 'Excel · SQL · Power BI · Python',
    description: 'Turn raw business data into decisions. Master spreadsheets, SQL queries, BI dashboards, and Python automation to become the analyst every team needs.',
    roleLabel: 'Data Analyst',
    salaryRange: '$55k – $110k',
    duration: '4 months',
    theme: PATH_THEMES['data-analytics'],
    stages: [
      {
        id: 'da-excel',
        title: 'Excel Basics',
        subtitle: 'Spreadsheets & formulas',
        skills: ['VLOOKUP / XLOOKUP', 'Pivot Tables', 'Conditional Formatting', 'Data Validation', 'Named Ranges'],
        lessons: [
          'Navigating and formatting workbooks',
          'Writing lookup and logical formulas',
          'Building pivot tables from raw data',
          'Using conditional formatting to surface insights',
          'Data cleaning with Text-to-Columns and Power Query basics',
        ],
        tools: ['Microsoft Excel', 'Google Sheets'],
        practiceTasks: [
          'Clean a 1,000-row sales CSV in Excel',
          'Build a pivot table summarising revenue by region',
          'Write a VLOOKUP to join two tables',
        ],
        checkpoints: [{ type: 'quiz', label: 'Excel Formulas Quiz' }],
        expectedOutcome: 'Able to clean, organise, and summarise business data in a spreadsheet independently.',
        durationWeeks: 2,
      },
      {
        id: 'da-sql',
        title: 'SQL Foundations',
        subtitle: 'Query databases like a pro',
        skills: ['SELECT / WHERE / JOIN', 'GROUP BY & Aggregations', 'Subqueries', 'Window Functions', 'CTEs'],
        lessons: [
          'Database concepts: tables, keys, relationships',
          'Writing SELECT queries with filters and ordering',
          'JOIN types: INNER, LEFT, RIGHT, FULL',
          'Aggregating data with GROUP BY and HAVING',
          'Writing subqueries and Common Table Expressions',
          'Window functions: ROW_NUMBER, RANK, LAG/LEAD',
        ],
        tools: ['PostgreSQL', 'MySQL', 'DBeaver', 'SQLiteOnline'],
        practiceTasks: [
          'Query a customer orders database with JOINs',
          'Rank products by sales using window functions',
          'Write a CTE to find month-over-month growth',
        ],
        checkpoints: [{ type: 'quiz', label: 'SQL Joins & Aggregations Quiz' }],
        expectedOutcome: 'Write production-quality SQL queries to answer business questions from any relational database.',
        durationWeeks: 3,
      },
      {
        id: 'da-powerbi',
        title: 'Power BI Dashboards',
        subtitle: 'Visual storytelling with data',
        skills: ['Power Query', 'DAX Measures', 'Report Design', 'KPI Cards', 'Slicers & Filters'],
        lessons: [
          'Connecting Power BI to CSV, SQL, and Excel sources',
          'Transforming data with Power Query editor',
          'Creating calculated columns and measures with DAX',
          'Designing interactive report pages',
          'Building KPI tiles, bar charts, and waterfall charts',
          'Publishing and sharing reports',
        ],
        tools: ['Power BI Desktop', 'DAX Studio', 'Power Query'],
        practiceTasks: [
          'Build a sales performance dashboard from a sample dataset',
          'Create a DAX measure for rolling 3-month average',
          'Add slicer filters for region and product category',
        ],
        checkpoints: [
          { type: 'project', label: 'Sales Dashboard Project' },
        ],
        expectedOutcome: 'Build and publish interactive Power BI dashboards that answer real business questions.',
        durationWeeks: 3,
      },
      {
        id: 'da-python',
        title: 'Python for Analysis',
        subtitle: 'Automate and scale your analysis',
        skills: ['Pandas DataFrames', 'NumPy', 'Matplotlib / Seaborn', 'Data Cleaning', 'EDA Notebooks'],
        lessons: [
          'Python basics: lists, dicts, functions, loops',
          'Loading data with Pandas read_csv / read_sql',
          'Cleaning: handling nulls, outliers, dtypes',
          'Groupby, merge, pivot_table in Pandas',
          'Plotting distributions and trends with Matplotlib',
          'Structuring a reproducible Jupyter notebook',
        ],
        tools: ['Python 3', 'Jupyter Notebook', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn'],
        practiceTasks: [
          'Load and clean a messy public dataset',
          'Generate an EDA report with 5 key charts',
          'Automate monthly report generation with a Python script',
        ],
        checkpoints: [{ type: 'quiz', label: 'Pandas & EDA Quiz' }],
        expectedOutcome: 'Use Python to automate data analysis tasks that would take hours in Excel.',
        durationWeeks: 3,
      },
      {
        id: 'da-kpi',
        title: 'Business KPIs',
        subtitle: 'Metrics that drive decisions',
        skills: ['KPI Frameworks', 'A/B Testing', 'Cohort Analysis', 'Stakeholder Reporting', 'Data Storytelling'],
        lessons: [
          'Defining north-star metrics vs. vanity metrics',
          'Customer cohort analysis and retention curves',
          'Designing and analysing A/B experiments',
          'Translating analysis into executive summaries',
          'STAR method for data storytelling',
        ],
        tools: ['Excel', 'Python', 'Power BI', 'Google Slides'],
        practiceTasks: [
          'Define 5 KPIs for a fictional e-commerce company',
          'Run a simulated A/B test and interpret p-values',
          'Write a 1-page stakeholder summary of findings',
        ],
        checkpoints: [{ type: 'exam', label: 'Analytics Fundamentals Exam' }],
        expectedOutcome: 'Frame business problems as data questions, choose the right metric, and communicate findings clearly.',
        durationWeeks: 2,
      },
      {
        id: 'da-capstone',
        title: 'Capstone: Analytics Dashboard',
        subtitle: 'End-to-end business analytics project',
        skills: ['Full Analytics Pipeline', 'Dashboard Design', 'Insight Communication'],
        lessons: [
          'Scoping a real-world analytics problem',
          'Data sourcing, cleaning, and modelling',
          'Building a multi-page Power BI or Python dashboard',
          'Writing a project README and walkthrough',
        ],
        tools: ['Power BI', 'Python', 'SQL', 'Excel'],
        practiceTasks: [
          'Select a public dataset (Kaggle or data.gov)',
          'Produce a full EDA → dashboard → insights deliverable',
          'Present findings in a 5-minute recorded walkthrough',
        ],
        checkpoints: [{ type: 'project', label: 'Capstone Analytics Project' }],
        expectedOutcome: 'A portfolio-ready end-to-end analytics project demonstrating SQL, Python, and BI skills.',
        durationWeeks: 3,
        isCapstone: true,
      },
      {
        id: 'da-interview',
        title: 'Interview Prep',
        subtitle: 'SQL · Power BI · Case Study',
        skills: ['SQL Interview Patterns', 'Case Study Frameworks', 'Behavioural STAR Stories', 'Portfolio Presentation'],
        lessons: [
          'Top 50 SQL interview questions and patterns',
          'Power BI / Tableau interview scenarios',
          'Case study framework: clarify → structure → analyse → recommend',
          'Building a 2-page analyst portfolio PDF',
          'Salary negotiation tactics for data roles',
        ],
        tools: ['LeetCode SQL', 'StrataScratch', 'LinkedIn', 'Notion'],
        practiceTasks: [
          'Solve 20 SQL interview problems on StrataScratch',
          'Practise 3 case studies with the framework',
          'Record a mock interview walkthrough',
        ],
        checkpoints: [{ type: 'interview', label: 'Mock Interview Session' }],
        expectedOutcome: 'Job-ready confidence to pass data analyst technical screens and case study rounds.',
        durationWeeks: 2,
        isInterviewPrep: true,
      },
    ],
  },

  {
    id: 'data-science',
    title: 'Data Science',
    subtitle: 'Python · Stats · ML · Model Evaluation',
    description: 'Go beyond dashboards and build predictive models. Learn statistics, machine learning, and model evaluation to solve complex problems with data.',
    roleLabel: 'Data Scientist',
    salaryRange: '$85k – $155k',
    duration: '4 months',
    theme: PATH_THEMES['data-science'],
    stages: [
      {
        id: 'ds-python',
        title: 'Python Foundations',
        subtitle: 'The language of data science',
        skills: ['Variables & Types', 'Functions & OOP', 'List Comprehensions', 'Error Handling', 'File I/O'],
        lessons: [
          'Python syntax: variables, strings, lists, dicts',
          'Control flow: if/else, loops, comprehensions',
          'Writing reusable functions and classes',
          'Handling exceptions and writing defensive code',
          'Reading and writing CSV, JSON, and text files',
          'Virtual environments and pip',
        ],
        tools: ['Python 3', 'VS Code', 'Jupyter Notebook', 'pip'],
        practiceTasks: [
          'Write a Python script that reads a CSV and prints a summary',
          'Build a simple class for a Student record',
          'Solve 10 coding challenges on HackerRank (Easy)',
        ],
        checkpoints: [{ type: 'quiz', label: 'Python Foundations Quiz' }],
        expectedOutcome: 'Write clean, modular Python code and understand the tools every data scientist uses daily.',
        durationWeeks: 2,
      },
      {
        id: 'ds-stats',
        title: 'Statistics & Probability',
        subtitle: 'The math behind machine learning',
        skills: ['Descriptive Statistics', 'Probability Distributions', 'Hypothesis Testing', 'Correlation', 'Bayes Theorem'],
        lessons: [
          'Mean, median, mode, variance, standard deviation',
          'Normal, Poisson, and Binomial distributions',
          'Central Limit Theorem and sampling',
          'Hypothesis testing: t-tests, chi-squared tests',
          'p-values, confidence intervals, statistical power',
          'Correlation vs. causation',
        ],
        tools: ['Python (SciPy, Statsmodels)', 'Jupyter Notebook'],
        practiceTasks: [
          'Run a t-test to compare two groups in Python',
          'Simulate 1,000 coin flips and plot the distribution',
          'Find correlations in a real dataset and explain them',
        ],
        checkpoints: [{ type: 'quiz', label: 'Statistics & Probability Quiz' }],
        expectedOutcome: 'Understand the statistical foundations needed to build and interpret machine learning models.',
        durationWeeks: 3,
      },
      {
        id: 'ds-pandas',
        title: 'Pandas / NumPy',
        subtitle: 'Data wrangling at scale',
        skills: ['DataFrames & Series', 'GroupBy & Merge', 'NumPy Arrays', 'Missing Data Handling', 'Feature Engineering'],
        lessons: [
          'Creating and indexing DataFrames',
          'Filtering, sorting, and slicing data',
          'GroupBy aggregations and transform',
          'Merging and reshaping datasets',
          'Handling missing values: fillna, dropna, interpolate',
          'NumPy vectorised operations for speed',
          'Feature engineering: binning, encoding, scaling',
        ],
        tools: ['Pandas', 'NumPy', 'Jupyter Notebook', 'Matplotlib'],
        practiceTasks: [
          'Merge two messy datasets and resolve conflicts',
          'Engineer 3 new features from a datetime column',
          'Compare Pandas vs NumPy performance on 100k rows',
        ],
        checkpoints: [{ type: 'project', label: 'Data Wrangling Project' }],
        expectedOutcome: 'Wrangle any dataset into model-ready shape using Pandas and NumPy efficiently.',
        durationWeeks: 3,
      },
      {
        id: 'ds-ml',
        title: 'Machine Learning Basics',
        subtitle: 'From data to predictions',
        skills: ['Linear Regression', 'Logistic Regression', 'Decision Trees', 'K-Nearest Neighbors', 'scikit-learn Pipeline'],
        lessons: [
          'Supervised vs. unsupervised learning',
          'Train/test split and data leakage',
          'Linear regression: assumptions and interpretation',
          'Logistic regression for classification',
          'Decision tree and random forest',
          'K-nearest neighbors',
          'scikit-learn Pipeline for repeatable workflows',
        ],
        tools: ['scikit-learn', 'Pandas', 'Matplotlib', 'Jupyter Notebook'],
        practiceTasks: [
          'Build a house price predictor with linear regression',
          'Classify spam emails with logistic regression',
          'Compare 3 models on the same dataset',
        ],
        checkpoints: [{ type: 'quiz', label: 'ML Algorithms Quiz' }],
        expectedOutcome: 'Train, evaluate, and compare basic ML models using scikit-learn on real datasets.',
        durationWeeks: 3,
      },
      {
        id: 'ds-eval',
        title: 'Model Evaluation',
        subtitle: 'Knowing when your model is good',
        skills: ['Accuracy / Precision / Recall / F1', 'ROC-AUC', 'Cross-Validation', 'Hyperparameter Tuning', 'Overfitting & Bias'],
        lessons: [
          'Confusion matrix and classification metrics',
          'When to use accuracy vs. F1 vs. AUC',
          'K-fold and stratified cross-validation',
          'GridSearchCV and RandomizedSearchCV',
          'Diagnosing overfitting with learning curves',
          'Bias-variance tradeoff explained',
        ],
        tools: ['scikit-learn', 'Matplotlib', 'Seaborn', 'Optuna'],
        practiceTasks: [
          'Evaluate a classifier with precision/recall/F1',
          'Tune a random forest with GridSearchCV',
          'Plot ROC curves for 3 models and compare',
        ],
        checkpoints: [{ type: 'exam', label: 'ML Evaluation & Tuning Exam' }],
        expectedOutcome: 'Confidently choose evaluation metrics, tune models, and diagnose common ML failure modes.',
        durationWeeks: 2,
      },
      {
        id: 'ds-capstone',
        title: 'Capstone: Prediction Project',
        subtitle: 'A complete ML project from scratch',
        skills: ['End-to-End ML Pipeline', 'Feature Engineering', 'Model Selection', 'Results Communication'],
        lessons: [
          'Defining the prediction problem and success metric',
          'Data sourcing, EDA, and feature engineering',
          'Model comparison and selection',
          'Writing a project report with SHAP explanations',
          'Deploying a model to a Flask/FastAPI endpoint (optional)',
        ],
        tools: ['scikit-learn', 'Pandas', 'Matplotlib', 'SHAP', 'Jupyter Notebook'],
        practiceTasks: [
          'Build an end-to-end prediction pipeline on a Kaggle dataset',
          'Write a 2-page model card documenting your project',
          'Present results with SHAP feature importance plots',
        ],
        checkpoints: [{ type: 'project', label: 'Capstone Prediction Project' }],
        expectedOutcome: 'A portfolio-ready ML project showcasing the full data science workflow.',
        durationWeeks: 3,
        isCapstone: true,
      },
      {
        id: 'ds-interview',
        title: 'Interview Prep',
        subtitle: 'ML Concepts · Python · Case Study',
        skills: ['ML Theory Questions', 'Python Coding Screens', 'Case Studies', 'Portfolio Walkthrough'],
        lessons: [
          'Top 50 ML interview questions (theory + intuition)',
          'Python coding patterns: sorting, recursion, data structures',
          'Case study framework for product and metric questions',
          'Explaining models to non-technical stakeholders',
          'Negotiating data scientist offers',
        ],
        tools: ['LeetCode', 'StrataScratch', 'Kaggle', 'Notion'],
        practiceTasks: [
          'Answer 20 ML interview questions aloud',
          'Complete 3 take-home case studies',
          'Record a 5-minute model walkthrough video',
        ],
        checkpoints: [{ type: 'interview', label: 'Mock DS Interview Session' }],
        expectedOutcome: 'Ready to pass data scientist technical rounds, case studies, and behavioural interviews.',
        durationWeeks: 2,
        isInterviewPrep: true,
      },
    ],
  },

  {
    id: 'data-engineering',
    title: 'Data Engineering',
    subtitle: 'SQL · Python · ETL · Cloud · Spark',
    description: 'Build the infrastructure that data teams depend on. Design pipelines, data lakes, and distributed systems that move and transform data reliably at scale.',
    roleLabel: 'Data Engineer',
    salaryRange: '$90k – $160k',
    duration: '4 months',
    theme: PATH_THEMES['data-engineering'],
    stages: [
      {
        id: 'de-sql',
        title: 'SQL + Data Modeling',
        subtitle: 'Designing data at the foundation',
        skills: ['Schema Design', 'Normalisation (1NF–3NF)', 'Star Schema', 'Indexing', 'Query Optimisation'],
        lessons: [
          'Relational database design principles',
          'Normalisation: 1NF, 2NF, 3NF',
          'Dimensional modelling: star and snowflake schemas',
          'Writing complex JOINs, CTEs, and window functions',
          'Indexing strategies and query execution plans',
          'Stored procedures and triggers',
        ],
        tools: ['PostgreSQL', 'DBeaver', 'dbdiagram.io'],
        practiceTasks: [
          'Design a star schema for an e-commerce order system',
          'Write a query optimised with an index on a 1M-row table',
          'Normalise a flat CSV into 3NF relational tables',
        ],
        checkpoints: [{ type: 'quiz', label: 'Data Modeling Quiz' }],
        expectedOutcome: 'Design database schemas and write optimised SQL queries for large-scale analytical workloads.',
        durationWeeks: 3,
      },
      {
        id: 'de-python',
        title: 'Python Automation',
        subtitle: 'Scripting, APIs & data movement',
        skills: ['File Processing', 'REST API Calls', 'Scheduling (cron/Airflow)', 'Logging', 'Error Handling'],
        lessons: [
          'Reading/writing CSV, JSON, Parquet with Python',
          'Calling REST APIs and handling pagination',
          'Environment variables and secrets management',
          'Logging, retry logic, and alerting',
          'Scheduling jobs with cron and Airflow basics',
          'Writing testable Python scripts',
        ],
        tools: ['Python 3', 'Requests', 'Boto3', 'dotenv', 'Apache Airflow'],
        practiceTasks: [
          'Write a script that calls an API and writes results to Parquet',
          'Add retry logic and logging to an existing script',
          'Schedule a daily data pull with cron or Airflow',
        ],
        checkpoints: [{ type: 'quiz', label: 'Python Automation Quiz' }],
        expectedOutcome: 'Write robust, scheduled Python scripts that move and transform data between systems.',
        durationWeeks: 3,
      },
      {
        id: 'de-etl',
        title: 'ETL Pipelines',
        subtitle: 'Extract, Transform, Load at scale',
        skills: ['ETL vs ELT', 'dbt Transformations', 'Data Validation', 'Incremental Loads', 'Pipeline Monitoring'],
        lessons: [
          'ETL vs ELT patterns and when to use each',
          'Building a pipeline with Python: extract → validate → load',
          'dbt for SQL-based transformations',
          'Incremental and full-refresh strategies',
          'Data quality checks: not-null, uniqueness, freshness',
          'Pipeline monitoring and alerting',
        ],
        tools: ['dbt', 'Apache Airflow', 'Great Expectations', 'PostgreSQL'],
        practiceTasks: [
          'Build a 3-step ETL pipeline: API → transform → database',
          'Write dbt models with tests for a sample dataset',
          'Add a data quality check that alerts on failures',
        ],
        checkpoints: [{ type: 'project', label: 'ETL Pipeline Project' }],
        expectedOutcome: 'Build production-grade ETL/ELT pipelines with data quality checks and monitoring.',
        durationWeeks: 3,
      },
      {
        id: 'de-cloud',
        title: 'Cloud / Data Lake Basics',
        subtitle: 'Modern data storage in the cloud',
        skills: ['S3 / GCS Object Storage', 'Data Lake Architecture', 'Parquet / Delta Lake', 'IAM & Permissions', 'Cost Optimisation'],
        lessons: [
          'Cloud storage concepts: buckets, prefixes, lifecycle',
          'Data lake zones: raw, curated, consumption',
          'Parquet format vs CSV/JSON: why it matters',
          'Delta Lake: ACID transactions for data lakes',
          'IAM roles and least-privilege access',
          'Cloud cost patterns and storage tiers',
        ],
        tools: ['AWS S3 (or GCS)', 'AWS CLI', 'Delta Lake', 'PySpark'],
        practiceTasks: [
          'Upload and partition a dataset to S3 by date',
          'Read partitioned Parquet files into a Pandas DataFrame',
          'Set up lifecycle rules to move old data to cheaper storage',
        ],
        checkpoints: [{ type: 'quiz', label: 'Cloud Data Lake Quiz' }],
        expectedOutcome: 'Design and manage a data lake on cloud object storage following modern best practices.',
        durationWeeks: 2,
      },
      {
        id: 'de-spark',
        title: 'Spark / PySpark Basics',
        subtitle: 'Distributed data processing',
        skills: ['RDDs vs DataFrames', 'Spark SQL', 'Partitioning & Shuffling', 'Databricks Basics', 'Performance Tuning'],
        lessons: [
          'Spark architecture: driver, executors, partitions',
          'PySpark DataFrames vs Pandas: key differences',
          'Transformations vs actions: lazy evaluation',
          'Spark SQL for analytical queries on big data',
          'Understanding shuffles and avoiding them',
          'Databricks notebooks for interactive Spark',
        ],
        tools: ['PySpark', 'Databricks Community Edition', 'Delta Lake', 'Spark SQL'],
        practiceTasks: [
          'Process a 5M-row dataset in PySpark',
          'Write Spark SQL queries on a partitioned Delta table',
          'Profile a Spark job and identify shuffle bottlenecks',
        ],
        checkpoints: [{ type: 'exam', label: 'Spark & Distributed Processing Exam' }],
        expectedOutcome: 'Process large datasets at scale using PySpark and understand distributed system trade-offs.',
        durationWeeks: 3,
      },
      {
        id: 'de-capstone',
        title: 'Capstone: Data Pipeline Project',
        subtitle: 'A production-ready pipeline end to end',
        skills: ['Full Pipeline Design', 'Orchestration', 'Data Quality', 'Documentation'],
        lessons: [
          'Designing a pipeline architecture diagram',
          'Implementing source → lake → warehouse → BI pipeline',
          'Writing a data engineering design document',
          'Adding monitoring, alerting, and SLAs',
        ],
        tools: ['Airflow', 'dbt', 'PySpark', 'S3', 'PostgreSQL'],
        practiceTasks: [
          'Build an end-to-end pipeline with 3 data sources',
          'Write a 1-page architecture doc and data dictionary',
          'Present the pipeline in a mock review session',
        ],
        checkpoints: [{ type: 'project', label: 'Capstone Pipeline Project' }],
        expectedOutcome: 'A portfolio-ready data pipeline project showcasing the full data engineering skill set.',
        durationWeeks: 3,
        isCapstone: true,
      },
      {
        id: 'de-interview',
        title: 'Interview Prep',
        subtitle: 'SQL · Python · Pipeline Design',
        skills: ['SQL Design Interviews', 'Python Take-Homes', 'System Design', 'Behavioural Stories'],
        lessons: [
          'Top 40 data engineering interview questions',
          'System design: design a real-time ingestion pipeline',
          'SQL optimisation questions: indexes, partitioning',
          'Python take-home patterns: ETL, validation, logging',
          'STAR behavioural stories for engineering roles',
        ],
        tools: ['LeetCode SQL', 'StrataScratch', 'Excalidraw', 'Notion'],
        practiceTasks: [
          'Design a streaming ingestion system whiteboard-style',
          'Complete a 4-hour Python ETL take-home exercise',
          'Solve 15 advanced SQL problems',
        ],
        checkpoints: [{ type: 'interview', label: 'Mock DE Interview Session' }],
        expectedOutcome: 'Ready to clear data engineer technical rounds including SQL, system design, and Python screens.',
        durationWeeks: 2,
        isInterviewPrep: true,
      },
    ],
  },
]

export function getPathById(id: CareerPath['id']): CareerPath {
  return CAREER_PATHS.find((p) => p.id === id) ?? CAREER_PATHS[0]
}

/** Default first N stages as completed, next as current, rest locked */
export function getDefaultStageStatuses(path: CareerPath): Record<string, StageStatus> {
  const result: Record<string, StageStatus> = {}
  const completedCount = 2
  path.stages.forEach((stage, idx) => {
    if (idx < completedCount) result[stage.id] = 'completed'
    else if (idx === completedCount) result[stage.id] = 'current'
    else result[stage.id] = 'locked'
  })
  return result
}

export const CHECKPOINT_LABELS: Record<CheckpointType, string> = {
  quiz: 'Quiz',
  exam: 'Exam',
  project: 'Project',
  interview: 'Interview Prep',
}

export const CHECKPOINT_COLORS: Record<CheckpointType, string> = {
  quiz: 'bg-blue-100 text-blue-800 border-blue-200',
  exam: 'bg-amber-100 text-amber-800 border-amber-200',
  project: 'bg-green-100 text-green-800 border-green-200',
  interview: 'bg-purple-100 text-purple-800 border-purple-200',
}

export const CHECKPOINT_ICONS: Record<CheckpointType, string> = {
  quiz: '📝',
  exam: '🎯',
  project: '🛠️',
  interview: '💼',
}
