import type { ReactNode } from 'react';

const shapes: Record<string, ReactNode> = {
  user: <><circle cx="12" cy="7" r="4" fill="currentColor" stroke="none"/><path d="M3 22v-3c0-5 4-8 9-8s9 3 9 8v3z" fill="currentColor" stroke="none"/></>,
  briefcase: <><path d="M8 6V3h8v3M2 11h20M9 11v3h6v-3"/><rect x="2" y="6" width="20" height="15" rx="2"/><path d="M3 7h18v4H3z" fill="currentColor" opacity=".65"/></>,
  gamepad: <><path d="M7 6h10c3 0 4 2 5 6l1 5c.6 3-2 4-4 2l-3-3H8l-3 3c-2 2-4.6 1-4-2l1-5c1-4 2-6 5-6z" fill="currentColor" stroke="none"/><path d="M6 8.5v6M3 11.5h6" stroke="#0c2854" strokeWidth="1.8"/><circle cx="17" cy="10" r="1" fill="#0c2854" stroke="none"/><circle cx="20" cy="12" r="1" fill="#0c2854" stroke="none"/><circle cx="14" cy="12" r="1" fill="#0c2854" stroke="none"/><circle cx="17" cy="14" r="1" fill="#0c2854" stroke="none"/></>,
  code: <><path d="m8 5-7 7 7 7m8-14 7 7-7 7m-3-16-2 20" strokeWidth="2.3"/></>,
  layers: <><path d="m12 2 11 6-11 6L1 8z" fill="currentColor" stroke="none"/><path d="m2 13 10 6 10-6M2 18l10 6 10-6" strokeWidth="2"/></>,
  tools: <path d="M21 2a7 7 0 0 0-9 9L2 21l2 2 10-10a7 7 0 0 0 9-9l-5 5-3-3z" fill="currentColor" stroke="none"/>,
  mail: <><rect x="1" y="5" width="22" height="15" rx="2"/><path d="m2 6 10 8L22 6M2 19l7-7m6 0 7 7"/></>,
  globe: <><circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/><path d="M2 12h20M4 6h16M4 18h16"/></>,
  document: <><path d="M5 2h10l5 5v15H5zM14 2v6h6M8 12h9M8 16h9"/><path d="M8 19h5"/></>,
  graduation: <><path d="m1 8 11-6 11 6-11 6z" fill="currentColor" stroke="none"/><path d="M5 11v7c4 4 10 4 14 0v-7M23 8v10"/></>,
  github: <><path d="M12 2a10 10 0 0 0-3 19.5V18c-3 .8-4-1-4-1.5-.6-1-1-1-1-1.5 1-.5 2 .5 2.5 1 1 .5 2 .5 2.5 0 0-1 .5-1.5 1-2-3-.5-6-1-6-5 0-1 .5-2 1-3-.5-1 0-3 0-3s2-.5 4 1a12 12 0 0 1 6 0c2-1.5 4-1 4-1s.5 2 0 3c.5 1 1 2 1 3 0 4-3 4.5-6 5 1 1 1 2 1 3v4.5A10 10 0 0 0 12 2" fill="currentColor" stroke="none"/></>,
  linkedin: <><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M6 10v8m5 0v-8m0 4c0-5 7-5 7 0v4" strokeWidth="2.4"/><circle cx="6" cy="6" r="1.3" fill="currentColor" stroke="none"/></>,
  film: <><rect x="2" y="3" width="20" height="18" rx="1"/><path d="M7 3v18M17 3v18M2 8h5M2 16h5m10-8h5m-5 8h5M7 12h10"/></>,
  plane: <path d="m2 12 8 2 2 8 3-7 7-12zM10 14 22 3"/>,
  terminal: <><rect x="1" y="3" width="22" height="18" rx="2"/><path d="m5 8 4 4-4 4m7 0h6"/></>,
  database: <><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 4 18 4 18 0V5M3 12c0 4 18 4 18 0"/></>,
  cloud: <path d="M7 19a6 6 0 0 1-1-12 7 7 0 0 1 13 1 5.5 5.5 0 0 1-1 11z"/>,
};

export function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name] ?? shapes.code}</svg>;
}
