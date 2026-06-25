import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import './index.css';
import App from './App.jsx';

const savedTheme = localStorage.getItem('alumiodtu_theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(13, 21, 64, 0.95)',
              color: '#e8eaf6',
              border: '1px solid rgba(245, 200, 66, 0.2)',
              borderRadius: '12px',
              backdropFilter: 'blur(8px)',
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
