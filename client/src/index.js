import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));

// Hide initial loading when React mounts
const hideInitialLoading = () => {
  const initialLoading = document.getElementById('initial-loading');
  if (initialLoading) {
    initialLoading.style.display = 'none';
  }
  document.body.classList.add('react-loaded');
};

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Hide initial loading after React mounts
setTimeout(hideInitialLoading, 100);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
