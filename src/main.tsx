import React from "react";
import ReactDOM from "react-dom/client";
import StampCalculator from "../stamp_calculator";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StampCalculator />
  </React.StrictMode>,
);
