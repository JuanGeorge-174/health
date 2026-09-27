import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Calendar, Clock, X, CheckCircle, AlertCircle, FileText } from 'lucide-react';

export const BookingModal = ({ doctor, onClose, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate || !doctor) return;
      setLoadingSlots(true);
      setError('');
      setSelectedSlot(null);
      try {
        const res = await API.get(`/doctors/${doctor._id}/available-slots?date=${selectedDate}`);
        if (res.data.success) {
          setSlots(res.data.data);
        }
      } catch (err) {
        setError('Failed to fetch doctor availability slots.');
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDate, doctor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please select an available time slot.');
      return;
    }
    if (!reason.trim()) {
      setError('Please enter a reason for your appointment.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await API.post('/appointments', {
        doctorId: doctor._id,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reason,
        notes
      });

      if (res.data.success) {
        onSuccess(res.data.data);
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to book appointment. Please try another slot.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-card w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-400" /> Book Appointment
            </h3>
            <p className="text-xs text-slate-400 mt-1">With {doctor.userId?.name} ({doctor.specializationId?.name})</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Select Date</label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Slots */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Available Time Slots</label>
            {loadingSlots ? (
              <div className="py-8 text-center text-xs text-slate-400">Calculating doctor availability...</div>
            ) : slots.length === 0 ? (
              <p className="text-xs text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-center">
                Doctor has no working availability on this day of the week.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {slots.map((slot) => (
                  <button
                    key={slot.startTime}
                    type="button"
                    disabled={!slot.isAvailable}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                      !slot.isAvailable
                        ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed line-through'
                        : selectedSlot?.startTime === slot.startTime
                        ? 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/30 ring-2 ring-sky-400/50'
                        : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-sky-400'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {slot.startTime}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Reason for Visit *</label>
            <input
              type="text"
              required
              placeholder="e.g. Regular heart checkup, severe headaches..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedSlot}
              className="gradient-btn px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {submitting ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
