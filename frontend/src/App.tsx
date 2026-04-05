import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
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
import { Profile } from './pages/Profile';
import { Preferences } from './pages/Preferences';
import { LandingPage } from './pages/LandingPage';
import { AccessProvider } from './components/AccessContext';
import { ChatProvider } from './components/ChatContext';
import { ExperimentProvider } from './components/ExperimentContext';

// Shows a spinner while auth state is being resolved
const LoadingScreen = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-[#0f1014]">
    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
  </div>
);

// Redirects unauthenticated users to login; first-time users to onboarding
const PrivateRoute = ({ children, skipOnboardingCheck = false }: { children: React.ReactNode; skipOnboardingCheck?: boolean }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!skipOnboardingCheck && user && !user.has_completed_onboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
};

// Redirects already-authenticated users away from auth pages
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return !isAuthenticated ? <>{children}</> : <Navigate to="/daniel" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <AccessProvider>
        <ChatProvider>
          <ExperimentProvider>
            <BrowserRouter>
              <Routes>
                {/* Public auth routes */}
                <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/verify-email-signup" element={<VerifyEmail nextRoute="/success-signup" />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/success-signup" element={<Success title="Account Created Successfully!" subtitle="Your account is ready. You can sign in now." />} />
                <Route path="/success-reset" element={<Success title="Password Updated Successfully!" subtitle="Your new password has been saved. You can now continue securely." />} />

                {/* Protected app routes */}
                <Route path="/onboarding" element={<PrivateRoute skipOnboardingCheck><Onboarding /></PrivateRoute>} />
                <Route path="/daniel/:id?" element={<PrivateRoute><Daniel /></PrivateRoute>} />
                <Route path="/pragmatist" element={<Navigate to="/daniel" replace />} />
                <Route path="/experiment" element={<PrivateRoute><Experiment /></PrivateRoute>} />
                <Route path="/result" element={<PrivateRoute><Result /></PrivateRoute>} />
                <Route path="/result/:id" element={<PrivateRoute><ExperimentDetails /></PrivateRoute>} />
                <Route path="/daily-log" element={<PrivateRoute><DailyLog /></PrivateRoute>} />
                <Route path="/subscription" element={<PrivateRoute><Subscription /></PrivateRoute>} />
                <Route path="/history" element={<Navigate to="/result" replace />} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/preferences" element={<PrivateRoute><Preferences /></PrivateRoute>} />
              </Routes>
            </BrowserRouter>
          </ExperimentProvider>
        </ChatProvider>
      </AccessProvider>
    </AuthProvider>
  );
}
