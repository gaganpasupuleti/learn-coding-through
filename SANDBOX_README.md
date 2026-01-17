# Sandboxed Code Execution System

## Overview

This application implements a secure, browser-based code execution sandbox that allows students to run code in multiple languages (JavaScript, Python, Java, and SQL) without requiring server-side compilation or interpretation.

## Architecture

### Core Components

1. **Sandbox Module** (`src/lib/sandbox.ts`)
   - Main execution engine
   - Handles all language-specific execution logic
   - Implements security measures and timeouts
   - Provides unified interface for all languages

2. **Code Editor** (`src/components/CodeEditor.tsx`)
   - Rich code editing experience with syntax highlighting
   - Integrates with sandbox for execution
   - Displays execution results and errors
   - Shows execution time metrics

3. **Sandbox Info** (`src/components/SandboxInfo.tsx`)
   - Educational component explaining sandbox features
   - Documents security measures
   - Lists supported language features

## Security Features

### Isolation
- **JavaScript**: Executes in sandboxed iframes with restricted permissions
- **Python/Java/SQL**: Simulated execution prevents direct code execution

### Protections
- ✅ 5-second timeout to prevent infinite loops
- ✅ Output length limits to prevent memory exhaustion
- ✅ No filesystem access
- ✅ No network access
- ✅ No system API access
- ✅ Restricted window/document access in JavaScript

### Sandboxing Techniques

#### JavaScript Sandbox
```typescript
// Creates isolated iframe with sandbox attribute
const iframe = document.createElement('iframe')
iframe.setAttribute('sandbox', 'allow-scripts')

// Uses postMessage for controlled communication
window.postMessage({ type: 'log', args }, '*')
```

#### Simulated Execution (Python, Java, SQL)
- Parses code without executing
- Identifies patterns (print statements, variables, etc.)
- Generates appropriate output
- Perfect for educational purposes

## Language Support

### JavaScript (Native Execution)
**Fully Supported:**
- Variables (let, const, var)
- Functions (regular, arrow, async)
- Loops (for, while, do-while)
- Arrays and objects
- String operations
- Math operations
- Console methods (log, error, warn, info)
- Promises and async/await

**Example:**
```javascript
console.log("Hello, World!")
const numbers = [1, 2, 3, 4, 5]
const doubled = numbers.map(n => n * 2)
console.log("Doubled:", doubled)
```

### Python (Simulated)
**Supported:**
- print() statements
- Variable assignments
- Basic arithmetic
- String operations
- Function definitions (def)
- Class definitions
- Import statements

**Example:**
```python
print("Hello, World!")
x = 10
y = 20
print("Sum:", x + y)
```

### Java (Simulated)
**Supported:**
- System.out.println()
- Variable declarations
- Method definitions
- Scanner input (simulated)
- Random number generation (simulated)
- Class structure recognition

**Example:**
```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        int x = 10;
        int y = 20;
        System.out.println("Sum: " + (x + y));
    }
}
```

### SQL (Simulated)
**Supported:**
- SELECT queries
- INSERT statements
- UPDATE statements
- DELETE statements
- CREATE TABLE
- ALTER TABLE
- DROP TABLE
- JOIN operations

**Example:**
```sql
SELECT * FROM users WHERE age > 18;
INSERT INTO users (name, email) VALUES ('John', 'john@example.com');
```

## Usage

### Basic Execution
```typescript
import { sandbox } from '@/lib/sandbox'

const result = await sandbox.execute(code, 'javascript')

if (result.error) {
  console.error('Error:', result.error)
} else {
  console.log('Output:', result.output)
  console.log('Execution time:', result.executionTime, 'ms')
}
```

### In React Components
```tsx
import { CodeEditor } from '@/components/CodeEditor'

<CodeEditor
  initialCode="console.log('Hello!')"
  language="javascript"
  projectId="my-project"
  onRun={(code) => console.log('Code executed:', code)}
/>
```

## Configuration

### Sandbox Options
```typescript
const sandbox = new CodeSandbox({
  timeout: 5000,           // Maximum execution time (ms)
  maxOutputLength: 10000   // Maximum output characters
})
```

### Supported Languages
- `javascript` / `js` / `typescript` / `ts`
- `python` / `py`
- `java`
- `sql`

## Test Cases

Pre-built test cases are available in `src/lib/test-cases.ts`:

```typescript
import { getTestCase, getAllTestsForLanguage } from '@/lib/test-cases'

// Get specific test
const basicJSTest = getTestCase('javascript', 'basic')

// Get all tests for a language
const pythonTests = getAllTestsForLanguage('python')
```

## Educational Benefits

1. **Immediate Feedback**: Students see results instantly
2. **Safe Learning**: Cannot break anything or access system
3. **Multi-Language**: Learn different languages in one environment
4. **Real Behavior**: JavaScript runs natively for authentic experience
5. **Guided Simulation**: Other languages provide educational feedback

## Performance

- JavaScript execution: Near-native speed in sandboxed iframe
- Simulated languages: < 10ms execution time
- Minimal memory footprint
- No server requests required

## Limitations

### By Design
- Python/Java/SQL are simulated, not fully executed
- Limited to browser capabilities
- No package/module imports for Python/Java
- No database persistence for SQL

### Security Restrictions
- Cannot access user files
- Cannot make network requests
- Cannot modify page outside sandbox
- Execution timeout enforced

## Future Enhancements

Possible improvements:
- WebAssembly for native Python/Java execution
- Package manager integration
- Persistent storage for SQL operations
- Advanced debugging features
- Code validation before execution
- Performance profiling

## Browser Compatibility

Requires modern browser with:
- ES6+ support
- iframe sandboxing
- postMessage API
- Performance API

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Code Not Executing
- Check browser console for errors
- Ensure code is syntactically valid
- Check timeout limits

### Unexpected Output
- JavaScript: Check console methods used
- Python/Java/SQL: Remember these are simulations
- Verify language is correctly specified

### Performance Issues
- Reduce output volume
- Avoid extremely long loops
- Check for infinite recursion

## Contributing

When adding new language features:
1. Update `sandbox.ts` with execution logic
2. Add test cases to `test-cases.ts`
3. Update documentation
4. Test security implications
