import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
