import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { logger } from "./utils/logger";

const isProd = import.meta.env.PROD;

try {
  if (outputs.auth && outputs.auth.user_pool_id && !outputs.auth.user_pool_id.includes('placeholder')) {
    Amplify.configure(outputs);
    logger.info('Amplify configured successfully.');
  } else {
    logger.warn('Amplify is running in offline demo mode with placeholder configuration.');
  }
} catch (err) {
  logger.error('Failed to configure Amplify:', err);
  console.error('Amplify configuration error (app will continue):', err);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Report Web Vitals performance metrics
import { reportWebVitals } from './utils/reportWebVitals';
reportWebVitals();
