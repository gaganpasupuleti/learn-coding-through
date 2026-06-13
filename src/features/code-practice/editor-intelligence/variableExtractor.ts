const IDENT = '[a-zA-Z_$][\\w$]*'

/** Python assignments and simple loop variables. */
export function extractPythonVariables(code: string): string[] {
  const names = new Set<string>()
  const assignRe = new RegExp(`^\\s*(${IDENT})\\s*=`, 'gm')
  const forRe = new RegExp(`^\\s*for\\s+(${IDENT})\\s+in\\b`, 'gm')
  const defRe = new RegExp(`^\\s*def\\s+(${IDENT})\\s*\\(`, 'gm')

  let m: RegExpExecArray | null
  while ((m = assignRe.exec(code))) names.add(m[1])
  while ((m = forRe.exec(code))) names.add(m[1])
  while ((m = defRe.exec(code))) names.add(m[1])

  return [...names].sort()
}

/** JavaScript const/let/var, functions, and top-level arrow bindings. */
export function extractJavaScriptVariables(code: string): string[] {
  const names = new Set<string>()
  const declRe = new RegExp(`(?:const|let|var)\\s+(${IDENT})`, 'g')
  const funcRe = new RegExp(`function\\s+(${IDENT})\\s*\\(([^)]*)\\)`, 'g')
  const arrowRe = new RegExp(`(?:const|let|var)\\s+(${IDENT})\\s*=\\s*(?:async\\s*)?\\([^)]*\\)\\s*=>`, 'g')

  let m: RegExpExecArray | null
  while ((m = declRe.exec(code))) names.add(m[1])
  while ((m = arrowRe.exec(code))) names.add(m[1])
  while ((m = funcRe.exec(code))) {
    names.add(m[1])
    parseParamList(m[2]).forEach((p) => names.add(p))
  }

  return [...names].sort()
}

function parseParamList(params: string): string[] {
  if (!params.trim()) return []
  return params
    .split(',')
    .map((p) => p.trim().split('=')[0].trim().replace(/^\.\.\./, ''))
    .filter((p) => p && /^[a-zA-Z_$]/.test(p))
}

/** Java field/local declarations and enhanced-for loop variables. */
export function extractJavaVariables(code: string): string[] {
  const names = new Set<string>()
  const declRe = new RegExp(`(?:int|double|boolean|String)\\s+(${IDENT})\\s*[=;]`, 'g')
  const forClassicRe = new RegExp(`for\\s*\\(\\s*(?:int\\s+)?(${IDENT})\\s*=`, 'g')
  const forEachRe = new RegExp(`for\\s*\\(\\s*(?:int|double|boolean|String)\\s+(${IDENT})\\s*:`, 'g')

  let m: RegExpExecArray | null
  while ((m = declRe.exec(code))) names.add(m[1])
  while ((m = forClassicRe.exec(code))) names.add(m[1])
  while ((m = forEachRe.exec(code))) names.add(m[1])

  return [...names].sort()
}

export function extractVariablesForLanguage(
  language: 'python' | 'javascript' | 'react' | 'java',
  code: string,
): string[] {
  if (language === 'python') return extractPythonVariables(code)
  if (language === 'java') return extractJavaVariables(code)
  return extractJavaScriptVariables(code)
}

/** True when cursor is inside System.out.print( or println( on the current line. */
export function isInsideJavaPrintCall(lineContent: string): boolean {
  if (!lineContent.includes('System.out')) return false
  if (isInsideCallExpression(lineContent, 'println')) return true
  const printIdx = lineContent.lastIndexOf('print(')
  if (printIdx > 0 && lineContent.slice(printIdx - 2, printIdx) === 'ln') return false
  return isInsideCallExpression(lineContent, 'print')
}

/** True when cursor is inside print( … ) or console.log( … ). */
export function isInsideCallExpression(lineContent: string, callName: string): boolean {
  const idx = lineContent.lastIndexOf(callName + '(')
  if (idx === -1) return false
  const after = lineContent.slice(idx + callName.length + 1)
  const opens = (after.match(/\(/g) ?? []).length
  const closes = (after.match(/\)/g) ?? []).length
  return opens >= closes
}
