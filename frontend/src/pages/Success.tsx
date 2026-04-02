import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/Button';

interface SuccessProps {
  title: string;
  subtitle: string;
}

export const Success = ({ title, subtitle }: SuccessProps) => {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title={title}
      subtitle={subtitle}
    >
      <Button onClick={() => navigate('/login')} className="mt-4">
        Sign in
      </Button>
    </AuthLayout>
  );
};
