import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./services/pwa";

createRoot(document.getElementById("root")!).render(<App />);

// Register the PWA service worker (no-op in iframes / Lovable previews).
registerServiceWorker();
