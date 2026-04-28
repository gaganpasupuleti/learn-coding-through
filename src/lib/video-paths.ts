export type VideoEntry = {
  id: string
  title: string
  desc: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  channel: string
}

export type LearningPath = {
  label: string
  emoji: string
  color: string   // Tailwind bg class for accent
  videos: VideoEntry[]
}

// ── TEST MODE: single video to verify embed works ─────────────────────────────
// Once confirmed working, replace with the full LEARNING_PATHS below.
export const LEARNING_PATHS: Record<string, LearningPath> = {
  python_backend: {
    label: 'Python Backend',
    emoji: '🐍',
    color: 'bg-emerald-600',
    videos: [
      {
        id: 'YMP5itrPBk4',
        title: 'The Fundamentals of Python',
        desc: 'Variables, functions, OOP — the complete Python foundation for backend development',
        level: 'Beginner',
        channel: 'Pasupuleti Gagan',
      },
    ],
  },
}

/*
// ── FULL PATHS (restore once test video confirmed working) ───────────────────
export const LEARNING_PATHS_FULL: Record<string, LearningPath> = {
  data_analyst: {
    label: 'Data Analyst', emoji: '📊', color: 'bg-blue-600',
    videos: [
      { id: 'HXV3zeQKqGY', title: 'SQL Full Course', desc: 'SELECT, JOINs, GROUP BY, subqueries — complete beginner to advanced', level: 'Beginner', channel: 'freeCodeCamp' },
      { id: 'r-uOLxNrNk8', title: 'Data Analysis with Python', desc: 'Numpy, Pandas, Matplotlib, Seaborn — complete data analysis for beginners', level: 'Beginner', channel: 'freeCodeCamp' },
      { id: 'xxpc-HPKN28', title: 'Statistics for Data Science', desc: 'Distributions, hypothesis testing, p-values and statistical thinking', level: 'Intermediate', channel: 'StatQuest' },
      { id: 'TmhQCQr_cAo', title: 'Power BI Full Tutorial', desc: 'Connect data sources, build dashboards, DAX basics and sharing reports', level: 'Intermediate', channel: 'Kevin Stratvert' },
    ],
  },
  python_backend: {
    label: 'Python Backend', emoji: '🐍', color: 'bg-emerald-600',
    videos: [
      { id: 'YMP5itrPBk4', title: 'The Fundamentals of Python', desc: 'Variables to OOP — the complete foundation for backend development', level: 'Beginner', channel: 'Pasupuleti Gagan' },
      { id: '0sOvCWFmrtA', title: 'FastAPI Full Course', desc: 'Build production APIs with path params, Pydantic, auth and OpenAPI docs', level: 'Intermediate', channel: 'freeCodeCamp' },
      { id: 'qw--VYLpxG4', title: 'PostgreSQL for Beginners', desc: 'Schemas, relationships, indexing, transactions and real SQL queries', level: 'Beginner', channel: 'freeCodeCamp' },
      { id: '3c-iBn73dDE', title: 'Docker Full Course', desc: 'Containers, Dockerfiles, volumes, networks and docker-compose', level: 'Intermediate', channel: 'TechWorld with Nana' },
    ],
  },
  data_engineer: {
    label: 'Data Engineer', emoji: '⚙️', color: 'bg-violet-600',
    videos: [
      { id: 'S2MUhGA3lEw', title: 'Apache Spark Tutorial', desc: 'Distributed data processing, RDDs, DataFrames and Spark SQL', level: 'Intermediate', channel: 'Simplilearn' },
      { id: 'B5j3uNBH8X4', title: 'Apache Kafka Full Course', desc: 'Event streaming, producers, consumers, topics and real-time pipelines', level: 'Intermediate', channel: 'freeCodeCamp' },
      { id: '5rNquRnNb4E', title: 'dbt Crash Course', desc: 'Transform data in your warehouse with SQL, tests and documentation', level: 'Intermediate', channel: 'freeCodeCamp' },
      { id: 'K9AnJ9_ZAXE', title: 'Apache Airflow Tutorial', desc: 'Build, schedule and monitor data pipelines with DAGs', level: 'Advanced', channel: 'coder2j' },
    ],
  },
  ml_engineer: {
    label: 'ML Engineer', emoji: '🤖', color: 'bg-rose-600',
    videos: [
      { id: 'i_LwzRVP7bg', title: 'Machine Learning with Python', desc: 'Regression, classification, clustering and scikit-learn from scratch', level: 'Beginner', channel: 'freeCodeCamp' },
      { id: 'V_xro1ggaQo', title: 'PyTorch for Deep Learning', desc: 'Tensors, neural networks, CNNs and model training full course', level: 'Intermediate', channel: 'freeCodeCamp' },
      { id: 'MqI8vt3-cag', title: 'MLflow Tutorial', desc: 'Track experiments, package models and deploy ML pipelines', level: 'Intermediate', channel: 'DataTalksClub' },
      { id: 'B2q5cRJvqI8', title: 'NLP with Deep Learning', desc: 'Natural language processing with TensorFlow — text classification, sequences and transformers', level: 'Advanced', channel: 'freeCodeCamp' },
    ],
  },
  fullstack: {
    label: 'Full Stack', emoji: '🌐', color: 'bg-sky-600',
    videos: [
      { id: 'bMknfKXIFA8', title: 'React Full Course', desc: 'Components, hooks, state, context and building a complete React app', level: 'Beginner', channel: 'freeCodeCamp' },
      { id: 'Oe421EPjeBE', title: 'Node.js & Express Full Course', desc: 'REST APIs, middleware, authentication and PostgreSQL with Node', level: 'Intermediate', channel: 'freeCodeCamp' },
      { id: 'SpwzRDUQ1GI', title: 'TypeScript Full Course', desc: 'Types, interfaces, generics, decorators — write safer JavaScript', level: 'Intermediate', channel: 'freeCodeCamp' },
      { id: 'ZVnjOPwW4ZA', title: 'Next.js Full Course', desc: 'App router, server components, data fetching, deployment and full stack patterns', level: 'Advanced', channel: 'Programming with Mosh' },
    ],
  },
  devops: {
    label: 'DevOps', emoji: '🚀', color: 'bg-amber-600',
    videos: [
      { id: 'pg19Z8LL06w', title: 'Docker & Kubernetes Full Course', desc: 'From containers to orchestration — full practical course', level: 'Intermediate', channel: 'TechWorld with Nana' },
      { id: 'd6WC5n9G_sM', title: 'Kubernetes Full Course', desc: 'Pods, services, deployments, ingress and Helm in one complete course', level: 'Intermediate', channel: 'freeCodeCamp' },
      { id: 'R8_veQiYBjI', title: 'GitHub Actions CI/CD', desc: 'Automate builds, tests and deployments with GitHub Actions workflows', level: 'Intermediate', channel: 'TechWorld with Nana' },
      { id: 'l5k1ai6LLOW', title: 'Terraform Full Course', desc: 'Infrastructure as code, providers, modules and state management', level: 'Beginner', channel: 'freeCodeCamp' },
    ],
  },
}
*/
