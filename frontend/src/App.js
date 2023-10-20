import './App.css';
import React from "react";
import ReactDOM, { createRoot } from "react-dom";
import Dashboard from './Dashboard';

function App() {
  return (
    <div>
      <h1>Process Tracking</h1>
      <Dashboard />
    </div>
  );
}

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(<App />);
export default App;
