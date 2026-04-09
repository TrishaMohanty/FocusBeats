import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await signUp(email, password, displayName);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm: animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mx-auto w-16 h-16 bg-primary-50 dark:bg-primary-900/20 text-primary-500 rounded-2xl flex items-center justify-center mb-md border border-primary-200 dark:border-primary-800 shadow-sm">
          <span className="material-symbols-rounded text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-text tracking-tight">Create your account</h2>
        <p className="mt-2 text-center text-sm text-text-muted">
          Start your focus journey today
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm: animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-surface py-8 px-4 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.1)] border border-border sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-sm bg-error/10 border border-error/20 text-error rounded-lg text-sm text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-text mb-1">Display Name</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-bg border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                  placeholder="Alex"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-text mb-1">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-bg border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                  placeholder="alex@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-text mb-1">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-bg border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md shadow-primary-500/20 text-sm font-bold text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Sign Up
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-medium text-text-muted hover:text-primary-500 transition-colors">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
