import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import { useAppStore } from './app/store';
import { assertBackendConfig } from './services/api/startupGuard';
import './styles/index.css';

assertBackendConfig();
void useAppStore.getState().syncDecisionsFromBackend();

createRoot(document.getElementById('root')!).render(<App />);