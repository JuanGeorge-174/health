import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { useConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Modal, FormField, Pagination, Skeleton, EmptyState, ErrorState } from '../components/UI';

export function DoctorsPage() {
  const { config, formatCurrency } = useConfig();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedSpec, setSelectedSpec] = useState(searchParams.get('specializationId') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking Modal State
  const [bookingDoc, setBookingDoc] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  useEffect(() => {
    document.title = `Specialist Doctors - ${config.clinicName || 'Healthcare Portal'}`;
  }, [config.clinicName]);

  // Sync state to URL search parameters
  useEffect(() => {
    const params = {};
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (selectedSpec) params.specializationId = selectedSpec;
    if (page > 1) params.page = page;
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedSpec, page, setSearchParams]);

  // Load specializations catalog
  useEffect(() => {
    API.get('/specializations')
      .then(res => {
        if (res.data.success) setSpecializations(res.data.data || []);
      })
      .catch(console.error);
  }, []);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery.trim()) queryParams.set('search', searchQuery.trim());
      if (selectedSpec) queryParams.set('specializationId', selectedSpec);
      queryParams.set('page', page);
      queryParams.set('limit', 12);

      const res = await API.get(`/doctors?${queryParams.toString()}`);
      if (res.data.success) {
        setDoctors(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
      setError('Unable to load doctor directory. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedSpec, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors();
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [fetchDoctors]);

  // Load candidate slots for selected date
  const loadAvailableSlots = async (docId, dateStr) => {
    if (!docId || !dateStr) return;
    setSlotsLoading(true);
    try {
      const res = await API.get(`/doctors/${docId}/available-slots?date=${dateStr}`);
      if (res.data.success) {
        setSlots(res.data.data || []);
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to load available slots.';
      addToast(msg, 'error');
    } finally {
      setSlotsLoading(false);
    }
  };

  const openBookingModal = (doc) => {
    if (!user) {
      addToast('Please sign in as a patient to book an appointment.', 'info');
      window.location.href = '/login?returnTo=' + encodeURIComponent(window.location.pathname);
      return;
    }
    if (user.role !== 'patient') {
      addToast('Only patient accounts can book appointments.', 'error');
      return;
    }
    setBookingDoc(doc);
    setSelectedSlot(null);
    setReason('');
    setNotes('');

    // Default min date to today in clinic timezone
    const today = new Date().toISOString().split('T')[0];
    setBookingDate(today);
    loadAvailableSlots(doc.id, today);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      addToast('Please select an available time slot.', 'error');
      return;
    }
    if (!reason.trim()) {
      addToast('Please enter a reason for your appointment.', 'error');
      return;
    }

    setBookingSubmitting(true);
    try {
      const res = await API.post('/appointments', {
        doctorId: bookingDoc.id,
        appointmentDate: bookingDate,
        startTime: selectedSlot.startTime,
        reason: reason.trim(),
        notes: notes ? notes.trim() : undefined
      });

      if (res.data.success) {
        addToast('Appointment booked successfully!', 'success');
        setBookingDoc(null);
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error?.message || 'Failed to book appointment.';
      addToast(msg, 'error');

      // Requirement E: Refresh slots after a 409 conflict
      if (status === 409 && bookingDoc && bookingDate) {
        loadAvailableSlots(bookingDoc.id, bookingDate);
      }
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Min/Max date limits from config
  const todayStr = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + (config.bookingWindowDays || 60));
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100">
      <h1 className="text-2xl font-bold mb-2 text-white">Find a Medical Specialist</h1>
      <p className="text-xs text-slate-400 mb-6">Search our clinic directory by doctor name, qualification, or specialization.</p>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex-1">
          <label htmlFor="docSearch" className="sr-only">Search doctors</label>
          <input
            id="docSearch"
            type="text"
            placeholder="Search by doctor name or qualification..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="w-full sm:w-64">
          <label htmlFor="specFilter" className="sr-only">Filter by Specialization</label>
          <select
            id="specFilter"
            value={selectedSpec}
            onChange={(e) => {
              setSelectedSpec(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Specializations</option>
            {specializations.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctor List Container */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDoctors} />
      ) : doctors.length === 0 ? (
        <EmptyState message="No doctors available matching your criteria." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {doctors.map(doc => (
              <div key={doc.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">{doc.name}</h2>
                  <p className="text-xs font-semibold text-indigo-400 mb-3">{doc.specialization?.name || 'General Practice'}</p>
                  <p className="text-xs text-slate-300"><strong>Qualification:</strong> {doc.qualification}</p>
                  <p className="text-xs text-slate-300"><strong>Experience:</strong> {doc.experience} years</p>
                  {doc.bio && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{doc.bio}</p>}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Consultation Fee</span>
                    <span className="text-sm font-bold text-slate-100">{formatCurrency(doc.consultationFee)}</span>
                  </div>
                  <button
                    onClick={() => openBookingModal(doc)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}

      {/* Booking Modal (Requirement E) */}
      <Modal
        isOpen={!!bookingDoc}
        onClose={() => setBookingDoc(null)}
        title={`Book Appointment with ${bookingDoc?.name}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleBookingSubmit} className="space-y-4 text-slate-100">
          <FormField label="Select Date" htmlFor="bookDate">
            <input
              id="bookDate"
              type="date"
              min={todayStr}
              max={maxDateStr}
              value={bookingDate}
              onChange={(e) => {
                setBookingDate(e.target.value);
                setSelectedSlot(null);
                loadAvailableSlots(bookingDoc.id, e.target.value);
              }}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </FormField>

          {/* Time Slots Grid */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Available 30-Minute Time Slots
            </label>

            {slotsLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : slots.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center border border-slate-800 rounded-lg bg-slate-950">
                No slots available on this date.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1 border border-slate-800 rounded-lg bg-slate-950">
                {slots.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={!s.isAvailable}
                    onClick={() => setSelectedSlot(s)}
                    className={`py-1.5 px-2 rounded text-xs font-medium border transition-colors ${
                      !s.isAvailable
                        ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed line-through'
                        : selectedSlot?.startTime === s.startTime
                        ? 'bg-indigo-600 border-indigo-500 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {s.startTime} - {s.endTime}
                  </button>
                ))}
              </div>
            )}
          </div>

          <FormField label="Reason for Appointment" htmlFor="bookReason">
            <textarea
              id="bookReason"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Annual physical checkup, headache evaluation..."
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </FormField>

          <FormField label="Additional Notes (Optional)" htmlFor="bookNotes">
            <textarea
              id="bookNotes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any relevant past history or symptoms..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </FormField>

          {/* Fee & Summary */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Consultation Fee</span>
            <span className="text-sm font-bold text-white">{formatCurrency(bookingDoc?.consultationFee)}</span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setBookingDoc(null)}
              className="px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bookingSubmitting || !selectedSlot}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium disabled:opacity-50"
            >
              {bookingSubmitting ? 'Confirming...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
