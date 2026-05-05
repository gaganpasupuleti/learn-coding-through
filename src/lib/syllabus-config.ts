/**
 * Config-driven 4-month syllabus content.
 *
 * Edit this file to update syllabus content without touching UI code.
 * Each entry maps a role key to an array of MonthEntry objects (Month 1–4).
 */

export interface SyllabusWeek {
  week: number
  topic: string
  activities: string[]
}

export interface SyllabusMonth {
  month: number
  title: string
  theme: string
  weeks: SyllabusWeek[]
  capstone: string
}

export interface RoleSyllabus {
  roleKey: string
  roleLabel: string
  months: SyllabusMonth[]
}

/** Shared foundational month used as a base for all roles. */
const sharedMonth1: SyllabusMonth = {
  month: 1,
  title: 'Foundation',
  theme: 'Environment setup, core language basics, and first program',
  weeks: [
    { week: 1, topic: 'Dev Environment & Tooling', activities: ['Install tools', 'Run hello world', 'Git basics'] },
    { week: 2, topic: 'Variables, Types & Control Flow', activities: ['Data types', 'Conditionals', 'Loops'] },
    { week: 3, topic: 'Functions & Modules', activities: ['Function design', 'Imports', 'Small utilities'] },
    { week: 4, topic: 'Mini Project', activities: ['Build a CLI tool', 'Code review', 'Debugging practice'] },
  ],
  capstone: 'Build and submit a working command-line application',
}

