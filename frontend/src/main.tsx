import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'

const GoogleAuthProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/auth/google-client-id`)
      .then((res) => res.json())
      .then((data) => setClientId(data.client_id))
      .catch((err) => {
        console.error('Failed to fetch Google Client ID', err);
        setClientId('');
      });
  }, []);

  if (clientId === null) {
    // Optionally return a loading spinner or just null while fetching
    return null;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleAuthProviderWrapper>
      <App />
    </GoogleAuthProviderWrapper>
  </StrictMode>,
)
