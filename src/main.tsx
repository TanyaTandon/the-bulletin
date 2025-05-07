import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { toast } from "react-toastify";
import { ToastContext } from "./contexts/toastcontextTP.ts";
import { StytchProvider } from "@stytch/react";
import { createStytchUIClient } from "@stytch/react/ui";
import { Provider } from "react-redux";
import { store } from "./redux/index.ts";
// import { ClerkProvider } from "@clerk/clerk-react";

// Import your Publishable Key
const stytch = createStytchUIClient(
  "public-token-test-cba27da6-eeb9-4c13-9ac7-69467b4c025c"
);

const PUBLISHABLE_KEY = "pk_live_Y2xlcmsudGhlYnVsbGV0aW4uYXBwJA";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}
export const showToast = (message: string) => {
  toast.error(message);
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
  <StytchProvider stytch={stytch}>
    <Provider store={store}>
      <App />
      <div id="clerk-captcha" />
    </Provider>
  </StytchProvider>
);
