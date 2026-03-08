import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { UserProvider } from './contexts/UserContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "PLACEHOLDER_CLIENT_ID";

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </GoogleOAuthProvider>
  );
}