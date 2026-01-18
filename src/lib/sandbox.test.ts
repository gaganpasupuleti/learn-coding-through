import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CodeExecutor } from './sandbox'

describe('CodeExecutor', () => {
  let executor: CodeExecutor

  beforeEach(() => {
    executor = new CodeExecutor()
    vi.clearAllMocks()
  })

  describe('JavaScript Execution', () => {
    it('should execute simple console.log statements', async () => {
      const code = 'console.log("Hello, World!")'
      const result = await executor.executeJavaScript(code)

      expect(result.output).toBe('Hello, World!')
      expect(result.error).toBeUndefined()
      expect(result.executionTime).toBeGreaterThan(0)
    })

    it('should execute multiple console.log statements', async () => {
      const code = `
        console.log("First line")
        console.log("Second line")
        console.log("Third line")
      `
      const result = await executor.executeJavaScript(code)

      expect(result.output).toBe('First line\nSecond line\nThird line')
      expect(result.error).toBeUndefined()
    })

    it('should capture return values from expressions', async () => {
      const code = '5 + 10'
      const result = await executor.executeJavaScript(code)

      expect(result.output).toBe('15')
      expect(result.error).toBeUndefined()
    })

    it('should handle arithmetic operations', async () => {
      const code = `
        const a = 10
        const b = 20
        console.log(a + b)
        console.log(a * b)
        console.log(b - a)
      `
      const result = await executor.executeJavaScript(code)

      expect(result.output).toBe('30\n200\n10')
      expect(result.error).toBeUndefined()
    })

    it('should handle syntax errors', async () => {
      const code = 'const x = ;'
      const result = await executor.executeJavaScript(code)

      expect(result.error).toBeDefined()
      expect(result.error).toContain('Unexpected token')
    })

    it('should handle runtime errors', async () => {
      const code = 'throw new Error("Test error")'
      const result = await executor.executeJavaScript(code)

      expect(result.error).toBe('Test error')
    })

    it('should handle function definitions and calls', async () => {
      const code = `
        function greet(name) {
          return "Hello, " + name + "!"
        }
        console.log(greet("Alice"))
        console.log(greet("Bob"))
      `
      const result = await executor.executeJavaScript(code)

      expect(result.output).toBe('Hello, Alice!\nHello, Bob!')
      expect(result.error).toBeUndefined()
    })

    it('should handle array operations', async () => {
      const code = `
        const arr = [1, 2, 3, 4, 5]
        console.log(arr.map(x => x * 2))
        console.log(arr.filter(x => x > 2))
      `
      const result = await executor.executeJavaScript(code)

      expect(result.output).toContain('2,4,6,8,10')
      expect(result.output).toContain('3,4,5')
      expect(result.error).toBeUndefined()
    })

    it('should handle object operations', async () => {
      const code = `
        const obj = { name: "John", age: 30 }
        console.log(obj.name)
        console.log(obj.age)
      `
      const result = await executor.executeJavaScript(code)

      expect(result.output).toBe('John\n30')
      expect(result.error).toBeUndefined()
    })

    it('should timeout for infinite loops', async () => {
      const code = 'while(true) {}'
      const result = await executor.executeJavaScript(code)

      expect(result.error).toBe('Execution timed out')
    }, 10000)

    it('should handle empty code', async () => {
      const code = ''
      const result = await executor.executeJavaScript(code)

      expect(result.output).toBe('JavaScript code executed successfully')
      expect(result.error).toBeUndefined()
    })
  })

  describe('Python Execution (Simulated)', () => {
    it('should execute simple print statements', async () => {
      const code = 'print("Hello, World!")'
      const result = await executor.executePython(code)

      expect(result.output).toBe('Hello, World!')
      expect(result.error).toBeUndefined()
      expect(result.executionTime).toBeGreaterThan(0)
    })

    it('should handle variable assignments and prints', async () => {
      const code = `
x = 10
y = 20
print(x + y)
      `
      const result = await executor.executePython(code)

      expect(result.output).toBe('30')
      expect(result.error).toBeUndefined()
    })

    it('should handle multiple variable operations', async () => {
      const code = `
a = 5
b = 10
c = a + b
print(c)
print(a * b)
      `
      const result = await executor.executePython(code)

      expect(result.output).toBe('15\n50')
      expect(result.error).toBeUndefined()
    })

    it('should handle string variables', async () => {
      const code = `
name = "Alice"
print(name)
      `
      const result = await executor.executePython(code)

      expect(result.output).toContain('Alice')
      expect(result.error).toBeUndefined()
    })

    it('should ignore comments', async () => {
      const code = `
# This is a comment
x = 42
print(x)
# Another comment
      `
      const result = await executor.executePython(code)

      expect(result.output).toBe('42')
      expect(result.error).toBeUndefined()
    })

    it('should handle arithmetic expressions in print', async () => {
      const code = `
print(5 + 10)
print(20 * 3)
print(100 - 25)
      `
      const result = await executor.executePython(code)

      expect(result.output).toBe('15\n60\n75')
      expect(result.error).toBeUndefined()
    })

    it('should handle empty code', async () => {
      const code = ''
      const result = await executor.executePython(code)

      expect(result.output).toBe('Python code executed (simulated)')
      expect(result.error).toBeUndefined()
    })

    it('should handle only comments', async () => {
      const code = `
# Comment 1
# Comment 2
# Comment 3
      `
      const result = await executor.executePython(code)

      expect(result.output).toBe('Python code executed (simulated)')
      expect(result.error).toBeUndefined()
    })
  })

  describe('Java Execution (Simulated)', () => {
    it('should execute simple System.out.println statements', async () => {
      const code = `
public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
  }
}
      `
      const result = await executor.executeJava(code)

      expect(result.output).toBe('Hello, World!')
      expect(result.error).toBeUndefined()
      expect(result.executionTime).toBeGreaterThan(0)
    })

    it('should handle variable declarations and prints', async () => {
      const code = `
public class Main {
  public static void main(String[] args) {
    int x = 10;
    int y = 20;
    System.out.println(x + y);
  }
}
      `
      const result = await executor.executeJava(code)

      expect(result.output).toBe('30')
      expect(result.error).toBeUndefined()
    })

    it('should handle multiple println statements', async () => {
      const code = `
public class Main {
  public static void main(String[] args) {
    System.out.println("First");
    System.out.println("Second");
    System.out.println("Third");
  }
}
      `
      const result = await executor.executeJava(code)

      expect(result.output).toBe('First\nSecond\nThird')
      expect(result.error).toBeUndefined()
    })

    it('should handle different variable types', async () => {
      const code = `
public class Main {
  public static void main(String[] args) {
    int num = 42;
    double pi = 3.14;
    String name = "Java";
    System.out.println(num);
    System.out.println(pi);
    System.out.println(name);
  }
}
      `
      const result = await executor.executeJava(code)

      expect(result.output).toContain('42')
      expect(result.output).toContain('3.14')
      expect(result.output).toContain('Java')
      expect(result.error).toBeUndefined()
    })

    it('should ignore comments', async () => {
      const code = `
public class Main {
  public static void main(String[] args) {
    // This is a comment
    int x = 100;
    System.out.println(x);
  }
}
      `
      const result = await executor.executeJava(code)

      expect(result.output).toBe('100')
      expect(result.error).toBeUndefined()
    })

    it('should handle arithmetic operations', async () => {
      const code = `
public class Main {
  public static void main(String[] args) {
    int a = 10;
    int b = 5;
    System.out.println(a + b);
    System.out.println(a * b);
    System.out.println(a - b);
  }
}
      `
      const result = await executor.executeJava(code)

      expect(result.output).toBe('15\n50\n5')
      expect(result.error).toBeUndefined()
    })

    it('should handle empty main method', async () => {
      const code = `
public class Main {
  public static void main(String[] args) {
  }
}
      `
      const result = await executor.executeJava(code)

      expect(result.output).toBe('Java code executed (simulated)')
      expect(result.error).toBeUndefined()
    })

    it('should ignore code outside main method', async () => {
      const code = `
public class Main {
  private int value = 10;
  
  public static void main(String[] args) {
    System.out.println("Inside main");
  }
  
  public void someMethod() {
    System.out.println("This should not execute");
  }
}
      `
      const result = await executor.executeJava(code)

      expect(result.output).toBe('Inside main')
      expect(result.error).toBeUndefined()
    })
  })

  describe('Execute Dispatcher', () => {
    it('should dispatch to JavaScript executor', async () => {
      const code = 'console.log("JS Test")'
      const result = await executor.execute(code, 'javascript')

      expect(result.output).toBe('JS Test')
      expect(result.error).toBeUndefined()
    })

    it('should dispatch to Python executor', async () => {
      const code = 'print("Python Test")'
      const result = await executor.execute(code, 'python')

      expect(result.output).toBe('Python Test')
      expect(result.error).toBeUndefined()
    })

    it('should dispatch to Java executor', async () => {
      const code = `
public class Main {
  public static void main(String[] args) {
    System.out.println("Java Test");
  }
}
      `
      const result = await executor.execute(code, 'java')

      expect(result.output).toBe('Java Test')
      expect(result.error).toBeUndefined()
    })
  })

  describe('Configuration', () => {
    it('should respect custom timeout configuration', async () => {
      const fastExecutor = new CodeExecutor({ timeout: 100 })
      const code = 'while(true) {}'
      const result = await fastExecutor.executeJavaScript(code)

      expect(result.error).toBe('Execution timed out')
    }, 5000)

    it('should respect maxOutputLength configuration', async () => {
      const limitedExecutor = new CodeExecutor({ maxOutputLength: 10 })
      const code = 'console.log("This is a very long output that should be truncated")'
      const result = await limitedExecutor.executeJavaScript(code)

      expect(result.output.length).toBeLessThanOrEqual(30)
      expect(result.output).toContain('...output truncated')
    })

    it('should use default configuration when not provided', () => {
      const defaultExecutor = new CodeExecutor()
      expect(defaultExecutor).toBeDefined()
    })

    it('should allow partial configuration', () => {
      const partialExecutor = new CodeExecutor({ timeout: 3000 })
      expect(partialExecutor).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle code with only whitespace', async () => {
      const code = '   \n   \n   '
      const resultJS = await executor.executeJavaScript(code)
      const resultPython = await executor.executePython(code)
      const resultJava = await executor.executeJava(code)

      expect(resultJS.output).toBe('JavaScript code executed successfully')
      expect(resultPython.output).toBe('Python code executed (simulated)')
      expect(resultJava.output).toBe('Java code executed (simulated)')
    })

    it('should handle special characters in output', async () => {
      const code = 'console.log("Special: !@#$%^&*()_+-={}[]|:;<>?,./")'
      const result = await executor.executeJavaScript(code)

      expect(result.output).toContain('Special: !@#$%^&*()_+-={}[]|:;<>?,./)')
      expect(result.error).toBeUndefined()
    })

    it('should handle unicode characters', async () => {
      const code = 'console.log("Unicode: 你好 🚀 ñ")'
      const result = await executor.executeJavaScript(code)

      expect(result.output).toContain('Unicode: 你好 🚀 ñ')
      expect(result.error).toBeUndefined()
    })

    it('should handle multiline strings', async () => {
      const code = 'console.log("Line 1\\nLine 2\\nLine 3")'
      const result = await executor.executeJavaScript(code)

      expect(result.output).toContain('Line 1')
      expect(result.output).toContain('Line 2')
      expect(result.output).toContain('Line 3')
      expect(result.error).toBeUndefined()
    })

    it('should handle null and undefined', async () => {
      const code = `
        console.log(null)
        console.log(undefined)
      `
      const result = await executor.executeJavaScript(code)

      expect(result.output).toContain('null')
      expect(result.output).toContain('undefined')
      expect(result.error).toBeUndefined()
    })

    it('should handle boolean values', async () => {
      const code = `
        console.log(true)
        console.log(false)
      `
      const result = await executor.executeJavaScript(code)

      expect(result.output).toBe('true\nfalse')
      expect(result.error).toBeUndefined()
    })
  })

  describe('Performance', () => {
    it('should complete simple operations quickly', async () => {
      const code = 'console.log("Quick test")'
      const result = await executor.executeJavaScript(code)

      expect(result.executionTime).toBeLessThan(100)
    })

    it('should track execution time accurately', async () => {
      const code = `
        let sum = 0
        for (let i = 0; i < 1000; i++) {
          sum += i
        }
        console.log(sum)
      `
      const result = await executor.executeJavaScript(code)

      expect(result.executionTime).toBeGreaterThan(0)
      expect(result.output).toBe('499500')
    })
  })
})
