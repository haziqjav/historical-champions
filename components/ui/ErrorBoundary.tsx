import React from 'react';

interface State { error: Error | null; }

/** Last line of defence: a render crash shows a recovery screen instead of a blank page. */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error) { console.error('Unhandled UI error:', error); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="fixed inset-0 bg-slate-950 text-white flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-black text-yellow-500 uppercase tracking-widest">Something went wrong</h1>
        <p className="text-slate-400 max-w-md text-sm">The game hit an unexpected error. Your saved progress is safe.</p>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-red-700 rounded font-black uppercase tracking-widest" onClick={() => this.setState({ error: null })}>Try again</button>
          <button className="px-6 py-3 bg-slate-700 rounded font-black uppercase tracking-widest" onClick={() => location.reload()}>Reload</button>
        </div>
      </div>
    );
  }
}
