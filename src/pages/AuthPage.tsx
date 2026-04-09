import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, user } = useAuth();

  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync state with URL
  useEffect(() => {
    setIsLogin(location.pathname === '/login');
    setError('');
  }, [location.pathname]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signUp(email, password, displayName);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuth = () => {
    const newPath = isLogin ? '/register' : '/login';
    window.history.pushState({}, '', newPath);
    setIsLogin(!isLogin);
    setError('');
  };

  // Force hide scrollbars on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="h-[100dvh] w-full bg-bg flex items-center justify-center p-0 lg:p-8 selection:bg-primary-500/30 overflow-hidden fixed inset-0">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full h-full max-w-[1100px] max-h-screen lg:max-h-[800px] grid grid-cols-1 lg:grid-cols-2 bg-surface border-x lg:border border-border lg:rounded-[2.5rem] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.1)] overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-700">

        {/* Left Side: Brand/Info (Hidden on small screens) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-primary-500 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
                <span className="material-symbols-rounded text-3xl leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
              </div>
              <h1 className="text-2xl font-black tracking-tighter">FocusBeats</h1>
            </div>

            <div className="space-y-6 ">
              <h2 className="text-4xl font-black leading-[1.1] tracking-tight">Master your flow, beat by beat.</h2>
              <p className="text-primary-50/80 font-medium leading-relaxed">
                Join thousands of creators who use FocusBeats to reach deep focus states and manage their high-impact tasks.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl">
                <p className="text-2xl font-black">2.5k+</p>
                <p className="text-xs uppercase tracking-widest font-bold opacity-70">Focus Hours</p>
              </div>
              <div className="p-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl">
                <p className="text-2xl font-black">98%</p>
                <p className="text-xs uppercase tracking-widest font-bold opacity-70">Completion</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold opacity-80">
              <span className="material-symbols-rounded text-base">privacy_tip</span>
              Your data is encrypted and secure
            </div>
          </div>
        </div>

        {/* Right Side: Forms */}
        <div className="flex flex-col relative z-10 bg-surface h-full overflow-hidden">

          <div className="flex-1 flex flex-col justify-center px-8 md:px-12 lg:px-16 overflow-hidden">
            <div className="relative w-full overflow-hidden">
              {/* Sliding Container - High Performance Transform */}
              <div
                className={`flex transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] will-change-transform w-[200%] ${isLogin ? 'translate-x-0' : '-translate-x-1/2'}`}
              >
                {/* Login Form Section */}
                <div className={`w-1/2 transition-opacity duration-500 ${isLogin ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <form onSubmit={handleLogin} className="space-y-6  mx-auto lg:mx-0">
                    {error && isLogin && (
                      <div className="p-3 bg-error/10 border border-error/20 text-error rounded-xl text-xs font-bold flex items-center gap-2">
                        <span className="material-symbols-rounded text-sm">error</span>
                        {error}
                      </div>
                    )}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2 ml-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-5 py-4 bg-bg border-2 border-border/50 rounded-2xl text-text placeholder:text-text-muted/40 focus:outline-none focus:border-primary-500 transition-all font-bold shadow-sm"
                          placeholder="name@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2 ml-1">Password</label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-5 py-4 bg-bg border-2 border-border/50 rounded-2xl text-text focus:outline-none focus:border-primary-500 transition-all font-bold shadow-sm"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="material-symbols-rounded animate-spin">refresh</span>
                      ) : (
                        <>
                          Sign In
                          <span className="material-symbols-rounded text-base">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Register Form Section */}
                <div className={`w-1/2 transition-opacity duration-500 ${!isLogin ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <form onSubmit={handleRegister} className="space-y-5  mx-auto lg:mx-0">
                    {error && !isLogin && (
                      <div className="p-3 bg-error/10 border border-error/20 text-error rounded-xl text-xs font-bold flex items-center gap-2">
                        <span className="material-symbols-rounded text-sm">error</span>
                        {error}
                      </div>
                    )}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2 ml-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full px-5 py-4 bg-bg border-2 border-border/50 rounded-2xl text-text placeholder:text-text-muted/40 focus:outline-none focus:border-primary-500 transition-all font-bold shadow-sm"
                          placeholder="Alex Flow"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2 ml-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-5 py-4 bg-bg border-2 border-border/50 rounded-2xl text-text placeholder:text-text-muted/40 focus:outline-none focus:border-primary-500 transition-all font-bold shadow-sm"
                          placeholder="name@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2 ml-1">Password</label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-5 py-4 bg-bg border-2 border-border/50 rounded-2xl text-text focus:outline-none focus:border-primary-500 transition-all font-bold shadow-sm"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="material-symbols-rounded animate-spin">refresh</span>
                      ) : (
                        <>
                          Create Account
                          <span className="material-symbols-rounded text-base">person_add</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="px-8 md:px-12 lg:px-16 py-8 border-t border-border/50 text-center lg:text-left bg-surface/50 backdrop-blur-sm">
            <p className="text-sm font-bold text-text-muted">
              {isLogin ? "Don't have an account?" : "Already joined us?"}{' '}
              <button
                onClick={toggleAuth}
                className="text-primary-500 hover:text-primary-600 transition-colors underline decoration-2 underline-offset-4"
              >
                {isLogin ? 'Create one for free' : 'Sign in to account'}
              </button>
            </p>
            <div className="mt-4">
              <Link to="/dashboard" className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-text transition-colors flex items-center justify-center lg:justify-start gap-2">
                Continue as Guest
                <span className="material-symbols-rounded text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
