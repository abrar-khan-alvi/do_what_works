import React from 'react';

export const Logo = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <svg width="56" height="56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 20H55C75 20 85 35 85 50C85 65 75 80 55 80H25V20Z" stroke="white" strokeWidth="8"/>
        <path d="M35 30L45 70L55 30L65 70L75 30" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div className="text-white text-[10px] font-bold tracking-[0.2em] uppercase">
        DO WHAT <span className="text-[#e53935]">WORKS.</span>
      </div>
    </div>
  );
};
