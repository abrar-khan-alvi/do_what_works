import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { ForgotPassword } from './pages/ForgotPassword';
import { VerifyEmail } from './pages/VerifyEmail';
import { ResetPassword } from './pages/ResetPassword';
import { Success } from './pages/Success';
import { Onboarding } from './pages/Onboarding';
import { Daniel } from './pages/Daniel';
import { Experiment } from './pages/Experiment';
import { Result } from './pages/Result';
import { DailyLog } from './pages/DailyLog';
import { ExperimentDetails } from './pages/ExperimentDetails';
import { Subscription } from './pages/Subscription';
import { AccessProvider } from './components/AccessContext';

export default function App() {
  return (
    <AccessProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/daniel" element={<Daniel />} />
        <Route path="/pragmatist" element={<Navigate to="/daniel" replace />} />
        <Route path="/experiment" element={<Experiment />} />
        <Route path="/result" element={<Result />} />
        <Route path="/result/:id" element={<ExperimentDetails />} />
        <Route path="/daily-log" element={<DailyLog />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/history" element={<Navigate to="/result" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-email-signup" element={<VerifyEmail nextRoute="/success-signup" />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route 
          path="/success-signup" 
          element={
            <Success 
              title="Account Created Successfully!" 
              subtitle="Your account is successfully! You can sign in now." 
            />
          } 
        />
        <Route 
          path="/success-reset" 
          element={
            <Success 
              title="Password Updated Successfully!" 
              subtitle="Your new password has been saved. You can now continue securely." 
            />
          } 
        />
        </Routes>
      </BrowserRouter>
    </AccessProvider>
  );
}
