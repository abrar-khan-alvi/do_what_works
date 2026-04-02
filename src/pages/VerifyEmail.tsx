import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/Button';

interface VerifyEmailProps {
  nextRoute?: string;
  title?: string;
  subtitle?: string;
}

export const VerifyEmail = ({ 
  nextRoute = '/reset-password',
  title = "Check your email",
  subtitle = "We sent a code to your email address. Please check your email for the 5 digit code."
}: VerifyEmailProps) => {
  const navigate = useNavigate();
  const [code, setCode] = useState(['2', '8', '4', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(nextRoute);
  };

  return (
    <AuthLayout
      title={title}
      subtitle={subtitle}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="flex justify-center gap-3">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 bg-transparent border border-white/20 rounded-lg text-center text-xl text-white focus:outline-none focus:border-white/50 transition-colors"
              maxLength={1}
            />
          ))}
        </div>

        <Button type="submit">Verify</Button>

        <div className="text-center">
          <span className="text-[#8e9299] text-sm">You have not received the email? </span>
          <button type="button" className="text-[#e53935] text-sm hover:underline underline-offset-4 transition-colors">
            Resend
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};
