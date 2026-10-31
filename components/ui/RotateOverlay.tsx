import React from 'react';

/** Shown only when combat is on screen in portrait. Combat is paused underneath and keeps its state. */
export const RotateOverlay: React.FC = () => (
  <div className="fixed inset-0 z-[90] bg-black flex flex-col items-center justify-center p-8 text-center" role="alert">
    <div className="rotate-icon" />
    <h2 className="text-3xl font-bold mb-4 neon-text">Rotate</h2>
    <p className="text-white text-lg font-mono tracking-widest">PLEASE ROTATE YOUR DEVICE<br />TO LANDSCAPE TO FIGHT</p>
    <p className="text-slate-500 text-xs mt-6 tracking-widest uppercase">Your battle is paused</p>
  </div>
);
