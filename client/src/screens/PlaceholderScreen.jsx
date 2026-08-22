import React from 'react';

const PlaceholderScreen = ({ title }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="pb-8 border-b border-[var(--line)]">
        <h1 className="text-3xl font-light mb-2" style={{ fontFamily: 'var(--font-display)' }}>{title}</h1>
        <p className="text-sm uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>Implementation Phase Active</p>
      </div>
      <div className="p-12 border border-[var(--line-strong)] text-center flex flex-col items-center justify-center bg-[var(--fill-ghost)]">
        <div className="text-sm mb-4" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
          Module pending real data hookup via API.
        </div>
        <div className="px-6 py-2 border border-[var(--line-strong)] text-xs uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)' }}>
          System Ready
        </div>
      </div>
    </div>
  );
};

export default PlaceholderScreen;
