import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";        // ✅ now works, since App.tsx is in same folder
import "./index.css";           // ✅ now works, since index.css is also in src

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
