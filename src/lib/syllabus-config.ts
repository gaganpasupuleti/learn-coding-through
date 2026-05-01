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
        theme: 'Case studies, resume, and mock interviews',
        weeks: [
          { week: 1, topic: 'Case Study Practice', activities: ['Business problem → data approach', 'Present findings', 'Q&A prep'] },
          { week: 2, topic: 'Portfolio Projects', activities: ['GitHub README', 'Project write-up', 'Kaggle notebook'] },
          { week: 3, topic: 'Resume & LinkedIn', activities: ['Keyword optimisation', 'Quantifying impact', 'LinkedIn audit'] },
          { week: 4, topic: 'Mock Interviews', activities: ['SQL rounds', 'Analytics take-home', 'Behavioural prep'] },
        ],
        capstone: 'Capstone: end-to-end analytics project with presentation',
      },
    ],
  },

  {
    roleKey: 'python-backend-developer',
    roleLabel: 'Backend Developer',
    months: [
      {
        month: 1,
        title: 'Internet, OS & Basics',
        theme: 'How the internet works, OS concepts, programming language, and Git',
        weeks: [
          { week: 1, topic: 'Internet', activities: ['HTTP/HTTPS', 'DNS', 'Browsers & Domain Names'] },
          { week: 2, topic: 'OS & General Knowledge', activities: ['Terminal Usage', 'Process & Memory Management', 'Networking Basics'] },
          { week: 3, topic: 'Pick a Language', activities: ['Language Basics', 'Data Structures', 'Control Flow'] },
          { week: 4, topic: 'Version Control Systems', activities: ['Git Basics', 'Branching', 'GitHub / GitLab'] },
        ],
        capstone: 'Build a simple CLI tool managing tasks using Git',
      },
      {
        month: 2,
        title: 'Databases & APIs',
        theme: 'Relational, NoSQL databases, and API communication',
        weeks: [
          { week: 1, topic: 'Relational Databases', activities: ['PostgreSQL / MySQL', 'ACID & Transactions', 'Normalization'] },
          { week: 2, topic: 'NoSQL Databases', activities: ['Document DBs (MongoDB)', 'Key-Value (Redis)', 'Graph DBs'] },
          { week: 3, topic: 'APIs & Communication I', activities: ['REST & JSON APIs', 'Authentication (JWT, OAuth)', 'Basic Auth'] },
          { week: 4, topic: 'APIs & Communication II', activities: ['GraphQL / gRPC', 'WebSockets / SSE', 'Webhooks'] },
        ],
        capstone: 'Build a REST API interacting with both SQL and NoSQL databases',
      },
      {
        month: 3,
        title: 'Security, Testing & CI/CD',
        theme: 'Securing apps, writing tests, and deployment pipelines',
        weeks: [
          { week: 1, topic: 'Web Security', activities: ['Hashing (bcrypt)', 'SSL/TLS & CORS', 'OWASP Top 10'] },
          { week: 2, topic: 'Testing', activities: ['Unit Testing', 'Integration Testing', 'Functional Testing'] },
          { week: 3, topic: 'CI/CD Tools', activities: ['GitHub Actions', 'Jenkins / GitLab CI', 'Automated Testing'] },
          { week: 4, topic: 'Virtualization', activities: ['Docker Basics', 'docker-compose', 'Kubernetes intro'] },
        ],
        capstone: 'Containerize and deploy a secure API with a CI/CD pipeline',
      },
      {
        month: 4,
        title: 'Architecture & Scaling',
        theme: 'System design, scalability, and advanced patterns',
        weeks: [
          { week: 1, topic: 'Architectural Patterns', activities: ['Monolithic vs Microservices', 'Serverless', 'Twelve-Factor Apps'] },
          { week: 2, topic: 'Scalability & Load Balancing', activities: ['Sharding & Replication', 'Load Balancers', 'Message Brokers (Kafka/RabbitMQ)'] },
          { week: 3, topic: 'Search Engines & Observability', activities: ['Elasticsearch', 'Monitoring', 'Telemetry'] },
          { week: 4, topic: 'Interview & Portfolio', activities: ['System Design Mock', 'Resume Review', 'Portfolio Polish'] },
        ],
        capstone: 'Design and present a highly scalable system architecture',
      },
    ],
  },

  {
    roleKey: 'data-engineer',
    roleLabel: 'Data Engineer',
    months: [
      sharedMonth1,
      {
        month: 2,
        title: 'Data Pipelines',
        theme: 'ETL, SQL at scale, and data warehousing',
        weeks: [
          { week: 1, topic: 'Advanced SQL', activities: ['Window functions', 'CTEs', 'Query optimisation'] },
          { week: 2, topic: 'ETL Fundamentals', activities: ['Extract-transform-load', 'Data quality checks', 'Lineage'] },
          { week: 3, topic: 'Data Warehouse Design', activities: ['Star schema', 'Slowly changing dims', 'Partitioning'] },
          { week: 4, topic: 'Apache Airflow', activities: ['DAG authoring', 'Operators & sensors', 'Backfills'] },
        ],
        capstone: 'Build an Airflow DAG that ingests, transforms, and loads data',
      },
      {
        month: 3,
        title: 'Big Data & Streaming',
        theme: 'Spark, Kafka, and cloud storage',
        weeks: [
          { week: 1, topic: 'PySpark Basics', activities: ['RDDs & DataFrames', 'Transformations', 'Joins at scale'] },
          { week: 2, topic: 'Streaming with Kafka', activities: ['Producers & consumers', 'Topics & partitions', 'Stream processing'] },
          { week: 3, topic: 'Cloud Data Platforms', activities: ['S3 / GCS', 'BigQuery / Redshift', 'dbt intro'] },
          { week: 4, topic: 'Data Quality & Observability', activities: ['Great Expectations', 'Data contracts', 'Alerting'] },
        ],
        capstone: 'Real-time streaming pipeline from Kafka through Spark to warehouse',
      },
      {
        month: 4,
        title: 'MLOps & Career',
        theme: 'Feature stores, data mesh concepts, and job prep',
        weeks: [
          { week: 1, topic: 'Feature Engineering for ML', activities: ['Feature stores', 'Point-in-time joins', 'Data versioning'] },
          { week: 2, topic: 'Infrastructure as Code', activities: ['Terraform basics', 'Cloud networking', 'Cost management'] },
          { week: 3, topic: 'Portfolio & Resume', activities: ['Showcase pipeline project', 'Data portfolio site', 'LinkedIn'] },
          { week: 4, topic: 'Mock Interviews', activities: ['SQL & Spark rounds', 'System design', 'Behavioural'] },
        ],
        capstone: 'Capstone: end-to-end data platform on cloud with IaC',
      },
    ],
  },

  {
    roleKey: 'ml-engineer',
    roleLabel: 'ML Engineer',
    months: [
      sharedMonth1,
      {
        month: 2,
        title: 'ML Fundamentals',
        theme: 'Supervised & unsupervised learning with scikit-learn',
        weeks: [
          { week: 1, topic: 'ML Concepts & Workflow', activities: ['Train/test split', 'Bias-variance', 'Metrics'] },
          { week: 2, topic: 'Supervised Learning', activities: ['Linear & logistic regression', 'Decision trees', 'Random forests'] },
          { week: 3, topic: 'Unsupervised Learning', activities: ['K-means', 'PCA', 'DBSCAN'] },
          { week: 4, topic: 'Feature Engineering', activities: ['Encoding', 'Scaling', 'Feature selection'] },
        ],
        capstone: 'Train and evaluate an end-to-end ML pipeline on a Kaggle dataset',
      },
      {
        month: 3,
        title: 'Deep Learning & MLOps',
        theme: 'Neural networks, MLflow, and model deployment',
        weeks: [
          { week: 1, topic: 'Neural Network Basics', activities: ['Perceptron', 'Backprop', 'PyTorch/TensorFlow intro'] },
          { week: 2, topic: 'CNNs & Transfer Learning', activities: ['Image classification', 'ResNet fine-tuning', 'Data augmentation'] },
          { week: 3, topic: 'MLflow & Experiment Tracking', activities: ['Run tracking', 'Model registry', 'Artifact logging'] },
          { week: 4, topic: 'Model Serving', activities: ['FastAPI inference endpoint', 'Docker packaging', 'Load testing'] },
        ],
        capstone: 'Deploy a computer vision model as a production REST API',
      },
      {
        month: 4,
        title: 'LLMs & Career',
        theme: 'Prompt engineering, RAG, and interview prep',
        weeks: [
          { week: 1, topic: 'LLM Foundations', activities: ['Transformers', 'Prompt engineering', 'OpenAI / HuggingFace API'] },
          { week: 2, topic: 'RAG & Fine-tuning', activities: ['Vector DBs', 'Retrieval-augmented generation', 'LoRA fine-tune'] },
          { week: 3, topic: 'Portfolio & Resume', activities: ['ML project portfolio', 'Paper summaries', 'GitHub showcase'] },
          { week: 4, topic: 'Mock Interviews', activities: ['ML theory rounds', 'Coding (NumPy/pandas)', 'System design for ML'] },
        ],
        capstone: 'Capstone: LLM-powered app with fine-tuned model and RAG pipeline',
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
          { week: 3, topic: 'Portfolio & Resume', activities: ['3 polished projects', 'README best practices', 'LinkedIn'] },
          { week: 4, topic: 'Mock Interviews', activities: ['Coding rounds', 'System design mock', 'Behavioural'] },
        ],
        capstone: 'Capstone: production full-stack SaaS product with real users',
      },
    ],
  },

  {
    roleKey: 'devops-engineer',
    roleLabel: 'DevOps Engineer',
    months: [
      sharedMonth1,
      {
        month: 2,
        title: 'Containers & CI/CD',
        theme: 'Docker, Kubernetes basics, and automated pipelines',
        weeks: [
          { week: 1, topic: 'Docker Deep Dive', activities: ['Images & layers', 'Networking', 'Volumes'] },
          { week: 2, topic: 'Kubernetes Fundamentals', activities: ['Pods & deployments', 'Services & ingress', 'ConfigMaps'] },
          { week: 3, topic: 'CI/CD Pipelines', activities: ['GitHub Actions', 'Build → test → deploy', 'Secrets management'] },
          { week: 4, topic: 'Helm & Kustomize', activities: ['Helm charts', 'Environments & values', 'GitOps intro'] },
        ],
        capstone: 'Deploy a multi-service app on Kubernetes with a full CI/CD pipeline',
      },
      {
        month: 3,
        title: 'Cloud & IaC',
        theme: 'AWS/GCP, Terraform, monitoring',
        weeks: [
          { week: 1, topic: 'Cloud Fundamentals', activities: ['EC2/GCE', 'S3/GCS', 'IAM & networking'] },
          { week: 2, topic: 'Terraform', activities: ['HCL basics', 'Modules', 'State management'] },
          { week: 3, topic: 'Observability', activities: ['Prometheus + Grafana', 'Log aggregation', 'Alerting rules'] },
          { week: 4, topic: 'Security & Compliance', activities: ['RBAC', 'Secret scanning', 'CIS benchmarks'] },
        ],
        capstone: 'Provision a cloud environment with Terraform and wire up observability',
      },
      {
        month: 4,
        title: 'SRE & Career',
        theme: 'Reliability, on-call, and job interviews',
        weeks: [
          { week: 1, topic: 'SRE Principles', activities: ['SLIs/SLOs/SLAs', 'Error budgets', 'Incident management'] },
          { week: 2, topic: 'Chaos Engineering', activities: ['Failure injection', 'Game days', 'Post-mortems'] },
          { week: 3, topic: 'Portfolio & Resume', activities: ['IaC portfolio', 'Blog post', 'Certifications plan'] },
          { week: 4, topic: 'Mock Interviews', activities: ['Linux & scripting rounds', 'System design', 'Incident scenario'] },
        ],
        capstone: 'Capstone: zero-downtime production deploy with full observability stack',
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
      theme: 'Portfolio, resume, and interview prep',
      weeks: [
        { week: 1, topic: 'Portfolio Building', activities: ['3 showcased projects', 'GitHub profile cleanup', 'Netlify/Vercel deploy'] },
        { week: 2, topic: 'Resume & LinkedIn', activities: ['Bullet-point impact statements', 'Keyword research', 'Endorsements'] },
        { week: 3, topic: 'Interview Practice', activities: ['Technical screen prep', 'Live coding drills', 'Behavioural STAR framework'] },
        { week: 4, topic: 'Mock Interview Day', activities: ['Full mock session', 'Feedback incorporation', 'Offer negotiation basics'] },
      ],
      capstone: 'Capstone: deliver polished portfolio and pass a full mock interview loop',
    },
  ],
}
