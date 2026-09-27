import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfig } from '../context/ConfigContext';
import { StatusBadge } from '../components/StatusBadge';
import { MedicalRecordModal } from '../components/MedicalRecordModal';
import {
  Calendar, Clock, User, CheckCircle, XCircle,
  FilePlus, Settings, Stethoscope, AlertCircle, RefreshCw,
} from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function CardSkeleton() {
  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 animate-pulse space-y-3">
      <div className="h-3 bg-slate-700 rounded w-1/2" />
      <div className="h-2 bg-slate-800 rounded w-3/4" />
      <div className="h-2 bg-slate-800 rounded w-2/3" />
    </div>
  );
}

export function DoctorDashboard() {
  const { user } = useAuth();
  const { addToast, showConfirm } = useToast();
  const { formatDate } = useConfig();

  const [appointments, setAppointments] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [selectedApptForRecord, setSelectedApptForRecord] = useState(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingAvailability, setSavingAvailability] = useState(false);

  // Local copy of availability to edit in modal
  const [availability, setAvailability] = useState([]);
  const [draftAvailability, setDraftAvailability] = useState([]);

  const fetchDoctorData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const meRes = await API.get('/auth/me');
      if (meRes.data.success && meRes.data.data.doctorProfile) {
        const doc = meRes.data.data.doctorProfile;
        setDoctorProfile(doc);
        setAvailability(doc.availability || []);

        const apptRes = await API.get('/appointments');
        if (apptRes.data.success) setAppointments(apptRes.data.data);
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to load dashboard. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctorData();
  }, [fetchDoctorData]);

  const handleOpenAvailability = () => {
    setDraftAvailability(JSON.parse(JSON.stringify(availability)));
    setShowAvailabilityModal(true);
  };

  const handleStatusChange = async (appointmentId, newStatus, appt) => {
    const labels = { confirmed: 'confirm', completed: 'mark as completed', cancelled: 'cancel' };
    const confirmed = await showConfirm({
      title: `${labels[newStatus]?.charAt(0).toUpperCase() + labels[newStatus]?.slice(1)} appointment?`,
      message: `Are you sure you want to ${labels[newStatus]} the appointment with ${appt.patientId?.userId?.name || 'this patient'} on ${formatDate(appt.appointmentDate)} at ${appt.startTime}?`,
      confirmText: 'Yes, proceed',
      isDanger: newStatus === 'cancelled',
    });
    if (!confirmed) return;

    try {
      const res = await API.patch(`/appointments/${appointmentId}/status`, { status: newStatus });
      if (res.data.success) {
        addToast(`Appointment ${newStatus} successfully.`, 'success');
        fetchDoctorData();
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to update appointment status.';
      addToast(msg, 'error');
    }
  };

  const toggleDraftDay = (dayNum) => {
    const exists = draftAvailability.some(a => a.dayOfWeek === dayNum);
    if (exists) {
      setDraftAvailability(draftAvailability.filter(a => a.dayOfWeek !== dayNum));
    } else {
      setDraftAvailability([...draftAvailability, { dayOfWeek: dayNum, startTime: '09:00', endTime: '17:00' }]);
    }
  };

  const updateDraftTime = (dayNum, field, value) => {
    setDraftAvailability(draftAvailability.map(a =>
      a.dayOfWeek === dayNum ? { ...a, [field]: value } : a
    ));
  };

  const handleSaveAvailability = async () => {
    if (!doctorProfile) return;
    setSavingAvailability(true);
    try {
      const res = await API.put(`/doctors/${doctorProfile._id}/availability`, { availability: draftAvailability });
      if (res.data.success) {
        setShowAvailabilityModal(false);
        addToast('Availability schedule updated.', 'success');
        fetchDoctorData();
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to update availability.';
      addToast(msg, 'error');
    } finally {
      setSavingAvailability(false);
    }
  };

  // Today's appointments using clinic timezone if available
  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
  const todayAppts = appointments.filter(a => {
    const d = new Date(a.appointmentDate);
    return d.toLocaleDateString('en-CA') === todayStr;
  });

  /* ─── Error state ──────────────────────────────────────────── */
  if (error && !loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <p className="text-sm text-rose-300 font-semibold">{error}</p>
        <button onClick={fetchDoctorData} className="gradient-btn px-5 py-2.5 rounded-xl text-xs font-bold text-white">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="space-y-1 relative z-10">
          <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Physician Workspace</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{user?.name}</h1>
          <p className="text-xs text-slate-400">
            Specialization:{' '}
            <span className="text-sky-400 font-semibold">
              {doctorProfile?.specializationId?.name || '—'}
            </span>
          </p>
        </div>
        <button
          onClick={handleOpenAvailability}
          className="gradient-btn px-5 py-3 rounded-2xl text-xs font-bold text-white shadow-xl flex items-center gap-2 relative z-10 shrink-0"
        >
          <Settings className="w-4 h-4" /> Manage Availability
        </button>
      </div>

      {/* ── Metrics ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Today's Appointments", value: todayAppts.length, icon: <Calendar className="w-5 h-5" />, colour: 'sky' },
          { label: 'Awaiting Confirmation', value: appointments.filter(a => a.status === 'scheduled').length, icon: <Clock className="w-5 h-5" />, colour: 'amber' },
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

      {/* ── Appointment List ─────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Patient Schedule</h2>
          <button
            onClick={fetchDoctorData}
            disabled={loading}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {loading ? (
          <>{[0, 1, 2].map(i => <CardSkeleton key={i} />)}</>
        ) : appointments.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl text-center border border-slate-800">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No patient bookings scheduled yet.</p>
            <p className="text-xs text-slate-500 mt-1">Patients can book once you have set your availability.</p>
          </div>
        ) : (
          appointments.map((appt) => (
            <div key={appt._id} className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <StatusBadge status={appt.status} />
                    <span className="text-xs text-slate-400 font-mono">
                      {formatDate(appt.appointmentDate)} &bull; {appt.startTime}–{appt.endTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-sky-400 shrink-0" />
                    {appt.patientId?.userId?.name || 'Patient'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    <span className="text-slate-500 font-semibold">Chief complaint: </span>{appt.reason}
                  </p>
                </div>

                {/* Status Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {appt.status === 'scheduled' && (
                    <button
                      onClick={() => handleStatusChange(appt._id, 'confirmed', appt)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Confirm
                    </button>
                  )}

                  {(appt.status === 'scheduled' || appt.status === 'confirmed') && (
                    <>
                      <button
                        onClick={() => handleStatusChange(appt._id, 'completed', appt)}
                        className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Mark Completed
                      </button>

                      <button
                        onClick={() => setSelectedApptForRecord(appt)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <FilePlus className="w-3.5 h-3.5" /> Add Record
                      </button>

                      <button
                        onClick={() => handleStatusChange(appt._id, 'cancelled', appt)}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Medical Record Modal ─────────────────────────────── */}
      {selectedApptForRecord && (
        <MedicalRecordModal
          appointment={selectedApptForRecord}
          onClose={() => setSelectedApptForRecord(null)}
          onSuccess={() => {
            setSelectedApptForRecord(null);
            addToast('Medical record saved successfully.', 'success');
            fetchDoctorData();
          }}
        />
      )}

      {/* ── Availability Schedule Modal ──────────────────────── */}
      {showAvailabilityModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Manage availability schedule"
        >
          <div className="glass-card w-full max-w-lg rounded-2xl border border-slate-700 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-sky-400" /> Weekly Availability
              </h3>
              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="text-slate-400 hover:text-white p-1 text-xl leading-none"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <p className="text-xs text-slate-400">Toggle each working day, then set the start/end hours.</p>

            <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
              {DAYS.map((dayName, idx) => {
                const slot = draftAvailability.find(a => a.dayOfWeek === idx);
                return (
                  <div key={dayName} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => toggleDraftDay(idx)}
                      className={`w-24 shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        slot ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-400'
                      }`}
                      aria-pressed={!!slot}
                    >
                      {dayName}
                    </button>
                    {slot ? (
                      <div className="flex items-center gap-2 text-xs">
                        <label className="text-slate-400 shrink-0">From</label>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={e => updateDraftTime(idx, 'startTime', e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white"
                          aria-label={`${dayName} start time`}
                        />
                        <label className="text-slate-400 shrink-0">To</label>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={e => updateDraftTime(idx, 'endTime', e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white"
                          aria-label={`${dayName} end time`}
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600 italic">Off / Unavailable</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button onClick={() => setShowAvailabilityModal(false)} className="px-4 py-2 text-xs text-slate-400 hover:text-white">
                Cancel
              </button>
              <button
                onClick={handleSaveAvailability}
                disabled={savingAvailability}
                className="gradient-btn px-5 py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-50"
              >
                {savingAvailability ? 'Saving…' : 'Save Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
