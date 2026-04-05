import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { FlaskConical, Plus, ArrowRight, History, Calendar, CheckCircle2, MoreVertical, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAccess } from '../components/AccessContext';
import { useExperiments, Experiment } from '../components/ExperimentContext';
import { FeatureLock } from '../components/FeatureLock';
import { motion, AnimatePresence } from 'framer-motion';

export const Result = () => {
  const { isSubscribed } = useAccess();
  const { experiments, fetchExperiments } = useExperiments();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'active' | 'queued' | 'completed' | 'abandoned'>('all');

  const filteredExperiments = experiments.filter(exp => {
    if (filter === 'all') return true;
    return exp.status === filter;
  });

  const getStatusColor = (status: Experiment['status']) => {
    switch (status) {
      case 'active': return 'border-[#10b981]/30 bg-[#10b981]/5 text-[#10b981]';
      case 'queued': return 'border-[#8b5cf6]/30 bg-[#8b5cf6]/5 text-[#8b5cf6]';
      case 'completed': return 'border-[#60a5fa]/30 bg-[#60a5fa]/5 text-[#60a5fa]';
      case 'abandoned': return 'border-[#ef4444]/30 bg-[#ef4444]/5 text-[#ef4444]';
      default: return 'border-white/10 bg-white/5 text-[#8e9299]';
    }
  };

  const tabs: { id: typeof filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'queued', label: 'Queue' },
    { id: 'completed', label: 'Completed' },
    { id: 'abandoned', label: 'Archived' },
  ];

  return (
    <DashboardLayout noPadding>
      <div className={`w-full flex-1 flex flex-col relative min-h-0 p-4 md:p-8 ${!isSubscribed ? 'h-full overflow-hidden' : 'overflow-y-auto custom-scrollbar'}`}>
        <div className="relative h-full flex flex-col max-w-5xl mx-auto w-full">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 px-1 md:px-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Experiments Result</h1>
              <p className="text-[#8e9299] text-sm md:text-base leading-relaxed">
                Your sandbox for refined behavioral science.
              </p>
            </div>
            <button 
              onClick={() => navigate('/daniel')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-[#C75F33] hover:text-white transition-all active:scale-95 text-sm"
            >
              <Plus size={18} />
              <span>New Experiment</span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-8 bg-white/5 p-1.5 rounded-2xl border border-white/5 self-start overflow-x-auto no-scrollbar max-w-full">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  filter === tab.id 
                    ? 'bg-white text-black shadow-lg shadow-black/20' 
                    : 'text-[#8e9299] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4 md:gap-5 relative min-h-[400px] pb-12">
            <AnimatePresence mode="popLayout">
              {filteredExperiments.length > 0 ? (
                filteredExperiments.map((exp) => {
                  const progress = Math.round((exp.logs.length / exp.durationDays) * 100);
                  
                  return (
                    <motion.div 
                      key={exp.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="bg-[#1a1b1e]/40 border border-white/5 rounded-2xl p-5 md:p-6 flex flex-col gap-5 md:gap-6 hover:border-white/10 transition-all group"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-white/5 rounded-2xl text-[#8e9299] flex-shrink-0 group-hover:text-white transition-colors">
                            <FlaskConical size={20} className="md:w-6 md:h-6" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-sm md:text-base font-bold text-white leading-relaxed group-hover:text-[#C75F33] transition-colors">
                              {exp.hypothesis}
                            </h3>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-[#8e9299] uppercase tracking-widest">
                               <span className="flex items-center gap-1">
                                 <Calendar size={12} />
                                 {exp.status === 'queued' ? 'Queued' : `Started ${new Date(exp.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                               </span>
                               <span className="w-1 h-1 rounded-full bg-white/10" />
                               <span>{exp.metric} Level</span>
                            </div>
                          </div>
                        </div>
                        <div className={`self-start md:self-auto px-3 py-1 rounded-full border text-[10px] md:text-xs font-bold uppercase tracking-widest ${getStatusColor(exp.status)}`}>
                          {exp.status}
                        </div>
                      </div>
                      
                      <div className="h-px w-full bg-white/5 md:ml-16" />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 md:ml-16">
                        <div className="flex-1 max-w-xs space-y-2">
                           <div className="flex justify-between text-[10px] font-bold text-[#8e9299] uppercase tracking-widest">
                              <span>{exp.status === 'queued' ? 'Duration' : 'Progress'}</span>
                              <span>{exp.status === 'queued' ? `${exp.durationDays} Days` : `${exp.logs.length} / ${exp.durationDays} Days`}</span>
                           </div>
                           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                             <div 
                               className={`h-full transition-all duration-500 ${
                                 exp.status === 'active' ? 'bg-[#10b981]' : 
                                 exp.status === 'queued' ? 'bg-[#8b5cf6]' : 'bg-[#8e9299]'
                               }`}
                               style={{ width: `${exp.status === 'queued' ? 0 : progress}%` }}
                             />
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {exp.status !== 'queued' && (
                            <button 
                              onClick={() => navigate(`/result/${exp.id}`)}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 text-xs text-white hover:bg-white/10 transition-all font-bold group/btn"
                            >
                              <span>View Analytics</span>
                              <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                          )}
                          
                          {exp.status === 'queued' && (
                            <span className="text-[10px] font-bold text-[#8e9299] uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl">
                              In Queue
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                /* Empty State */
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center"
                >
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10 text-[#8e9299]">
                    <History size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">No experiments found</h2>
                  <p className="text-[#8e9299] max-w-sm mb-8 leading-relaxed">
                    {filter === 'all' 
                      ? "You haven't launched any experiments yet. Time to test your assumptions." 
                      : `You don't have any ${filter} experiments yet.`}
                  </p>
                  {filter === 'all' && (
                    <button 
                      onClick={() => navigate('/daniel')}
                      className="text-[#C75F33] hover:text-white transition-all font-bold uppercase text-xs tracking-widest flex items-center gap-2"
                    >
                      Talk to Daniel <ArrowRight size={14} />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Subscription Lock Overlay */}
        {!isSubscribed && (
          <FeatureLock 
            title="View Your Progress"
            description="Unlock detailed analytics and history for all your behavioral experiments."
            icon={FlaskConical}
          />
        )}
      </div>
    </DashboardLayout>
  );
};
