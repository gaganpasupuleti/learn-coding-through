import { describe, it, expect } from 'vitest'
import { CodeSandbox } from './sandbox'

describe('CodeSandbox', () => {
  const executor = new CodeSandbox()

  it('should execute JavaScript code', async () => {
    const code = 'console.log("Hello, World!")'
    const result = await executor.executeJavaScript(code)
    expect(result.output).toBe('Hello, World!')
    expect(result.error).toBeUndefined()
  })

  it('should execute Python code', async () => {
    const code = 'print("Hello, Python!")'
    const result = await executor.executePython(code)
    expect(result.output).toContain('Hello, Python!')
  })

  it('should execute Java code', async () => {
    const code = `
public class Test {
  public static void main(String[] args) {
    System.out.println("Hello, Java!");
  }
}
    `
    const result = await executor.executeJava(code)
    expect(result.output).toContain('Hello, Java!')
  })

  it('should execute SQL code', async () => {
    const code = `
CREATE TABLE users (id INT, name VARCHAR(50));
INSERT INTO users VALUES (1, 'Alice');
SELECT * FROM users;
    `
    const result = await executor.executeSQL(code)
    expect(result.output).toContain('users')
  })
})
