import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../services/api';
import { BookOpen, User, Shield, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const loadDemo = (role: 'admin' | 'student') => {
    setEmail(role === 'admin' ? 'admin@quizx.com' : 'student@quizx.com');
    setPassword(role === 'admin' ? 'admin123' : 'student123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md w-full space-y-8 glass-panel p-10 rounded-[2.5rem] relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 via-indigo-400 to-teal-400"></div>

        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-indigo-100 to-pink-100 rounded-3xl flex items-center justify-center mb-6 transform -rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300 shadow-sm border border-white">
            <BookOpen className="h-10 w-10 text-indigo-500 drop-shadow-sm" />
          </div>
          <h2 className="text-4xl font-serif font-bold text-slate-800 tracking-tight">Welcome</h2>
          <p className="mt-3 text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-indigo-500 hover:text-pink-500 transition-colors">
              Sign up here
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm text-center font-medium animate-pulse">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full pl-12 pr-4 py-4 border-2 border-transparent bg-white/60 placeholder-slate-400 text-slate-800 rounded-full focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white sm:text-sm transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)]"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative group">
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full pl-12 pr-4 py-4 border-2 border-transparent bg-white/60 placeholder-slate-400 text-slate-800 rounded-full focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white sm:text-sm transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-slate-900 hover:bg-slate-800 hover:shadow-[0_10px_25px_rgba(0,0,0,0.15)] focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 transition-all hover:-translate-y-1"
            >
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200/50">
          <p className="text-xs text-center text-slate-400 mb-4 uppercase tracking-widest font-bold">Demo Accounts</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => loadDemo('student')}
              className="flex items-center justify-center gap-2 px-3 py-3 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-600 bg-white/60 hover:bg-white hover:border-indigo-100 hover:text-indigo-600 transition-all hover:-translate-y-0.5"
            >
              <User className="w-4 h-4 text-indigo-400" /> Student
            </button>
            <button
              type="button"
              onClick={() => loadDemo('admin')}
              className="flex items-center justify-center gap-2 px-3 py-3 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-600 bg-white/60 hover:bg-white hover:border-pink-100 hover:text-pink-600 transition-all hover:-translate-y-0.5"
            >
              <Shield className="w-4 h-4 text-pink-400" /> Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
