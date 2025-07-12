import __vite__cjsImport0_react_jsxDevRuntime from "/@fs/home/runner/workspace/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=c8c33f88"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_reactDom_client from "/@fs/home/runner/workspace/node_modules/.vite/deps/react-dom_client.js?v=c8c33f88"; const createRoot = __vite__cjsImport1_reactDom_client["createRoot"];
import { QueryClientProvider } from "/@fs/home/runner/workspace/node_modules/.vite/deps/@tanstack_react-query.js?v=c8c33f88";
import { queryClient } from "/src/lib/queryClient.ts";
import { AuthProvider } from "/src/hooks/useAuth-jwt.tsx";
import App from "/src/App.tsx";
import "/src/index.css";
createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxDEV(QueryClientProvider, { "data-replit-metadata": "client/src/main.tsx:18:2", "data-component-name": "QueryClientProvider", client: queryClient, children: /* @__PURE__ */ jsxDEV(AuthProvider, { "data-replit-metadata": "client/src/main.tsx:19:4", "data-component-name": "AuthProvider", children: /* @__PURE__ */ jsxDEV(App, { "data-replit-metadata": "client/src/main.tsx:20:6", "data-component-name": "App" }, void 0, false, {
    fileName: "/home/runner/workspace/client/src/main.tsx",
    lineNumber: 20,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "/home/runner/workspace/client/src/main.tsx",
    lineNumber: 19,
    columnNumber: 5
  }, this) }, void 0, false, {
    fileName: "/home/runner/workspace/client/src/main.tsx",
    lineNumber: 18,
    columnNumber: 3
  }, this)
);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IkFBbUJNO0FBbkJOLFNBQVNBLGtCQUFrQjtBQUMzQixTQUFTQywyQkFBMkI7QUFDcEMsU0FBU0MsbUJBQW1CO0FBQzVCLFNBQVNDLG9CQUFvQjtBQUM3QixPQUFPQyxTQUFTO0FBQ2hCLE9BQU87QUFXUEosV0FBV0ssU0FBU0MsZUFBZSxNQUFNLENBQUUsRUFBRUM7QUFBQUEsRUFDM0MsdUJBQUMseUhBQW9CLFFBQVFMLGFBQzNCLGlDQUFDLDJHQUNDLGlDQUFDLDJGQUFEO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0FBSSxLQUROO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0FFQSxLQUhGO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0FJQTtBQUNGIiwibmFtZXMiOlsiY3JlYXRlUm9vdCIsIlF1ZXJ5Q2xpZW50UHJvdmlkZXIiLCJxdWVyeUNsaWVudCIsIkF1dGhQcm92aWRlciIsIkFwcCIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJyZW5kZXIiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZXMiOlsibWFpbi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlUm9vdCB9IGZyb20gXCJyZWFjdC1kb20vY2xpZW50XCI7XG5pbXBvcnQgeyBRdWVyeUNsaWVudFByb3ZpZGVyIH0gZnJvbSBcIkB0YW5zdGFjay9yZWFjdC1xdWVyeVwiO1xuaW1wb3J0IHsgcXVlcnlDbGllbnQgfSBmcm9tIFwiQC9saWIvcXVlcnlDbGllbnRcIjtcbmltcG9ydCB7IEF1dGhQcm92aWRlciB9IGZyb20gXCJAL2hvb2tzL3VzZUF1dGgtand0XCI7XG5pbXBvcnQgQXBwIGZyb20gXCIuL0FwcFwiO1xuaW1wb3J0IFwiLi9pbmRleC5jc3NcIjtcblxuLy8gU2VydmljZSBXb3JrZXIgZGVzYWJpbGl0YWRvIHRlbXBvcmFyaWFtZW50ZSBwYXJhIHJlc29sdmVyIGJsb3F1ZWlvc1xuLy8gaWYgKCdzZXJ2aWNlV29ya2VyJyBpbiBuYXZpZ2F0b3IpIHtcbi8vICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XG4vLyAgICAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoJy9zdy5qcycpXG4vLyAgICAgICAudGhlbigoKSA9PiBjb25zb2xlLmxvZygn8J+agCBQV0EgU2VydmljZSBXb3JrZXIgcmVnaXN0cmFkbycpKVxuLy8gICAgICAgLmNhdGNoKCgpID0+IGNvbnNvbGUud2Fybign4pqg77iPIFBXQSBTZXJ2aWNlIFdvcmtlciBmYWxob3UnKSk7XG4vLyAgIH0pO1xuLy8gfVxuXG5jcmVhdGVSb290KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicm9vdFwiKSEpLnJlbmRlcihcbiAgPFF1ZXJ5Q2xpZW50UHJvdmlkZXIgY2xpZW50PXtxdWVyeUNsaWVudH0+XG4gICAgPEF1dGhQcm92aWRlcj5cbiAgICAgIDxBcHAgLz5cbiAgICA8L0F1dGhQcm92aWRlcj5cbiAgPC9RdWVyeUNsaWVudFByb3ZpZGVyPlxuKTtcbiJdLCJmaWxlIjoiL2hvbWUvcnVubmVyL3dvcmtzcGFjZS9jbGllbnQvc3JjL21haW4udHN4In0=