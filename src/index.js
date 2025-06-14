import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ClanProvider } from './context/ClanContext';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter basename="/arena">
      <ClanProvider>
       <AuthProvider>
        <App />
        </AuthProvider>
      </ClanProvider>
    </BrowserRouter>
  </React.StrictMode>
);
