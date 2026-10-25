import React from 'react';

export function BearHead({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Outer Ears */}
      <circle cx="5.5" cy="5.5" r="3.5" />
      <circle cx="18.5" cy="5.5" r="3.5" />
      {/* Inner Ears */}
      <circle cx="5.5" cy="5.5" r="2" fill="#d97736" opacity="0.8" />
      <circle cx="18.5" cy="5.5" r="2" fill="#d97736" opacity="0.8" />
      {/* Head */}
      <ellipse cx="12" cy="13.2" rx="8.5" ry="7.5" />
      {/* Snout */}
      <ellipse cx="12" cy="15.2" rx="4.2" ry="3.2" fill="#f0b27a" />
      {/* Nose */}
      <ellipse cx="12" cy="13.8" rx="1.8" ry="1.2" fill="#1b120c" />
      {/* Smile */}
      <path d="M10.8 16.2 C11.4 17 12.6 17 13.2 16.2" stroke="#1b120c" strokeWidth="0.8" strokeLinecap="round" fill="none" />
      {/* Eyes */}
      <circle cx="8.8" cy="11.5" r="1.1" fill="#1b120c" />
      <circle cx="15.2" cy="11.5" r="1.1" fill="#1b120c" />
      {/* Eye shines */}
      <circle cx="9.2" cy="11.1" r="0.35" fill="#ffffff" />
      <circle cx="15.6" cy="11.1" r="0.35" fill="#ffffff" />
    </svg>
  );
}

export function BearPaw({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="5.5" cy="8" r="2.2" />
      <circle cx="9.5" cy="4.8" r="2.3" />
      <circle cx="14.5" cy="4.8" r="2.3" />
      <circle cx="18.5" cy="8" r="2.2" />
      <ellipse cx="12" cy="14.8" rx="6" ry="5" />
    </svg>
  );
}
