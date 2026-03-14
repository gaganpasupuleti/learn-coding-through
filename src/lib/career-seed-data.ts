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
      { id: 'da-m1-w1-1', month: 1, week: 1, title: 'SQL Fundamentals', description: 'SELECT, WHERE, JOINs, GROUP BY, subqueries and window functions on real datasets', type: 'topic', sortOrder: 1 },
      { id: 'da-m1-w2-1', month: 1, week: 2, title: 'Python for Data Analysis', description: 'Pandas DataFrames, NumPy arrays, data loading and transformation pipelines', type: 'topic', sortOrder: 2 },
      { id: 'da-m1-w3-1', month: 1, week: 3, title: 'Statistics & Probability', description: 'Descriptive stats, distributions, hypothesis testing, correlation vs causation', type: 'topic', sortOrder: 3 },
      { id: 'da-m1-w4-1', month: 1, week: 4, title: 'Exploratory Data Analysis Report', description: 'Produce a complete EDA notebook on a public dataset with visualizations and summary', type: 'deliverable', sortOrder: 4 },

      { id: 'da-m2-w1-1', month: 2, week: 1, title: 'Data Visualization with Matplotlib & Seaborn', description: 'Charts, heatmaps, box plots and storytelling through visuals', type: 'topic', sortOrder: 5 },
      { id: 'da-m2-w2-1', month: 2, week: 2, title: 'Power BI Essentials', description: 'Connecting data sources, DAX basics, building interactive reports and sharing dashboards', type: 'topic', sortOrder: 6 },
      { id: 'da-m2-w3-1', month: 2, week: 3, title: 'Advanced SQL (CTEs & Stored Procedures)', description: 'Window functions, recursive CTEs, performance tuning and indexing', type: 'milestone', sortOrder: 7 },
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

  /* ──────────────── Python Backend Developer ──────────────── */
  {
    id: 'python-backend-developer',
    title: 'Python Backend Developer',
    slug: 'python-backend-developer',
    description: 'Build robust REST APIs and backend services with Python and FastAPI. Master databases, authentication, testing, and deploy production-grade applications to the cloud.',
    domain: 'Web',
    difficulty: 'Intermediate',
    salaryRangeMin: 70000,
    salaryRangeMax: 140000,
    demandLevel: 'High',
    icon: 'Code',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'REST APIs', 'Testing'],
    sortOrder: 2,
    isActive: true,
    syllabus: [
      { id: 'pbd-m1-w1-1', month: 1, week: 1, title: 'Python Fundamentals & OOP', description: 'Advanced Python: decorators, generators, context managers, dataclasses and type hints', type: 'topic', sortOrder: 1 },
      { id: 'pbd-m1-w2-1', month: 1, week: 2, title: 'Data Structures & Algorithms', description: 'Big-O analysis, lists, dicts, heaps, graphs — interview-level problem solving in Python', type: 'topic', sortOrder: 2 },
      { id: 'pbd-m1-w3-1', month: 1, week: 3, title: 'File I/O, Concurrency & Async', description: 'asyncio, aiohttp, threading vs multiprocessing, file and network I/O', type: 'topic', sortOrder: 3 },
      { id: 'pbd-m1-w4-1', month: 1, week: 4, title: 'CLI Task Manager', description: 'Build a feature-rich command-line task manager with JSON persistence and async operations', type: 'deliverable', sortOrder: 4 },

      { id: 'pbd-m2-w1-1', month: 2, week: 1, title: 'FastAPI Fundamentals', description: 'Routing, path/query params, Pydantic validation, dependency injection and OpenAPI docs', type: 'topic', sortOrder: 5 },
      { id: 'pbd-m2-w2-1', month: 2, week: 2, title: 'PostgreSQL & SQLAlchemy ORM', description: 'Schemas, relationships, migrations with Alembic, query optimisation and indexes', type: 'topic', sortOrder: 6 },
      { id: 'pbd-m2-w3-1', month: 2, week: 3, title: 'REST API Design Principles', description: 'Resource naming, versioning, status codes, pagination and HATEOAS', type: 'milestone', sortOrder: 7 },
      { id: 'pbd-m2-w4-1', month: 2, week: 4, title: 'CRUD REST API', description: 'Production-quality FastAPI + PostgreSQL CRUD API with Pydantic schemas and Alembic migrations', type: 'deliverable', sortOrder: 8 },

      { id: 'pbd-m3-w1-1', month: 3, week: 1, title: 'Authentication & Authorisation', description: 'JWT tokens, OAuth2 flow, hashed passwords, role-based access control (RBAC)', type: 'topic', sortOrder: 9 },
      { id: 'pbd-m3-w2-1', month: 3, week: 2, title: 'Testing (pytest)', description: 'Unit tests, integration tests, fixtures, mocking, test coverage and CI integration', type: 'topic', sortOrder: 10 },
      { id: 'pbd-m3-w3-1', month: 3, week: 3, title: 'Docker & Containerisation', description: 'Dockerfile best practices, multi-stage builds, docker-compose for local dev stacks', type: 'topic', sortOrder: 11 },
      { id: 'pbd-m3-w4-1', month: 3, week: 4, title: 'Authenticated Multi-tenant Service', description: 'API with JWT auth, role guards, full test suite and Docker deployment', type: 'deliverable', sortOrder: 12 },

      { id: 'pbd-m4-w1-1', month: 4, week: 1, title: 'Cloud Deployment (Railway / Render / AWS)', description: 'Environment configuration, secrets management, health checks and zero-downtime deploys', type: 'topic', sortOrder: 13 },
      { id: 'pbd-m4-w2-1', month: 4, week: 2, title: 'Performance & Caching', description: 'Redis caching, N+1 query fixes, connection pooling, load testing with Locust', type: 'topic', sortOrder: 14 },
      { id: 'pbd-m4-w3-1', month: 4, week: 3, title: 'System Design Fundamentals', description: 'CAP theorem, load balancing, message queues, microservices vs monolith', type: 'milestone', sortOrder: 15 },
      { id: 'pbd-m4-w4-1', month: 4, week: 4, title: 'Capstone: Production SaaS API', description: 'Full-featured multi-tenant REST API with auth, caching, tests, CI/CD and cloud deployment', type: 'deliverable', sortOrder: 16 },
    ],
  },

  /* ──────────────── Data Engineer ──────────────── */
  {
    id: 'data-engineer',
    title: 'Data Engineer',
    slug: 'data-engineer',
    description: 'Design and build the data infrastructure that powers analytics and ML. Master ETL pipelines, cloud data warehouses, streaming systems, and orchestration with Airflow.',
    domain: 'Data',
    difficulty: 'Intermediate',
    salaryRangeMin: 85000,
    salaryRangeMax: 165000,
    demandLevel: 'High',
    icon: 'Database',
    skills: ['SQL', 'Python', 'Spark', 'Airflow', 'Data Warehousing'],
    sortOrder: 3,
    isActive: true,
    syllabus: [
      { id: 'de-m1-w1-1', month: 1, week: 1, title: 'Advanced SQL & Data Modelling', description: 'Star schema, snowflake schema, slowly changing dimensions, query optimisation', type: 'topic', sortOrder: 1 },
      { id: 'de-m1-w2-1', month: 1, week: 2, title: 'Python Data Pipelines', description: 'Pandas, file formats (Parquet, Avro, ORC), chunked processing, data profiling', type: 'topic', sortOrder: 2 },
      { id: 'de-m1-w3-1', month: 1, week: 3, title: 'Linux & Shell Scripting', description: 'Bash for automation, cron jobs, file system operations, environment management', type: 'topic', sortOrder: 3 },
      { id: 'de-m1-w4-1', month: 1, week: 4, title: 'Batch ETL Pipeline', description: 'Extract from CSV/API, transform with Pandas, load into PostgreSQL with validation checks', type: 'deliverable', sortOrder: 4 },

      { id: 'de-m2-w1-1', month: 2, week: 1, title: 'Apache Spark Fundamentals', description: 'RDDs vs DataFrames, transformations/actions, Spark SQL, join optimisation', type: 'topic', sortOrder: 5 },
      { id: 'de-m2-w2-1', month: 2, week: 2, title: 'Cloud Storage & Data Lakes', description: 'S3/GCS object storage, Delta Lake, data lake architecture, partitioning strategies', type: 'topic', sortOrder: 6 },
      { id: 'de-m2-w3-1', month: 2, week: 3, title: 'Data Warehouse Design', description: 'Snowflake / BigQuery architecture, clustering, materialized views, cost optimisation', type: 'milestone', sortOrder: 7 },
      { id: 'de-m2-w4-1', month: 2, week: 4, title: 'Spark Data Warehouse Pipeline', description: 'Ingest raw data → process with Spark → load into cloud data warehouse with dimensional model', type: 'deliverable', sortOrder: 8 },

      { id: 'de-m3-w1-1', month: 3, week: 1, title: 'Apache Airflow Orchestration', description: 'DAGs, operators, sensors, XCom, dynamic task mapping, monitoring and alerting', type: 'topic', sortOrder: 9 },
      { id: 'de-m3-w2-1', month: 3, week: 2, title: 'Streaming with Apache Kafka', description: 'Producers/consumers, topics, partitions, Kafka Streams vs Flink intro', type: 'topic', sortOrder: 10 },
      { id: 'de-m3-w3-1', month: 3, week: 3, title: 'Data Quality & Testing', description: 'Great Expectations, dbt tests, data contracts, schema evolution and SLAs', type: 'topic', sortOrder: 11 },
      { id: 'de-m3-w4-1', month: 3, week: 4, title: 'Orchestrated Streaming Pipeline', description: 'Kafka → Spark Streaming → Airflow orchestration → data quality tests', type: 'deliverable', sortOrder: 12 },

      { id: 'de-m4-w1-1', month: 4, week: 1, title: 'dbt (data build tool)', description: 'Models, tests, snapshots, macros and documentation. Modern analytics engineering workflow', type: 'topic', sortOrder: 13 },
      { id: 'de-m4-w2-1', month: 4, week: 2, title: 'Infrastructure as Code (Terraform)', description: 'Terraform basics, provisioning cloud data infrastructure, state management', type: 'topic', sortOrder: 14 },
      { id: 'de-m4-w3-1', month: 4, week: 3, title: 'Observability & Data Platform Architecture', description: 'Metadata management, data lineage, cost monitoring, architecture patterns', type: 'milestone', sortOrder: 15 },
      { id: 'de-m4-w4-1', month: 4, week: 4, title: 'Capstone: Full Data Platform', description: 'End-to-end: ingestion → lake → warehouse → dbt transforms → Airflow orchestration → dashboards', type: 'deliverable', sortOrder: 16 },
    ],
  },

  /* ──────────────── ML Engineer ──────────────── */
  {
    id: 'ml-engineer',
    title: 'ML Engineer',
    slug: 'ml-engineer',
    description: 'Build and deploy machine learning systems at scale. From model training to production serving, master MLOps, feature engineering, and advanced deep learning architectures.',
    domain: 'AI',
    difficulty: 'Advanced',
    salaryRangeMin: 95000,
    salaryRangeMax: 190000,
    demandLevel: 'Growing',
    icon: 'Brain',
    skills: ['Python', 'Machine Learning', 'MLOps', 'TensorFlow', 'Feature Engineering'],
    sortOrder: 4,
    isActive: true,
    syllabus: [
      { id: 'mle-m1-w1-1', month: 1, week: 1, title: 'Math for ML (Linear Algebra & Calculus)', description: 'Vectors, matrices, eigenvalues, gradients, backpropagation from scratch', type: 'topic', sortOrder: 1 },
      { id: 'mle-m1-w2-1', month: 1, week: 2, title: 'ML Fundamentals with scikit-learn', description: 'Supervised/unsupervised learning, train/test splits, cross-validation, bias-variance', type: 'topic', sortOrder: 2 },
      { id: 'mle-m1-w3-1', month: 1, week: 3, title: 'Feature Engineering & Selection', description: 'Encoding, scaling, imputation, feature importance, dimensionality reduction (PCA)', type: 'topic', sortOrder: 3 },
      { id: 'mle-m1-w4-1', month: 1, week: 4, title: 'Regression & Classification Models', description: 'Predict real estate prices and customer churn with fully documented models', type: 'deliverable', sortOrder: 4 },

      { id: 'mle-m2-w1-1', month: 2, week: 1, title: 'Deep Learning with TensorFlow/Keras', description: 'Neural network architecture, activation functions, regularisation, transfer learning', type: 'topic', sortOrder: 5 },
      { id: 'mle-m2-w2-1', month: 2, week: 2, title: 'Computer Vision (CNNs)', description: 'ResNet, EfficientNet, object detection (YOLO), image augmentation pipelines', type: 'topic', sortOrder: 6 },
      { id: 'mle-m2-w3-1', month: 2, week: 3, title: 'NLP & Transformers', description: 'Text preprocessing, BERT fine-tuning, HuggingFace Transformers, embeddings', type: 'milestone', sortOrder: 7 },
      { id: 'mle-m2-w4-1', month: 2, week: 4, title: 'Image Classifier', description: 'Train a CNN classifier on a custom dataset, evaluate with confusion matrix and deploy locally', type: 'deliverable', sortOrder: 8 },

      { id: 'mle-m3-w1-1', month: 3, week: 1, title: 'MLOps: Tracking & Versioning', description: 'MLflow experiment tracking, DVC for data versioning, model registry best practices', type: 'topic', sortOrder: 9 },
      { id: 'mle-m3-w2-1', month: 3, week: 2, title: 'Model Deployment (FastAPI + Docker)', description: 'Build a prediction API, Dockerise it, health checks, batch vs real-time inference', type: 'topic', sortOrder: 10 },
      { id: 'mle-m3-w3-1', month: 3, week: 3, title: 'CI/CD for ML Pipelines', description: 'GitHub Actions for model retraining, automated testing, drift detection, A/B serving', type: 'topic', sortOrder: 11 },
      { id: 'mle-m3-w4-1', month: 3, week: 4, title: 'Deployed ML API', description: 'Trained model → FastAPI service → Docker → MLflow tracking → automated retrain trigger', type: 'deliverable', sortOrder: 12 },

      { id: 'mle-m4-w1-1', month: 4, week: 1, title: 'Advanced Deep Learning (GANs, RL)', description: 'Generative adversarial networks, reinforcement learning basics with OpenAI Gym', type: 'topic', sortOrder: 13 },
      { id: 'mle-m4-w2-1', month: 4, week: 2, title: 'LLMs & Prompt Engineering', description: 'Fine-tuning LLMs, RAG systems, LangChain, vector databases (Chroma, Pinecone)', type: 'topic', sortOrder: 14 },
      { id: 'mle-m4-w3-1', month: 4, week: 3, title: 'Production ML System Design', description: 'Feature stores, model monitoring, shadow deployments, SLA guarantees', type: 'milestone', sortOrder: 15 },
      { id: 'mle-m4-w4-1', month: 4, week: 4, title: 'Capstone: End-to-End ML System', description: 'Training pipeline → model registry → serving API → monitoring → automated retraining in production', type: 'deliverable', sortOrder: 16 },
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
    sortOrder: 5,
    isActive: true,
    syllabus: [
      { id: 'fsd-m1-w1-1', month: 1, week: 1, title: 'React Fundamentals & Hooks', description: 'Components, JSX, useState, useEffect, useContext, custom hooks, React DevTools', type: 'topic', sortOrder: 1 },
      { id: 'fsd-m1-w2-1', month: 1, week: 2, title: 'TypeScript Deep Dive', description: 'Generics, utility types, discriminated unions, type guards, module augmentation', type: 'topic', sortOrder: 2 },
      { id: 'fsd-m1-w3-1', month: 1, week: 3, title: 'State Management (Zustand / React Query)', description: 'Global state patterns, server state caching, optimistic updates, real-time sync', type: 'topic', sortOrder: 3 },
      { id: 'fsd-m1-w4-1', month: 1, week: 4, title: 'Interactive UI Application', description: 'React + TypeScript app with state management, routing and TailwindCSS design system', type: 'deliverable', sortOrder: 4 },

      { id: 'fsd-m2-w1-1', month: 2, week: 1, title: 'Node.js & Express/Fastify', description: 'Event loop, streams, middleware patterns, REST API design, error handling', type: 'topic', sortOrder: 5 },
      { id: 'fsd-m2-w2-1', month: 2, week: 2, title: 'Databases: SQL & NoSQL', description: 'PostgreSQL with Prisma/Drizzle ORM, Redis for caching, MongoDB for document store', type: 'topic', sortOrder: 6 },
      { id: 'fsd-m2-w3-1', month: 2, week: 3, title: 'REST API Design & GraphQL Intro', description: 'Versioning, pagination, filtering, GraphQL resolvers and Apollo Server', type: 'milestone', sortOrder: 7 },
      { id: 'fsd-m2-w4-1', month: 2, week: 4, title: 'Full Stack CRUD Application', description: 'React frontend + Node.js API + PostgreSQL with full CRUD, validation and error handling', type: 'deliverable', sortOrder: 8 },

      { id: 'fsd-m3-w1-1', month: 3, week: 1, title: 'Authentication & Security', description: 'JWT + refresh tokens, OAuth2 (Google/GitHub), RBAC, rate limiting, OWASP top 10', type: 'topic', sortOrder: 9 },
      { id: 'fsd-m3-w2-1', month: 3, week: 2, title: 'Cloud Deployment & DevOps', description: 'Docker compose, Railway/Render/Vercel deploy, CI/CD with GitHub Actions', type: 'topic', sortOrder: 10 },
      { id: 'fsd-m3-w3-1', month: 3, week: 3, title: 'Testing (Vitest, Playwright, Supertest)', description: 'Unit, component, E2E tests, TDD workflow, test coverage dashboards', type: 'topic', sortOrder: 11 },
      { id: 'fsd-m3-w4-1', month: 3, week: 4, title: 'SaaS MVP', description: 'Multi-tenant SaaS with auth, subscriptions, feature flags, deployed to cloud with CI/CD', type: 'deliverable', sortOrder: 12 },

      { id: 'fsd-m4-w1-1', month: 4, week: 1, title: 'System Design & Scalability', description: 'Load balancing, caching strategies, DB sharding, message queues, CDN', type: 'topic', sortOrder: 13 },
      { id: 'fsd-m4-w2-1', month: 4, week: 2, title: 'Performance Optimisation', description: 'Core Web Vitals, bundle splitting, server-side rendering (Next.js), database query profiling', type: 'topic', sortOrder: 14 },
      { id: 'fsd-m4-w3-1', month: 4, week: 3, title: 'Real-Time Features (WebSockets)', description: 'Socket.io, presence indicators, live updates, collaborative editing patterns', type: 'milestone', sortOrder: 15 },
      { id: 'fsd-m4-w4-1', month: 4, week: 4, title: 'Capstone: Production Application', description: 'Real-time full stack application with auth, DB, WebSockets, deployed, monitored and load-tested', type: 'deliverable', sortOrder: 16 },
    ],
  },

  /* ──────────────── DevOps Engineer ──────────────── */
  {
    id: 'devops-engineer',
    title: 'DevOps Engineer',
    slug: 'devops-engineer',
    description: 'Bridge development and operations. Automate infrastructure, build CI/CD pipelines, orchestrate containers with Kubernetes, and maintain highly available cloud systems.',
    domain: 'DevOps',
    difficulty: 'Advanced',
    salaryRangeMin: 90000,
    salaryRangeMax: 175000,
    demandLevel: 'Medium',
    icon: 'GitBranch',
    skills: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'Cloud'],
    sortOrder: 6,
    isActive: true,
    syllabus: [
      { id: 'dve-m1-w1-1', month: 1, week: 1, title: 'Linux Administration', description: 'File system, permissions, users/groups, processes, networking, systemd services', type: 'topic', sortOrder: 1 },
      { id: 'dve-m1-w2-1', month: 1, week: 2, title: 'Bash Scripting & Automation', description: 'Variables, loops, conditionals, functions, cron jobs, sed/awk text processing', type: 'topic', sortOrder: 2 },
      { id: 'dve-m1-w3-1', month: 1, week: 3, title: 'Git & Version Control Workflows', description: 'Branching strategies (GitFlow, trunk-based), rebasing, hooks, monorepo tools', type: 'topic', sortOrder: 3 },
      { id: 'dve-m1-w4-1', month: 1, week: 4, title: 'Server Automation Scripts', description: 'Bash scripts that provision, configure and monitor a Linux server end-to-end', type: 'deliverable', sortOrder: 4 },

      { id: 'dve-m2-w1-1', month: 2, week: 1, title: 'Docker & Containerisation', description: 'Dockerfile best practices, multi-stage builds, images, volumes, networking', type: 'topic', sortOrder: 5 },
      { id: 'dve-m2-w2-1', month: 2, week: 2, title: 'Docker Compose & Microservices', description: 'Multi-container applications, service discovery, health checks, compose profiles', type: 'topic', sortOrder: 6 },
      { id: 'dve-m2-w3-1', month: 2, week: 3, title: 'CI/CD with GitHub Actions', description: 'Workflows, matrix builds, secrets management, artifact publishing, deployment gates', type: 'milestone', sortOrder: 7 },
      { id: 'dve-m2-w4-1', month: 2, week: 4, title: 'Containerised App with CI/CD', description: 'Dockerised application with full CI/CD pipeline: lint → test → build → push → deploy', type: 'deliverable', sortOrder: 8 },

      { id: 'dve-m3-w1-1', month: 3, week: 1, title: 'Kubernetes Fundamentals', description: 'Pods, deployments, services, ingress, ConfigMaps/Secrets, namespaces and RBAC', type: 'topic', sortOrder: 9 },
      { id: 'dve-m3-w2-1', month: 3, week: 2, title: 'Cloud Platforms (AWS/GCP)', description: 'EC2/GCE, S3/GCS, managed databases (RDS/Cloud SQL), IAM, VPC, auto-scaling groups', type: 'topic', sortOrder: 10 },
      { id: 'dve-m3-w3-1', month: 3, week: 3, title: 'Infrastructure as Code (Terraform)', description: 'HCL syntax, resource graph, modules, state management, remote backends', type: 'topic', sortOrder: 11 },
      { id: 'dve-m3-w4-1', month: 3, week: 4, title: 'Kubernetes Cluster on Cloud', description: 'Provision EKS/GKE with Terraform, deploy a multi-service app with ingress and TLS', type: 'deliverable', sortOrder: 12 },

      { id: 'dve-m4-w1-1', month: 4, week: 1, title: 'Observability (Prometheus & Grafana)', description: 'Metrics instrumentation, alert rules, Loki for logs, distributed tracing with Jaeger', type: 'topic', sortOrder: 13 },
      { id: 'dve-m4-w2-1', month: 4, week: 2, title: 'Security & Compliance', description: 'Secrets management (Vault), image scanning (Trivy), network policies, SAST/DAST', type: 'topic', sortOrder: 14 },
      { id: 'dve-m4-w3-1', month: 4, week: 3, title: 'SRE Practices & Incident Response', description: 'SLOs/SLAs, error budgets, postmortems, on-call runbooks, chaos engineering', type: 'milestone', sortOrder: 15 },
      { id: 'dve-m4-w4-1', month: 4, week: 4, title: 'Capstone: Production Infrastructure', description: 'Full cloud platform: K8s + Terraform + CI/CD + observability stack + security hardening', type: 'deliverable', sortOrder: 16 },
    ],
  },
]
