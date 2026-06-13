import type { TypingCodeLanguage, TypingDifficulty, TypingSample } from '../types/typingPractice.types'

const TEXT_BEGINNER: TypingSample[] = [
  {
    id: 'text-beginner-1',
    title: 'Warm-up paragraph',
    language: 'text',
    difficulty: 'beginner',
    mode: 'text',
    topics: ['warm-up'],
    text: 'Typing practice helps you write code faster with fewer mistakes. Focus on accuracy first, then build speed with steady rhythm.',
  },
  {
    id: 'text-beginner-2',
    title: 'Career note',
    language: 'text',
    difficulty: 'beginner',
    mode: 'text',
    topics: ['career'],
    text: 'Clear communication matters in software teams. Short updates, clean commit messages, and readable documentation save time for everyone.',
  },
]

const TEXT_MID: TypingSample[] = [
  {
    id: 'text-mid-1',
    title: 'Interview follow-up',
    language: 'text',
    difficulty: 'mid',
    mode: 'text',
    topics: ['professional'],
    text: 'Thank you for the interview today. I enjoyed discussing the roadmap and the testing strategy. I am excited about contributing to the platform team and learning from your mentorship program.',
  },
  {
    id: 'text-mid-2',
    title: 'Project retrospective',
    language: 'text',
    difficulty: 'mid',
    mode: 'text',
    topics: ['professional'],
    text: 'Our sprint delivered the dashboard filters and improved load time by eighteen percent. Next sprint we should add integration tests around the export flow and document the API contract changes.',
  },
]

const PYTHON_BEGINNER: TypingSample[] = [
  {
    id: 'py-print',
    title: 'Print greeting',
    language: 'python',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['print'],
    text: 'print("Hello, coder!")',
  },
  {
    id: 'py-variables',
    title: 'Variables',
    language: 'python',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['variables'],
    text: 'name = "Asha"\nscore = 92\nprint(name, score)',
  },
  {
    id: 'py-if-else',
    title: 'If / else',
    language: 'python',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['if-else'],
    text: 'n = 7\nif n % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")',
  },
  {
    id: 'py-for-loop',
    title: 'For loop',
    language: 'python',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['for-loop'],
    text: 'for i in range(1, 4):\n    print(i)',
  },
  {
    id: 'py-function',
    title: 'Function',
    language: 'python',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['function'],
    text: 'def add(a, b):\n    return a + b\n\nprint(add(2, 3))',
  },
  {
    id: 'py-list-loop',
    title: 'List loop',
    language: 'python',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['list-loop'],
    text: 'skills = ["git", "sql", "python"]\nfor skill in skills:\n    print(skill)',
  },
  {
    id: 'py-dict-access',
    title: 'Dictionary access',
    language: 'python',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['dictionary'],
    text: 'student = {"name": "Ravi", "score": 88}\nprint(student["name"])\nprint(student.get("score", 0))',
  },
]

const PYTHON_MID: TypingSample[] = [
  {
    id: 'py-mid-summary',
    title: 'Summarize scores',
    language: 'python',
    difficulty: 'mid',
    mode: 'code',
    topics: ['function', 'list-loop'],
    text: 'def summarize(scores):\n    total = sum(scores)\n    avg = total / len(scores)\n    return {"total": total, "avg": round(avg, 2)}\n\nprint(summarize([80, 90, 95]))',
  },
  {
    id: 'py-mid-filter',
    title: 'Filter completed',
    language: 'python',
    difficulty: 'mid',
    mode: 'code',
    topics: ['list-loop', 'if-else'],
    text: 'projects = [{"name": "api", "done": True}, {"name": "ui", "done": False}]\ndone = [p["name"] for p in projects if p["done"]]\nprint(done)',
  },
]

