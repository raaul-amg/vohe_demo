import { createRoot } from 'react-dom/client'
import { AuthProvider } from './config/Auth.jsx'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
)
