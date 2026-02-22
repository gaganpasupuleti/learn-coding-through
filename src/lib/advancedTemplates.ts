import type { ProjectTemplate } from '@/types'

export const ADVANCED_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'rest-api-mock',
    name: 'REST API Mock Client',
    description: 'A full-featured REST API client for exploring and testing APIs. Supports GET, POST, PUT, DELETE with request/response inspection.',
    language: 'react-typescript',
    files: [
      {
        name: 'App.tsx',
        language: 'tsx',
        content: `import { useState } from 'react'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface RequestHistory {
  id: string
  method: HttpMethod
  url: string
  status: number
  duration: number
  timestamp: string
}

const MOCK_RESPONSES: Record<string, { status: number; body: unknown }> = {
  'https://api.example.com/users': {
    status: 200,
    body: [
      { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
      { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
      { id: 3, name: 'Carol Davis', email: 'carol@example.com', role: 'user' },
    ],
  },
  'https://api.example.com/posts': {
    status: 200,
    body: [
      { id: 1, title: 'Getting Started with React', userId: 1, published: true },
      { id: 2, title: 'TypeScript Tips', userId: 2, published: true },
    ],
  },
  'https://api.example.com/products': {
    status: 200,
    body: [
      { id: 1, name: 'Laptop', price: 999.99, inStock: true },
      { id: 2, name: 'Mouse', price: 29.99, inStock: true },
    ],
  },
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'bg-green-100 text-green-700',
  POST: 'bg-blue-100 text-blue-700',
  PUT: 'bg-yellow-100 text-yellow-700',
  PATCH: 'bg-orange-100 text-orange-700',
  DELETE: 'bg-red-100 text-red-700',
}

export default function ApiExplorer() {
  const [method, setMethod] = useState<HttpMethod>('GET')
  const [url, setUrl] = useState('https://api.example.com/users')
  const [body, setBody] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [status, setStatus] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<RequestHistory[]>([])
  const [activeTab, setActiveTab] = useState<'response' | 'history'>('response')

  const sendRequest = async () => {
    setLoading(true)
    const start = Date.now()
    await new Promise(r => setTimeout(r, 300 + Math.random() * 400))
    
    const mock = MOCK_RESPONSES[url]
    const duration = Date.now() - start

    if (mock && (method === 'GET' || method === 'DELETE')) {
      const responseBody = method === 'DELETE' 
        ? { message: 'Resource deleted successfully' } 
        : mock.body
      setStatus(method === 'DELETE' ? 204 : mock.status)
      setResponse(JSON.stringify(responseBody, null, 2))
      setHistory(prev => [{
        id: Date.now().toString(),
        method,
        url,
        status: method === 'DELETE' ? 204 : mock.status,
        duration,
        timestamp: new Date().toLocaleTimeString(),
      }, ...prev.slice(0, 9)])
    } else if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      const createdResource = body ? { id: Date.now(), ...JSON.parse(body || '{}') } : { id: Date.now() }
      const responseStatus = method === 'POST' ? 201 : 200
      setStatus(responseStatus)
      setResponse(JSON.stringify(createdResource, null, 2))
      setHistory(prev => [{
        id: Date.now().toString(),
        method,
        url,
        status: responseStatus,
        duration,
        timestamp: new Date().toLocaleTimeString(),
      }, ...prev.slice(0, 9)])
    } else {
      setStatus(404)
      setResponse(JSON.stringify({ error: 'Not Found', message: \`No resource at \${url}\` }, null, 2))
    }
    setLoading(false)
  }

  const statusColor = status
    ? status < 300 ? 'text-green-600' : status < 400 ? 'text-yellow-600' : 'text-red-600'
    : ''

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-white">🔌 REST API Explorer</h1>

        <div className="bg-gray-800 rounded-xl p-4 space-y-3">
          <div className="flex gap-2">
            <select
              value={method}
              onChange={e => setMethod(e.target.value as HttpMethod)}
              className="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 font-mono font-semibold"
            >
              {(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as HttpMethod[]).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 font-mono"
              placeholder="https://api.example.com/resource"
            />
            <button
              onClick={sendRequest}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? '...' : 'Send'}
            </button>
          </div>

          {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder={'{ "name": "New Resource" }'}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 font-mono text-sm h-24"
            />
          )}

          <div className="text-xs text-gray-400">
            Try: https://api.example.com/users | /posts | /products
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('response')}
            className={\`px-4 py-2 rounded-lg text-sm font-medium \${activeTab === 'response' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}\`}
          >
            Response {status && <span className={\`ml-2 font-mono \${statusColor}\`}>{status}</span>}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={\`px-4 py-2 rounded-lg text-sm font-medium \${activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}\`}
          >
            History ({history.length})
          </button>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 min-h-64">
          {activeTab === 'response' && (
            response ? (
              <pre className="text-green-400 font-mono text-sm overflow-auto whitespace-pre-wrap">{response}</pre>
            ) : (
              <p className="text-gray-500 text-center mt-8">Send a request to see the response</p>
            )
          )}
          {activeTab === 'history' && (
            history.length > 0 ? (
              <div className="space-y-2">
                {history.map(req => (
                  <div key={req.id} className="flex items-center gap-3 p-2 bg-gray-700 rounded-lg text-sm">
                    <span className={\`px-2 py-0.5 rounded text-xs font-mono font-bold \${METHOD_COLORS[req.method]}\`}>
                      {req.method}
                    </span>
                    <span className="flex-1 font-mono text-gray-300 truncate">{req.url}</span>
                    <span className={req.status < 300 ? 'text-green-400' : 'text-red-400'}>{req.status}</span>
                    <span className="text-gray-500">{req.duration}ms</span>
                    <span className="text-gray-600">{req.timestamp}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center mt-8">No requests yet</p>
            )
          )}
        </div>
      </div>
    </div>
  )
}`,
      },
    ],
  },
  {
    id: 'chat-ui',
    name: 'Real-Time Chat UI',
    description: 'A polished chat interface with simulated messages, typing indicators, and message history.',
    language: 'react-typescript',
    files: [
      {
        name: 'App.tsx',
        language: 'tsx',
        content: `import { useState, useEffect, useRef } from 'react'

interface Message {
  id: string
  text: string
  sender: string
  timestamp: string
  isOwn: boolean
}

const BOT_RESPONSES = [
  "That's interesting! Tell me more.",
  "I totally agree with that!",
  "Great point! Have you considered the other side?",
  "I'm not sure about that, but let's explore it.",
  "Absolutely! What do you think we should do next?",
  "That's a fascinating perspective!",
]

export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey! Welcome to the chat 👋',
      sender: 'Alex',
      timestamp: '10:00 AM',
      isOwn: false,
    },
  ])
  const [input, setInput] = useState('')
  const [username] = useState('You')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = () => {
    if (!input.trim()) return

    const msg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: username,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    }

    setMessages(prev => [...prev, msg])
    setInput('')

    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)],
        sender: 'Alex',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: false,
      }])
    }, 1500)
  }

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-white shadow-xl">
      <div className="bg-blue-600 text-white p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center font-bold">A</div>
        <div>
          <h2 className="font-semibold">Alex</h2>
          <p className="text-xs text-blue-200">Online</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map(msg => (
          <div key={msg.id} className={\`flex \${msg.isOwn ? 'justify-end' : 'justify-start'}\`}>
            <div className={\`max-w-xs px-4 py-2 rounded-2xl text-sm \${
              msg.isOwn
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-white text-gray-800 shadow rounded-bl-sm'
            }\`}>
              <p>{msg.text}</p>
              <p className={\`text-xs mt-1 \${msg.isOwn ? 'text-blue-200' : 'text-gray-400'}\`}>{msg.timestamp}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white shadow rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700"
        >
          ➤
        </button>
      </div>
    </div>
  )
}`,
      },
    ],
  },
  {
    id: 'expense-tracker',
    name: 'Expense Tracker',
    description: 'Track income and expenses with categories, charts, and monthly summaries.',
    language: 'react-typescript',
    files: [
      {
        name: 'App.tsx',
        language: 'tsx',
        content: `import { useState } from 'react'

type TransactionType = 'income' | 'expense'

interface Transaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  category: string
  date: string
}

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investment', 'Other Income'],
  expense: ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Other'],
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', description: 'Monthly Salary', amount: 3500, type: 'income', category: 'Salary', date: '2024-01-01' },
  { id: '2', description: 'Rent', amount: 1200, type: 'expense', category: 'Housing', date: '2024-01-02' },
  { id: '3', description: 'Groceries', amount: 150, type: 'expense', category: 'Food', date: '2024-01-05' },
  { id: '4', description: 'Freelance Project', amount: 800, type: 'income', category: 'Freelance', date: '2024-01-10' },
  { id: '5', description: 'Netflix', amount: 15, type: 'expense', category: 'Entertainment', date: '2024-01-12' },
]

export default function ExpenseTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS)
  const [form, setForm] = useState({ description: '', amount: '', type: 'expense' as TransactionType, category: 'Food' })
  const [filter, setFilter] = useState<'all' | TransactionType>('all')

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance = totalIncome - totalExpenses

  const addTransaction = () => {
    if (!form.description || !form.amount) return
    setTransactions([{
      id: Date.now().toString(),
      description: form.description,
      amount: parseFloat(form.amount),
      type: form.type,
      category: form.category,
      date: new Date().toISOString().split('T')[0],
    }, ...transactions])
    setForm({ description: '', amount: '', type: 'expense', category: 'Food' })
  }

  const filtered = transactions.filter(t => filter === 'all' || t.type === filter)

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">💰 Expense Tracker</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-sm text-blue-600">Balance</p>
          <p className={\`text-2xl font-bold \${balance >= 0 ? 'text-blue-700' : 'text-red-600'}\`}>\${balance.toFixed(2)}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-sm text-green-600">Income</p>
          <p className="text-2xl font-bold text-green-700">+\${totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-sm text-red-600">Expenses</p>
          <p className="text-2xl font-bold text-red-700">-\${totalExpenses.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold">Add Transaction</h2>
        <div className="grid grid-cols-2 gap-2">
          <input
            placeholder="Description"
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
            className="border rounded-lg px-3 py-2 col-span-2"
          />
          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={e => setForm({...form, amount: e.target.value})}
            className="border rounded-lg px-3 py-2"
          />
          <select
            value={form.type}
            onChange={e => setForm({...form, type: e.target.value as TransactionType, category: CATEGORIES[e.target.value as TransactionType][0]})}
            className="border rounded-lg px-3 py-2"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            value={form.category}
            onChange={e => setForm({...form, category: e.target.value})}
            className="border rounded-lg px-3 py-2"
          >
            {CATEGORIES[form.type].map(c => <option key={c}>{c}</option>)}
          </select>
          <button
            onClick={addTransaction}
            className="bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 col-start-2"
          >
            Add
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          {(['all', 'income', 'expense'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={\`px-3 py-1 rounded-full text-sm capitalize \${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100'}\`}>
              {f}
            </button>
          ))}
        </div>
        {filtered.map(t => (
          <div key={t.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
            <div>
              <p className="font-medium">{t.description}</p>
              <p className="text-xs text-gray-400">{t.category} · {t.date}</p>
            </div>
            <span className={\`font-semibold \${t.type === 'income' ? 'text-green-600' : 'text-red-600'}\`}>
              {t.type === 'income' ? '+' : '-'}\${t.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}`,
      },
    ],
  },
]