const JAVASCRIPT_BEGINNER: TypingSample[] = [
  {
    id: 'js-console-log',
    title: 'Console log',
    language: 'javascript',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['console.log'],
    text: 'console.log("Ready to type JavaScript");',
  },
  {
    id: 'js-const-let',
    title: 'Const / let',
    language: 'javascript',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['const-let'],
    text: 'const title = "Typing Practice";\nlet attempts = 0;\nattempts += 1;\nconsole.log(title, attempts);',
  },
  {
    id: 'js-if-else',
    title: 'If / else',
    language: 'javascript',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['if-else'],
    text: 'const score = 74;\nif (score >= 70) {\n  console.log("Pass");\n} else {\n  console.log("Retry");\n}',
  },
  {
    id: 'js-for-loop',
    title: 'For loop',
    language: 'javascript',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['for-loop'],
    text: 'for (let i = 1; i <= 3; i += 1) {\n  console.log(i);\n}',
  },
  {
    id: 'js-function',
    title: 'Function',
    language: 'javascript',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['function'],
    text: 'function greet(name) {\n  return `Hello, ${name}`;\n}\n\nconsole.log(greet("Sam"));',
  },
  {
    id: 'js-array-map-filter',
    title: 'Array map / filter',
    language: 'javascript',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['array-map-filter'],
    text: 'const nums = [1, 2, 3, 4];\nconst doubled = nums.map((n) => n * 2);\nconst evens = nums.filter((n) => n % 2 === 0);\nconsole.log(doubled, evens);',
  },
  {
    id: 'js-object-access',
    title: 'Object access',
    language: 'javascript',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['object-access'],
    text: 'const user = { id: 1, role: "student" };\nconsole.log(user.role);\nconsole.log(user["id"]);',
  },
]

const JAVASCRIPT_MID: TypingSample[] = [
  {
    id: 'js-mid-reduce',
    title: 'Reduce totals',
    language: 'javascript',
    difficulty: 'mid',
    mode: 'code',
    topics: ['array-map-filter', 'function'],
    text: 'export function totalPoints(entries) {\n  return entries.reduce((sum, entry) => sum + entry.points, 0);\n}',
  },
  {
    id: 'js-mid-fetch-shape',
    title: 'Fetch handler shape',
    language: 'javascript',
    difficulty: 'mid',
    mode: 'code',
    topics: ['function', 'if-else'],
    text: 'async function loadProfile(api, userId) {\n  const response = await api.get(`/users/${userId}`);\n  if (!response.ok) throw new Error("Request failed");\n  return response.json();\n}',
  },
]

const JAVA_BEGINNER: TypingSample[] = [
  {
    id: 'java-main-class',
    title: 'Public class Main',
    language: 'java',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['class'],
    text: 'public class Main {\n}',
  },
  {
    id: 'java-main-method',
    title: 'Main method',
    language: 'java',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['main-method'],
    text: 'public class Main {\n    public static void main(String[] args) {\n    }\n}',
  },
  {
    id: 'java-println',
    title: 'System.out.println',
    language: 'java',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['println'],
    text: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello Java");\n    }\n}',
  },
  {
    id: 'java-if-else',
    title: 'If / else',
    language: 'java',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['if-else'],
    text: 'public class Main {\n    public static void main(String[] args) {\n        int n = 5;\n        if (n % 2 == 0) {\n            System.out.println("Even");\n        } else {\n            System.out.println("Odd");\n        }\n    }\n}',
  },
  {
    id: 'java-for-loop',
    title: 'For loop',
    language: 'java',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['for-loop'],
    text: 'public class Main {\n    public static void main(String[] args) {\n        for (int i = 1; i <= 3; i++) {\n            System.out.println(i);\n        }\n    }\n}',
  },
  {
    id: 'java-array-sum',
    title: 'Array sum',
    language: 'java',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['array-sum'],
    text: 'public class Main {\n    public static void main(String[] args) {\n        int[] scores = {80, 90, 85};\n        int total = 0;\n        for (int score : scores) {\n            total += score;\n        }\n        System.out.println(total);\n    }\n}',
  },
  {
    id: 'java-method',
    title: 'Method',
    language: 'java',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['method'],
    text: 'public class Main {\n    static int max(int a, int b) {\n        return a >= b ? a : b;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(max(12, 7));\n    }\n}',
  },
]

const JAVA_MID: TypingSample[] = [
  {
    id: 'java-mid-tracker',
    title: 'Skill tracker',
    language: 'java',
    difficulty: 'mid',
    mode: 'code',
    topics: ['method', 'array-sum'],
    text: 'import java.util.List;\n\npublic class SkillTracker {\n    public static double average(List<Integer> scores) {\n        if (scores.isEmpty()) return 0;\n        int total = 0;\n        for (int score : scores) total += score;\n        return (double) total / scores.size();\n    }\n}',
  },
  {
    id: 'java-mid-scheduler',
    title: 'Scheduler slot',
    language: 'java',
    difficulty: 'mid',
    mode: 'code',
    topics: ['for-loop', 'method'],
    text: 'public class Scheduler {\n    public static int findSlot(int[] sessions, int target) {\n        int current = 0;\n        for (int minutes : sessions) {\n            current += minutes;\n            if (current >= target) return current;\n        }\n        return -1;\n    }\n}',
  },
]

