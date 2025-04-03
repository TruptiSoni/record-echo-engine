
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize the React app
createRoot(document.getElementById("root")!).render(<App />);

// This will handle building as a regular web app or Chrome extension
// The Chrome extension will use index.html as its popup
