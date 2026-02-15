/**
 * API client for backend code execution
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface ExecuteRequest {
  code: string
  language: string
}

export interface ExecuteResponse {
  success: boolean
  output: string
  error?: string
  execution_time: number
}

export interface SqlSchemaTable {
  name: string
  primary_key: string
  columns: string[]
  description?: string
}

export interface SqlPracticeSchemaResponse {
  tables: SqlSchemaTable[]
}

/**
 * Execute code on the backend
 */
export async function executeCode(
  code: string,
  language: string
): Promise<ExecuteResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        language,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    return {
      success: false,
      output: '',
      error: error.message || 'Failed to execute code',
      execution_time: 0,
    }
  }
}

export async function fetchSqlPracticeSchema(): Promise<SqlPracticeSchemaResponse> {
  const response = await fetch(`${API_BASE_URL}/api/sql/schema`)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
  }
  return response.json() as Promise<SqlPracticeSchemaResponse>
}
