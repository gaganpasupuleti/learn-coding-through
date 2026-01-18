import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CodeExecutor } from './sandbox'

  beforeEach(() => {
    vi.clearAllMocks()

    it('should execu
      const result = await execut
      expect(result.ou
    

      const code = `
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

        console.log("Third line")
    })
      const result = await executor.executeJavaScript(code)

      expect(result.output).toBe('First line\nSecond line\nThird line')
      expect(result.error).toBeUndefined()
    })

    it('should capture return values from expressions', async () => {
      expect(result.output)
      const result = await executor.executeJavaScript(code)

      expect(result.output).toBe('15')
      expect(result.error).toBeUndefined()
    })

    it('should handle arithmetic operations', async () => {
    it('should handl
        const a = 10

        console.log(a + b)

        console.log(b - a)
       
      const result = await executor.executeJavaScript(code)

      expect(result.output).toBe('30\n200\n10')
      expect(result.error).toBeUndefined()
      

    it('should handle syntax errors', async () => {
      const code = 'const x = ;'
      const result = await executor.executeJavaScript(code)

      expect(result.error).toBeDefined()
      expect(result.error).toContain('Unexpected token')
      

    it('should handle runtime errors', async () => {
      const code = 'throw new Error("Test error")'
      const result = await executor.executeJavaScript(code)

      expect(result.error).toBe('Test error')
      

    it('should handle function definitions and calls', async () => {
      const code = `
        function greet(name) {
          return "Hello, " + name + "!"
        }
        console.log(greet("Alice"))
        console.log(greet("Bob"))
b = 10
      const result = await executor.executeJavaScript(code)

      expect(result.output).toBe('Hello, Alice!\nHello, Bob!')
      expect(result.error).toBeUndefined()
    })

    it('should handle array operations', async () => {
    })
        const arr = [1, 2, 3, 4, 5]
        console.log(arr.map(x => x * 2))
        console.log(arr.filter(x => x > 2))
      `
      const result = await executor.executeJavaScript(code)

      expect(result.output).toContain('2,4,6,8,10')
      expect(result.output).toContain('3,4,5')
      expect(result.error).toBeUndefined()
print(

      expect(result.error).toBeUndefined()

      const code = ''

      expect(result.error).t

      const code = `

      `

    })

  describe('Java Execution (Simulated)', () => {
      const code = `
  public static void main(String[] args) {

      `


    it('should handle empty code', async () => {
      const code = ''
public class Main {

    System.out.println(x + y);
}
      
    

    it('should handle multiple println statements'
public class Main {
    System.out.println("First");
      const result = await executor.executePython(code)

      const result = await executor.executeJava(c
      expect(result.output).toBe('First\nS
    })
    it

    int num = 42;
    String name = "J
    Sy
  }
      `

      expect(result.output).toContain('3.14')


      const code = `
  publ

  }
      `

      

      co
  public sta
    int
    System.out.println(a * b);

      `

      

      const code = `
  public static void
}
      const
      e
    })

public class Main {
  
    Sy

    System.out.println("This should not execut
}
      const result 
      
    })

    it(
      const result = await executor.execute(code, 'java

    })
    it('should dispatch to Python executor
      

    })
    it('should dispa
public class 
    System.ou
}
      c
      expect(result.output).toBe('Java Test')


    it('should respect custom timeout conf
      

    }, 5000)
    it('should respec
      const code = 'console.log("This is a very long ou

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

    })

    it('should use default configuration when not provided', () => {
      const defaultExecutor = new CodeExecutor()
      expect(defaultExecutor).toBeDefined()
    })

    it('should allow partial configuration', () => {
      const partialExecutor = new CodeExecutor({ timeout: 3000 })
      expect(partialExecutor).toBeDefined()
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


    it('should handle special characters in output', async () => {
      const code = 'console.log("Special: !@#$%^&*()_+-={}[]|:;<>?,./")'


      expect(result.output).toContain('Special: !@#$%^&*()_+-={}[]|:;<>?,./)')
      expect(result.error).toBeUndefined()


    it('should handle unicode characters', async () => {
      const code = 'console.log("Unicode: 你好 🚀 ñ")'
      const result = await executor.executeJavaScript(code)

      expect(result.output).toContain('Unicode: 你好 🚀 ñ')
      expect(result.error).toBeUndefined()


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

      const result = await executor.executeJavaScript(code)

      expect(result.output).toContain('null')

      expect(result.error).toBeUndefined()


    it('should handle boolean values', async () => {
      const code = `

        console.log(false)

      const result = await executor.executeJavaScript(code)

      expect(result.output).toBe('true\nfalse')

    })


  describe('Performance', () => {
    it('should complete simple operations quickly', async () => {
      const code = 'console.log("Quick test")'
      const result = await executor.executeJavaScript(code)

      expect(result.executionTime).toBeLessThan(100)
    })

    it('should track execution time accurately', async () => {
      const code = `

        for (let i = 0; i < 1000; i++) {
          sum += i
        }

      `
      const result = await executor.executeJavaScript(code)

      expect(result.executionTime).toBeGreaterThan(0)
      expect(result.output).toBe('499500')
    })
  })

