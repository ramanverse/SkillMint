import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'

// Warm up Render backend on app load to avoid cold-start delays
const BACKEND = import.meta.env.VITE_API_URL;
if (!BACKEND) {
  throw new Error('VITE_API_URL not defined. Set it in the deployment environment.');
}
fetch(`${BACKEND}/health`).catch(() => {});


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="325232363180-ahp1a4es4l21jbh903ss1rrh3iufdvjd.apps.googleusercontent.com">
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
