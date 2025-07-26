import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);

// Debug: Log when styles are applied
console.log("=== MAIN.TSX LOADED ===");
console.log("Document title:", document.title);
console.log("Root element classes:", document.documentElement.className);
