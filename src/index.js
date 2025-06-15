import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ClanProvider } from './context/ClanContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter basename="/arena"> {/* Only use basename if deploying to subpath */}
      <AuthProvider>
        <ClanProvider>
          <App />
        </ClanProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
