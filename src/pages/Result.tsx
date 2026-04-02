import React from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { FlaskConical, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAccess } from '../components/AccessContext';

export const Result = () => {
  const { isSubscribed } = useAccess();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Experiment Result</h1>
        <p className="text-[#8e9299] text-base">
          All experiments and their outcomes.
        </p>
      </div>
      
      <div className="flex flex-col gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-transparent border border-white/10 rounded-xl p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <FlaskConical className="text-[#8e9299]" size={24} />
                <h3 className="text-lg font-medium">If I daily execution of specified behavior, then sleep hours will improve.</h3>
              </div>
              <div className="px-4 py-1 rounded-full border border-[#10b981] text-[#10b981] text-sm font-medium">
                Active
              </div>
            </div>
            
            <div className="flex items-center justify-between ml-10">
              <div className="flex items-center gap-6 text-sm text-[#8e9299]">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#8e9299]" />
                  0% Completed
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#8e9299]" />
                  0/7 Days
                </div>
              </div>
              <button 
                onClick={() => navigate(`/result/${i}`)}
                className="text-sm text-white underline decoration-white/30 underline-offset-4 hover:text-white/80 transition-colors"
              >
                View details
              </button>
            </div>
          </div>
        ))}

        {/* Subscription Lock Overlay */}
        {!isSubscribed && (
          <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-[6px] bg-[#0f1014]/40 rounded-2xl">
            <div className="bg-[#1a1b1e] border border-white/10 p-10 rounded-3xl max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-[#C75F33]/20 rounded-full flex items-center justify-center text-[#C75F33] mx-auto mb-8">
                <Lock size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">View Your Progress</h2>
              <p className="text-[#8e9299] mb-8 leading-relaxed">
                Unlock detailed analytics and history for all your behavioral experiments.
              </p>
              <Link 
                to="/subscription" 
                className="block w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-[#C75F33] hover:text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Go to Subscription
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
