import type { CodePracticeLanguageMode } from '../types/codePractice.types'
import { getDefaultQuestionForLanguage, getQuestionById } from './codeQuestions'

/** Language-level fallback when no question is selected. */
export const LANGUAGE_STARTER_TEMPLATES: Record<CodePracticeLanguageMode, string> = {
  python: '# Write your Python solution here\n',
  javascript: '// Write your JavaScript solution here\n',
  react: `// React / Frontend sandbox — live preview in Phase 2
function App() {
  return null;
}
`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}
`,
  c: `#include <stdio.h>

int main(void) {
    printf("Hello\\n");
    return 0;
}
`,
  cpp: `#include <iostream>

int main() {
    std::cout << "Hello" << std::endl;
    return 0;
}
`,
}

export function resolveStarterCode(language: CodePracticeLanguageMode, questionId?: string | null): string {
  if (questionId) {
    const question = getQuestionById(questionId)
    if (question) return question.starterCode
  }
  const defaultQuestion = getDefaultQuestionForLanguage(language)
  if (defaultQuestion) return defaultQuestion.starterCode
  return LANGUAGE_STARTER_TEMPLATES[language]
}
