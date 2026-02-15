export function createFrontendIndex(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Frontend App</title>
    <link rel="stylesheet" href="src/styles/main.css">
</head>
<body>
    <div id="app">
        <h1>Frontend Application</h1>
        <p>Welcome to your frontend application!</p>
        <button id="api-test">Test API Connection</button>
        <div id="result"></div>
    </div>
    <script src="src/app.js"></script>
</body>
</html>`;
}

export function createFrontendPackageJson(name: string): string {
    return `{
  "name": "${name}-frontend",
  "version": "0.1.0",
  "description": "Frontend for ${name}",
  "main": "src/app.js",
  "scripts": {
    "start": "python -m http.server 8080",
    "build": "echo 'Build step placeholder'",
    "test": "echo 'Test step placeholder'"
  },
  "devDependencies": {
    "live-server": "^1.2.2"
  }
}`;
}

export function createFrontendApp(): string {
    return `// Frontend application logic

document.addEventListener('DOMContentLoaded', function() {
    console.log('Frontend application loaded');
    
    const apiTestButton = document.getElementById('api-test');
    const resultDiv = document.getElementById('result');
    
    if (apiTestButton) {
        apiTestButton.addEventListener('click', async function() {
            try {
                const response = await fetch('http://localhost:8000/api/v1/items');
                const data = await response.json();
                
                if (resultDiv) {
                    resultDiv.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                }
            } catch (error) {
                console.error('API test failed:', error);
                if (resultDiv) {
                    resultDiv.innerHTML = '<p>API connection failed. Make sure the backend is running on port 8000.</p>';
                }
            }
        });
    }
});
`;
}

export function createFrontendStyles(): string {
    return `/* Frontend application styles */

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

#app {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
}

button:hover {
    background-color: #005a9e;
}

#result {
    margin-top: 20px;
    padding: 20px;
    background-color: #f8f8f8;
    border-radius: 4px;
    border-left: 4px solid #007acc;
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