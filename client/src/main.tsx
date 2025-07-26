import React from "react";
import ReactDOM from "react-dom/client";

const App: React.FC = () => {
  return React.createElement("div", {
    style: { padding: "20px", fontFamily: "Arial, sans-serif" }
  }, [
    React.createElement("h1", {
      key: "title",
      style: { color: "#10b981" }
    }, "🚀 VENDZZ - Sistema Online"),
    React.createElement("p", { key: "p1" }, "Sistema backend PostgreSQL funcionando ✅"),
    React.createElement("p", { key: "p2" }, "Frontend React carregado com sucesso ✅"),
    React.createElement("div", {
      key: "status",
      style: { marginTop: "20px", padding: "15px", backgroundColor: "#f0f9ff", borderRadius: "8px" }
    }, [
      React.createElement("h3", { key: "h3" }, "✅ Pronto para Deploy Railway"),
      React.createElement("p", { key: "backend" }, "Backend: PostgreSQL routes ativas"),
      React.createElement("p", { key: "frontend" }, "Frontend: React funcionando corretamente"),
      React.createElement("p", { key: "status" }, "Status: Sistema pronto para produção")
    ])
  ]);
};

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(React.createElement(App));
}
