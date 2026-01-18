import { CodeExecutor } from './sandbox'

export const sandbox = new CodeExecutor({
  timeout: 5000,
  maxOutputLength: 10000,
})
