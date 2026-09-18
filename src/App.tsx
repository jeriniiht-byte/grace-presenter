import { useEffect } from 'react';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { Router } from './routes/router';
import { useAppInit } from './hooks/useAppInit';
import { initPresentationBridge } from './services/presentation/presentationBridge';

function App() {
  useAppInit();

  useEffect(() => {
    if (getCurrentWebviewWindow().label === 'main') {
      initPresentationBridge();
    }
  }, []);

  return <Router />;
}

export default App;
