import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { useAuth } from '../components/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/daniel');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Login to Account" subtitle="Please enter your email and password to continue">
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
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-sm text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between mt-1">
          <Checkbox id="remember" label="Remember me" checked={remember} onChange={setRemember} />
          <Link to="/forgot-password" className="text-sm text-white/90 hover:text-white transition-colors">
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" className="mt-2" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>

        <div className="text-center mt-4">
          <span className="text-[#8e9299] text-sm">Don't have an account? </span>
          <Link to="/signup" className="text-white/90 text-sm hover:text-white underline decoration-white/30 underline-offset-4 transition-colors">
            Create an Account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
