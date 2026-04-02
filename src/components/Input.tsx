import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  type?: string;
  className?: string;
  placeholder?: string;
  defaultValue?: string;
}

export const Input = ({ label, type = 'text', className = '', ...props }: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-sm text-white/90">{label}</label>}
      <div className="relative">
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={`w-full bg-[#1c1c1e] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-[#8e9299] focus:outline-none focus:border-white/30 transition-colors ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8e9299] hover:text-white transition-colors"
          >
            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};
