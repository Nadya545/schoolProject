import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Router } from "./router/Router";
import { Provider } from "react-redux";
import { store } from "./store";

const router = createBrowserRouter(Router);
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
