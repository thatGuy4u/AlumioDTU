import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { SocketProvider } from './contexts/SocketProvider';
import { setStore } from './utils/apiClient';
import './index.css';
import App from './App.jsx';

// Wire store to API client for auto-refresh token handling
setStore(store);

const savedTheme = localStorage.getItem('alumiodtu_theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <SocketProvider>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--bg-secondary, rgba(13, 21, 64, 0.95))',
                color: 'var(--text-primary, #e8eaf6)',
                border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                borderRadius: '14px',
                backdropFilter: 'blur(16px)',
                fontSize: '0.82rem',
                fontWeight: 500,
                padding: '10px 14px',
                maxWidth: '360px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)',
                lineHeight: 1.4,
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#fff' },
                style: { borderLeft: '3px solid #22c55e' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
                style: { borderLeft: '3px solid #ef4444' },
              },
            }}
          />
        </BrowserRouter>
      </SocketProvider>
    </Provider>
  </StrictMode>,
);
