
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Report initial page view to Google Analytics
if (typeof window !== 'undefined' && (window as any).gtag) {
  (window as any).gtag('config', 'G-7PDFV18DN2', {
    page_path: window.location.pathname,
  });
}
