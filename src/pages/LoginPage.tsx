import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sign in');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 mx-auto bg-primary-container rounded-2xl flex items-center justify-center text-white mb-4">
          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
        </div>
        <h2 className="text-3xl font-black">Welcome back</h2>
        <p className="mt-2 text-sm text-on-surface-muted">
           Or{' '}
          <Link to="/dashboard" className="font-bold text-primary hover:text-primary/80">
            continue as guest
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-4 rounded-3xl sm:px-10 border border-outline">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error-container text-on-error-container p-3 rounded-xl text-sm font-bold text-center">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-bold mb-2">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-low border border-outline rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary/20 outline-none placeholder:text-on-surface-muted/50"
                placeholder="alex@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-low border border-outline rounded-xl py-3 px-4 focus:ring-1 focus:ring-primary/20 outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95"
            >
              Sign In
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link to="/register" className="text-sm font-bold text-primary hover:underline">
              Don't have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
