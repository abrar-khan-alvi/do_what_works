import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/Button';
import { api } from '../services/api';
import { useAuth } from '../components/AuthContext';

interface VerifyEmailProps {
  nextRoute?: string;
  title?: string;
  subtitle?: string;
}

export const VerifyEmail = ({
  nextRoute = '/reset-password',
  title = "Check your email",
  subtitle = "We sent a 6-digit verification code to your email address."
}: VerifyEmailProps) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const email = sessionStorage.getItem('pending_email') || '';

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return; // digits only

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const otp_code = code.join('');

    if (otp_code.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/api/v1/auth/verify-otp/', { email, otp_code });

      // If this was a signup verification, store the tokens and log in
      if (res.data.access) {
        localStorage.setItem('access_token', res.data.access);
        localStorage.setItem('refresh_token', res.data.refresh);
        localStorage.setItem('auth_user', JSON.stringify(res.data.user));
        sessionStorage.removeItem('pending_email');
      }

      navigate(nextRoute);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Verification failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    setResendSuccess(false);
    try {
      await api.post('/api/v1/auth/signup/', {
        email,
        username: 'resend', // Will be ignored; existing pending record will be updated
        password: 'placeholder', // Required by serializer; the real password is already hashed
        confirm_password: 'placeholder',
      });
      setResendSuccess(true);
    } catch {
      setError('Could not resend code. Please try signing up again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout title={title} subtitle={email ? `Code sent to ${email}` : subtitle}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="flex justify-center gap-3">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
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

        {error && (
          <p className="text-sm text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl px-4 py-3 text-center">
            {error}
          </p>
        )}
        {resendSuccess && (
          <p className="text-sm text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20 rounded-xl px-4 py-3 text-center">
            A new code has been sent.
          </p>
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Verify'}
        </Button>

        <div className="text-center">
          <span className="text-[#8e9299] text-sm">Didn't receive the email? </span>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-[#C75F33] text-sm hover:underline underline-offset-4 transition-colors disabled:opacity-50"
          >
            {isResending ? 'Sending...' : 'Resend'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};
