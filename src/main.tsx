
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClerkProvider } from "@clerk/clerk-react";
import { Provider } from "react-redux";
import { store } from "./redux/index.ts";

// Import your Publishable Key - this should be your actual public key
const PUBLISHABLE_KEY = "pk_test_aW5jbHVkZWQtYmVuZ2FsLTMxLmNsZXJrLmFjY291bnRzLmRldiQ";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Provider store={store}>
        <App />
        <ToastContainer position="top-right" autoClose={3000} />
      </Provider>
    </ClerkProvider>
  </React.StrictMode>
);
