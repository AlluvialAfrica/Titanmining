import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

try {
  if (outputs.auth && outputs.auth.user_pool_id && !outputs.auth.user_pool_id.includes('placeholder')) {
    Amplify.configure(outputs);
    console.log('Amplify configured successfully.');
  } else {
    console.warn('Amplify is running in offline demo mode with placeholder configuration.');
  }
} catch (err) {
  console.error('Failed to configure Amplify:', err);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
