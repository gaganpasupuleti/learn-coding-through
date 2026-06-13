import type { PracticeIntelligenceLanguage, PracticeSnippet } from './codeIntelligence.types'

const PYTHON_SNIPPETS: PracticeSnippet[] = [
  { label: 'print()', filterText: 'print', insertText: 'print(${1:value})', detail: 'Print to stdout' },
  { label: 'input()', filterText: 'input', insertText: 'input(${1:"prompt"})', detail: 'Read user input' },
  { label: 'int(input())', filterText: 'intinput', insertText: 'int(input(${1:"Enter a number: "}))', detail: 'Read integer input' },
  {
    label: 'if condition:',
    filterText: 'if',
    insertText: 'if ${1:condition}:\n\t${2:pass}',
    detail: 'If statement',
  },
  {
    label: 'for item in list:',
    filterText: 'for',
    insertText: 'for ${1:item} in ${2:items}:\n\t${3:pass}',
    detail: 'For loop',
  },
  {
    label: 'while condition:',
    filterText: 'while',
    insertText: 'while ${1:condition}:\n\t${2:pass}',
    detail: 'While loop',
  },
  {
    label: 'def function_name():',
    filterText: 'def',
    insertText: 'def ${1:function_name}(${2:}):\n\t${3:pass}',
    detail: 'Function definition',
  },
  {
    label: 'list.append',
    filterText: 'append',
    insertText: '${1:my_list}.append(${2:item})',
    detail: 'Append to list',
  },
  {
    label: 'range loop',
    filterText: 'range',
    insertText: 'for ${1:i} in range(${2:n}):\n\t${3:pass}',
    detail: 'Loop with range()',
  },
]

const JAVASCRIPT_SNIPPETS: PracticeSnippet[] = [
  { label: 'console.log()', filterText: 'console.log', insertText: 'console.log(${1:value})', detail: 'Log to console' },
  { label: 'const variable = value', filterText: 'const', insertText: 'const ${1:name} = ${2:value}', detail: 'Const declaration' },
  { label: 'let variable = value', filterText: 'let', insertText: 'let ${1:name} = ${2:value}', detail: 'Let declaration' },
  {
    label: 'if condition',
    filterText: 'if',
    insertText: 'if (${1:condition}) {\n\t${2:// code}\n}',
    detail: 'If statement',
  },
  {
    label: 'for loop',
    filterText: 'for',
    insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${3:// code}\n}',
    detail: 'Classic for loop',
  },
  {
    label: 'function declaration',
    filterText: 'function',
    insertText: 'function ${1:name}(${2:params}) {\n\t${3:// code}\n}',
    detail: 'Named function',
  },
  {
    label: 'arrow function',
    filterText: 'arrow',
    insertText: 'const ${1:name} = (${2:params}) => {\n\t${3:// code}\n}',
    detail: 'Arrow function',
  },
  {
    label: 'array.map',
    filterText: 'map',
    insertText: '${1:array}.map((${2:item}) => ${3:item})',
    detail: 'Map over array',
  },
]

const REACT_SNIPPETS: PracticeSnippet[] = [
  {
    label: 'functional component',
    filterText: 'component',
    insertText: 'export default function ${1:App}() {\n\treturn (\n\t\t<div>${2:Hello}</div>\n\t)\n}',
    detail: 'React function component',
  },
  {
    label: 'useState counter',
    filterText: 'useState',
    insertText: 'const [${1:count}, setCount] = useState(${2:0})',
    detail: 'useState hook',
  },
  {
    label: 'button with onClick',
    filterText: 'button',
    insertText: '<button onClick={() => ${1:handleClick()}}>${2:Click me}</button>',
    detail: 'Button with click handler',
  },
  {
    label: 'list render using map',
    filterText: 'mapjsx',
    insertText: '{${1:items}.map((${2:item}) => (\n\t<div key={${2:item}.id}>${3:{item.name}}</div>\n))}',
    detail: 'Render list in JSX',
  },
  {
    label: 'conditional render',
    filterText: 'conditional',
    insertText: '{${1:condition} && <${2:div}>${3:Content}</${2:div}>}',
    detail: 'Conditional JSX',
  },
]

const JAVA_SNIPPETS: PracticeSnippet[] = [
  {
    label: 'main class',
    filterText: 'main class',
    insertText: `public class Main {
\tpublic static void main(String[] args) {
\t\t\${1:// code}
\t}
}`,
    detail: 'Practice entry class',
  },
  {
    label: 'print line',
    filterText: 'sys println print',
    insertText: 'System.out.println(${1:value});',
    detail: 'Print a line',
  },
  {
    label: 'if else',
    filterText: 'if',
    insertText: 'if (${1:condition}) {\n\t${2:// code}\n} else {\n\t${3:// code}\n}',
    detail: 'If / else block',
  },
  {
    label: 'for loop',
    filterText: 'for',
    insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${3:// code}\n}',
    detail: 'Classic for loop',
  },
  {
    label: 'while loop',
    filterText: 'while',
    insertText: 'while (${1:condition}) {\n\t${2:// code}\n}',
    detail: 'While loop',
  },
  {
    label: 'method',
    filterText: 'method',
    insertText: 'public static ${1:int} ${2:name}(${3:}) {\n\t${4:return 0;}\n}',
    detail: 'Static helper method',
  },
  {
    label: 'array loop',
    filterText: 'array for each',
    insertText: 'for (int ${1:item} : ${2:nums}) {\n\t${3:// code}\n}',
    detail: 'Enhanced for over array',
  },
  {
    label: 'even odd',
    filterText: 'even odd',
    insertText: `if (n % 2 == 0) {
\tSystem.out.println("Even");
} else {
\tSystem.out.println("Odd");
}`,
    detail: 'Even / odd branch',
  },
  {
    label: 'sum two numbers',
    filterText: 'sum add',
    insertText: 'int a = ${1:2};\nint b = ${2:3};\nSystem.out.println(a + b);',
    detail: 'Add two in-code variables',
  },
]

export function getSnippetsForLanguage(language: PracticeIntelligenceLanguage): PracticeSnippet[] {
  if (language === 'python') return PYTHON_SNIPPETS
  if (language === 'javascript') return JAVASCRIPT_SNIPPETS
  if (language === 'java') return JAVA_SNIPPETS
  return [...JAVASCRIPT_SNIPPETS, ...REACT_SNIPPETS]
}
