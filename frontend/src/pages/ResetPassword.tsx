import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export const ResetPassword = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/success-reset');
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Create a new password. Ensure it differs from previous ones for security"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input 
          label="Password" 
          type="password" 
          placeholder="********" 
          defaultValue="password123"
        />
        <Input 
          label="Confirm Password" 
          type="password" 
          placeholder="********" 
          defaultValue="password123"
        />

        <Button type="submit" className="mt-4">Reset Password</Button>
      </form>
    </AuthLayout>
  );
};