export const syllabusConfig: RoleSyllabus[] = [
  {
    roleKey: 'data-analyst',
    roleLabel: 'Data Analyst',
    months: [
      sharedMonth1,
      {
        month: 2,
        title: 'Data Manipulation',
        theme: 'SQL, Excel/Sheets, and Python for data wrangling',
        weeks: [
          { week: 1, topic: 'SQL Fundamentals', activities: ['SELECT, WHERE, JOIN', 'Aggregations', 'Subqueries'] },
          { week: 2, topic: 'Python pandas Basics', activities: ['DataFrames', 'Filtering', 'GroupBy'] },
          { week: 3, topic: 'Data Cleaning', activities: ['Handling nulls', 'Type coercion', 'Deduplication'] },
          { week: 4, topic: 'Excel & Sheets', activities: ['PivotTables', 'VLOOKUP', 'Charts'] },
        ],
        capstone: 'Clean and analyze a real-world CSV dataset',
      },
      {
        month: 3,
        title: 'Visualisation & Insights',
        theme: 'Power BI / Tableau, storytelling with data',
        weeks: [
          { week: 1, topic: 'Chart Types & When to Use Them', activities: ['Bar, line, scatter', 'Histograms', 'Heatmaps'] },
          { week: 2, topic: 'Power BI / Tableau Basics', activities: ['Connect to data', 'Build dashboards', 'Filters & slicers'] },
          { week: 3, topic: 'Statistical Concepts', activities: ['Mean/median/mode', 'Distributions', 'Correlation'] },
          { week: 4, topic: 'Dashboard Project', activities: ['End-to-end dashboard', 'KPI definition', 'Peer review'] },
        ],
        capstone: 'Deliver a self-serve analytics dashboard with 5+ KPIs',
      },
      {
        month: 4,
        title: 'Interview & Portfolio',
        theme: 'Case studies and mock interviews',
        weeks: [
          { week: 1, topic: 'Case Study Practice', activities: ['Business problem → data approach', 'Present findings', 'Q&A prep'] },
          { week: 2, topic: 'Portfolio Projects', activities: ['GitHub README', 'Project write-up', 'Kaggle notebook'] },
          { week: 3, topic: 'LinkedIn & Career Materials', activities: ['Keyword optimisation', 'Quantifying impact', 'LinkedIn audit'] },
          { week: 4, topic: 'Mock Interviews', activities: ['SQL rounds', 'Analytics take-home', 'Behavioural prep'] },
        ],
        capstone: 'Capstone: end-to-end analytics project with presentation',
      },
    ],
  },

  {
    roleKey: 'sql-developer',
    roleLabel: 'SQL Developer',
    months: [
      {
        month: 1,
        title: 'Relational Database Fundamentals',
        theme: 'Tables, keys, and core SQL queries',
        weeks: [
          { week: 1, topic: 'Tables & Basics', activities: ['CREATE TABLE', 'Data Types', 'CRUD Operations'] },
          { week: 2, topic: 'Filtering & Sorting', activities: ['WHERE, LIKE, NULLs', 'ORDER BY', 'LIMIT / OFFSET'] },
          { week: 3, topic: 'Joins & Relationships', activities: ['INNER JOIN', 'LEFT / RIGHT JOIN', 'Cross & Self Joins'] },
          { week: 4, topic: 'Basic SQL Portfolio', activities: ['Design library schema', 'Write foundational queries'] },
        ],
        capstone: 'Design a simple schema and extract structured data using joins and filters.',
      },
      {
        month: 2,
        title: 'Aggregations & Data Modification',
        theme: 'Grouping, Subqueries, and DDL',
        weeks: [
          { week: 1, topic: 'Aggregations', activities: ['GROUP BY & HAVING', 'SUM, AVG, COUNT', 'Data summarization'] },
          { week: 2, topic: 'Subqueries & CTEs', activities: ['Nested queries', 'Correlated subqueries', 'Common Table Expressions'] },
          { week: 3, topic: 'Data Modification & DDL', activities: ['INSERT, UPDATE, DELETE', 'ALTER TABLE', 'Constraints'] },
          { week: 4, topic: 'E-commerce Database Design', activities: ['Normalize tables', 'Design complex schema'] },
        ],
        capstone: 'Build and populate a fully normalized database schema for an online store.',
      },
      {
        month: 3,
        title: 'Advanced SQL & Logic',
        theme: 'Window functions, triggers, and stored procedures',
        weeks: [
          { week: 1, topic: 'Advanced Functions', activities: ['String/Date functions', 'Math & CAST', 'CASE Statements'] },
          { week: 2, topic: 'Window Functions', activities: ['ROW_NUMBER, RANK', 'Running totals', 'LEAD/LAG'] },
          { week: 3, topic: 'Procedures & Triggers', activities: ['Variables & Control flow', 'Stored Procedures', 'Triggers'] },
          { week: 4, topic: 'Automated Reporting', activities: ['Monthly sales report proc', 'Data validation trigger'] },
        ],
        capstone: 'Build stored procedures and triggers to automate a monthly reporting system.',
      },
      {
        month: 4,
        title: 'Performance Tuning & Architecture',
        theme: 'Indexes, execution plans, and data warehousing',
        weeks: [
          { week: 1, topic: 'Performance & Indexing', activities: ['Execution plans', 'B-tree indexes', 'Covering indexes'] },
          { week: 2, topic: 'Database Administration', activities: ['Backups / Restores', 'Roles & Permissions', 'ACID Transactions'] },
          { week: 3, topic: 'Data Warehousing Concepts', activities: ['OLTP vs OLAP', 'Star schemas', 'Dimensional modeling'] },
          { week: 4, topic: 'Capstone Project', activities: ['Enterprise data model', 'Optimization', 'Documentation'] },
        ],
        capstone: 'End-to-end design, implementation, and optimization of a high-performance database.',
      },
    ],
  },

  {
    roleKey: 'full-stack-developer',
    roleLabel: 'Full Stack Developer',
    months: [
      sharedMonth1,
      {
        month: 2,
        title: 'Frontend & Backend',
        theme: 'React, TypeScript, Node.js, and REST APIs',
        weeks: [
          { week: 1, topic: 'React Fundamentals', activities: ['Components & props', 'State & hooks', 'Routing'] },
          { week: 2, topic: 'TypeScript Basics', activities: ['Types & interfaces', 'Generics', 'Utility types'] },
          { week: 3, topic: 'Node.js + Express API', activities: ['Route handlers', 'Middleware', 'Error handling'] },
          { week: 4, topic: 'Database & ORM', activities: ['PostgreSQL setup', 'Prisma ORM', 'CRUD endpoints'] },
        ],
        capstone: 'Build a full-stack CRUD app with React frontend and Node.js API',
      },
      {
        month: 3,
        title: 'Auth, Testing & Deploy',
        theme: 'JWT auth, Vitest, Docker, Vercel/Railway',
        weeks: [
          { week: 1, topic: 'Auth & Sessions', activities: ['JWT & refresh tokens', 'Protected routes', 'OAuth intro'] },
          { week: 2, topic: 'Testing Frontend & Backend', activities: ['Vitest + RTL', 'API integration tests', 'E2E with Playwright'] },
          { week: 3, topic: 'Containerisation & CI', activities: ['Docker + docker-compose', 'GitHub Actions', 'Deploy to Railway'] },
          { week: 4, topic: 'Performance & SEO', activities: ['Lighthouse audit', 'Code splitting', 'OG tags'] },
        ],
        capstone: 'Dockerised full-stack app with auth, tests, and CI/CD deploy',
      },
      {
        month: 4,
        title: 'System Design & Career',
        theme: 'Scalable architecture and job-ready portfolio',
        weeks: [
          { week: 1, topic: 'System Design', activities: ['DB design', 'Caching strategies', 'API versioning'] },
          { week: 2, topic: 'Real-time Features', activities: ['WebSockets', 'Optimistic UI', 'Rate limiting'] },
          { week: 3, topic: 'Portfolio & Career Materials', activities: ['3 polished projects', 'README best practices', 'LinkedIn'] },
          { week: 4, topic: 'Mock Interviews', activities: ['Coding rounds', 'System design mock', 'Behavioural'] },
        ],
        capstone: 'Capstone: production full-stack SaaS product with real users',
      },
    ],
  },
]

