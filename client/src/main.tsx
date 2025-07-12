import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/hooks/useAuth-jwt";
import App from "./App";
import "./index.css";

// Versão limpa sem Service Worker e com error handling
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  const root = createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  );
} catch (error) {
  console.error("Error initializing app:", error);
  document.body.innerHTML = "<div>Error loading application. Please refresh the page.</div>";
}
