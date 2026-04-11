import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Home } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative Background */}
      <div className="absolute top-0 w-full h-[400px] bg-emerald-900/20 blur-[100px] -z-10 transform -translate-y-1/2 rounded-full"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-2xl tracking-tighter">S</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">STRATA<span className="text-emerald-500">PLY</span></h2>
        </Link>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400 font-medium">
          Sign in to access the secure dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900 py-10 px-6 shadow-2xl sm:rounded-3xl sm:px-10 border border-slate-800">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-900/30 text-red-400 text-sm p-4 rounded-xl border border-red-900/50 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 sm:text-sm bg-slate-950 border-slate-800 border focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl p-3.5 outline-none text-white transition-all"
                  placeholder="admin@strataply.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 sm:text-sm bg-slate-950 border-slate-800 border focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl p-3.5 outline-none text-white transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-900/20 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 transition-all gap-2 items-center"
              >
                {isLoading ? 'Authenticating...' : 'Sign in to Dashboard'}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </div>

            <div className="mt-8 text-center border-t border-slate-800 pt-6">
              <Link to="/" className="text-sm font-bold text-slate-500 hover:text-emerald-400 flex items-center justify-center gap-2 transition-colors">
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