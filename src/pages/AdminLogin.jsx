import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/common/BrandLogo';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await axios.post('/api/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans transition-colors duration-300">
      <div className="absolute top-0 w-full h-[400px] bg-brand/5 dark:bg-brand/10 blur-[100px] -z-10 transform -translate-y-1/2 rounded-full"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        <Link to="/" className="inline-flex flex-col items-center justify-center mb-6 group" aria-label="Startaply Home">
          <BrandLogo variant="vertical" height={70} className="group-hover:scale-105 transition-transform duration-300" />
        </Link>

        <h2 className="text-center text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Admin Portal
        </h2>
        <p className="mt-1.5 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
          Sign in to access the operational intelligence console
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-[#0a0a0a] py-10 px-6 shadow-2xl sm:rounded-[2rem] sm:px-10 border border-slate-200 dark:border-neutral-800">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-4 rounded-2xl border border-red-100 dark:border-red-900/50 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-14 sm:text-sm bg-slate-50 dark:bg-[#121212] border-slate-200 dark:border-neutral-800 border focus:ring-2 focus:ring-brand focus:border-brand rounded-full py-4 pr-5 outline-none text-slate-900 dark:text-white transition-all font-medium"
                  placeholder="admin@startaply.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-14 sm:text-sm bg-slate-50 dark:bg-[#121212] border-slate-200 dark:border-neutral-800 border focus:ring-2 focus:ring-brand focus:border-brand rounded-full py-4 pr-5 outline-none text-slate-900 dark:text-white transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-lg shadow-brand/20 text-sm font-bold text-on-brand bg-brand hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 transition-all gap-2 items-center"
              >
                {isLoading ? 'Authenticating...' : 'Sign in to Dashboard'}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </div>

            <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
              <Link to="/" className="text-sm font-bold text-slate-500 hover:text-brand dark:hover:text-brand-hover flex items-center justify-center gap-2 transition-colors">
                <Home size={16} /> Back to Public Site
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
