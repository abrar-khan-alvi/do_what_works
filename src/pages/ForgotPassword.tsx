import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export const ForgotPassword = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/verify-email');
  };

  return (
    <AuthLayout
      title="Forget Password?"
      subtitle="Please enter your email to get verification code"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input 
          label="Email address" 
          type="email" 
          placeholder="esteban_schiller@gmail.com" 
          defaultValue="esteban_schiller@gmail.com"
        />

        <Button type="submit" className="mt-4">Sign up</Button>
      </form>
    </AuthLayout>
  );
};
