import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { toast } from "react-toastify";
import { StytchProvider } from "@stytch/react";
import { createStytchUIClient } from "@stytch/react/ui";
import { Provider } from "react-redux";
import { store } from "./redux/index.ts";

// Import your Publishable Key
const stytch = createStytchUIClient(
  "public-token-live-f10fc60c-b80c-4303-9fc2-9bc732d36f4c"
);

export const showToast = (message: string) => {
  toast.error(message);
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <StytchProvider stytch={stytch}>
      <App />
    </StytchProvider>
  </Provider>
);
