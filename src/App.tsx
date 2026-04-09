import { AuthProvider } from './contexts/AuthContext';
import { AudioProvider } from './contexts/AudioContext';
import { LayoutProvider } from './contexts/LayoutContext';
import { AppContent } from './components/AppContent';

function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <LayoutProvider>
          <AppContent />
        </LayoutProvider>
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;
