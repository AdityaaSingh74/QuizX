import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../services/api';
import { User, Mail, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);
    try {
      await fetchApi('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ display_name: displayName }),
      });
      updateUser({ display_name: displayName });
      setMessage('Profile updated successfully!');
    } catch (error: any) {
      setIsError(true);
      setMessage(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="glass-panel rounded-[3rem] overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-2 border-white/80 p-8 sm:p-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 -z-10 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 -z-10 animate-blob animation-delay-2000"></div>

        <div className="relative z-10 mt-6">
          <div className="flex flex-col items-center gap-4 mb-12">
            <div className="bg-white/60 p-2 rounded-[2rem] shadow-sm border border-white backdrop-blur-sm">
              <div className="bg-gradient-to-br from-indigo-100 to-pink-100 p-6 rounded-[1.5rem]">
                <User className="w-12 h-12 text-indigo-600" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-4xl font-serif font-extrabold text-slate-800 tracking-tight">Your Profile</h2>
              <p className="text-lg text-slate-500 mt-2 font-medium">Manage your account settings</p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-8 max-w-md mx-auto">
            {message && (
              <div className={`p-5 rounded-2xl text-sm font-bold flex items-center gap-3 backdrop-blur-md ${isError ? 'bg-red-50/80 text-red-800 border-[2px] border-red-100' : 'bg-green-50/80 text-emerald-800 border-[2px] border-green-100'}`}>
                {isError ? <AlertCircle className="w-6 h-6 flex-shrink-0" /> : <CheckCircle className="w-6 h-6 flex-shrink-0" />}
                {message}
              </div>
            )}

            <div>
              <label htmlFor="display_name" className="block text-sm font-bold text-slate-700 mb-2 px-1">
                Display Name
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <User className="h-6 w-6 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="display_name"
                  id="display_name"
                  className="focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 block w-full pl-14 sm:text-base border-white bg-white/60 hover:bg-white rounded-[1.5rem] py-4 border-[2px] transition-all font-medium text-slate-800 shadow-sm"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 px-1">
                Email Address
              </label>
              <div className="relative rounded-2xl shadow-sm opacity-60">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail className="h-6 w-6 text-slate-400" />
                </div>
                <input
                  type="email"
                  disabled
                  className="block w-full pl-14 sm:text-base border-white bg-slate-50 rounded-[1.5rem] py-4 border-[2px] text-slate-500 cursor-not-allowed font-medium shadow-sm"
                  value={user.email}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 px-1">
                Role
              </label>
              <div className="relative rounded-2xl shadow-sm opacity-60">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Shield className="h-6 w-6 text-slate-400" />
                </div>
                <input
                  type="text"
                  disabled
                  className="block w-full pl-14 sm:text-base border-white bg-slate-50 rounded-[1.5rem] py-4 border-[2px] text-slate-500 cursor-not-allowed uppercase tracking-wider font-bold shadow-sm"
                  value={user.role}
                />
              </div>
            </div>

            <div className="pt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-5 px-6 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] text-lg font-bold text-white bg-slate-900 hover:bg-slate-800 hover:shadow-[0_15px_40px_rgba(0,0,0,0.25)] focus:outline-none focus:ring-4 focus:ring-slate-900/30 disabled:opacity-50 transition-all hover:-translate-y-1 relative overflow-hidden group"
              >
                <span className="relative z-10">{loading ? 'Saving Changes...' : 'Save Changes'}</span>
                {!loading && (
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
