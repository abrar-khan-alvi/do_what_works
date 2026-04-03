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
      <div className="mb-6 md:mb-8 px-1 md:px-0">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Experiment Result</h1>
        <p className="text-[#8e9299] text-sm md:text-base leading-relaxed">
          Track and analyze all your behavioral science experiments.
        </p>
      </div>
      
      <div className="flex flex-col gap-4 md:gap-5 relative min-h-[400px]">
        {[1, 2].map((i) => (
          <div key={i} className="bg-[#1a1b1e]/40 border border-white/5 rounded-2xl p-5 md:p-6 flex flex-col gap-5 md:gap-6 hover:border-white/10 transition-colors">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-white/5 rounded-xl text-[#8e9299] flex-shrink-0">
                  <FlaskConical size={20} className="md:w-6 md:h-6" />
                </div>
                <h3 className="text-sm md:text-base font-bold text-white leading-relaxed">
                  If I daily execution of specified behavior, then sleep hours will improve.
                </h3>
              </div>
              <div className="self-start md:self-auto px-3 py-1 rounded-full border border-[#10b981]/30 bg-[#10b981]/5 text-[#10b981] text-[10px] md:text-xs font-bold uppercase tracking-widest">
                Active
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:ml-14">
              <div className="flex items-center gap-5 text-[10px] md:text-xs font-bold text-[#8e9299] uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8e9299]/30" />
                  0% Completed
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8e9299]/30" />
                  0/7 Days
                </div>
              </div>
              <button 
                onClick={() => navigate(`/result/${i}`)}
                className="w-full sm:w-auto text-center px-4 py-2 rounded-lg bg-white/5 text-xs text-white hover:bg-white/10 transition-all font-bold"
              >
                View Details
              </button>
            </div>
          </div>
        ))}

        {/* Subscription Lock Overlay */}
        {!isSubscribed && (
          <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-[#0f1014]/40 rounded-2xl p-4 md:p-0">
            <div className="bg-[#1a1b1e] border border-white/10 p-8 md:p-10 rounded-3xl max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#C75F33]/20 rounded-full flex items-center justify-center text-[#C75F33] mx-auto mb-6 md:mb-8 ring-8 ring-[#C75F33]/5">
                <Lock size={32} className="md:w-10 md:h-10" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-3 tracking-tight">View Your Progress</h2>
              <p className="text-[#8e9299] text-sm mb-8 leading-relaxed font-medium">
                Unlock detailed analytics and history for all your behavioral experiments.
              </p>
              <Link 
                to="/subscription" 
                className="block w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-[#C75F33] hover:text-white transition-all transform active:scale-95 text-sm"
              >
                Get Full Access
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
