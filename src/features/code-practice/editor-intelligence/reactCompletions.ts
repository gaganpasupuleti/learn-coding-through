import type { PracticeKeyword } from './codeIntelligence.types'

export const REACT_KEYWORDS: PracticeKeyword[] = [
  { label: 'useState', detail: 'React state hook' },
  { label: 'useEffect', detail: 'React effect hook' },
  { label: 'useMemo', detail: 'Memoize a value' },
  { label: 'useCallback', detail: 'Memoize a callback' },
  { label: 'props', detail: 'Component props' },
  { label: 'className', detail: 'CSS class (JSX)' },
  { label: 'onClick', detail: 'Click event handler' },
  { label: 'onChange', detail: 'Change event handler' },
  { label: 'button', detail: 'Button element' },
  { label: 'div', detail: 'Div element' },
  { label: 'input', detail: 'Input element' },
  { label: 'map', detail: 'Array map (render lists)' },
  { label: 'return', detail: 'Return JSX' },
  { label: 'export default function App', detail: 'Default export component' },
]

export const REACT_JSX_TAGS = ['div', 'span', 'button', 'input', 'p', 'h1', 'h2', 'ul', 'li', 'form', 'label']
