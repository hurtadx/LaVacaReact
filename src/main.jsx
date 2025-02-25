import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { NotificationProvider } from './Components/Notification/NotificationContext';
import App from './App/App';
import './index.css';

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </StrictMode>
);
