export interface CodeFile {
  name: string
  content: string
  language: string
}

export interface TechStack {
  name: string
  icon?: string
  color?: string
}

export interface Step {
  id: number
  title: string
  type: 'understanding' | 'logic' | 'code' | 'preview' | 'challenge'
  content: {
    description?: string
    points?: string[]
    code?: string
    language?: string
    challenge?: string
    hint?: string
    walkthroughGif?: string
    walkthroughCaption?: string
  }
  contentMd?: string
  deliverableDescription?: string
  template?: CodeFile[]
}

export interface Project {
  id: string
  title: string
  description: string
  shortDescription: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  steps: Step[]
  category?: 'web-app' | 'api' | 'cli-tool' | 'data-pipeline' | 'mobile-app'
  tags?: string[]
  techStack?: TechStack[]
  seriesId?: string
}

export const projects: Project[] = [
  // ─── Project 1: Task Master ───────────────────────────────────────────────
  {
    id: 'task-master-todo',
    title: 'Task Master - Smart Todo App',
    shortDescription: 'Build a feature-rich todo app with priorities, filtering, and real-time task management.',
    description: 'Create a polished todo application with task priorities, filtering, and a clean UI. Learn React hooks, state management, and TypeScript interfaces through a practical project.',
    difficulty: 'beginner',
    estimatedTime: '2-3 hours',
    category: 'web-app',
    tags: ['react', 'typescript', 'hooks', 'state-management'],
    techStack: [
      { name: 'React', icon: '⚛️', color: '#61DAFB' },
      { name: 'TypeScript', icon: '🔷', color: '#3178C6' },
      { name: 'Tailwind CSS', icon: '🎨', color: '#06B6D4' },
    ],
    steps: [
      {
        id: 1,
        title: 'Understanding the Problem',
        type: 'understanding',
        content: {
          description: 'A smart todo app helps users manage tasks with priorities and filters. Unlike a simple list, it lets you categorize work by urgency and track what\'s done vs. pending.',
          points: [
            'Tasks need a title, completion status, and priority level (low / medium / high)',
            'Users should be able to add new tasks, mark them complete, and delete them',
            'Filtering lets users focus on "active" or "completed" tasks separately',
            'Priority colors give instant visual feedback on what needs attention first',
            'A task counter shows how many items are still pending',
          ],
        },
        contentMd: '## What is a Todo App?\n\nA smart todo app is more than a simple checklist. It lets you prioritize work, filter views, and track progress—skills that directly map to real product features.',
        deliverableDescription: 'Understand the core feature set of a task management app.',
      },
      {
        id: 2,
        title: 'Breaking Down the Logic',
        type: 'logic',
        content: {
          description: 'Model the data and define the state transitions before writing any UI.',
          points: [
            'Define a Task interface: id (string), title (string), completed (boolean), priority (low|medium|high), createdAt (string)',
            'Use useState<Task[]> to hold the task list; derive filtered views with .filter()',
            'addTask() creates a new Task object and appends it to the array',
            'toggleTask() maps over tasks and flips the completed flag for the matching id',
            'deleteTask() filters out the task with the matching id',
            'The filter state (all|active|completed) drives which tasks are shown without mutating the source array',
          ],
        },
        contentMd: '## Data Modeling\n\nBefore coding, define your data shape. A well-typed `Task` interface prevents bugs and makes refactoring safe.',
        deliverableDescription: 'Sketch the Task interface and state update functions.',
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        content: {
          language: 'typescript',
          points: [
            'useState manages the tasks array and the current filter selection',
            'The addTask function validates input and appends a new Task with Date.now() as a unique id',
            'toggleTask uses .map() to immutably update a single task\'s completed flag',
            'The filtered constant derives the visible task list from the full array without mutation',
            'priorityColors maps each priority level to Tailwind classes for visual differentiation',
          ],
          code: `import { useState } from 'react'

type Priority = 'low' | 'medium' | 'high'
type FilterType = 'all' | 'active' | 'completed'

interface Task {
  id: string
  title: string
  completed: boolean
  priority: Priority
  createdAt: string
}

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Learn React hooks', completed: false, priority: 'high', createdAt: new Date().toISOString() },
    { id: '2', title: 'Build a todo app', completed: false, priority: 'medium', createdAt: new Date().toISOString() },
    { id: '3', title: 'Deploy to production', completed: false, priority: 'low', createdAt: new Date().toISOString() },
  ])
  const [newTask, setNewTask] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [filter, setFilter] = useState<FilterType>('all')

  const addTask = () => {
    if (!newTask.trim()) return
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.trim(),
      completed: false,
      priority,
      createdAt: new Date().toISOString(),
    }
    setTasks([...tasks, task])
    setNewTask('')
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const filtered = tasks.filter(t => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const priorityColors: Record<Priority, string> = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200',
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Task Master</h1>

      <div className="flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="Add a new task..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={priority}
          onChange={e => setPriority(e.target.value as Priority)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button
          onClick={addTask}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      <div className="flex gap-2">
        {(['all', 'active', 'completed'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={\`px-4 py-1.5 rounded-full text-sm capitalize \${
              filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }\`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-500 self-center">
          {tasks.filter(t => !t.completed).length} remaining
        </span>
      </div>

      <ul className="space-y-2">
        {filtered.map(task => (
          <li
            key={task.id}
            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="w-5 h-5 accent-blue-600"
            />
            <span className={\`flex-1 \${task.completed ? 'line-through text-gray-400' : ''}\`}>
              {task.title}
            </span>
            <span className={\`text-xs px-2 py-0.5 rounded border \${priorityColors[task.priority]}\`}>
              {task.priority}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-red-400 hover:text-red-600 text-lg leading-none"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-8">No tasks here!</p>
      )}
    </div>
  )
}`,
          walkthroughGif: '',
          walkthroughCaption: 'Add tasks, set priorities, and filter between active and completed.',
        },
        contentMd: '## Building the TodoApp Component\n\nWrite the full component with hooks, derived state, and event handlers.',
        deliverableDescription: 'A working TodoApp component with add, toggle, delete, and filter functionality.',
        template: [
          {
            name: 'App.tsx',
            language: 'tsx',
            content: `import { useState } from 'react'

type Priority = 'low' | 'medium' | 'high'
type FilterType = 'all' | 'active' | 'completed'

interface Task {
  id: string
  title: string
  completed: boolean
  priority: Priority
  createdAt: string
}

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Learn React hooks', completed: false, priority: 'high', createdAt: new Date().toISOString() },
    { id: '2', title: 'Build a todo app', completed: false, priority: 'medium', createdAt: new Date().toISOString() },
    { id: '3', title: 'Deploy to production', completed: false, priority: 'low', createdAt: new Date().toISOString() },
  ])
  const [newTask, setNewTask] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [filter, setFilter] = useState<FilterType>('all')

  const addTask = () => {
    if (!newTask.trim()) return
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.trim(),
      completed: false,
      priority,
      createdAt: new Date().toISOString(),
    }
    setTasks([...tasks, task])
    setNewTask('')
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const filtered = tasks.filter(t => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const priorityColors: Record<Priority, string> = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200',
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Task Master</h1>
      <div className="flex gap-2">
        <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()} placeholder="Add a new task..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select value={priority} onChange={e => setPriority(e.target.value as Priority)}
          className="border rounded-lg px-3 py-2">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button onClick={addTask} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add</button>
      </div>
      <div className="flex gap-2">
        {(['all', 'active', 'completed'] as FilterType[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={\`px-4 py-1.5 rounded-full text-sm capitalize \${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100'}\`}>{f}</button>
        ))}
        <span className="ml-auto text-sm text-gray-500 self-center">{tasks.filter(t => !t.completed).length} remaining</span>
      </div>
      <ul className="space-y-2">
        {filtered.map(task => (
          <li key={task.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
            <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} className="w-5 h-5 accent-blue-600" />
            <span className={\`flex-1 \${task.completed ? 'line-through text-gray-400' : ''}\`}>{task.title}</span>
            <span className={\`text-xs px-2 py-0.5 rounded border \${priorityColors[task.priority]}\`}>{task.priority}</span>
            <button onClick={() => deleteTask(task.id)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && <p className="text-center text-gray-400 py-8">No tasks here!</p>}
    </div>
  )
}`,
          },
        ],
      },
      {
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'Your todo app is fully functional. Try adding tasks with different priorities, filtering by status, and deleting completed items.',
        },
        deliverableDescription: 'A live, interactive todo app running in the browser.',
      },
      {
        id: 5,
        title: 'Challenge: Drag & Drop Reordering',
        type: 'challenge',
        content: {
          challenge: 'Add drag-and-drop reordering so users can manually sort tasks by dragging them up and down the list.',
          hint: 'Use the HTML5 Drag and Drop API with onDragStart, onDragOver, and onDrop events. Track the dragged item\'s index and swap positions in the tasks array.',
        },
        deliverableDescription: 'Tasks can be reordered by dragging.',
      },
    ],
  },

  // ─── Project 2: Weather Dashboard ────────────────────────────────────────
  {
    id: 'weather-dashboard',
    title: 'Weather Dashboard with API Integration',
    shortDescription: 'Fetch and display real weather data using the OpenWeatherMap API with loading and error states.',
    description: 'Build a weather dashboard that fetches live data from an external API. Learn async/await, loading states, error handling, and TypeScript interfaces for API responses.',
    difficulty: 'beginner',
    estimatedTime: '3-4 hours',
    category: 'web-app',
    tags: ['react', 'typescript', 'api', 'fetch', 'async'],
    techStack: [
      { name: 'React', icon: '⚛️', color: '#61DAFB' },
      { name: 'TypeScript', icon: '🔷', color: '#3178C6' },
      { name: 'OpenWeatherMap API', icon: '🌤️', color: '#EB6E4B' },
    ],
    steps: [
      {
        id: 1,
        title: 'Understanding APIs and Weather Data',
        type: 'understanding',
        content: {
          description: 'An API (Application Programming Interface) is a service that lets your app request data from a remote server. Weather APIs return structured JSON with temperature, conditions, and more.',
          points: [
            'APIs communicate over HTTP using methods like GET, POST, PUT, DELETE',
            'Responses are typically JSON: { "main": { "temp": 15, "humidity": 72 }, "weather": [{ "description": "cloudy" }] }',
            'Every API request can succeed (200 OK) or fail (404 Not Found, 401 Unauthorized)',
            'Async/await lets you write asynchronous code that reads like synchronous code',
            'Loading states prevent showing stale data while a request is in flight',
          ],
        },
        deliverableDescription: 'Understand API concepts, HTTP, and JSON data structure.',
      },
      {
        id: 2,
        title: 'Data Flow Architecture',
        type: 'logic',
        content: {
          description: 'Plan the data flow: user input → fetch → parse → render. Handle all three states: loading, success, and error.',
          points: [
            'State: city (string), weather (WeatherData | null), loading (boolean), error (string)',
            'fetchWeather() sets loading=true, calls the API, parses JSON, sets weather or error, sets loading=false',
            'Define a WeatherData interface matching the API response shape for type safety',
            'Use a mock data fallback so the tutorial works without a real API key',
            'Error handling: try/catch around the fetch call; display the error message to the user',
          ],
        },
        deliverableDescription: 'Design the state model and async data flow.',
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        content: {
          language: 'typescript',
          points: [
            'WeatherData interface types the API response for compile-time safety',
            'WEATHER_DATA object simulates an API so the tutorial works without a real key',
            'fetchWeather uses async/await and simulates network latency with setTimeout',
            'Loading state shows a spinner; error state shows a helpful message',
            'The weather card only renders when data is available, preventing null reference errors',
          ],
          code: `import { useState } from 'react'

interface WeatherData {
  city: string
  temp: number
  feelsLike: number
  condition: string
  humidity: number
  windSpeed: number
  icon: string
}

const WEATHER_DATA: Record<string, WeatherData> = {
  london: { city: 'London', temp: 15, feelsLike: 12, condition: 'Cloudy', humidity: 72, windSpeed: 12, icon: '☁️' },
  tokyo: { city: 'Tokyo', temp: 22, feelsLike: 21, condition: 'Sunny', humidity: 55, windSpeed: 8, icon: '☀️' },
  'new york': { city: 'New York', temp: 18, feelsLike: 16, condition: 'Partly Cloudy', humidity: 65, windSpeed: 15, icon: '⛅' },
  paris: { city: 'Paris', temp: 13, feelsLike: 10, condition: 'Rainy', humidity: 80, windSpeed: 20, icon: '🌧️' },
}

export default function WeatherDashboard() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchWeather = async () => {
    if (!city.trim()) return
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 800))
    const data = WEATHER_DATA[city.toLowerCase()]
    if (data) {
      setWeather(data)
    } else {
      setError('City not found. Try: London, Tokyo, New York, or Paris')
      setWeather(null)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">🌤️ Weather Dashboard</h1>
        <div className="flex gap-2 mb-6">
          <input value={city} onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchWeather()}
            placeholder="Enter city..." className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <button onClick={fetchWeather} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            {loading ? '...' : 'Go'}
          </button>
        </div>
        {error && <p className="text-red-500 text-center text-sm mb-4">{error}</p>}
        {weather && (
          <div className="text-center space-y-3">
            <div className="text-6xl">{weather.icon}</div>
            <h2 className="text-2xl font-bold text-gray-800">{weather.city}</h2>
            <p className="text-5xl font-light text-blue-600">{weather.temp}°C</p>
            <p className="text-gray-500">Feels like {weather.feelsLike}°C · {weather.condition}</p>
            <div className="flex justify-around pt-4 border-t">
              <div><p className="text-gray-400 text-xs uppercase">Humidity</p><p className="font-semibold text-lg">{weather.humidity}%</p></div>
              <div><p className="text-gray-400 text-xs uppercase">Wind</p><p className="font-semibold text-lg">{weather.windSpeed} km/h</p></div>
            </div>
          </div>
        )}
        {!weather && !error && <p className="text-center text-gray-400 py-4">Search for a city to see weather</p>}
      </div>
    </div>
  )
}`,
          walkthroughGif: '',
          walkthroughCaption: 'Search for London, Tokyo, New York, or Paris to see weather data.',
        },
        deliverableDescription: 'A weather dashboard with search, loading, error, and data display states.',
        template: [
          {
            name: 'App.tsx',
            language: 'tsx',
            content: `import { useState } from 'react'

interface WeatherData {
  city: string
  temp: number
  feelsLike: number
  condition: string
  humidity: number
  windSpeed: number
  icon: string
}

const WEATHER_DATA: Record<string, WeatherData> = {
  london: { city: 'London', temp: 15, feelsLike: 12, condition: 'Cloudy', humidity: 72, windSpeed: 12, icon: '☁️' },
  tokyo: { city: 'Tokyo', temp: 22, feelsLike: 21, condition: 'Sunny', humidity: 55, windSpeed: 8, icon: '☀️' },
  'new york': { city: 'New York', temp: 18, feelsLike: 16, condition: 'Partly Cloudy', humidity: 65, windSpeed: 15, icon: '⛅' },
  paris: { city: 'Paris', temp: 13, feelsLike: 10, condition: 'Rainy', humidity: 80, windSpeed: 20, icon: '🌧️' },
}

export default function WeatherDashboard() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchWeather = async () => {
    if (!city.trim()) return
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 800))
    const data = WEATHER_DATA[city.toLowerCase()]
    if (data) { setWeather(data) } else {
      setError('City not found. Try: London, Tokyo, New York, or Paris')
      setWeather(null)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">🌤️ Weather Dashboard</h1>
        <div className="flex gap-2 mb-6">
          <input value={city} onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchWeather()} placeholder="Enter city..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <button onClick={fetchWeather} className="bg-blue-500 text-white px-4 py-2 rounded-lg">{loading ? '...' : 'Go'}</button>
        </div>
        {error && <p className="text-red-500 text-center text-sm mb-4">{error}</p>}
        {weather && (
          <div className="text-center space-y-3">
            <div className="text-6xl">{weather.icon}</div>
            <h2 className="text-2xl font-bold">{weather.city}</h2>
            <p className="text-5xl font-light text-blue-600">{weather.temp}°C</p>
            <p className="text-gray-500">Feels like {weather.feelsLike}°C · {weather.condition}</p>
            <div className="flex justify-around pt-4 border-t">
              <div><p className="text-xs text-gray-400 uppercase">Humidity</p><p className="font-semibold">{weather.humidity}%</p></div>
              <div><p className="text-xs text-gray-400 uppercase">Wind</p><p className="font-semibold">{weather.windSpeed} km/h</p></div>
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
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'Search for London, Tokyo, New York, or Paris to see the weather dashboard populate with data. Notice the loading state and error handling.',
        },
        deliverableDescription: 'Live weather dashboard with all states visible.',
      },
      {
        id: 5,
        title: 'Challenge: 5-Day Forecast & Unit Toggle',
        type: 'challenge',
        content: {
          challenge: 'Extend the dashboard with a 5-day forecast row below the current weather card. Also add a °C / °F toggle button.',
          hint: 'Add a forecast array to each city\'s mock data. For the toggle, store a unit state and derive the displayed temperature with: unit === "F" ? Math.round(temp * 9/5 + 32) : temp',
        },
        deliverableDescription: 'Dashboard shows 5-day forecast and supports Celsius/Fahrenheit toggle.',
      },
    ],
  },

  // ─── Project 3: E-commerce Product Filter ─────────────────────────────────
  {
    id: 'ecommerce-product-filter',
    title: 'E-commerce Product Filter',
    shortDescription: 'Build a product listing page with search, category filters, price range, and sorting.',
    description: 'Create a fully-featured product filter page like you\'d find on Amazon or eBay. Practice derived state, useMemo for performance, and multi-dimensional filtering in React.',
    difficulty: 'intermediate',
    estimatedTime: '4-5 hours',
    category: 'web-app',
    tags: ['react', 'typescript', 'filtering', 'sorting', 'search'],
    techStack: [
      { name: 'React', icon: '⚛️', color: '#61DAFB' },
      { name: 'TypeScript', icon: '🔷', color: '#3178C6' },
      { name: 'Tailwind CSS', icon: '🎨', color: '#06B6D4' },
    ],
    steps: [
      {
        id: 1,
        title: 'Understanding Product Filtering',
        type: 'understanding',
        content: {
          description: 'Product filtering combines multiple constraints simultaneously: text search, category selection, price range, availability, and sort order—all applied together.',
          points: [
            'Filtering is non-destructive: the source data never changes, only the derived view',
            'Multiple filters compose: each filter narrows the result of the previous one',
            'Sorting is separate from filtering—it orders the already-filtered results',
            'useMemo caches the filtered result so it only recalculates when dependencies change',
            'An empty filter state should show all products (sensible defaults matter)',
          ],
        },
        deliverableDescription: 'Understand multi-dimensional filtering and derived state.',
      },
      {
        id: 2,
        title: 'Filter State Architecture',
        type: 'logic',
        content: {
          description: 'Each filter dimension becomes its own state variable. The filtered result is derived by chaining .filter() calls and a final .sort().',
          points: [
            'Product interface: id, name, category, price, rating, image, inStock',
            'Filter state: search (string), category (string), maxPrice (number), inStockOnly (boolean), sortBy (enum)',
            'Derived filtered array: filter by text → filter by category → filter by price → filter by stock → sort',
            'useMemo wraps the derived computation with [search, category, maxPrice, sortBy, inStockOnly] as deps',
            'Count of filtered results gives useful feedback: "8 products found"',
          ],
        },
        deliverableDescription: 'Plan the filter state and derived computation.',
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        content: {
          language: 'typescript',
          points: [
            'useMemo wraps the filter chain—it only recomputes when filter state changes, not on every render',
            'Multiple .filter() calls chain cleanly: each returns a new array for the next filter to process',
            'The sidebar layout separates filter controls from the product grid for clear UX',
            'Disabled button and reduced opacity communicate out-of-stock status accessibly',
            'Sort options in the select map to comparison functions in the .sort() call',
          ],
          code: `import { useState, useMemo } from 'react'

interface Product {
  id: number
  name: string
  category: string
  price: number
  rating: number
  image: string
  inStock: boolean
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: 79.99, rating: 4.5, image: '🎧', inStock: true },
  { id: 2, name: 'Running Shoes', category: 'Sports', price: 120.00, rating: 4.8, image: '👟', inStock: true },
  { id: 3, name: 'Coffee Maker', category: 'Kitchen', price: 49.99, rating: 4.2, image: '☕', inStock: false },
  { id: 4, name: 'Yoga Mat', category: 'Sports', price: 35.00, rating: 4.6, image: '🧘', inStock: true },
  { id: 5, name: 'Smart Watch', category: 'Electronics', price: 199.99, rating: 4.7, image: '⌚', inStock: true },
  { id: 6, name: 'Blender', category: 'Kitchen', price: 65.00, rating: 4.3, image: '🥤', inStock: true },
  { id: 7, name: 'Basketball', category: 'Sports', price: 29.99, rating: 4.4, image: '🏀', inStock: false },
  { id: 8, name: 'Laptop Stand', category: 'Electronics', price: 45.00, rating: 4.6, image: '💻', inStock: true },
]

const CATEGORIES = ['All', 'Electronics', 'Sports', 'Kitchen']

export default function ProductFilter() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [maxPrice, setMaxPrice] = useState(300)
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rating'>('rating')
  const [inStockOnly, setInStockOnly] = useState(false)

  const filtered = useMemo(() => {
    return PRODUCTS
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      .filter(p => category === 'All' || p.category === category)
      .filter(p => p.price <= maxPrice)
      .filter(p => !inStockOnly || p.inStock)
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price
        if (sortBy === 'price-desc') return b.price - a.price
        return b.rating - a.rating
      })
  }, [search, category, maxPrice, sortBy, inStockOnly])

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🛒 Product Store</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-4">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search..." className="w-full border rounded-lg px-3 py-2" />
          <div>
            <p className="font-medium mb-2">Category</p>
            {CATEGORIES.map(c => (
              <label key={c} className="flex items-center gap-2 py-1 cursor-pointer">
                <input type="radio" name="category" checked={category === c} onChange={() => setCategory(c)} />
                {c}
              </label>
            ))}
          </div>
          <div>
            <p className="font-medium mb-2">Max Price: \${maxPrice}</p>
            <input type="range" min="0" max="300" value={maxPrice}
              onChange={e => setMaxPrice(+e.target.value)} className="w-full" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} />
            In Stock Only
          </label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="w-full border rounded-lg px-3 py-2">
            <option value="rating">Top Rated</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
        <div className="md:col-span-3">
          <p className="text-gray-500 mb-4">{filtered.length} products found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => (
              <div key={p.id} className={\`border rounded-xl p-4 \${!p.inStock ? 'opacity-60' : 'hover:shadow-lg'} transition-shadow\`}>
                <div className="text-4xl text-center mb-3">{p.image}</div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-gray-400 text-sm">{p.category}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-blue-600">\${p.price}</span>
                  <span className="text-yellow-500 text-sm">★ {p.rating}</span>
                </div>
                {!p.inStock && <p className="text-red-400 text-xs mt-1">Out of stock</p>}
                <button disabled={!p.inStock}
                  className="w-full mt-2 bg-blue-500 text-white py-1.5 rounded-lg text-sm disabled:bg-gray-300">
                  {p.inStock ? 'Add to Cart' : 'Unavailable'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}`,
        },
        deliverableDescription: 'Product filter page with all filter dimensions working together.',
        template: [
          {
            name: 'App.tsx',
            language: 'tsx',
            content: `import { useState, useMemo } from 'react'

interface Product {
  id: number; name: string; category: string
  price: number; rating: number; image: string; inStock: boolean
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: 79.99, rating: 4.5, image: '🎧', inStock: true },
  { id: 2, name: 'Running Shoes', category: 'Sports', price: 120.00, rating: 4.8, image: '👟', inStock: true },
  { id: 3, name: 'Coffee Maker', category: 'Kitchen', price: 49.99, rating: 4.2, image: '☕', inStock: false },
  { id: 4, name: 'Yoga Mat', category: 'Sports', price: 35.00, rating: 4.6, image: '🧘', inStock: true },
  { id: 5, name: 'Smart Watch', category: 'Electronics', price: 199.99, rating: 4.7, image: '⌚', inStock: true },
]

export default function ProductFilter() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const filtered = useMemo(() =>
    PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
             .filter(p => category === 'All' || p.category === category),
  [search, category])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Product Store</h1>
      <div className="flex gap-3 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
          className="border rounded px-3 py-2 flex-1" />
        <select value={category} onChange={e => setCategory(e.target.value)} className="border rounded px-3 py-2">
          {['All', 'Electronics', 'Sports', 'Kitchen'].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="border rounded-xl p-4">
            <div className="text-4xl text-center mb-2">{p.image}</div>
            <h3 className="font-semibold">{p.name}</h3>
            <p className="font-bold text-blue-600">\${p.price}</p>
          </div>
        ))}
      </div>
    </div>
  )
}`,
          },
        ],
      },
      {
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'Try the filter sidebar: search for a product, switch categories, drag the price slider, and toggle "In Stock Only". All filters compose simultaneously.',
        },
        deliverableDescription: 'Interactive product filter page with real-time filtering.',
      },
      {
        id: 5,
        title: 'Challenge: Shopping Cart with Quantity',
        type: 'challenge',
        content: {
          challenge: 'Add a shopping cart sidebar. Clicking "Add to Cart" should add the product (or increment its quantity). Show total item count and total price. Allow removing items.',
          hint: 'Use a Map<number, { product: Product, quantity: number }> or an array for cart state. The total is cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)',
        },
        deliverableDescription: 'Product filter with a working shopping cart.',
      },
    ],
  },

  // ─── Project 4: Real-time Chat App ────────────────────────────────────────
  {
    id: 'realtime-chat-app',
    title: 'Real-time Chat Application',
    shortDescription: 'Build a multi-user chat UI with simulated real-time messages, typing indicators, and user presence.',
    description: 'Create a polished chat application with simulated real-time messaging. Learn WebSocket concepts, message threading, typing indicators, and scroll behavior.',
    difficulty: 'advanced',
    estimatedTime: '6-8 hours',
    category: 'web-app',
    tags: ['react', 'typescript', 'websockets', 'real-time'],
    techStack: [
      { name: 'React', icon: '⚛️', color: '#61DAFB' },
      { name: 'TypeScript', icon: '🔷', color: '#3178C6' },
      { name: 'WebSockets', icon: '🔌', color: '#8B5CF6' },
    ],
    steps: [
      {
        id: 1,
        title: 'Understanding Real-time Communication',
        type: 'understanding',
        content: {
          description: 'Real-time apps need a persistent connection between client and server. WebSockets provide a bidirectional channel that stays open, unlike HTTP which closes after each request.',
          points: [
            'HTTP is request/response: client asks, server answers, connection closes',
            'WebSockets maintain an open TCP connection for continuous two-way messaging',
            'Events arrive as JSON messages; the client and server agree on a message schema',
            'Presence (online/offline) is tracked by connection state, not polling',
            'Typing indicators require debounced "is typing" events sent over the socket',
          ],
        },
        deliverableDescription: 'Understand WebSocket vs HTTP and real-time patterns.',
      },
      {
        id: 2,
        title: 'Chat Data Model',
        type: 'logic',
        content: {
          description: 'Design the message schema, user model, and event types before building the UI.',
          points: [
            'Message: id, text, user, time, isOwn (derived from sender === currentUser)',
            'User: name, status (online | offline), color (for avatar)',
            'Events: message_sent, message_received, user_typing, user_stopped_typing',
            'State: messages array, input string, typing indicator (string | null)',
            'useRef for the messages container enables smooth auto-scroll to the latest message',
          ],
        },
        deliverableDescription: 'Define message schema and event model.',
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        content: {
          language: 'typescript',
          points: [
            'useRef + scrollIntoView auto-scrolls to the latest message after every update',
            'Simulated bot responses demonstrate the async message receive pattern',
            'The typing indicator appears for 1.2 seconds then resolves to a new message',
            'A sidebar shows online/offline user presence with color-coded avatars',
            'isOwn flag drives which side of the chat the message bubble appears on',
          ],
          code: `import { useState, useEffect, useRef } from 'react'

interface Message {
  id: string; text: string; user: string; time: string; isOwn: boolean
}
interface User { name: string; status: 'online' | 'offline'; color: string }

const USERS: User[] = [
  { name: 'Alice', status: 'online', color: 'bg-purple-500' },
  { name: 'Bob', status: 'online', color: 'bg-green-500' },
  { name: 'Carol', status: 'offline', color: 'bg-orange-500' },
]

const BOT_MESSAGES = [
  'Hey there! 👋', "How's your project going?", 'Looking good!',
  'Need any help?', 'Great progress!', 'Keep it up! 🚀',
]

export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Welcome to the chat room! 🎉', user: 'Alice', time: '10:00', isOwn: false },
    { id: '2', text: 'Hey everyone!', user: 'Bob', time: '10:01', isOwn: false },
  ])
  const [input, setInput] = useState('')
  const [username] = useState('You')
  const [typing, setTyping] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  const send = () => {
    if (!input.trim()) return
    setMessages(p => [...p, {
      id: Date.now().toString(), text: input.trim(), user: username,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isOwn: true,
    }])
    setInput('')
    const responder = USERS.filter(u => u.status === 'online')[Math.floor(Math.random() * 2)]
    setTyping(responder.name)
    setTimeout(() => {
      setTyping(null)
      setMessages(p => [...p, {
        id: (Date.now() + 1).toString(),
        text: BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)],
        user: responder.name,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: false,
      }])
    }, 1200)
  }

  const userColors: Record<string, string> = { Alice: 'bg-purple-500', Bob: 'bg-green-500', You: 'bg-blue-500' }

  return (
    <div className="flex h-screen max-w-3xl mx-auto bg-gray-100">
      <div className="w-48 bg-gray-800 text-white p-4 flex flex-col gap-2">
        <h2 className="font-bold text-lg mb-2">Chat Room</h2>
        {USERS.map(u => (
          <div key={u.name} className="flex items-center gap-2 text-sm">
            <div className={\`w-7 h-7 \${u.color} rounded-full flex items-center justify-center font-bold text-xs\`}>{u.name[0]}</div>
            <div>
              <p>{u.name}</p>
              <p className={\`text-xs \${u.status === 'online' ? 'text-green-400' : 'text-gray-400'}\`}>{u.status}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b p-4 font-semibold">General Channel</div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map(m => (
            <div key={m.id} className={\`flex items-start gap-2 \${m.isOwn ? 'flex-row-reverse' : ''}\`}>
              <div className={\`w-8 h-8 \${userColors[m.user] || 'bg-gray-400'} rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0\`}>{m.user[0]}</div>
              <div className={\`max-w-xs \${m.isOwn ? 'items-end' : 'items-start'} flex flex-col\`}>
                <span className="text-xs text-gray-400 mb-1">{m.isOwn ? 'You' : m.user} · {m.time}</span>
                <div className={\`px-3 py-2 rounded-xl text-sm \${m.isOwn ? 'bg-blue-500 text-white' : 'bg-white shadow'}\`}>{m.text}</div>
              </div>
            </div>
          ))}
          {typing && <p className="text-xs text-gray-400 italic">{typing} is typing...</p>}
          <div ref={endRef} />
        </div>
        <div className="p-4 bg-white border-t flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type a message..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <button onClick={send} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Send</button>
        </div>
      </div>
    </div>
  )
}`,
        },
        deliverableDescription: 'Working chat UI with simulated real-time messages.',
        template: [
          {
            name: 'App.tsx',
            language: 'tsx',
            content: `import { useState, useRef, useEffect } from 'react'

interface Message { id: string; text: string; user: string; isOwn: boolean }

export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Welcome! Start chatting.', user: 'Bot', isOwn: false },
  ])
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = () => {
    if (!input.trim()) return
    setMessages(p => [...p, { id: Date.now().toString(), text: input, user: 'You', isOwn: true }])
    setInput('')
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto">
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {messages.map(m => (
          <div key={m.id} className={\`flex \${m.isOwn ? 'justify-end' : 'justify-start'}\`}>
            <div className={\`px-3 py-2 rounded-xl text-sm \${m.isOwn ? 'bg-blue-500 text-white' : 'bg-white shadow'}\`}>{m.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="p-3 bg-white border-t flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()} placeholder="Message..."
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none" />
        <button onClick={send} className="bg-blue-500 text-white px-4 py-2 rounded-full">Send</button>
      </div>
    </div>
  )
}`,
          },
        ],
      },
      {
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'Send a message and watch Alice or Bob respond after a typing indicator. The sidebar shows who is online.',
        },
        deliverableDescription: 'Live chat with simulated multi-user responses.',
      },
      {
        id: 5,
        title: 'Challenge: Message Reactions',
        type: 'challenge',
        content: {
          challenge: 'Add emoji reactions to messages. Hovering a message shows a reaction picker (👍 ❤️ 😂 😮). Clicking adds the reaction count under the message.',
          hint: 'Add a reactions field to the Message interface: reactions?: Record<string, number>. Update it with setMessages + map on click. Show reaction badges only when their count > 0.',
        },
        deliverableDescription: 'Messages support emoji reactions with live counts.',
      },
    ],
  },

  // ─── Project 5: REST API Explorer ────────────────────────────────────────
  {
    id: 'rest-api-explorer',
    title: 'REST API Explorer',
    shortDescription: 'Build a TypeScript API client that sends HTTP requests and inspects responses.',
    description: 'Build a class-based REST API client in TypeScript. Learn HTTP methods, request/response handling, error management, and the Fetch API in depth.',
    difficulty: 'intermediate',
    estimatedTime: '4-5 hours',
    category: 'api',
    tags: ['typescript', 'fetch', 'rest-api', 'http'],
    techStack: [
      { name: 'TypeScript', icon: '🔷', color: '#3178C6' },
      { name: 'Fetch API', icon: '🌐', color: '#10B981' },
    ],
    steps: [
      {
        id: 1,
        title: 'Understanding REST APIs',
        type: 'understanding',
        content: {
          description: 'REST (Representational State Transfer) is an architectural style for APIs. It uses standard HTTP methods to perform CRUD operations on resources identified by URLs.',
          points: [
            'GET retrieves a resource (safe, idempotent, no body)',
            'POST creates a new resource (not idempotent, body required)',
            'PUT replaces a resource entirely (idempotent, body required)',
            'PATCH partially updates a resource (body with changed fields only)',
            'DELETE removes a resource (idempotent, no body)',
            'Status codes communicate outcome: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error',
          ],
        },
        deliverableDescription: 'Understand HTTP methods, status codes, and REST conventions.',
      },
      {
        id: 2,
        title: 'API Client Architecture',
        type: 'logic',
        content: {
          description: 'A well-designed API client encapsulates fetch logic in a reusable class, handles auth headers centrally, and returns typed responses.',
          points: [
            'ApiExplorer class stores baseUrl and headers (including auth) in the constructor',
            'Private request() method handles fetch, JSON parsing, and timing',
            'Public get(), post(), put(), delete() methods are thin wrappers over request()',
            'ApiResponse interface: { status, data, headers, duration }',
            'Error handling: catch network errors and non-2xx status codes separately',
          ],
        },
        deliverableDescription: 'Design the ApiExplorer class interface.',
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        content: {
          language: 'typescript',
          points: [
            'The ApiExplorer class centralizes base URL and auth headers—change once, applies everywhere',
            'Private request() times each call and returns a typed ApiResponse object',
            'Public convenience methods (get, post, put, delete) compose on top of request()',
            'The usage example demonstrates full CRUD against jsonplaceholder.typicode.com',
            'Optional apiKey in the constructor adds Authorization: Bearer header when provided',
          ],
          code: `// REST API Explorer - Demonstrates HTTP methods and response handling
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface ApiResponse {
  status: number
  data: unknown
  headers: Record<string, string>
  duration: number
}

class ApiExplorer {
  private baseUrl: string
  private headers: Record<string, string>

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(apiKey && { 'Authorization': \`Bearer \${apiKey}\` }),
    }
  }

  private async request(method: HttpMethod, path: string, body?: unknown): Promise<ApiResponse> {
    const start = Date.now()
    const response = await fetch(\`\${this.baseUrl}\${path}\`, {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await response.json()
    return {
      status: response.status,
      data,
      headers: Object.fromEntries(response.headers.entries()),
      duration: Date.now() - start,
    }
  }

  async get(path: string) { return this.request('GET', path) }
  async post(path: string, body: unknown) { return this.request('POST', path, body) }
  async put(path: string, body: unknown) { return this.request('PUT', path, body) }
  async delete(path: string) { return this.request('DELETE', path) }
}

async function exploreApi() {
  const api = new ApiExplorer('https://jsonplaceholder.typicode.com')

  const usersResponse = await api.get('/users')
  console.log('Users:', usersResponse.status, usersResponse.data)

  const newPost = await api.post('/posts', {
    title: 'My First API Post',
    body: 'This was created via the API',
    userId: 1,
  })
  console.log('Created:', newPost.status, newPost.data)

  const updated = await api.put('/posts/1', { title: 'Updated Title', userId: 1 })
  console.log('Updated:', updated.status, updated.data)

  const deleted = await api.delete('/posts/1')
  console.log('Deleted:', deleted.status)
}

exploreApi().catch(console.error)`,
        },
        deliverableDescription: 'A typed ApiExplorer class with full CRUD support.',
        template: [
          {
            name: 'solution.ts',
            language: 'typescript',
            content: `type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface ApiResponse {
  status: number
  data: unknown
  headers: Record<string, string>
  duration: number
}

class ApiExplorer {
  private baseUrl: string
  private headers: Record<string, string>

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(apiKey && { 'Authorization': \`Bearer \${apiKey}\` }),
    }
  }

  private async request(method: HttpMethod, path: string, body?: unknown): Promise<ApiResponse> {
    const start = Date.now()
    const response = await fetch(\`\${this.baseUrl}\${path}\`, {
      method, headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await response.json()
    return { status: response.status, data, headers: Object.fromEntries(response.headers.entries()), duration: Date.now() - start }
  }

  async get(path: string) { return this.request('GET', path) }
  async post(path: string, body: unknown) { return this.request('POST', path, body) }
  async put(path: string, body: unknown) { return this.request('PUT', path, body) }
  async delete(path: string) { return this.request('DELETE', path) }
}

export { ApiExplorer }`,
          },
        ],
      },
      {
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'Run the script against jsonplaceholder.typicode.com to see live API responses in the console. Each request shows status code, data, and duration.',
        },
        deliverableDescription: 'API client making live requests with typed responses.',
      },
      {
        id: 5,
        title: 'Challenge: Add Retry Logic and Caching',
        type: 'challenge',
        content: {
          challenge: 'Add automatic retry for failed requests (up to 3 attempts with exponential backoff), and a simple in-memory cache for GET requests that expires after 60 seconds.',
          hint: 'For retry: wrap the fetch in a loop with try/catch and await delay(attempt * 1000). For cache: use Map<string, { data: unknown, timestamp: number }> and check timestamp before fetching.',
        },
        deliverableDescription: 'API client with retry logic and GET response caching.',
      },
    ],
  },

  // ─── Project 6: Python CLI File Organizer ─────────────────────────────────
  {
    id: 'python-file-organizer',
    title: 'Python CLI Tool - File Organizer',
    shortDescription: 'Build a command-line tool that organizes files by type into categorized folders.',
    description: 'Create a professional CLI tool in Python using argparse and pathlib. Learn file system operations, argument parsing, and how to structure a Python CLI application.',
    difficulty: 'beginner',
    estimatedTime: '2-3 hours',
    category: 'cli-tool',
    tags: ['python', 'cli', 'file-system', 'argparse'],
    techStack: [
      { name: 'Python', icon: '🐍', color: '#3776AB' },
      { name: 'argparse', icon: '⚙️', color: '#FFD43B' },
      { name: 'pathlib', icon: '📁', color: '#4CAF50' },
    ],
    steps: [
      {
        id: 1,
        title: 'Understanding CLI Tools',
        type: 'understanding',
        content: {
          description: 'Command-line interface (CLI) tools are programs controlled via terminal commands and flags. They\'re essential for automation, DevOps, and developer tooling.',
          points: [
            'CLI tools accept arguments: positional (required) and optional (--flag value)',
            'argparse handles argument parsing, type validation, and help text generation automatically',
            'pathlib.Path provides an object-oriented, cross-platform file system API',
            'shutil.move() moves files safely across different directories and drives',
            'A --dry-run flag lets users preview what would happen before committing changes',
          ],
        },
        deliverableDescription: 'Understand CLI tool design and argument parsing.',
      },
      {
        id: 2,
        title: 'File Organization Logic',
        type: 'logic',
        content: {
          description: 'Design the categorization logic: map file extensions to category folders, scan the source directory, and move files to their respective category subdirectories.',
          points: [
            'FILE_CATEGORIES dict maps category names to lists of extensions: { "Images": [".jpg", ".png"] }',
            'get_category(ext) looks up the extension in FILE_CATEGORIES and returns "Other" if not found',
            'scan_directory(path) iterates directory contents, skips subdirectories, groups files by category',
            'organize_files() is the main orchestrator: scan, group, then move (or print in dry-run mode)',
            'defaultdict(list) from collections auto-initializes list values when a new key is accessed',
          ],
        },
        deliverableDescription: 'Plan the extension→category mapping and file grouping logic.',
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        content: {
          language: 'python',
          points: [
            'FILE_CATEGORIES maps category names to extension lists for easy maintenance',
            'get_category() returns "Other" for unknown extensions, ensuring all files are handled',
            'scan_directory() uses defaultdict(list) to auto-initialize category buckets',
            'dry_run mode prints planned moves without executing them—essential for user trust',
            'argparse provides --help text, type validation, and clear usage instructions automatically',
          ],
          code: `#!/usr/bin/env python3
"""File Organizer CLI Tool - Organize files by extension into categorized folders."""

import os
import shutil
import argparse
from pathlib import Path
from collections import defaultdict

FILE_CATEGORIES = {
    'Images': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'],
    'Videos': ['.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv'],
    'Documents': ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.pptx', '.csv'],
    'Audio': ['.mp3', '.wav', '.flac', '.aac', '.ogg'],
    'Code': ['.py', '.js', '.ts', '.html', '.css', '.java', '.cpp', '.go'],
    'Archives': ['.zip', '.tar', '.gz', '.rar', '.7z'],
    'Data': ['.json', '.xml', '.yaml', '.yml', '.sql', '.db'],
}


def get_category(extension: str) -> str:
    ext_lower = extension.lower()
    for category, extensions in FILE_CATEGORIES.items():
        if ext_lower in extensions:
            return category
    return 'Other'


def scan_directory(source: Path) -> dict:
    grouped: dict = defaultdict(list)
    for item in source.iterdir():
        if item.is_file():
            category = get_category(item.suffix)
            grouped[category].append(item)
    return dict(grouped)


def organize_files(source_dir: str, dry_run: bool = False) -> None:
    source = Path(source_dir)
    if not source.exists():
        print(f"Error: Directory '{source_dir}' does not exist.")
        return

    grouped = scan_directory(source)
    if not grouped:
        print("No files found to organize.")
        return

    print(f"\\n{'DRY RUN - ' if dry_run else ''}Organizing files in: {source}\\n")
    moved = 0
    for category, files in sorted(grouped.items()):
        target_dir = source / category
        print(f"📁 {category}/ ({len(files)} files)")
        for file_path in files:
            dest = target_dir / file_path.name
            print(f"  {file_path.name} → {category}/")
            if not dry_run:
                target_dir.mkdir(exist_ok=True)
                shutil.move(str(file_path), str(dest))
                moved += 1

    if dry_run:
        total = sum(len(f) for f in grouped.values())
        print(f"\\n✅ Would move {total} files into {len(grouped)} categories")
    else:
        print(f"\\n✅ Moved {moved} files successfully!")


def main():
    parser = argparse.ArgumentParser(
        description='Organize files in a directory by type',
        epilog='Example: python organizer.py ~/Downloads --dry-run'
    )
    parser.add_argument('directory', help='Directory to organize')
    parser.add_argument('--dry-run', action='store_true',
                        help='Preview changes without moving files')
    args = parser.parse_args()
    organize_files(args.directory, args.dry_run)


if __name__ == '__main__':
    main()`,
        },
        deliverableDescription: 'Working file organizer CLI with dry-run support.',
        template: [
          {
            name: 'solution.py',
            language: 'python',
            content: `#!/usr/bin/env python3
"""File Organizer CLI Tool."""

import shutil
import argparse
from pathlib import Path
from collections import defaultdict

FILE_CATEGORIES = {
    'Images': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    'Documents': ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.csv'],
    'Code': ['.py', '.js', '.ts', '.html', '.css'],
    'Archives': ['.zip', '.tar', '.gz'],
}

def get_category(ext: str) -> str:
    for cat, exts in FILE_CATEGORIES.items():
        if ext.lower() in exts:
            return cat
    return 'Other'

def organize_files(source_dir: str, dry_run: bool = False) -> None:
    source = Path(source_dir)
    grouped: dict = defaultdict(list)
    for item in source.iterdir():
        if item.is_file():
            grouped[get_category(item.suffix)].append(item)
    for cat, files in sorted(grouped.items()):
        print(f"📁 {cat}/ ({len(files)} files)")
        for f in files:
            print(f"  {f.name}")
            if not dry_run:
                dest = source / cat
                dest.mkdir(exist_ok=True)
                shutil.move(str(f), str(dest / f.name))

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('directory')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    organize_files(args.directory, args.dry_run)`,
          },
        ],
      },
      {
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'Run the script with --dry-run first to preview the file moves, then run without the flag to actually organize the directory.',
        },
        deliverableDescription: 'CLI tool running in terminal with real file operations.',
      },
      {
        id: 5,
        title: 'Challenge: Duplicate File Detector',
        type: 'challenge',
        content: {
          challenge: 'Add a --dedupe flag that scans the directory for duplicate files (same content, different names) using SHA-256 hashing and lists them. Optionally delete all but the first copy.',
          hint: 'Use hashlib.sha256() to hash each file\'s bytes (SHA-256 is preferred over MD5 for reliable deduplication). Group files by hash using a defaultdict(list). Files with the same hash are duplicates. Use --keep-first to delete all but the earliest one.',
        },
        deliverableDescription: 'CLI tool with duplicate detection and optional removal.',
      },
    ],
  },

  // ─── Project 7: Data Pipeline ETL ─────────────────────────────────────────
  {
    id: 'data-pipeline-etl',
    title: 'Data Pipeline - ETL with Apache Airflow',
    shortDescription: 'Build a production-grade ETL pipeline DAG that extracts, transforms, and loads customer data.',
    description: 'Learn data engineering fundamentals by building an Airflow DAG that processes customer records. Cover extraction, cleaning, enrichment, validation, and loading patterns.',
    difficulty: 'advanced',
    estimatedTime: '8-10 hours',
    category: 'data-pipeline',
    tags: ['python', 'airflow', 'etl', 'data-engineering'],
    techStack: [
      { name: 'Python', icon: '🐍', color: '#3776AB' },
      { name: 'Apache Airflow', icon: '🌊', color: '#017CEE' },
      { name: 'pandas', icon: '🐼', color: '#150458' },
    ],
    steps: [
      {
        id: 1,
        title: 'Understanding ETL Pipelines',
        type: 'understanding',
        content: {
          description: 'ETL (Extract, Transform, Load) is the backbone of data engineering. Data flows from source systems through cleaning/enrichment logic into a destination for analysis.',
          points: [
            'Extract: pull raw data from databases, APIs, files, or streams',
            'Transform: clean nulls, normalize formats, validate values, enrich with derived fields',
            'Load: write clean data to a data warehouse, database, or file storage',
            'Airflow orchestrates ETL as a DAG (Directed Acyclic Graph) of tasks with dependencies',
            'XCom (cross-communication) passes data between Airflow tasks via the metadata database',
          ],
        },
        deliverableDescription: 'Understand ETL concepts, DAGs, and Airflow task orchestration.',
      },
      {
        id: 2,
        title: 'Pipeline Architecture',
        type: 'logic',
        content: {
          description: 'Design the three-stage pipeline: extract() → transform() → load(). Each stage is an independent Python function connected by Airflow operators.',
          points: [
            'extract() fetches raw records and returns JSON string (simulates DB or API call)',
            'transform() loads the JSON into a DataFrame, cleans nulls, normalizes text, validates, enriches',
            'load() writes the final DataFrame to the destination and prints summary statistics',
            'XCom ti.xcom_push/pull passes data between tasks without writing to disk',
            'DEFAULT_ARGS sets owner, start_date, retry count, and retry delay for all tasks in the DAG',
          ],
        },
        deliverableDescription: 'Design the 3-stage ETL pipeline architecture.',
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        content: {
          language: 'python',
          points: [
            'extract() simulates pulling from a database and returns raw JSON via XCom',
            'transform() uses pandas to clean nulls, normalize names/emails, remove invalid rows, add a tier column',
            'pd.cut() bins continuous spend values into labeled categories (Bronze/Silver/Gold/Platinum)',
            'The standalone test block at the bottom allows running without Airflow for development',
            'Commented DAG code shows how to wire tasks with >> operator in real Airflow',
          ],
          code: `"""Data Pipeline ETL - Apache Airflow DAG for customer data processing."""

from datetime import datetime, timedelta
import pandas as pd
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def extract_customer_data(**context) -> str:
    raw_data = [
        {"id": 1, "name": "Alice Johnson", "email": "alice@co.com", "spend": 1250.00, "date": "2024-01-15"},
        {"id": 2, "name": "bob smith", "email": "BOB@CO.COM", "spend": -50.00, "date": "2024-01-16"},
        {"id": 3, "name": "Carol Davis", "email": "carol@co.com", "spend": 830.50, "date": "2024-01-16"},
        {"id": 4, "name": "Dave Wilson", "email": "dave@co.com", "spend": 2100.00, "date": "2024-01-17"},
        {"id": 5, "name": None, "email": "unknown@co.com", "spend": 500.00, "date": "2024-01-17"},
    ]
    logger.info(f"Extracted {len(raw_data)} customer records")
    return json.dumps(raw_data)


def transform_customer_data(**context) -> str:
    raw_json = context['ti'].xcom_pull(task_ids='extract')
    records = json.loads(raw_json)
    df = pd.DataFrame(records)

    df['name'] = df['name'].fillna('Unknown').str.title().str.strip()
    df['email'] = df['email'].str.lower().str.strip()

    invalid = df[df['spend'] < 0]
    if not invalid.empty:
        logger.warning(f"Removing {len(invalid)} records with negative spend")
    df = df[df['spend'] >= 0]

    df['tier'] = pd.cut(df['spend'],
        bins=[0, 500, 1000, 2000, float('inf')],
        labels=['Bronze', 'Silver', 'Gold', 'Platinum'])
    df['processed_at'] = datetime.utcnow().isoformat()

    logger.info(f"Transformed {len(df)} valid records")
    return df.to_json(orient='records')


def load_customer_data(**context) -> None:
    clean_json = context['ti'].xcom_pull(task_ids='transform')
    records = json.loads(clean_json)
    output_path = Path('/tmp/customer_output.json')
    output_path.write_text(json.dumps(records, indent=2))
    logger.info(f"Loaded {len(records)} records to {output_path}")
    df = pd.DataFrame(records)
    print("\\n📊 Pipeline Summary:")
    print(f"  Total records: {len(df)}")
    print(f"  Total spend: \${df['spend'].sum():,.2f}")
    print(f"  Avg spend: \${df['spend'].mean():,.2f}")
    print(f"  Tier breakdown:\\n{df['tier'].value_counts().to_string()}")


DEFAULT_ARGS = {
    'owner': 'data-team',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

# Uncomment to use in real Airflow:
# with DAG('customer_etl', default_args=DEFAULT_ARGS, schedule_interval='@daily') as dag:
#     extract = PythonOperator(task_id='extract', python_callable=extract_customer_data)
#     transform = PythonOperator(task_id='transform', python_callable=transform_customer_data)
#     load = PythonOperator(task_id='load', python_callable=load_customer_data)
#     extract >> transform >> load

if __name__ == '__main__':
    class MockTi:
        _data: dict = {}
        @classmethod
        def xcom_pull(cls, task_ids: str): return cls._data.get(task_ids)

    ctx: dict = {'ti': MockTi()}
    raw = extract_customer_data(**ctx)
    MockTi._data['extract'] = raw
    transformed = transform_customer_data(**ctx)
    MockTi._data['transform'] = transformed
    load_customer_data(**ctx)`,
        },
        deliverableDescription: 'Working ETL pipeline runnable both standalone and in Airflow.',
        template: [
          {
            name: 'solution.py',
            language: 'python',
            content: `"""ETL Pipeline Starter."""
import pandas as pd
import json
from datetime import datetime

def extract(**context):
    data = [
        {"id": 1, "name": "Alice", "email": "alice@co.com", "spend": 1200.0},
        {"id": 2, "name": "bob", "email": "BOB@CO.COM", "spend": -10.0},
        {"id": 3, "name": None, "email": "carol@co.com", "spend": 850.0},
    ]
    return json.dumps(data)

def transform(**context):
    df = pd.DataFrame(json.loads(context['ti'].xcom_pull(task_ids='extract')))
    df['name'] = df['name'].fillna('Unknown').str.title()
    df['email'] = df['email'].str.lower()
    df = df[df['spend'] >= 0]
    df['processed_at'] = datetime.utcnow().isoformat()
    return df.to_json(orient='records')

def load(**context):
    records = json.loads(context['ti'].xcom_pull(task_ids='transform'))
    print(f"Loaded {len(records)} records")
    for r in records:
        print(r)

if __name__ == '__main__':
    class Ti:
        _d: dict = {}
        @classmethod
        def xcom_pull(cls, task_ids): return cls._d.get(task_ids)
    ctx = {'ti': Ti()}
    Ti._d['extract'] = extract(**ctx)
    Ti._d['transform'] = transform(**ctx)
    load(**ctx)`,
          },
        ],
      },
      {
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'Run python solution.py to execute the full ETL pipeline. Watch the data flow through extract → transform → load with the summary printed at the end.',
        },
        deliverableDescription: 'ETL pipeline running end-to-end with summary statistics.',
      },
      {
        id: 5,
        title: 'Challenge: Add Data Quality Checks',
        type: 'challenge',
        content: {
          challenge: 'Add a validate() stage between transform and load that checks: no nulls in required fields, email format matches a regex, all spend values are positive, and tier distribution is reasonable. Fail the pipeline (raise ValueError with a message listing which check failed and how many records were affected) if critical checks fail.',
          hint: 'Use df.isnull().sum() to check for nulls. For email regex: import re; df[~df["email"].str.match(r"^[\\w.-]+@[\\w.-]+\\.\\w+$")]. Raise ValueError(f"Validation failed: {check_name} — {n} records affected") if validation fails.',
        },
        deliverableDescription: 'Pipeline with data quality gate that fails on bad data.',
      },
    ],
  },

  // ─── Project 8: React Native Expense Tracker ──────────────────────────────
  {
    id: 'expense-tracker-mobile',
    title: 'React Native Expense Tracker',
    shortDescription: 'Build a mobile expense tracking app with categories, totals, and screen navigation.',
    description: 'Create a cross-platform mobile expense tracker using React Native and Expo. Learn mobile navigation, native-style UI components, and offline-first state management.',
    difficulty: 'intermediate',
    estimatedTime: '5-6 hours',
    category: 'mobile-app',
    tags: ['react-native', 'typescript', 'mobile', 'expo'],
    techStack: [
      { name: 'React Native', icon: '📱', color: '#61DAFB' },
      { name: 'TypeScript', icon: '🔷', color: '#3178C6' },
      { name: 'Expo', icon: '🚀', color: '#000020' },
    ],
    steps: [
      {
        id: 1,
        title: 'Understanding Mobile Development',
        type: 'understanding',
        content: {
          description: 'React Native lets you build iOS and Android apps with React and TypeScript. Unlike web, you use native UI components (View, Text, TouchableOpacity) instead of HTML elements.',
          points: [
            'React Native uses View (div), Text (p/span), and TouchableOpacity (button) instead of HTML',
            'StyleSheet.create() defines styles with camelCase properties similar to CSS',
            'Navigation between screens uses React Navigation (Stack, Tab, Drawer navigators)',
            'AsyncStorage persists data locally on the device across app restarts',
            'Expo simplifies builds, device features (camera, location), and OTA updates',
          ],
        },
        deliverableDescription: 'Understand React Native vs React and mobile-specific concepts.',
      },
      {
        id: 2,
        title: 'Expense Data Model',
        type: 'logic',
        content: {
          description: 'Design the expense schema, category system, and screen navigation flow.',
          points: [
            'Expense: id, title, amount, category (food|transport|housing|entertainment|health|other), date, note?',
            'CATEGORY_EMOJI and CATEGORY_COLOR maps drive consistent visual theming',
            'Screen state (list | add) simulates stack navigation in the web prototype',
            'Total is derived: expenses.reduce((sum, e) => sum + e.amount, 0)',
            'Category filter derives a subset without mutating the source array',
          ],
        },
        deliverableDescription: 'Define expense schema and navigation flow.',
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        content: {
          language: 'typescript',
          points: [
            'screen state simulates React Navigation stack: "list" and "add" screens rendered conditionally',
            'CATEGORY_EMOJI and CATEGORY_COLOR maps keep category styling consistent and maintainable',
            'The add screen uses a number input with leading $ for native-style amount entry',
            'Category grid uses Object.keys() to render buttons from the enum automatically',
            'The floating + button (fixed position) follows the mobile FAB (Floating Action Button) pattern',
          ],
          code: `import { useState } from 'react'

type ExpenseCategory = 'food' | 'transport' | 'housing' | 'entertainment' | 'health' | 'other'

interface Expense {
  id: string; title: string; amount: number
  category: ExpenseCategory; date: string; note?: string
}

const CATEGORY_EMOJI: Record<ExpenseCategory, string> = {
  food: '🍔', transport: '🚗', housing: '🏠',
  entertainment: '🎬', health: '💊', other: '📦',
}

const CATEGORY_COLOR: Record<ExpenseCategory, string> = {
  food: 'bg-orange-100 text-orange-700',
  transport: 'bg-blue-100 text-blue-700',
  housing: 'bg-green-100 text-green-700',
  entertainment: 'bg-purple-100 text-purple-700',
  health: 'bg-red-100 text-red-700',
  other: 'bg-gray-100 text-gray-700',
}

const SAMPLE_EXPENSES: Expense[] = [
  { id: '1', title: 'Lunch at cafe', amount: 12.50, category: 'food', date: '2024-01-15' },
  { id: '2', title: 'Uber ride', amount: 8.00, category: 'transport', date: '2024-01-15' },
  { id: '3', title: 'Netflix', amount: 15.99, category: 'entertainment', date: '2024-01-14' },
  { id: '4', title: 'Groceries', amount: 67.30, category: 'food', date: '2024-01-13' },
]

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>(SAMPLE_EXPENSES)
  const [screen, setScreen] = useState<'list' | 'add'>('list')
  const [form, setForm] = useState({ title: '', amount: '', category: 'food' as ExpenseCategory })
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'all'>('all')

  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const filtered = selectedCategory === 'all' ? expenses : expenses.filter(e => e.category === selectedCategory)

  const addExpense = () => {
    if (!form.title || !form.amount) return
    setExpenses([{ id: Date.now().toString(), title: form.title, amount: parseFloat(form.amount),
      category: form.category, date: new Date().toISOString().split('T')[0] }, ...expenses])
    setForm({ title: '', amount: '', category: 'food' })
    setScreen('list')
  }

  if (screen === 'add') {
    return (
      <div className="max-w-sm mx-auto bg-white min-h-screen p-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setScreen('list')} className="text-blue-500 font-medium">← Back</button>
          <h1 className="text-xl font-bold">Add Expense</h1>
        </div>
        <div className="space-y-4">
          <input placeholder="What did you spend on?" value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
            className="w-full border-b-2 py-2 focus:outline-none focus:border-blue-500 text-lg" />
          <div className="relative">
            <span className="absolute left-0 top-2 text-2xl text-gray-400">$</span>
            <input type="number" placeholder="0.00" value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value})}
              className="w-full pl-6 border-b-2 py-2 text-3xl font-light focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-2">Category</p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(CATEGORY_EMOJI) as ExpenseCategory[]).map(cat => (
                <button key={cat} onClick={() => setForm({...form, category: cat})}
                  className={\`p-2 rounded-xl text-center text-sm \${form.category === cat ? 'bg-blue-500 text-white' : 'bg-gray-100'}\`}>
                  <div className="text-xl">{CATEGORY_EMOJI[cat]}</div>
                  <div className="capitalize">{cat}</div>
                </button>
              ))}
            </div>
          </div>
          <button onClick={addExpense} className="w-full bg-blue-500 text-white py-3 rounded-xl text-lg font-semibold mt-4">
            Add Expense
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto bg-gray-50 min-h-screen">
      <div className="bg-blue-600 text-white p-6 pb-10">
        <h1 className="text-xl font-bold mb-1">My Expenses</h1>
        <p className="text-blue-200 text-sm">This month</p>
        <p className="text-4xl font-light mt-2">\${total.toFixed(2)}</p>
      </div>
      <div className="bg-white mx-4 -mt-4 rounded-2xl shadow-lg p-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['all', ...Object.keys(CATEGORY_EMOJI)] as (ExpenseCategory | 'all')[]).map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={\`px-3 py-1 rounded-full text-sm whitespace-nowrap \${selectedCategory === cat ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}\`}>
              {cat === 'all' ? 'All' : \`\${CATEGORY_EMOJI[cat as ExpenseCategory]} \${cat}\`}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 space-y-2 pb-20">
        {filtered.map(e => (
          <div key={e.id} className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm">
            <div className="text-2xl">{CATEGORY_EMOJI[e.category]}</div>
            <div className="flex-1">
              <p className="font-medium">{e.title}</p>
              <p className="text-xs text-gray-400">{e.date}</p>
            </div>
            <p className="font-semibold text-gray-800">-\${e.amount.toFixed(2)}</p>
          </div>
        ))}
      </div>
      <button onClick={() => setScreen('add')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full text-3xl shadow-lg hover:bg-blue-600 flex items-center justify-center">
        +
      </button>
    </div>
  )
}`,
        },
        deliverableDescription: 'Mobile expense tracker with add screen and category filtering.',
        template: [
          {
            name: 'App.tsx',
            language: 'tsx',
            content: `import { useState } from 'react'

type Category = 'food' | 'transport' | 'other'

interface Expense { id: string; title: string; amount: number; category: Category; date: string }

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')

  const add = () => {
    if (!title || !amount) return
    setExpenses([{ id: Date.now().toString(), title, amount: parseFloat(amount), category: 'other', date: new Date().toISOString().split('T')[0] }, ...expenses])
    setTitle(''); setAmount('')
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="max-w-sm mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Expenses: \${total.toFixed(2)}</h1>
      <div className="bg-white rounded-xl p-4 mb-4 space-y-2">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Description"
          className="w-full border rounded px-3 py-2" />
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount"
          className="w-full border rounded px-3 py-2" />
        <button onClick={add} className="w-full bg-blue-500 text-white py-2 rounded">Add</button>
      </div>
      {expenses.map(e => (
        <div key={e.id} className="bg-white rounded-xl p-3 mb-2 flex justify-between">
          <span>{e.title}</span>
          <span className="font-semibold">-\${e.amount.toFixed(2)}</span>
        </div>
      ))}
    </div>
  )
}`,
          },
        ],
      },
      {
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'Tap the + button to add an expense, choose a category, and see it appear in the list. Filter by category using the chips at the top.',
        },
        deliverableDescription: 'Mobile app UI with add/list screens and category filtering.',
      },
      {
        id: 5,
        title: 'Challenge: Monthly Budget Goals',
        type: 'challenge',
        content: {
          challenge: 'Add per-category budget goals. Show a progress bar under each category filter chip: spent/$budget. Highlight categories that are over budget in red.',
          hint: 'Create a BUDGETS constant: Record<ExpenseCategory, number>. Calculate spent per category with expenses.filter(e => e.category === cat).reduce(). Show width: (spent/budget * 100)% as a progress bar.',
        },
        deliverableDescription: 'Expense tracker with per-category budget progress bars.',
      },
    ],
  },

  // ─── Project 9: Data Visualization Dashboard ─────────────────────────────
  {
    id: 'data-viz-dashboard',
    title: 'Data Visualization Dashboard',
    shortDescription: 'Build an analytics dashboard with bar charts, line charts, pie charts, and KPI cards using Recharts.',
    description: 'Create a professional analytics dashboard with multiple chart types and interactive controls. Learn Recharts, responsive containers, and data transformation patterns.',
    difficulty: 'intermediate',
    estimatedTime: '5-6 hours',
    category: 'web-app',
    tags: ['react', 'typescript', 'd3', 'recharts', 'data-viz'],
    techStack: [
      { name: 'React', icon: '⚛️', color: '#61DAFB' },
      { name: 'TypeScript', icon: '🔷', color: '#3178C6' },
      { name: 'Recharts', icon: '📊', color: '#8884D8' },
    ],
    steps: [
      {
        id: 1,
        title: 'Understanding Data Visualization',
        type: 'understanding',
        content: {
          description: 'Data visualization transforms raw numbers into intuitive charts. Choosing the right chart type is as important as the data itself.',
          points: [
            'Bar charts compare discrete categories (e.g., monthly revenue per region)',
            'Line charts show trends over time (e.g., revenue growth over 6 months)',
            'Pie/donut charts show proportion/composition (e.g., product mix as % of revenue)',
            'KPI cards give instant single-metric snapshots (total revenue, % change)',
            'ResponsiveContainer from Recharts makes charts fluid and responsive to window size',
          ],
        },
        deliverableDescription: 'Understand chart types, when to use each, and Recharts architecture.',
      },
      {
        id: 2,
        title: 'Dashboard Architecture',
        type: 'logic',
        content: {
          description: 'Structure the data, define the chart configurations, and plan the interactive controls before coding.',
          points: [
            'MONTHLY_SALES array: { month, revenue, expenses, profit } drives bar and line charts',
            'PRODUCT_MIX array: { name, value, color } drives the donut pie chart',
            'KPI_DATA array: { label, value, change, up } drives the KPI summary cards',
            'chartView state (revenue | profit | both) controls which Bar series are visible',
            'Tooltip formatter functions convert raw numbers to readable "$42,000" strings',
          ],
        },
        deliverableDescription: 'Plan data structures and chart configurations.',
      },
      {
        id: 3,
        title: 'The Code',
        type: 'code',
        content: {
          language: 'typescript',
          points: [
            'ResponsiveContainer wraps every chart so it resizes with the viewport automatically',
            'chartView state toggles Bar series visibility without duplicating the chart component',
            'KPI cards derive color from the up boolean, avoiding hardcoded class names per card',
            'PieChart uses innerRadius to create a donut shape; Cell components apply per-slice colors',
            'tickFormatter and formatter functions on XAxis/Tooltip clean up numeric labels',
          ],
          code: `import { useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const MONTHLY_SALES = [
  { month: 'Jan', revenue: 42000, expenses: 28000, profit: 14000 },
  { month: 'Feb', revenue: 38000, expenses: 25000, profit: 13000 },
  { month: 'Mar', revenue: 55000, expenses: 32000, profit: 23000 },
  { month: 'Apr', revenue: 51000, expenses: 30000, profit: 21000 },
  { month: 'May', revenue: 63000, expenses: 35000, profit: 28000 },
  { month: 'Jun', revenue: 59000, expenses: 33000, profit: 26000 },
]

const PRODUCT_MIX = [
  { name: 'Software', value: 45, color: '#3B82F6' },
  { name: 'Hardware', value: 25, color: '#10B981' },
  { name: 'Services', value: 20, color: '#F59E0B' },
  { name: 'Support', value: 10, color: '#EF4444' },
]

const KPI_DATA = [
  { label: 'Total Revenue', value: '$308K', change: '+12%', up: true },
  { label: 'Total Profit', value: '$125K', change: '+8%', up: true },
  { label: 'Avg Margin', value: '40.6%', change: '-2%', up: false },
  { label: 'Customers', value: '1,284', change: '+21%', up: true },
]

type ChartView = 'revenue' | 'profit' | 'both'

export default function Dashboard() {
  const [chartView, setChartView] = useState<ChartView>('both')

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">📊 Analytics Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {KPI_DATA.map(kpi => (
            <div key={kpi.label} className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-gray-500 text-sm">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{kpi.value}</p>
              <p className={\`text-sm font-medium mt-1 \${kpi.up ? 'text-green-500' : 'text-red-500'}\`}>
                {kpi.up ? '↑' : '↓'} {kpi.change} vs last period
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Monthly Performance</h2>
            <div className="flex gap-2">
              {(['revenue', 'profit', 'both'] as ChartView[]).map(v => (
                <button key={v} onClick={() => setChartView(v)}
                  className={\`px-3 py-1 rounded-full text-sm capitalize \${chartView === v ? 'bg-blue-500 text-white' : 'bg-gray-100'}\`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={MONTHLY_SALES}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={v => \`\$\${(v as number)/1000}k\`} />
              <Tooltip formatter={(v: unknown) => \`\$\${(v as number).toLocaleString()}\`} />
              <Legend />
              {(chartView === 'revenue' || chartView === 'both') && (
                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              )}
              {(chartView === 'profit' || chartView === 'both') && (
                <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-4">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={MONTHLY_SALES}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={v => \`\$\${(v as number)/1000}k\`} />
                <Tooltip formatter={(v: unknown) => \`\$\${(v as number).toLocaleString()}\`} />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-4">Product Mix</h2>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={180}>
                <PieChart>
                  <Pie data={PRODUCT_MIX} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
                    {PRODUCT_MIX.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: unknown) => \`\${v}%\`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {PRODUCT_MIX.map(p => (
                  <div key={p.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-gray-600">{p.name}</span>
                    <span className="font-semibold">{p.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}`,
        },
        deliverableDescription: 'Full analytics dashboard with bar, line, and pie charts plus KPI cards.',
        template: [
          {
            name: 'App.tsx',
            language: 'tsx',
            content: `import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { month: 'Jan', revenue: 42000 },
  { month: 'Feb', revenue: 38000 },
  { month: 'Mar', revenue: 55000 },
  { month: 'Apr', revenue: 51000 },
  { month: 'May', revenue: 63000 },
  { month: 'Jun', revenue: 59000 },
]

export default function Dashboard() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">📊 Sales Dashboard</h1>
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-semibold mb-4">Monthly Revenue</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}`,
          },
        ],
      },
      {
        id: 4,
        title: 'See It In Action',
        type: 'preview',
        content: {
          description: 'Click the revenue/profit/both toggle to show different data series. Hover chart elements to see tooltips. The dashboard is fully responsive.',
        },
        deliverableDescription: 'Live dashboard with interactive chart controls.',
      },
      {
        id: 5,
        title: 'Challenge: Date Range Picker',
        type: 'challenge',
        content: {
          challenge: 'Add a date range picker (start month / end month) that filters MONTHLY_SALES to the selected range. All three charts should update reactively when the range changes.',
          hint: 'Store startMonth and endMonth as indices (0–5). Filter MONTHLY_SALES with .slice(startMonth, endMonth + 1). Pass the filtered array to all three charts instead of the full MONTHLY_SALES constant.',
        },
        deliverableDescription: 'Dashboard with date range filter controlling all charts simultaneously.',
      },
    ],
  },
]

export const SEED_PROJECTS = projects

export function getProjectById(id: string): Project | undefined {
  return projects.find(p => p.id === id)
}
