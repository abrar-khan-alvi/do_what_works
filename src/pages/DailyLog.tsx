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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Daily Log</h1>
          <p className="text-[#8e9299] text-base">
            Log your active experiment metrics and daily observations.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {/* Global Daily Notes */}
          <div className="bg-[#1a1b1e]/40 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-medium text-white mb-4">Daily Observations</h2>
            <textarea
              value={dailyNotes}
              onChange={(e) => setDailyNotes(e.target.value)}
              placeholder="Note anything significant that happened today..."
              className="w-full h-24 bg-transparent border border-white/10 rounded-xl p-4 text-white outline-none resize-none focus:border-white/30 transition-colors placeholder:text-[#8e9299]/50"
            />
          </div>

          {/* Active Experiment Metrics */}
          <div>
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              Active Experiments
              <span className="text-xs font-normal text-[#10b981] bg-[#10b981]/10 px-2 py-1 rounded-full">Auto-synced</span>
            </h2>
            
            <div className="bg-transparent border border-white/10 rounded-xl p-6 flex flex-col gap-6">
              <div className="flex items-start justify-between border-b border-white/5 pb-4">
                <div>
                  <div className="text-xs text-[#8e9299] mb-1">Experiment: Morning Fasting</div>
                  <h3 className="text-base text-white pr-8">
                    If I daily execution of specified behavior, then sleep hours will improve.
                  </h3>
                </div>
                <span className="text-[#8e9299] text-sm whitespace-nowrap bg-white/5 px-3 py-1 rounded-full">Day 12</span>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[#8e9299] text-sm">Did you complete this action?</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setCompleted('yes')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all duration-200 ${
                      completed === 'yes'
                        ? 'bg-[#10b981]/10 border-[#10b981] text-[#10b981]'
                        : completed === 'no'
                        ? 'bg-transparent border-white/10 text-[#8e9299]/30'
                        : 'bg-[#1a1b1e]/40 border-white/10 text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Check size={18} />
                    {completed !== 'no' && <span>Yes</span>}
                  </button>
                  <button
                    onClick={() => setCompleted('no')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all duration-200 ${
                      completed === 'no'
                        ? 'bg-[#ef4444]/10 border-[#ef4444] text-[#ef4444]'
                        : completed === 'yes'
                        ? 'bg-transparent border-white/10 text-[#8e9299]/30'
                        : 'bg-[#1a1b1e]/40 border-white/10 text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <X size={18} />
                    {completed !== 'yes' && <span>No</span>}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[#8e9299] text-sm">Anxiety level (1-10)</label>
                <div className="relative">
                  <select
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full bg-[#1a1b1e]/40 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none outline-none focus:border-white/30 transition-colors cursor-pointer"
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1} className="bg-[#1a1b1e] text-white">
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center text-[#8e9299]">
                    <ChevronUp size={12} className="-mb-1" />
                    <ChevronDown size={12} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[#8e9299] text-sm">Experiment Notes (Optional)</label>
                <input
                  type="text"
                  value={experimentNotes}
                  onChange={(e) => setExperimentNotes(e.target.value)}
                  placeholder="Type any observations specific to this experiment..."
                  className="w-full bg-[#1a1b1e]/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/30 transition-colors placeholder:text-[#8e9299]/50"
                />
              </div>
            </div>
          </div>
        </div>

        <button className="w-full mt-6 py-4 bg-white text-black rounded-xl font-medium text-base hover:bg-white/90 transition-colors">
          Submit Log
        </button>

        {/* Subscription Lock Overlay */}
        {!isSubscribed && (
          <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-[6px] bg-[#0f1014]/40 rounded-2xl">
            <div className="bg-[#1a1b1e] border border-white/10 p-10 rounded-3xl max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-[#C75F33]/20 rounded-full flex items-center justify-center text-[#C75F33] mx-auto mb-8">
                <Lock size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Unlock Daily Logs</h2>
              <p className="text-[#8e9299] mb-8 leading-relaxed">
                Consistency is key. Log your results every day to gather evidence and complete your experiments.
              </p>
              <Link 
                to="/subscription" 
                className="block w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-[#C75F33] hover:text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Subscription
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
