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
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-xl rounded-3xl border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        
        <div className="px-6 py-8 sm:p-10 relative z-10 mt-12">
          <div className="flex flex-col items-center gap-4 mb-10">
            <div className="bg-white p-2 rounded-full shadow-lg border-4 border-white">
              <div className="bg-indigo-100 p-6 rounded-full">
                <User className="w-12 h-12 text-indigo-600" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Your Profile</h2>
              <p className="text-base text-gray-500 mt-1">Manage your account settings</p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6 max-w-md mx-auto">
            {message && (
              <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${isError ? 'bg-red-50 text-red-800 border border-red-100' : 'bg-green-50 text-green-800 border border-green-100'}`}>
                {isError ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 flex-shrink-0" />}
                {message}
              </div>
            )}

            <div>
              <label htmlFor="display_name" className="block text-sm font-bold text-gray-700 mb-2">
                Display Name
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="display_name"
                  id="display_name"
                  className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-11 sm:text-sm border-gray-300 rounded-xl py-3.5 border transition-shadow"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm opacity-70">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  disabled
                  className="bg-slate-50 block w-full pl-11 sm:text-sm border-slate-200 rounded-xl py-3.5 border text-slate-500 cursor-not-allowed"
                  value={user.email}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Role
              </label>
              <div className="relative rounded-xl shadow-sm opacity-70">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  disabled
                  className="bg-slate-50 block w-full pl-11 sm:text-sm border-slate-200 rounded-xl py-3.5 border text-slate-500 cursor-not-allowed uppercase font-semibold"
                  value={user.role}
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                {loading ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
