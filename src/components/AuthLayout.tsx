import React from 'react';
import { Logo } from './Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen animate-gradient-bg flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Moving background glows */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#C75F33]/10 rounded-full blur-[120px] pointer-events-none animate-float" />
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-[#C75F33]/10 rounded-full blur-[120px] pointer-events-none animate-float-reverse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C75F33]/5 rounded-full blur-[150px] pointer-events-none animate-float-alt" />

      <div className="w-full max-w-[440px] bg-[#1a1b1e]/60 backdrop-blur-xl rounded-xl border border-white/10 p-8 relative z-10 shadow-2xl">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && <h1 className="text-2xl font-semibold text-white mb-2">{title}</h1>}
            {subtitle && <p className="text-[#8e9299] text-sm">{subtitle}</p>}
          </div>
        )}

        {children}
      </div>
    </div>
  );
};
