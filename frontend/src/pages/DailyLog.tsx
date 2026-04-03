import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Check, X, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { useAccess } from '../components/AccessContext';
import { Link } from 'react-router-dom';

export const DailyLog = () => {
  const { isSubscribed } = useAccess();
  const [completed, setCompleted] = useState<'yes' | 'no' | null>(null);
  const [score, setScore] = useState('5');
  const [experimentNotes, setExperimentNotes] = useState('');
  const [dailyNotes, setDailyNotes] = useState('');

  return (
    <DashboardLayout>
      <div className="relative">
      <div className="relative">
        <div className="mb-6 md:mb-8 px-1 md:px-0">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Daily Log</h1>
          <p className="text-[#8e9299] text-sm md:text-base leading-relaxed">
            Log your active experiment metrics and daily observations.
          </p>
        </div>

        <div className="flex flex-col gap-6 md:gap-8">
          {/* Global Daily Notes */}
          <div className="bg-[#1a1b1e]/40 border border-white/10 rounded-2xl p-5 md:p-6">
            <h2 className="text-base md:text-lg font-bold text-white mb-4">Daily Observations</h2>
            <textarea
              value={dailyNotes}
              onChange={(e) => setDailyNotes(e.target.value)}
              placeholder="Note anything significant..."
              className="w-full h-24 bg-[#1a1b1e]/40 border border-white/10 rounded-xl p-4 text-white outline-none resize-none focus:border-[#C75F33]/50 transition-all text-sm placeholder:text-[#8e9299]/30"
            />
          </div>

          {/* Active Experiment Metrics */}
          <div>
            <h2 className="text-base md:text-lg font-bold text-white mb-4 flex items-center gap-3 px-1">
              Active Experiments
              <span className="text-[10px] font-bold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-full uppercase tracking-widest leading-none">Auto-synced</span>
            </h2>
            
            <div className="bg-[#1a1b1e]/40 border border-white/10 rounded-2xl p-5 md:p-6 flex flex-col gap-6 md:gap-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-white/5 pb-6">
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-[#8e9299] uppercase tracking-widest">Experiment: Morning Fasting</div>
                  <h3 className="text-sm md:text-base font-bold text-white leading-relaxed">
                    If I daily execution of specified behavior, then sleep hours will improve.
                  </h3>
                </div>
                <span className="self-start md:self-auto text-[#8e9299] text-[10px] font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5 whitespace-nowrap">Day 12</span>
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-[#8e9299] text-xs font-bold uppercase tracking-widest">Did you complete this action?</label>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <button
                    onClick={() => setCompleted('yes')}
                    className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border transition-all font-bold text-sm active:scale-95 ${
                      completed === 'yes'
                        ? 'bg-[#10b981] border-[#10b981] text-black'
                        : completed === 'no'
                        ? 'bg-white/5 border-white/5 text-[#8e9299]/30'
                        : 'bg-white/5 border-white/5 text-[#8e9299] hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Check size={18} />
                    <span>Yes</span>
                  </button>
                  <button
                    onClick={() => setCompleted('no')}
                    className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border transition-all font-bold text-sm active:scale-95 ${
                      completed === 'no'
                        ? 'bg-[#ef4444] border-[#ef4444] text-white'
                        : completed === 'yes'
                        ? 'bg-white/5 border-white/5 text-[#8e9299]/30'
                        : 'bg-white/5 border-white/5 text-[#8e9299] hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <X size={18} />
                    <span>No</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-[#8e9299] text-xs font-bold uppercase tracking-widest">Anxiety level (1-10)</label>
                <div className="relative">
                  <select
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full bg-[#1a1b1e]/60 border border-white/10 rounded-xl px-5 py-3.5 text-white appearance-none outline-none focus:border-[#C75F33]/50 transition-all cursor-pointer font-bold text-sm"
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1} className="bg-[#1a1b1e] text-white">
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center text-[#8e9299] opacity-50">
                    <ChevronUp size={12} className="-mb-1" />
                    <ChevronDown size={12} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-[#8e9299] text-xs font-bold uppercase tracking-widest">Experiment Notes (Optional)</label>
                <input
                  type="text"
                  value={experimentNotes}
                  onChange={(e) => setExperimentNotes(e.target.value)}
                  placeholder="Additional observations..."
                  className="w-full bg-[#1a1b1e]/60 border border-white/10 rounded-xl px-5 py-3.5 text-white outline-none focus:border-[#C75F33]/50 transition-all text-sm placeholder:text-[#8e9299]/30"
                />
              </div>
            </div>
          </div>
        </div>

        <button className="w-full mt-8 py-4.5 bg-white text-black rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#C75F33] hover:text-white transition-all transform active:scale-[0.98] shadow-2xl shadow-black/20">
          Submit Daily Log
        </button>

        {/* Subscription Lock Overlay */}
        {!isSubscribed && (
          <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-[#0f1014]/40 rounded-2xl p-4">
            <div className="bg-[#1a1b1e] border border-white/10 p-8 md:p-10 rounded-3xl max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#C75F33]/20 rounded-full flex items-center justify-center text-[#C75F33] mx-auto mb-6 md:mb-8 ring-8 ring-[#C75F33]/5">
                <Lock size={32} className="md:w-10 md:h-10" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-3 tracking-tight">Unlock Daily Logs</h2>
              <p className="text-[#8e9299] text-sm mb-8 leading-relaxed font-medium">
                Consistency is key. Log your results every day to gather evidence and complete your experiments.
              </p>
              <Link 
                to="/subscription" 
                className="block w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-[#C75F33] hover:text-white transition-all transform active:scale-95 text-sm"
              >
                Start Subscription
              </Link>
            </div>
          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
};