const SQL_BEGINNER: TypingSample[] = [
  {
    id: 'sql-select',
    title: 'SELECT basics',
    language: 'sql',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['select'],
    text: 'SELECT id, full_name, email\nFROM students;',
  },
  {
    id: 'sql-where',
    title: 'WHERE filter',
    language: 'sql',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['where'],
    text: 'SELECT id, full_name\nFROM students\nWHERE active = 1;',
  },
  {
    id: 'sql-group-by',
    title: 'GROUP BY',
    language: 'sql',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['group-by'],
    text: 'SELECT role_id, COUNT(*) AS student_count\nFROM enrollments\nGROUP BY role_id;',
  },
  {
    id: 'sql-having',
    title: 'HAVING',
    language: 'sql',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['having'],
    text: 'SELECT role_id, COUNT(*) AS total\nFROM enrollments\nGROUP BY role_id\nHAVING COUNT(*) > 5;',
  },
  {
    id: 'sql-order-by',
    title: 'ORDER BY',
    language: 'sql',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['order-by'],
    text: 'SELECT full_name, score\nFROM exam_results\nORDER BY score DESC, full_name ASC;',
  },
  {
    id: 'sql-join',
    title: 'JOIN',
    language: 'sql',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['join'],
    text: 'SELECT s.full_name, r.role_name\nFROM students s\nJOIN roles r ON r.id = s.role_id;',
  },
  {
    id: 'sql-aggregate',
    title: 'Aggregate query',
    language: 'sql',
    difficulty: 'beginner',
    mode: 'code',
    topics: ['aggregate'],
    text: 'SELECT department,\n       COUNT(*) AS headcount,\n       AVG(salary) AS avg_salary\nFROM employees\nGROUP BY department;',
  },
]

const SQL_MID: TypingSample[] = [
  {
    id: 'sql-mid-progress',
    title: 'Progress report',
    language: 'sql',
    difficulty: 'mid',
    mode: 'code',
    topics: ['join', 'where', 'order-by'],
    text: 'SELECT s.full_name, p.completion_percentage\nFROM student_progress p\nJOIN students s ON s.id = p.student_id\nWHERE p.completion_percentage >= 70\nORDER BY p.completion_percentage DESC;',
  },
  {
    id: 'sql-mid-monthly',
    title: 'Monthly averages',
    language: 'sql',
    difficulty: 'mid',
    mode: 'code',
    topics: ['group-by', 'aggregate'],
    text: 'SELECT student_id,\n       DATE_TRUNC(\'month\', attempt_date) AS score_month,\n       ROUND(AVG(score), 2) AS avg_score\nFROM typing_attempts\nGROUP BY student_id, DATE_TRUNC(\'month\', attempt_date);',
  },
]

export const TYPING_SAMPLES: TypingSample[] = [
  ...TEXT_BEGINNER,
  ...TEXT_MID,
  ...PYTHON_BEGINNER,
  ...PYTHON_MID,
  ...JAVASCRIPT_BEGINNER,
  ...JAVASCRIPT_MID,
  ...JAVA_BEGINNER,
  ...JAVA_MID,
  ...SQL_BEGINNER,
  ...SQL_MID,
]

export function getTypingSampleById(id: string): TypingSample | undefined {
  return TYPING_SAMPLES.find((sample) => sample.id === id)
}

export function getTypingSamplesForMode(
  mode: 'text' | 'code',
  language?: TypingCodeLanguage,
  difficulty?: TypingDifficulty,
): TypingSample[] {
  return TYPING_SAMPLES.filter((sample) => {
    if (sample.mode !== mode) return false
    if (mode === 'code' && language && sample.language !== language) return false
    if (difficulty && sample.difficulty !== difficulty) return false
    return true
  })
}

export function pickTypingSample(
  mode: 'text' | 'code',
  language: TypingCodeLanguage,
  difficulty: TypingDifficulty,
  excludeIds: string[] = [],
): TypingSample | null {
  const pool = getTypingSamplesForMode(mode, mode === 'code' ? language : undefined, difficulty)
    .filter((sample) => !excludeIds.includes(sample.id))
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

export function buildMistakeReviewSample(mistakes: Array<{ snippetId: string; snippetText: string; language: TypingCodeLanguage | 'text' }>): TypingSample | null {
  if (mistakes.length === 0) return null
  const first = mistakes[0]
  const known = getTypingSampleById(first.snippetId)
  if (known) return known
  return {
    id: `retry-${first.snippetId}`,
    title: 'Retry mistake snippet',
    language: first.language,
    difficulty: 'any',
    mode: first.language === 'text' ? 'text' : 'code',
    topics: ['mistake-review'],
    text: first.snippetText,
  }
}
