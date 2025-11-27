// src/index.js

import React from 'react';
// We use the client-specific API for modern React apps
import ReactDOM from 'react-dom/client'; 
// Import BrowserRouter from react-router-dom
import { BrowserRouter } from 'react-router-dom'; 

// Import your App component (no need for the .tsx extension)
import App from './App'; 
import './index.css';
import reportWebVitals from './reportWebVitals'; // Assuming you use this utility

// 1. Find the root element and create the root
const root = ReactDOM.createRoot(
  document.getElementById('root')
);

// 2. Render the application
root.render(
  <React.StrictMode>
    {/* 🔑 THE FIX: Wrap your App component with BrowserRouter */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you are using reportWebVitals, keep this line
reportWebVitals();