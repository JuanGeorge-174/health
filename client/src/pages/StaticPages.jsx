import React, { useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';

export function PrivacyPage() {
  const { config } = useConfig();

  useEffect(() => {
    document.title = `Privacy Policy - ${config.clinicName || 'Healthcare Portal'}`;
  }, [config.clinicName]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-200">
      <div className="bg-amber-950/40 border border-amber-800/50 p-4 rounded-xl text-amber-200 text-xs mb-8">
        ⚖️ <strong>Notice:</strong> This Privacy Policy template describes data collection for the online appointment booking portal. It must be formally reviewed and approved by {config.clinicName || "the clinic's"} legal adviser.
      </div>

      <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
      
      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">1. Information We Collect</h2>
          <p>
            When you register for an account or book an appointment on this platform, we collect personal identity information, including your full name, email address, phone number, gender, date of birth, and home address. Medical records and consultation notes documented by attending physicians are securely stored to maintain clinical history.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">2. How Information Is Used</h2>
          <p>
            Your information is strictly used to schedule consultations, verify physician availability, provide appointment status notifications, and maintain confidential medical records between you and your healthcare provider.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">3. Role-Based Data Isolation</h2>
          <p>
            Administrative personnel are restricted by strict system controls from reading, creating, or modifying medical records. Physicians can access clinical records strictly for patients with whom they have established an active clinical relationship.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">4. Cookies &amp; Security</h2>
          <p>
            Authentication is managed via HTTP-only, secure cookies. No personal data or medical notes are exposed or stored in browser local storage.
          </p>
        </section>
      </div>
    </div>
  );
}

export function TermsPage() {
  const { config } = useConfig();

  useEffect(() => {
    document.title = `Terms of Service - ${config.clinicName || 'Healthcare Portal'}`;
  }, [config.clinicName]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-200">
      <div className="bg-amber-950/40 border border-amber-800/50 p-4 rounded-xl text-amber-200 text-xs mb-8">
        ⚖️ <strong>Notice:</strong> These Terms of Service must be reviewed and approved by {config.clinicName || "the clinic's"} legal adviser.
      </div>

      <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">1. Medical Emergency Disclaimer</h2>
          <p className="text-rose-300 font-medium">
            This online appointment booking platform is strictly intended for non-urgent scheduled outpatient consultations. If you are experiencing a life-threatening emergency, chest pain, severe bleeding, or acute distress, DO NOT rely on this portal. Immediately call local emergency medical services or proceed to the nearest emergency department.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">2. Appointment Cancellations</h2>
          <p>
            Patients may cancel scheduled appointments up to {config.cancellationCutoffHours || 24} hours prior to the scheduled start time. Cancellations requested within the {config.cancellationCutoffHours || 24}-hour cutoff window must be managed by contacting clinic staff directly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">3. User Responsibilities</h2>
          <p>
            Users are required to provide accurate, truthful personal and contact information upon registration and appointment booking.
          </p>
        </section>
      </div>
    </div>
  );
}

/** Default export used by the lazy() import in App.jsx.
 *  Pass `page="privacy"` or `page="terms"` as a prop via the Route element. */
export default function StaticPages({ page }) {
  if (page === 'terms') return <TermsPage />;
  return <PrivacyPage />;
}
