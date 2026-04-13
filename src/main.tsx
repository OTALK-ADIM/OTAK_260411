import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // CSS는 가장 아래에서 한 번만!

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)