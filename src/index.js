import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ClanProvider } from './context/ClanContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ClanProvider>
      <App />
    </ClanProvider>
  </React.StrictMode>
);