/** Look up syllabus by role key. Returns null if not found. */
export function getSyllabusByRoleKey(roleKey: string): RoleSyllabus | null {
  return syllabusConfig.find((s) => s.roleKey === roleKey) ?? null
}

/** Default syllabus shown when no role is selected (generic / overview). */
export const defaultSyllabus: RoleSyllabus = {
  roleKey: 'general',
  roleLabel: 'General Track',
  months: [
    sharedMonth1,
    {
      month: 2,
      title: 'Core Skills',
      theme: 'Deepen fundamentals relevant to your chosen track',
      weeks: [
        { week: 1, topic: 'Role-specific tooling', activities: ['Setup', 'First exercises', 'Quick win project'] },
        { week: 2, topic: 'Applied Practice', activities: ['Guided problems', 'Peer review', 'Self-assessment'] },
        { week: 3, topic: 'Real-world Scenario', activities: ['Industry dataset or codebase', 'Pair programming', 'Retrospective'] },
        { week: 4, topic: 'Mini Capstone', activities: ['Deliverable', 'Code review', 'Reflection'] },
      ],
      capstone: 'Complete a role-relevant mini project and document your findings',
    },
    {
      month: 3,
      title: 'Production Practices',
      theme: 'Quality, testing, and deployment',
      weeks: [
        { week: 1, topic: 'Testing & Quality', activities: ['Unit tests', 'Integration tests', 'Code coverage'] },
        { week: 2, topic: 'Deployment Basics', activities: ['CI/CD pipeline', 'Environment management', 'Rollback strategy'] },
        { week: 3, topic: 'Collaboration', activities: ['Code review workflow', 'Documentation', 'Git branching'] },
        { week: 4, topic: 'Project Polish', activities: ['Refactor & optimise', 'README', 'Demo recording'] },
      ],
      capstone: 'Deploy a tested, documented, production-grade version of your project',
    },
    {
      month: 4,
      title: 'Job Readiness',
      theme: 'Portfolio and interview prep',
      weeks: [
        { week: 1, topic: 'Portfolio Building', activities: ['3 showcased projects', 'GitHub profile cleanup', 'Netlify/Vercel deploy'] },
        { week: 2, topic: 'LinkedIn & Career Materials', activities: ['Bullet-point impact statements', 'Keyword research', 'Endorsements'] },
        { week: 3, topic: 'Interview Practice', activities: ['Technical screen prep', 'Live coding drills', 'Behavioural STAR framework'] },
        { week: 4, topic: 'Mock Interview Day', activities: ['Full mock session', 'Feedback incorporation', 'Offer negotiation basics'] },
      ],
      capstone: 'Capstone: deliver polished portfolio and pass a full mock interview loop',
    },
  ],
}
