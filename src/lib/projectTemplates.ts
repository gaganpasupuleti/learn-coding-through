import type { ProjectTemplate } from '@/types'

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'react-todo-app',
    name: 'React Todo App',
    description: 'A clean starting point for building todo/task management apps with React and TypeScript.',
    language: 'react-typescript',
    files: [
      {
        name: 'App.tsx',
        language: 'tsx',
        content: `import { useState } from 'react'

interface Task {
  id: string
  title: string
  completed: boolean
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [input, setInput] = useState('')

  const addTask = () => {
    if (!input.trim()) return
    setTasks([...tasks, { id: Date.now().toString(), title: input, completed: false }])
    setInput('')
  }

  const toggleTask = (id: string) =>
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-4">My Todo App</h1>
      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="Add task..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button onClick={addTask} className="bg-blue-500 text-white px-4 py-2 rounded">Add</button>
      </div>
      <ul className="space-y-2">
        {tasks.map(task => (
          <li key={task.id} className="flex items-center gap-3 p-2 border rounded cursor-pointer"
              onClick={() => toggleTask(task.id)}>
            <input type="checkbox" checked={task.completed} readOnly className="w-4 h-4" />
            <span className={task.completed ? 'line-through text-gray-400' : ''}>{task.title}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}`,
      },
      {
        name: 'index.css',
        language: 'css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
      },
    ],
  },
  {
    id: 'weather-dashboard',
    name: 'Weather Dashboard',
    description: 'Starter template for a weather app with mock data and clean UI.',
    language: 'react-typescript',
    files: [
      {
        name: 'App.tsx',
        language: 'tsx',
        content: `import { useState } from 'react'

interface WeatherData {
  city: string
  temp: number
  condition: string
  humidity: number
  windSpeed: number
  icon: string
}

const MOCK_DATA: Record<string, WeatherData> = {
  london: { city: 'London', temp: 15, condition: 'Cloudy', humidity: 72, windSpeed: 12, icon: '☁️' },
  tokyo: { city: 'Tokyo', temp: 22, condition: 'Sunny', humidity: 55, windSpeed: 8, icon: '☀️' },
  'new york': { city: 'New York', temp: 18, condition: 'Partly Cloudy', humidity: 65, windSpeed: 15, icon: '⛅' },
}

export default function WeatherDashboard() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [error, setError] = useState('')

  const search = () => {
    const data = MOCK_DATA[city.toLowerCase()]
    if (data) {
      setWeather(data)
      setError('')
    } else {
      setError('City not found. Try: London, Tokyo, or New York')
      setWeather(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Weather Dashboard</h1>
        <div className="flex gap-2 mb-6">
          <input
            value={city}
            onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Enter city name..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button onClick={search} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Search
          </button>
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {weather && (
          <div className="text-center space-y-3">
            <div className="text-6xl">{weather.icon}</div>
            <h2 className="text-3xl font-bold text-gray-800">{weather.city}</h2>
            <p className="text-5xl font-light text-blue-600">{weather.temp}°C</p>
            <p className="text-gray-600 text-lg">{weather.condition}</p>
            <div className="flex justify-around pt-4 border-t">
              <div><p className="text-gray-500 text-sm">Humidity</p><p className="font-semibold">{weather.humidity}%</p></div>
              <div><p className="text-gray-500 text-sm">Wind</p><p className="font-semibold">{weather.windSpeed} km/h</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}`,
      },
    ],
  },
  {
    id: 'blank-react',
    name: 'Blank React App',
    description: 'A minimal React + TypeScript starter with Tailwind CSS pre-configured.',
    language: 'react-typescript',
    files: [
      {
        name: 'App.tsx',
        language: 'tsx',
        content: `export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Hello, World!</h1>
        <p className="text-gray-600">Start editing App.tsx to build your app.</p>
      </div>
    </div>
  )
}`,
      },
    ],
  },
  {
    id: 'data-visualization-recharts',
    name: 'Data Visualization with Recharts',
    description: 'Starter template for building data dashboards with Recharts.',
    language: 'react-typescript',
    files: [
      {
        name: 'App.tsx',
        language: 'tsx',
        content: `import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const salesData = [
  { month: 'Jan', revenue: 4000, expenses: 2400 },
  { month: 'Feb', revenue: 3000, expenses: 1398 },
  { month: 'Mar', revenue: 5000, expenses: 3200 },
  { month: 'Apr', revenue: 4500, expenses: 2800 },
  { month: 'May', revenue: 6000, expenses: 3500 },
  { month: 'Jun', revenue: 5500, expenses: 3000 },
]

export default function Dashboard() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Sales Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Monthly Revenue vs Expenses</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#3B82F6" />
              <Bar dataKey="expenses" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}`,
      },
    ],
  },
  {
    id: 'product-listing',
    name: 'Product Listing with Filter',
    description: 'E-commerce style product grid with search and category filter.',
    language: 'react-typescript',
    files: [
      {
        name: 'App.tsx',
        language: 'tsx',
        content: `import { useState } from 'react'

interface Product {
  id: number
  name: string
  category: string
  price: number
  rating: number
  image: string
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: 79.99, rating: 4.5, image: '🎧' },
  { id: 2, name: 'Running Shoes', category: 'Sports', price: 120.00, rating: 4.8, image: '👟' },
  { id: 3, name: 'Coffee Maker', category: 'Kitchen', price: 49.99, rating: 4.2, image: '☕' },
  { id: 4, name: 'Yoga Mat', category: 'Sports', price: 35.00, rating: 4.6, image: '🧘' },
  { id: 5, name: 'Smart Watch', category: 'Electronics', price: 199.99, rating: 4.7, image: '⌚' },
  { id: 6, name: 'Blender', category: 'Kitchen', price: 65.00, rating: 4.3, image: '🥤' },
]

const CATEGORIES = ['All', 'Electronics', 'Sports', 'Kitchen']

export default function App() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState<'price' | 'rating'>('rating')

  const filtered = PRODUCTS
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => category === 'All' || p.category === category)
    .sort((a, b) => sortBy === 'price' ? a.price - b.price : b.rating - a.rating)

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Product Store</h1>
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="border rounded-lg px-4 py-2 flex-1 min-w-48"
        />
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="border rounded-lg px-4 py-2">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as 'price' | 'rating')}
          className="border rounded-lg px-4 py-2">
          <option value="rating">Sort by Rating</option>
          <option value="price">Sort by Price</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(product => (
          <div key={product.id} className="border rounded-xl p-4 hover:shadow-lg transition-shadow">
            <div className="text-5xl text-center mb-3">{product.image}</div>
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-gray-500 text-sm">{product.category}</p>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xl font-bold text-blue-600">\${product.price}</span>
              <span className="text-yellow-500">★ {product.rating}</span>
            </div>
            <button className="w-full mt-3 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
              Add to Cart
            </button>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-12">No products found</p>
      )}
    </div>
  )
}`,
      },
    ],
  },
]
