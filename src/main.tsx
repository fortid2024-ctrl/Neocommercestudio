import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupFirestoreAdmin, createSampleCategory } from './utils/setupFirestore';

setupFirestoreAdmin();
createSampleCategory();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
