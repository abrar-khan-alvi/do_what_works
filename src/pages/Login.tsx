import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';

export const Login = () => {
  const [remember, setRemember] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic
    navigate('/onboarding');
  };

  return (
    <AuthLayout
      title="Login to Account"
      subtitle="Please enter your email and password to continue"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input 
          label="Email address" 
          type="email" 
          placeholder="esteban_schiller@gmail.com" 
          defaultValue="esteban_schiller@gmail.com"
        />
        <Input 
          label="Password" 
          type="password" 
          placeholder="********" 
          defaultValue="password123"
        />
        
        <div className="flex items-center justify-between mt-1">
          <Checkbox 
            id="remember" 
            label="Remember Password" 
            checked={remember} 
            onChange={setRemember} 
          />
          <Link to="/forgot-password" className="text-sm text-white/90 hover:text-white transition-colors">
            Forget Password?
          </Link>
        </div>

        <Button type="submit" className="mt-2">Sign in</Button>

        <div className="text-center mt-4">
          <span className="text-[#8e9299] text-sm">Don't have any account? </span>
          <Link to="/signup" className="text-white/90 text-sm hover:text-white underline decoration-white/30 underline-offset-4 transition-colors">
            Create an Account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
