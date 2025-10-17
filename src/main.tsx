import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MyRouter } from "./router/MyRouter";

const router = createBrowserRouter(MyRouter);
const rootElement = document.getElementById("root");

console.log("🚀 Application starting...");
console.log("MyRouter config:", MyRouter);

if (!rootElement) {
  throw new Error("Root element not found");
}
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
