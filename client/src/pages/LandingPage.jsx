import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useConfig } from '../context/ConfigContext';
import { Skeleton, ErrorState, EmptyState } from '../components/UI';

export function LandingPage() {
  const { config } = useConfig();
  const navigate = useNavigate();

  const [specializations, setSpecializations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = `${config.clinicName || 'Healthcare'} - Patient Appointment Booking`;
  }, [config.clinicName]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [specRes, docRes] = await Promise.all([
        API.get('/specializations'),
        API.get('/doctors?limit=4')
      ]);
      if (specRes.data.success) setSpecializations(specRes.data.data || []);
      if (docRes.data.success) setDoctors(docRes.data.data || []);
    } catch (err) {
      console.error('Failed to load landing page data:', err);
      setError('Unable to load clinical directory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Emergency Notice Header */}
      <div className="bg-rose-950/80 border-b border-rose-900/50 py-2 px-4 text-center text-xs font-medium text-rose-200">
        ⚠️ This online booking portal is for scheduled appointments. If you are experiencing a medical emergency, please call your local emergency services or visit the nearest emergency department immediately.
        {config.emergencyPhone && <span className="ml-2 font-bold">Emergency Contact: {config.emergencyPhone}</span>}
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 max-w-3xl mx-auto leading-tight">
          Book Your Medical Appointment Online
        </h1>
        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8">
          Find a medical specialist, view real-time open consultation slots, and confirm your appointment in minutes.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Link
            to="/doctors"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition-colors shadow-lg"
          >
            Book An Appointment
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm rounded-xl transition-colors"
          >
            Sign In
          </Link>
        </div>

        {/* Clinic Location & Info Notice */}
        {(config.clinicName || config.address || config.hours) && (
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl max-w-xl mx-auto text-xs text-slate-300 space-y-1">
            {config.clinicName && <p className="font-semibold text-slate-200">{config.clinicName}</p>}
            {config.address && <p>📍 {config.address}</p>}
            {config.hours && <p>🕒 Clinic Hours: {config.hours}</p>}
            {config.phone && <p>📞 Phone: {config.phone}</p>}
          </div>
        )}
      </section>

      {/* How Booking Works */}
      <section className="bg-slate-900/50 border-y border-slate-800 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-10">How Booking Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center mx-auto mb-4 text-lg">1</div>
              <h3 className="font-semibold text-white mb-2">1. Select a Specialist</h3>
              <p className="text-xs text-slate-400">Filter doctors by medical specialization, qualification, or name to find the right clinician.</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center mx-auto mb-4 text-lg">2</div>
              <h3 className="font-semibold text-white mb-2">2. Choose Open Time Slot</h3>
              <p className="text-xs text-slate-400">View real-time 30-minute consultation slots up to {config.bookingWindowDays || 60} days in advance.</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center mx-auto mb-4 text-lg">3</div>
              <h3 className="font-semibold text-white mb-2">3. Confirm & Visit</h3>
              <p className="text-xs text-slate-400">Receive instant in-app appointment confirmation and track status from your patient dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations Shortcuts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-white mb-6">Medical Specializations</h2>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchData} />
        ) : specializations.length === 0 ? (
          <EmptyState message="No specializations available yet." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {specializations.map(spec => (
              <button
                key={spec._id}
                onClick={() => navigate(`/doctors?specializationId=${spec._id}`)}
                className="p-4 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-left transition-colors"
              >
                <h3 className="font-semibold text-sm text-slate-200">{spec.name}</h3>
                {spec.description && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{spec.description}</p>}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Featured Doctors Directory */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Our Medical Specialists</h2>
          <Link to="/doctors" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
            View All Doctors →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : doctors.length === 0 ? (
          <EmptyState message="No doctors available yet." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {doctors.map(doc => (
              <div key={doc.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">{doc.name}</h3>
                  <p className="text-xs text-indigo-400 font-medium">{doc.specialization?.name || 'General Practice'}</p>
                  <p className="text-xs text-slate-400 mt-2">{doc.qualification}</p>
                  <p className="text-xs text-slate-400">{doc.experience} years experience</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-200">
                    Fee: {doc.consultationFee ? `${doc.consultationFee}` : 'N/A'}
                  </span>
                  <Link
                    to={`/doctors?specializationId=${doc.specialization?.id || ''}`}
                    className="text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Book Slot
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
