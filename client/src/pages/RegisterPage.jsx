import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FormField } from '../components/UI';

export function RegisterPage() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Prefer not to say');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Patient Self-Registration';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 10 || password.length > 128) {
      setError('Password must be between 10 and 128 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and confirmation password do not match.');
      return;
    }

    if (!privacyConsent) {
      setError('You must consent to the Privacy Policy to register.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        phone,
        gender,
        dateOfBirth: dateOfBirth || undefined
      });
      addToast('Account created successfully!', 'success');
      navigate('/patient/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Registration failed. Please try again.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 shadow-xl">
      <h1 className="text-xl font-bold mb-2 text-white text-center">Patient Self-Registration</h1>
      <p className="text-xs text-slate-400 text-center mb-6">Create a patient account to book appointments and view your clinical record history.</p>

      {error && <div className="p-3 mb-4 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-xs font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Full Name" htmlFor="regName">
          <input
            id="regName"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </FormField>

        <FormField label="Email Address" htmlFor="regEmail">
          <input
            id="regEmail"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </FormField>

        <FormField label="Password" htmlFor="regPassword" hint="Must be 10 to 128 characters in length.">
          <input
            id="regPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={10}
            maxLength={128}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </FormField>

        <FormField label="Confirm Password" htmlFor="regConfirmPassword">
          <input
            id="regConfirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </FormField>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showRegPass"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0"
          />
          <label htmlFor="showRegPass" className="text-xs text-slate-300">
            Show passwords
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Phone Number" htmlFor="regPhone">
            <input
              id="regPhone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </FormField>

          <FormField label="Gender" htmlFor="regGender">
            <select
              id="regGender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </FormField>
        </div>

        <FormField label="Date of Birth" htmlFor="regDob">
          <input
            id="regDob"
            type="date"
            autoComplete="bday"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </FormField>

        {/* Consent Checkbox */}
        <div className="flex items-start gap-2 pt-2">
          <input
            type="checkbox"
            id="privacyConsent"
            checked={privacyConsent}
            onChange={(e) => setPrivacyConsent(e.target.checked)}
            required
            className="mt-1 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0"
          />
          <label htmlFor="privacyConsent" className="text-xs text-slate-300 leading-normal">
            I agree to the collection and handling of my personal and medical appointment data as outlined in the{' '}
            <Link to="/privacy" target="_blank" className="text-indigo-400 underline hover:text-indigo-300">
              Privacy Policy
            </Link>.
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50 mt-4"
        >
          {loading ? 'Creating Account...' : 'Register Account'}
        </button>
      </form>

      <p className="text-center text-xs text-slate-400 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium underline">
          Sign In here
        </Link>
      </p>
    </div>
  );
}
