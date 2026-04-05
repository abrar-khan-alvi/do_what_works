import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { api } from '../services/api';

export const SignUp = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/api/v1/auth/signup/', { email, username, password, confirm_password: confirmPassword });
      // Store email so VerifyEmail can read it
      sessionStorage.setItem('pending_email', email);
      navigate('/verify-email-signup');
    } catch (err: any) {
      const data = err?.response?.data;
      if (typeof data === 'object') {
        const firstError = Object.values(data).flat()[0];
        setError(String(firstError));
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Create an Account" subtitle="Start your behavioral optimization journey">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Username"
          type="text"
          placeholder="your_username"
          value={username}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          required
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-sm text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <Button type="submit" className="mt-2" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Sign up'}
        </Button>

        <div className="text-center mt-4">
          <span className="text-[#8e9299] text-sm">Already have an account? </span>
          <Link to="/login" className="text-white/90 text-sm hover:text-white underline decoration-white/30 underline-offset-4 transition-colors">
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
