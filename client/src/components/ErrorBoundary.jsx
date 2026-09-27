import React, { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Exception caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-center text-slate-100">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-2xl">
            <h1 className="text-xl font-bold text-rose-400 mb-3">Something went wrong</h1>
            <p className="text-sm text-slate-300 mb-6">
              An unexpected application error occurred. Please refresh the page or return to home.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
