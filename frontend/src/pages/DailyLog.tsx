import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Check, X, Clock, MessageSquare, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAccess } from '../components/AccessContext';
import { useExperiments } from '../components/ExperimentContext';
import { Link, useNavigate } from 'react-router-dom';
import { FeatureLock } from '../components/FeatureLock';
import { motion, AnimatePresence } from 'framer-motion';

export const DailyLog = () => {
  const { isSubscribed } = useAccess();
  const { activeExperiment, logToday, hasLoggedToday, getTodayLog, generateDailyAction } = useExperiments();
  const navigate = useNavigate();
  const [isGeneratingAction, setIsGeneratingAction] = useState(false);

  const [completed, setCompleted] = useState<'yes' | 'no' | null>(null);
  const [score, setScore] = useState(5);
  const [experimentNotes, setExperimentNotes] = useState('');
  const [dailyNotes, setDailyNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Sync with existing log if day already logged
  useEffect(() => {
    if (activeExperiment && hasLoggedToday(activeExperiment.id)) {
      const log = getTodayLog(activeExperiment.id);
      if (log && log.completed !== 'pending') {
        setCompleted(log.completed);
        setScore(log.metricValue);
        setExperimentNotes(log.notes);
        setDailyNotes(log.dailyObservation);
        setIsSubmitted(true);
      }
    }
  }, [activeExperiment, hasLoggedToday, getTodayLog]);

  const handleSubmit = () => {
    if (!activeExperiment || !completed) return;

    logToday(activeExperiment.id, {
      completed,
      metricValue: score,
      notes: experimentNotes,
      dailyObservation: dailyNotes,
    });
    setIsSubmitted(true);
  };

  const handleGenerateAction = async () => {
    if (!activeExperiment) return;
    setIsGeneratingAction(true);
    await generateDailyAction(activeExperiment.id);
    setIsGeneratingAction(true); // Keep the 'just generated' feel or let it refresh
    setTimeout(() => setIsGeneratingAction(false), 1000);
  };

  const todayLog = activeExperiment ? getTodayLog(activeExperiment.id) : null;
  const aiSuggestion = todayLog?.aiSuggestion;


  const progressPercent = activeExperiment 
    ? Math.round(((activeExperiment.logs.length) / activeExperiment.durationDays) * 100) 
    : 0;

  const isFullyComplete = activeExperiment && activeExperiment.logs.length >= activeExperiment.durationDays;

  return (
    <DashboardLayout noPadding>
      <div className={`w-full flex-1 flex flex-col relative min-h-0 p-4 md:p-8 ${!isSubscribed ? 'h-full overflow-hidden' : 'overflow-y-auto custom-scrollbar'}`}>
        <div className="relative h-full flex flex-col max-w-4xl mx-auto w-full">
          
          {/* Header */}
          <div className="mb-8 px-1 md:px-0">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Daily Log</h1>
            <p className="text-[#8e9299] text-sm md:text-base leading-relaxed">
              Consistency is evidence. Log your protocol execution and metrics.
            </p>
          </div>

          {!activeExperiment ? (
            /* STATE A: No Active Experiment */
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10">
                <Clock size={32} className="text-[#8e9299]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">No Active Experiment</h2>
              <p className="text-[#8e9299] max-w-md mb-8 leading-relaxed">
                You don't have an active experiment running. Start a conversation with Daniel to refine your next big idea.
              </p>
              <button 
                onClick={() => navigate('/daniel')}
                className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-bold hover:bg-white/90 transition-all active:scale-95"
              >
                <span>Talk to Daniel</span>
                <ArrowRight size={18} />
              </button>
            </div>
          ) : isSubmitted ? (
            /* STATE B: Already Logged Today */
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center"
            >
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 border transition-colors ${
                isFullyComplete 
                  ? 'bg-[#10b981]/10 border-[#10b981]/20' 
                  : 'bg-[#C75F33]/10 border-[#C75F33]/20'
              }`}>
                {isFullyComplete ? (
                  <Sparkles size={48} className="text-[#10b981]" />
                ) : (
                  <CheckCircle2 size={48} className="text-[#C75F33]" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                {isFullyComplete ? 'Protocol Strategy Complete' : "Today's Log Recorded"}
              </h2>
              <p className="text-[#8e9299] max-w-md mb-10 leading-relaxed font-medium">
                {isFullyComplete 
                  ? "Final data point gathered. Your evidence is now ready for a full behavioral analysis."
                  : "Great job! You've recorded your data for today. Consistency is the foundation of behavioral science."
                }
              </p>
              
              <div className="w-full max-w-sm bg-[#1a1b1e]/40 border border-white/10 rounded-2xl p-6 mb-8 text-left">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-[10px] font-bold text-[#8e9299] uppercase tracking-widest">Evidence Gathered</span>
                  <span className="text-sm font-bold text-white">{activeExperiment.logs.length} / {activeExperiment.durationDays} Days</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className={`h-full ${isFullyComplete ? 'bg-[#10b981]' : 'bg-[#C75F33]'}`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => navigate('/overview')}
                  className="px-8 py-4 bg-white text-black rounded-2xl font-bold hover:bg-[#C75F33] hover:text-white transition-all active:scale-95"
                >
                  {isFullyComplete ? 'Go to Final Assessment' : 'Back to Dashboard'}
                </button>
                <button 
                  onClick={() => navigate('/result')}
                  className="text-[#8e9299] hover:text-white transition-colors text-xs font-bold uppercase tracking-widest pt-2"
                >
                  View Historical Logs
                </button>
              </div>
            </motion.div>
          ) : (
            /* STATE C: Ready to Log */
            <div className="flex flex-col gap-6 md:gap-8 pb-12">
              
              {/* Progress Summary */}
              <div className="bg-[#C75F33]/5 border border-[#C75F33]/20 rounded-2xl p-5 md:p-6 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-[#C75F33] uppercase tracking-widest mb-1">Experiment Progress</div>
                  <div className="text-lg font-bold text-white leading-none">Day {activeExperiment.logs.length + 1} of {activeExperiment.durationDays}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-[#8e9299] uppercase tracking-widest mb-1">Completion</div>
                  <div className="text-lg font-bold text-white leading-none">{progressPercent}%</div>
                </div>
              </div>

              {/* Global Daily Notes */}
              <div className="bg-[#1a1b1e]/40 border border-white/10 rounded-2xl p-5 md:p-6">
                <h2 className="text-base md:text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <MessageSquare size={18} className="text-[#8e9299]" />
                  Daily Observations
                </h2>
                <textarea
                  value={dailyNotes}
                  onChange={(e) => setDailyNotes(e.target.value)}
                  placeholder="Any significant events, mood shifts, or environmental changes today?"
                  className="w-full h-24 bg-[#1a1b1e]/40 border border-white/10 rounded-xl p-4 text-white outline-none resize-none focus:border-[#C75F33]/50 transition-all text-sm placeholder:text-[#8e9299]/30"
                />
              </div>

              {/* Active Experiment Metrics */}
              <div className="space-y-4">
                <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-3 px-1">
                  Active Protocol
                  <span className="text-[10px] font-bold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-full uppercase tracking-widest leading-none">Verified</span>
                </h2>
                
                <div className="bg-[#1a1b1e]/40 border border-white/10 rounded-2xl p-6 flex flex-col gap-8">
                  <div className="space-y-2 border-b border-white/5 pb-6">
                    <div className="text-[10px] font-bold text-[#8e9299] uppercase tracking-widest flex items-center gap-2">
                       <Sparkles size={12} />
                       Hypothesis
                    </div>
                    <h3 className="text-sm md:text-base font-bold text-white leading-relaxed italic opacity-90">
                      "{activeExperiment.hypothesis}"
                    </h3>

                    {/* AI Suggestion Button/Display */}
                    <div className="pt-4 mt-2 border-t border-white/5">
                      {!aiSuggestion ? (
                        <button
                          onClick={handleGenerateAction}
                          disabled={isGeneratingAction}
                          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-[#C75F33]/5 border border-[#C75F33]/20 text-[#C75F33] hover:bg-[#C75F33] hover:text-white transition-all disabled:opacity-50 group shadow-lg shadow-[#C75F33]/5"
                        >
                          {isGeneratingAction ? (
                            <Clock size={16} className="animate-spin" />
                          ) : (
                            <Sparkles size={16} className="group-hover:scale-110 transition-transform" />
                          )}
                          <span className="text-xs font-black uppercase tracking-[0.2em]">Strategize Today's Action</span>
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#C75F33]">
                            <Sparkles size={12} />
                            <span>Daniel's Tactical Pivot for Today</span>
                          </div>
                          <div className="bg-[#C75F33]/10 border border-[#C75F33]/20 p-4 rounded-xl text-white text-sm font-medium italic shadow-lg shadow-[#C75F33]/5">
                            "{aiSuggestion}"
                          </div>
                        </div>
                      )}
                    </div>
                  </div>


                  {/* Binary Completion */}
                  <div className="flex flex-col gap-4">
                    <label className="text-[#8e9299] text-xs font-bold uppercase tracking-widest flex items-center justify-between">
                      Did you complete the action?
                      {completed && <span className={`text-[10px] ${completed === 'yes' ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>{completed.toUpperCase()}</span>}
                    </label>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <button
                        onClick={() => setCompleted('yes')}
                        className={`flex items-center justify-center gap-2 py-4 rounded-xl border transition-all font-bold text-sm active:scale-95 ${
                          completed === 'yes'
                            ? 'bg-[#10b981] border-[#10b981] text-black shadow-lg shadow-[#10b981]/20'
                            : 'bg-white/5 border-white/5 text-[#8e9299] hover:bg-white/10'
                        }`}
                      >
                        <Check size={18} />
                        <span>Yes</span>
                      </button>
                      <button
                        onClick={() => setCompleted('no')}
                        className={`flex items-center justify-center gap-2 py-4 rounded-xl border transition-all font-bold text-sm active:scale-95 ${
                          completed === 'no'
                            ? 'bg-[#ef4444] border-[#ef4444] text-white shadow-lg shadow-[#ef4444]/20'
                            : 'bg-white/5 border-white/5 text-[#8e9299] hover:bg-white/10'
                        }`}
                      >
                        <X size={18} />
                        <span>No</span>
                      </button>
                    </div>
                    <div className="text-[10px] text-[#8e9299] bg-white/5 p-3 rounded-lg border border-white/5">
                      <span className="font-bold text-white">Action:</span> {activeExperiment.action}
                    </div>
                  </div>

                  {/* Metric Score Slider */}
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <label className="text-[#8e9299] text-xs font-bold uppercase tracking-widest">
                        {activeExperiment.metric} Level
                      </label>
                      <span className="w-8 h-8 rounded-lg bg-[#C75F33] text-white flex items-center justify-center font-bold text-sm">
                        {score}
                      </span>
                    </div>
                    <div className="relative h-2 w-full bg-white/5 rounded-full px-1 flex items-center">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={score}
                        onChange={(e) => setScore(parseInt(e.target.value))}
                        className="w-full h-1 bg-transparent appearance-none cursor-pointer accent-[#C75F33]"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-[#8e9299]/50 uppercase tracking-widest px-1">
                      <span>Low</span>
                      <span>Neutral</span>
                      <span>High</span>
                    </div>
                  </div>

                  {/* Experiment Specific Notes */}
                  <div className="flex flex-col gap-4">
                    <label className="text-[#8e9299] text-xs font-bold uppercase tracking-widest">Protocol Notes</label>
                    <input
                      type="text"
                      value={experimentNotes}
                      onChange={(e) => setExperimentNotes(e.target.value)}
                      placeholder="Specific observations related to this hypothesis..."
                      className="w-full bg-[#1a1b1e]/60 border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-[#C75F33]/50 transition-all text-sm placeholder:text-[#8e9299]/30"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                onClick={handleSubmit}
                disabled={!completed || !aiSuggestion}
                className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all transform active:scale-[0.98] shadow-2xl ${
                  completed && aiSuggestion
                    ? 'bg-white text-black hover:bg-[#C75F33] hover:text-white shadow-black/20' 
                    : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                }`}
              >
                {!aiSuggestion 
                  ? 'Strategize first to Log' 
                  : completed 
                    ? 'Submit Daily Log' 
                    : 'Complete Action to Log'}
              </button>
            </div>
          )}

        </div>

        {/* Subscription Lock Overlay */}
        {!isSubscribed && (
          <FeatureLock 
            title="Unlock Daily Logs"
            description="Consistency is key. Log your results every day to gather evidence and complete your experiments."
            icon={Clock}
          />
        )}
      </div>
    </DashboardLayout>
  );
};
