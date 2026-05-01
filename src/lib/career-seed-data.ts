import type { CareerRole } from '@/types/career'

/**
 * Local seed data for career roles.
 * fetchCareerRoles() in api.ts calls the backend for basic role info and
 * enriches each role with the syllabus from this file (matched by slug).
 */
export const careerSeedData: CareerRole[] = [
  /* ──────────────── Data Analyst ──────────────── */
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    slug: 'data-analyst',
    description: 'Turn raw data into actionable business insights using SQL, Python, and BI tools. Learn to clean messy datasets, build dashboards, and communicate findings to stakeholders.',
    domain: 'Data',
    difficulty: 'Beginner',
    salaryRangeMin: 55000,
    salaryRangeMax: 110000,
    demandLevel: 'High',
    icon: 'ChartBar',
    skills: ['SQL', 'Python', 'Excel', 'Power BI', 'Statistics'],
    sortOrder: 1,
    isActive: true,
    syllabus: [
      { id: 'da-m1-w1-1', month: 1, week: 1, title: 'SQL Fundamentals', description: 'SELECT, WHERE, JOINs, GROUP BY, subqueries and window functions on real datasets', type: 'topic', sortOrder: 1, projectId: 'medical-sql-basics' },
      { id: 'da-m1-w2-1', month: 1, week: 2, title: 'Python for Data Analysis', description: 'Pandas DataFrames, NumPy arrays, data loading and transformation pipelines', type: 'topic', sortOrder: 2 },
      { id: 'da-m1-w3-1', month: 1, week: 3, title: 'Statistics & Probability', description: 'Descriptive stats, distributions, hypothesis testing, correlation vs causation', type: 'topic', sortOrder: 3, projectId: 'number-guesser' },
      { id: 'da-m1-w4-1', month: 1, week: 4, title: 'Exploratory Data Analysis Report', description: 'Produce a complete EDA notebook on a public dataset with visualizations and summary', type: 'deliverable', sortOrder: 4 },

      { id: 'da-m2-w1-1', month: 2, week: 1, title: 'Data Visualization with Matplotlib & Seaborn', description: 'Charts, heatmaps, box plots and storytelling through visuals', type: 'topic', sortOrder: 5 },
      { id: 'da-m2-w2-1', month: 2, week: 2, title: 'Power BI Essentials', description: 'Connecting data sources, DAX basics, building interactive reports and sharing dashboards', type: 'topic', sortOrder: 6 },
      { id: 'da-m2-w3-1', month: 2, week: 3, title: 'Advanced SQL (CTEs & Stored Procedures)', description: 'Window functions, recursive CTEs, performance tuning and indexing', type: 'milestone', sortOrder: 7, projectId: 'sales-analytics' },
      { id: 'da-m2-w4-1', month: 2, week: 4, title: 'Sales Performance Dashboard', description: 'Build a Power BI dashboard from a sales dataset with KPI tiles and slicers', type: 'deliverable', sortOrder: 8 },

      { id: 'da-m3-w1-1', month: 3, week: 1, title: 'Data Cleaning & Wrangling', description: 'Handling nulls, outliers, dtype mismatches, merging inconsistent tables', type: 'topic', sortOrder: 9 },
      { id: 'da-m3-w2-1', month: 3, week: 2, title: 'A/B Testing & Experimentation', description: 'Designing experiments, t-tests, chi-squared tests, p-value interpretation', type: 'topic', sortOrder: 10 },
      { id: 'da-m3-w3-1', month: 3, week: 3, title: 'Business Intelligence & Reporting', description: 'Stakeholder communication, executive summaries, metric selection frameworks', type: 'topic', sortOrder: 11 },
      { id: 'da-m3-w4-1', month: 3, week: 4, title: 'A/B Test Business Case Study', description: 'Run a simulated A/B test, analyse results and write a stakeholder recommendation', type: 'deliverable', sortOrder: 12 },

      { id: 'da-m4-w1-1', month: 4, week: 1, title: 'Machine Learning Basics for Analysts', description: 'Linear & logistic regression, decision trees, using scikit-learn for predictions', type: 'topic', sortOrder: 13 },
      { id: 'da-m4-w2-1', month: 4, week: 2, title: 'Time Series Analysis', description: 'Trend decomposition, forecasting with Prophet, seasonality modelling', type: 'topic', sortOrder: 14 },
      { id: 'da-m4-w3-1', month: 4, week: 3, title: 'Interview & Portfolio Prep', description: 'SQL interview patterns, case study frameworks, STAR stories for data roles', type: 'milestone', sortOrder: 15 },
      { id: 'da-m4-w4-1', month: 4, week: 4, title: 'Capstone: End-to-End Analytics Project', description: 'Source → clean → analyse → dashboard → present. Full end-to-end on a business problem', type: 'deliverable', sortOrder: 16 },
    ],
  },

  /* ──────────────── SQL Developer ──────────────── */
  {
    id: 'sql-developer',
    title: 'SQL Developer',
    slug: 'sql-developer',
    description: 'Master relational databases, data modeling, and advanced querying. Learn to design, optimize, and maintain complex database systems using PostgreSQL and MySQL.',
    domain: 'Data',
    difficulty: 'Intermediate',
    salaryRangeMin: 65000,
    salaryRangeMax: 130000,
    demandLevel: 'High',
    icon: 'Database',
    skills: ['SQL', 'PostgreSQL', 'Database Design', 'Performance Tuning', 'Data Warehousing'],
    sortOrder: 2,
    isActive: true,
    syllabus: [
      { id: 'sqld-m1-w1-1', month: 1, week: 1, title: 'Relational Database Fundamentals', description: 'Tables, primary/foreign keys, basic CRUD operations, and data types', type: 'topic', sortOrder: 1 },
      { id: 'sqld-m1-w2-1', month: 1, week: 2, title: 'Filtering & Sorting', description: 'WHERE clauses, ORDER BY, pattern matching with LIKE, and NULL handling', type: 'topic', sortOrder: 2 },
      { id: 'sqld-m1-w3-1', month: 1, week: 3, title: 'Joins & Relationships', description: 'INNER, LEFT, RIGHT, and FULL OUTER joins, self joins, and cross joins', type: 'topic', sortOrder: 3, projectId: 'medical-sql-basics' },
      { id: 'sqld-m1-w4-1', month: 1, week: 4, title: 'Basic SQL Portfolio Project', description: 'Design a simple schema for a library and write basic queries to extract data', type: 'deliverable', sortOrder: 4 },

      { id: 'sqld-m2-w1-1', month: 2, week: 1, title: 'Aggregations & Grouping', description: 'GROUP BY, HAVING, COUNT, SUM, AVG, and data summarization techniques', type: 'topic', sortOrder: 5, projectId: 'sales-analytics' },
      { id: 'sqld-m2-w2-1', month: 2, week: 2, title: 'Subqueries & CTEs', description: 'Nested queries, correlated subqueries, and Common Table Expressions', type: 'topic', sortOrder: 6 },
      { id: 'sqld-m2-w3-1', month: 2, week: 3, title: 'Data Modification & DDL', description: 'INSERT, UPDATE, DELETE, CREATE TABLE, ALTER TABLE, and constraints', type: 'milestone', sortOrder: 7 },
      { id: 'sqld-m2-w4-1', month: 2, week: 4, title: 'E-commerce Database Design', description: 'Design and populate a normalized database schema for an online store', type: 'deliverable', sortOrder: 8 },

      { id: 'sqld-m3-w1-1', month: 3, week: 1, title: 'Advanced SQL Functions', description: 'String manipulation, date/time functions, mathematical functions, and CAST', type: 'topic', sortOrder: 9 },
      { id: 'sqld-m3-w2-1', month: 3, week: 2, title: 'Window Functions', description: 'ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG, and running totals', type: 'topic', sortOrder: 10 },
      { id: 'sqld-m3-w3-1', month: 3, week: 3, title: 'Stored Procedures & Triggers', description: 'Variables, control flow, error handling, and automating tasks with triggers', type: 'topic', sortOrder: 11 },
      { id: 'sqld-m3-w4-1', month: 3, week: 4, title: 'Automated Reporting System', description: 'Build stored procedures to generate monthly sales reports automatically', type: 'deliverable', sortOrder: 12 },

      { id: 'sqld-m4-w1-1', month: 4, week: 1, title: 'Performance Tuning & Indexing', description: 'Query execution plans, B-tree indexes, covering indexes, and optimization', type: 'topic', sortOrder: 13 },
      { id: 'sqld-m4-w2-1', month: 4, week: 2, title: 'Database Administration Basics', description: 'Backups, restores, user permissions, roles, and transaction management (ACID)', type: 'topic', sortOrder: 14 },
      { id: 'sqld-m4-w3-1', month: 4, week: 3, title: 'Data Warehousing Concepts', description: 'OLTP vs OLAP, Star schemas, Snowflake schemas, and dimensional modeling', type: 'milestone', sortOrder: 15 },
      { id: 'sqld-m4-w4-1', month: 4, week: 4, title: 'Capstone: Enterprise Data Model', description: 'End-to-end design, implementation, and optimization of a high-performance database', type: 'deliverable', sortOrder: 16 },
    ],
  },

  /* ──────────────── Full Stack Developer ──────────────── */
  {
    id: 'full-stack-developer',
    title: 'Full Stack Developer',
    slug: 'full-stack-developer',
    description: 'Build complete web applications from database to UI. Master React & TypeScript on the frontend, Node.js on the backend, and deploy scalable systems to the cloud.',
    domain: 'Web',
    difficulty: 'Intermediate',
    salaryRangeMin: 75000,
    salaryRangeMax: 155000,
    demandLevel: 'High',
    icon: 'Stack',
    skills: ['React', 'TypeScript', 'Node.js', 'Databases', 'System Design'],
    sortOrder: 3,
    isActive: true,
    syllabus: [
      { id: 'fsd-m1-w1-1', month: 1, week: 1, title: 'React Fundamentals & Hooks', description: 'Components, JSX, useState, useEffect, useContext, custom hooks, React DevTools', type: 'topic', sortOrder: 1, quizId: 'frontend-foundations' },
      { id: 'fsd-m1-w2-1', month: 1, week: 2, title: 'TypeScript Deep Dive', description: 'Generics, utility types, discriminated unions, type guards, module augmentation', type: 'topic', sortOrder: 2, quizId: 'js-logic-check' },
      { id: 'fsd-m1-w3-1', month: 1, week: 3, title: 'State Management (Zustand / React Query)', description: 'Global state patterns, server state caching, optimistic updates, real-time sync', type: 'topic', sortOrder: 3, projectId: 'temperature-converter' },
      { id: 'fsd-m1-w4-1', month: 1, week: 4, title: 'Interactive UI Application', description: 'React + TypeScript app with state management, routing and TailwindCSS design system', type: 'deliverable', sortOrder: 4, projectId: 'digital-clock' },

      { id: 'fsd-m2-w1-1', month: 2, week: 1, title: 'Node.js & Express/Fastify', description: 'Event loop, streams, middleware patterns, REST API design, error handling', type: 'topic', sortOrder: 5 },
      { id: 'fsd-m2-w2-1', month: 2, week: 2, title: 'Databases: SQL & NoSQL', description: 'PostgreSQL with Prisma/Drizzle ORM, Redis for caching, MongoDB for document store', type: 'topic', sortOrder: 6 },
      { id: 'fsd-m2-w3-1', month: 2, week: 3, title: 'REST API Design & GraphQL Intro', description: 'Versioning, pagination, filtering, GraphQL resolvers and Apollo Server', type: 'milestone', sortOrder: 7 },
      { id: 'fsd-m2-w4-1', month: 2, week: 4, title: 'Full Stack CRUD Application', description: 'React frontend + Node.js API + PostgreSQL with full CRUD, validation and error handling', type: 'deliverable', sortOrder: 8, projectId: 'calculator' },

      { id: 'fsd-m3-w1-1', month: 3, week: 1, title: 'Authentication & Security', description: 'JWT + refresh tokens, OAuth2 (Google/GitHub), RBAC, rate limiting, OWASP top 10', type: 'topic', sortOrder: 9, projectId: 'password-generator' },
      { id: 'fsd-m3-w2-1', month: 3, week: 2, title: 'Cloud Deployment & DevOps', description: 'Docker compose, Railway/Render/Vercel deploy, CI/CD with GitHub Actions', type: 'topic', sortOrder: 10 },
      { id: 'fsd-m3-w3-1', month: 3, week: 3, title: 'Testing (Vitest, Playwright, Supertest)', description: 'Unit, component, E2E tests, TDD workflow, test coverage dashboards', type: 'topic', sortOrder: 11 },
      { id: 'fsd-m3-w4-1', month: 3, week: 4, title: 'SaaS MVP', description: 'Multi-tenant SaaS with auth, subscriptions, feature flags, deployed to cloud with CI/CD', type: 'deliverable', sortOrder: 12 },

      { id: 'fsd-m4-w1-1', month: 4, week: 1, title: 'System Design & Scalability', description: 'Load balancing, caching strategies, DB sharding, message queues, CDN', type: 'topic', sortOrder: 13 },
      { id: 'fsd-m4-w2-1', month: 4, week: 2, title: 'Performance Optimisation', description: 'Core Web Vitals, bundle splitting, server-side rendering (Next.js), database query profiling', type: 'topic', sortOrder: 14 },
      { id: 'fsd-m4-w3-1', month: 4, week: 3, title: 'Real-Time Features (WebSockets)', description: 'Socket.io, presence indicators, live updates, collaborative editing patterns', type: 'milestone', sortOrder: 15 },
      { id: 'fsd-m4-w4-1', month: 4, week: 4, title: 'Capstone: Production Application', description: 'Real-time full stack application with auth, DB, WebSockets, deployed, monitored and load-tested', type: 'deliverable', sortOrder: 16 },
    ],
  },
]
