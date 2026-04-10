import { AuthProvider } from './contexts/AuthContext';
import { AudioProvider } from './contexts/AudioContext';
import { SessionProvider } from './contexts/SessionContext';
import { AppContent } from './components/AppContent';

function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <SessionProvider>
          <AppContent />
        </SessionProvider>
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;
