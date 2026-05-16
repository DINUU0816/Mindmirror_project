import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(credentials);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="text-center mb-10">
        <BrainCircuit className="w-16 h-16 text-primary-500 mx-auto mb-4" />
        <h1 className="text-4xl font-black mb-2">Welcome Back</h1>
        <p className="text-white/40">Reconnect with your emotional self.</p>
      </div>

      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-white/60">Username</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="yourusername"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-white/60">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input
                type="password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 rounded-xl font-bold transition-all shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : <><ArrowRight className="w-5 h-5" /> Sign In</>}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-white/40">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 font-bold hover:underline">Create one</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
