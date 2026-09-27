import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FormField } from '../components/UI';

export function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Sign In - Healthcare System';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email.trim().toLowerCase(), password);
      addToast(`Welcome back, ${user.name}!`, 'success');

      if (user.mustChangePassword) {
        navigate('/change-password');
        return;
      }

      const returnTo = searchParams.get('returnTo');
      if (returnTo) {
        navigate(decodeURIComponent(returnTo));
      } else if (user.role === 'patient') {
        navigate('/patient/dashboard');
      } else if (user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Invalid email or password.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 shadow-xl">
      <h1 className="text-xl font-bold mb-2 text-white text-center">Sign In to Your Account</h1>
      <p className="text-xs text-slate-400 text-center mb-6">Enter your registered email address and password to access the portal.</p>

      {error && <div className="p-3 mb-4 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-xs font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Email Address" htmlFor="loginEmail">
          <input
            id="loginEmail"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </FormField>

        <FormField label="Password" htmlFor="loginPassword">
          <input
            id="loginPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </FormField>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showLoginPass"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0"
          />
          <label htmlFor="showLoginPass" className="text-xs text-slate-300">
            Show password
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-xs text-slate-400 mt-6">
        Don't have a patient account?{' '}
        <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium underline">
          Register as a Patient
        </Link>
      </p>
    </div>
  );
}
