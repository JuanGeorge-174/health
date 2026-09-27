import React, { useEffect, useRef } from 'react';

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={dialogRef}
        className={`bg-slate-900 border border-slate-800 rounded-xl p-6 w-full ${maxWidth} shadow-2xl text-slate-100 relative my-8`}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <h2 id="modal-title" className="text-lg font-semibold text-slate-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export function FormField({ label, htmlFor, error, hint, children }) {
  const errorId = error ? `${htmlFor}-error` : undefined;
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5 mb-4">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-slate-200">
          {label}
        </label>
      )}
      {React.isValidElement(children)
        ? React.cloneElement(children, {
            id: htmlFor,
            'aria-invalid': error ? 'true' : undefined,
            'aria-describedby': describedBy
          })
        : children}
      {hint && !error && <p id={hintId} className="text-xs text-slate-400">{hint}</p>}
      {error && <p id={errorId} className="text-xs text-rose-400 font-medium">{error}</p>}
    </div>
  );
}

export function Table({ caption, headers, children }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-800">
      <table className="w-full text-left text-sm text-slate-200">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 border-b border-slate-800">
          <tr>
            {headers.map((h, i) => (
              <th key={i} scope="col" className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-950/40">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 text-xs text-slate-400">
      <span>Page {page} of {totalPages}</span>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1.5 rounded-md border border-slate-800 bg-slate-900 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
        >
          Previous
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1.5 rounded-md border border-slate-800 bg-slate-900 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function EmptyState({ message, actionLabel, onAction }) {
  return (
    <div className="py-12 px-4 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40 my-4">
      <p className="text-slate-400 text-sm mb-4">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="py-8 px-4 text-center border border-rose-900/50 bg-rose-950/20 rounded-xl my-4">
      <p className="text-rose-300 text-sm font-medium mb-3">{message || 'Failed to load data.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-xs font-medium rounded-lg bg-rose-700 hover:bg-rose-600 text-white transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function Skeleton({ className = 'h-6 w-full' }) {
  return <div className={`animate-pulse bg-slate-800 rounded ${className}`} />;
}
