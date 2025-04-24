import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { toast } from "react-toastify";
import { ToastContext } from "./contexts/toastcontextTP.ts";
import { ClerkProvider } from "@clerk/clerk-react";
import { Provider } from "react-redux";
import { store } from "./redux/index.ts";

// Import your Publishable Key
const PUBLISHABLE_KEY =
  "pk_test_aW5jbHVkZWQtYmVuZ2FsLTMxLmNsZXJrLmFjY291bnRzLmRldiQ";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}
const showToast = (message: string) => {
  toast.error(message);
};

const key = "pk_test_aW5jbHVkZWQtYmVuZ2FsLTMxLmNsZXJrLmFjY291bnRzLmRldiQ";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={key} afterSignOutUrl="/">
      <ToastContext.Provider value={{ showToast }}>
        <Provider store={store}>
          <App />
          <div id="clerk-captcha" />
        </Provider>
      </ToastContext.Provider>
    </ClerkProvider>
  </React.StrictMode>
);
