import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FormField } from '../components/UI';
import API from '../services/api';

export function ChangePasswordPage() {
  const { user, refreshAuth } = useAuth();
  const { addToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Change Password';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 10 || newPassword.length > 128) {
      setError('New password must be between 10 and 128 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/change-password', { currentPassword, newPassword });
      if (res.data.success) {
        addToast('Password changed successfully!', 'success');
        await refreshAuth();
        window.location.href = '/';
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to change password.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 shadow-xl">
      <h1 className="text-xl font-bold mb-2 text-white">Change Password</h1>
      {user?.mustChangePassword && (
        <div className="p-3 mb-4 bg-amber-950/60 border border-amber-800 rounded-lg text-amber-200 text-xs font-medium">
          ⚠️ You must change your initial temporary password before proceeding.
        </div>
      )}

      {error && <div className="p-3 mb-4 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-xs font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Current Password" htmlFor="currentPassword">
          <input
            type={showPassword ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </FormField>

        <FormField label="New Password" htmlFor="newPassword" hint="Must be 10 to 128 characters in length.">
          <input
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={10}
            maxLength={128}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </FormField>

        <FormField label="Confirm New Password" htmlFor="confirmPassword">
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </FormField>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showPasswordToggle"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0"
          />
          <label htmlFor="showPasswordToggle" className="text-xs text-slate-300">
            Show passwords
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Updating Password...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
