import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ClanProvider } from './context/ClanContext';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter basename="/arena">
      <ClanProvider>
        <App />
      </ClanProvider>
    </BrowserRouter>
  </React.StrictMode>
);
