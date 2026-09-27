import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-sky-600/5 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 space-y-6 max-w-md">
        {/* 404 */}
        <div className="space-y-2">
          <p className="text-8xl font-extrabold gradient-text select-none">404</p>
          <h1 className="text-2xl font-bold text-white">Page not found</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
            Check the URL or navigate back to a known page.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-semibold text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <Link
            to="/"
            className="gradient-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </div>

        {/* Quick nav suggestions */}
        <div className="pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-semibold">Quick links</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: 'Browse Doctors', to: '/doctors' },
              { label: 'Sign In', to: '/login' },
              { label: 'Register', to: '/register' },
              { label: 'Privacy Policy', to: '/privacy' },
            ].map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
