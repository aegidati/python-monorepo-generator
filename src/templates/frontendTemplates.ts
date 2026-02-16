export function createFrontendIndex(): string {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Frontend App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;
}

export function createFrontendPackageJson(name: string): string {
    return `{
  "name": "${name}-frontend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "Frontend for ${name}",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.17",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.6"
  },
  "overrides": {
    "rollup": "^4.30.1",
    "postcss": "^8.4.49"
  }
}`;
}

export function createFrontendApp(): string {
    return `import { useState } from 'react'
import './App.css'

function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const testAPI = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:8000/api/v1/items')
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError('API connection failed. Make sure the backend is running on port 8000.')
      console.error('API test failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <h1>Frontend Application</h1>
      <p>Welcome to your React + Vite application!</p>
      <button onClick={testAPI} disabled={loading}>
        {loading ? 'Testing...' : 'Test API Connection'}
      </button>
      
      {error && <div className="error">{error}</div>}
      
      {result && (
        <div className="result">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default App
`;
}

export function createFrontendStyles(): string {
    return `.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

button {
  background-color: #007acc;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #005a9e;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result {
  margin-top: 20px;
  padding: 20px;
  background-color: #f8f8f8;
  border-radius: 4px;
  border-left: 4px solid #007acc;
}

.error {
  margin-top: 20px;
  padding: 15px;
  background-color: #fee;
  border-left: 4px solid #c00;
  color: #c00;
  border-radius: 4px;
}

pre {
  margin: 0;
  background-color: #282c34;
  color: #abb2bf;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}
`;
}