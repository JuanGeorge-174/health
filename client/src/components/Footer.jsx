import React from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';

export function Footer() {
  const { config } = useConfig();

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-8 px-4 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-sm font-bold text-slate-200 mb-1">{config.clinicName || 'Healthcare Clinic'}</h2>
          {config.address && <p>{config.address}</p>}
          {config.phone && <p>Phone: {config.phone}</p>}
          {config.hours && <p>Hours: {config.hours}</p>}
          {config.emergencyPhone && <p className="text-rose-400 font-medium">Emergency: {config.emergencyPhone}</p>}
        </div>

        <div className="flex flex-wrap gap-4 text-slate-300 font-medium">
          <Link to="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link to="/doctors" className="hover:text-white transition-colors">
            Our Doctors
          </Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-slate-900 text-center text-slate-500">
        <p>&copy; {new Date().getFullYear()} {config.clinicName || 'Clinic'}. All rights reserved.</p>
      </div>
    </footer>
  );
}
