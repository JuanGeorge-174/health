import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfig } from '../context/ConfigContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  Calendar, FileText, Clock, Stethoscope,
  PlusCircle, XCircle, ChevronRight, AlertCircle,
  RefreshCw,
} from 'lucide-react';

/* ─── Loading skeleton ──────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 animate-pulse space-y-3">
      <div className="h-3 bg-slate-700 rounded w-1/2" />
      <div className="h-2 bg-slate-800 rounded w-3/4" />
      <div className="h-2 bg-slate-800 rounded w-2/3" />
    </div>
  );
}

export function PatientDashboard() {
  const { user } = useAuth();
  const { addToast, showConfirm } = useToast();
  const { formatDate, formatCurrency } = useConfig();

  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [patientProfile, setPatientProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('appointments');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPatientData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const meRes = await API.get('/auth/me');
      if (meRes.data.success && meRes.data.data.patientProfile) {
        const pat = meRes.data.data.patientProfile;
        setPatientProfile(pat);

        const [apptRes, recordRes] = await Promise.all([
          API.get('/appointments'),
          API.get(`/patients/${pat._id}/medical-records`),
        ]);

        if (apptRes.data.success) setAppointments(apptRes.data.data);
        if (recordRes.data.success) setMedicalRecords(recordRes.data.data);
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to load your dashboard. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatientData();
  }, [fetchPatientData]);

  const handleCancelAppointment = async (appt) => {
    const confirmed = await showConfirm({
      title: 'Cancel appointment?',
      message: `Cancel your appointment with Dr. ${appt.doctorId?.userId?.name || 'your doctor'} on ${formatDate(appt.appointmentDate)} at ${appt.startTime}? This cannot be undone.`,
      confirmText: 'Yes, cancel it',
      cancelText: 'Keep appointment',
      isDanger: true,
    });
    if (!confirmed) return;

    try {
      await API.patch(`/appointments/${appt._id}/status`, { status: 'cancelled' });
      addToast('Appointment cancelled successfully.', 'success');
      fetchPatientData();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to cancel appointment.';
      addToast(msg, 'error');
    }
  };

  const upcomingAppts = appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed');
  const pastAppts = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled' || a.status === 'no_show');

  /* ─── Error state ─────────────────────────────────────────── */
  if (error && !loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <p className="text-sm text-rose-300 font-semibold">{error}</p>
        <button onClick={fetchPatientData} className="gradient-btn px-5 py-2.5 rounded-xl text-xs font-bold text-white">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-sky-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="space-y-1 relative z-10">
          <span className="text-xs text-sky-400 font-bold uppercase tracking-wider">Patient Portal</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-xs text-slate-400">Manage your appointments and medical history</p>
        </div>
        <Link
          to="/doctors"
          className="gradient-btn px-5 py-3 rounded-2xl text-xs font-bold text-white shadow-xl flex items-center gap-2 relative z-10 shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Book New Appointment
        </Link>
      </div>

      {/* ── Metrics ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Upcoming', value: upcomingAppts.length, icon: <Calendar className="w-5 h-5" />, colour: 'amber' },
          { label: 'Medical Records', value: medicalRecords.length, icon: <FileText className="w-5 h-5" />, colour: 'sky' },
          { label: 'Total Consultations', value: appointments.length, icon: <Stethoscope className="w-5 h-5" />, colour: 'emerald' },
        ].map(({ label, value, icon, colour }) => (
          <div key={label} className="glass-card p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
              <div className={`w-10 h-10 rounded-xl bg-${colour}-500/10 text-${colour}-400 flex items-center justify-center`}>
                {icon}
              </div>
            </div>
            {loading
              ? <div className="h-8 w-12 bg-slate-700 rounded mt-2 animate-pulse" />
              : <span className="text-3xl font-extrabold text-white mt-2 block">{value}</span>
            }
          </div>
        ))}
      </div>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div className="flex items-center gap-4 border-b border-slate-800 pb-2">
        {[
          { key: 'appointments', label: `My Appointments (${appointments.length})`, icon: <Calendar className="w-4 h-4" /> },
          { key: 'records', label: `Medical Records (${medicalRecords.length})`, icon: <FileText className="w-4 h-4" /> },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`pb-2 px-1 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === key ? 'border-sky-400 text-sky-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {icon} {label}
          </button>
        ))}
        <button
          onClick={fetchPatientData}
          disabled={loading}
          className="ml-auto text-xs text-slate-500 hover:text-sky-400 flex items-center gap-1 transition-colors"
          aria-label="Refresh data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Appointments Tab ────────────────────────────────── */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {loading ? (
            <>{[0, 1, 2].map(i => <CardSkeleton key={i} />)}</>
          ) : appointments.length === 0 ? (
            <div className="glass-card p-12 rounded-2xl text-center space-y-3 border border-slate-800">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">You have no appointments yet.</p>
              <Link to="/doctors" className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:underline">
                Browse Doctors &amp; Book Now <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            appointments.map((appt) => (
              <div
                key={appt._id}
                className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <StatusBadge status={appt.status} />
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      {formatDate(appt.appointmentDate)} &bull; {appt.startTime}–{appt.endTime}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Dr. {appt.doctorId?.userId?.name || 'Doctor'}
                    <span className="text-xs font-normal text-sky-400 ml-2">({appt.doctorId?.specializationId?.name})</span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    <span className="text-slate-500 font-semibold">Reason: </span>{appt.reason}
                  </p>
                  {appt.consultationFee != null && (
                    <p className="text-xs text-slate-400">
                      Fee: <span className="text-white font-semibold">{formatCurrency(appt.consultationFee)}</span>
                    </p>
                  )}
                </div>

                {(appt.status === 'scheduled' || appt.status === 'confirmed') && (
                  <button
                    onClick={() => handleCancelAppointment(appt)}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-center transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Cancel Booking
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Medical Records Tab ─────────────────────────────── */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          {loading ? (
            <>{[0, 1].map(i => <CardSkeleton key={i} />)}</>
          ) : medicalRecords.length === 0 ? (
            <div className="glass-card p-12 rounded-2xl text-center border border-slate-800">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No medical records available yet.</p>
              <p className="text-xs text-slate-500 mt-1">Records are created by your doctor after a consultation.</p>
            </div>
          ) : (
            medicalRecords.map((record) => (
              <div key={record._id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-start justify-between pb-3 border-b border-slate-800 gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                      Diagnosis: {record.diagnosis}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Attending Physician: Dr. {record.doctorId?.userId?.name}
                      {record.doctorId?.specializationId?.name && (
                        <> &bull; {record.doctorId.specializationId.name}</>
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 font-mono shrink-0">
                    {formatDate(record.createdAt)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {record.symptoms && (
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <span className="font-semibold text-slate-300 block mb-1">Symptoms Reported</span>
                      <p className="text-slate-400 leading-relaxed">{record.symptoms}</p>
                    </div>
                  )}
                  {record.treatment && (
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <span className="font-semibold text-slate-300 block mb-1">Treatment Plan</span>
                      <p className="text-slate-400 leading-relaxed">{record.treatment}</p>
                    </div>
                  )}
                </div>

                {record.notes && (
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
                    <span className="font-semibold text-slate-300 block mb-1">Clinical Notes</span>
                    <p className="text-slate-400 leading-relaxed">{record.notes}</p>
                  </div>
                )}

                {record.prescription && (
                  <div className="bg-sky-500/10 p-3.5 rounded-xl border border-sky-500/20 text-xs">
                    <span className="font-bold text-sky-300 block mb-1">Prescription &amp; Medications</span>
                    <p className="text-sky-200 font-mono leading-relaxed whitespace-pre-wrap">{record.prescription}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
