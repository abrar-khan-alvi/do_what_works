import React from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { 
  ArrowLeft, ArrowRight, Trash2, Calendar, Target, 
  TrendingUp, CheckCircle2, XCircle, Clock 
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useExperiments } from '../components/ExperimentContext';
import { motion } from 'framer-motion';
import { ConfirmModal } from '../components/ConfirmModal';

export const ExperimentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { experiments, deleteExperiment } = useExperiments();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  
  const experiment = experiments.find(e => e.id === id);

  if (!experiment) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-xl font-bold text-white mb-4">Experiment Not Found</h2>
          <button 
            onClick={() => navigate('/result')}
            className="text-[#C75F33] font-bold uppercase text-xs tracking-widest"
          >
            Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    deleteExperiment(experiment.id);
    navigate('/result');
  };

  // Analytics Calculations
  const logsCount = experiment.logs.length;
  const completionRate = Math.round((logsCount / experiment.durationDays) * 100);
  const avgScore = logsCount > 0 
    ? (experiment.logs.reduce((acc, log) => acc + log.metricValue, 0) / logsCount).toFixed(1)
    : 0;
  
  const daysLeft = Math.max(0, experiment.durationDays - logsCount);

  // Simple Streak Calculation
  const calculateStreak = () => {
    if (logsCount === 0) return 0;
    const sortedLogs = [...experiment.logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0,0,0,0);

    for (let log of sortedLogs) {
      const logDate = new Date(log.date);
      logDate.setHours(0,0,0,0);
      
      const diffDays = Math.floor((currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) { // Logged today or yesterday
         streak++;
         currentDate = logDate;
      } else {
        break;
      }
    }
    return streak;
  };

  // Chart Logic (SVG)
  const chartWidth = 600;
  const chartHeight = 150;
  const padding = 20;
  const maxScore = 10;
  
  const points = experiment.logs.map((log, i) => {
    const x = (i / (Math.max(1, experiment.durationDays - 1))) * (chartWidth - padding * 2) + padding;
    const y = chartHeight - ((log.metricValue / maxScore) * (chartHeight - padding * 2) + padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto w-full pb-12">
        
        {/* Navigation & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <button 
            onClick={() => navigate('/result')}
            className="flex items-center gap-2 text-[#8e9299] hover:text-white transition-colors text-sm font-medium w-fit"
          >
            <ArrowLeft size={16} />
            <span>Back to Research Dashboard</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/20 transition-colors text-xs font-bold uppercase tracking-widest"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>

        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${
              experiment.status === 'active' ? 'border-[#10b981]/30 bg-[#10b981]/10 text-[#10b981]' : 
              experiment.status === 'completed' ? 'border-[#60a5fa]/30 bg-[#60a5fa]/10 text-[#60a5fa]' :
              'border-white/10 bg-white/5 text-[#8e9299]'
            }`}>
              {experiment.status}
            </span>
            <span className="text-[#8e9299] text-[10px] uppercase font-bold tracking-widest">
              ID: {experiment.id.slice(0, 8)}
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-6">
            "{experiment.hypothesis}"
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-[#8e9299]">
            <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} />
                <span>Started: {new Date(experiment.startDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
                <Target size={16} />
                <span>Primary Metric: {experiment.metric}</span>
            </div>
          </div>
        </div>

        {/* Analytics Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1a1b1e]/40 border border-white/10 rounded-2xl p-6">
            <div className="text-[10px] font-bold text-[#8e9299] uppercase tracking-widest mb-2">Duration</div>
            <div className="flex items-baseline gap-1">
               <div className="text-3xl font-bold text-white">{logsCount}</div>
               <div className="text-sm text-[#8e9299]">/ {experiment.durationDays} Days</div>
            </div>
          </div>
          <div className="bg-[#1a1b1e]/40 border border-white/10 rounded-2xl p-6">
            <div className="text-[10px] font-bold text-[#8e9299] uppercase tracking-widest mb-2">Completion</div>
            <div className="text-3xl font-bold text-[#10b981]">{completionRate}%</div>
          </div>
          <div className="bg-[#1a1b1e]/40 border border-white/10 rounded-2xl p-6">
            <div className="text-[10px] font-bold text-[#8e9299] uppercase tracking-widest mb-2">Avg {experiment.metric}</div>
            <div className="text-3xl font-bold text-white">{avgScore}</div>
          </div>
          <div className="bg-[#1a1b1e]/40 border border-white/10 rounded-2xl p-6">
            <div className="text-[10px] font-bold text-[#8e9299] uppercase tracking-widest mb-2">Streak</div>
            <div className="text-3xl font-bold text-white uppercase">{calculateStreak()} 🔥</div>
          </div>
        </div>

        {/* Visual Trend Chart */}
        <div className="bg-[#1a1b1e]/40 border border-white/10 rounded-3xl p-6 md:p-8 mb-8">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-white flex items-center gap-3">
                <TrendingUp size={20} className="text-[#C75F33]" />
                Metric Trends
              </h2>
              <div className="text-[10px] font-bold text-[#8e9299] uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                 Variable: {experiment.metric}
              </div>
           </div>

           <div className="w-full overflow-x-auto custom-scrollbar pb-4">
              <div className="min-w-[600px] h-[200px] relative">
                 {/* Y-axis labels */}
                 <div className="absolute left-0 inset-y-0 flex flex-col justify-between py-5 text-[8px] font-black text-[#8e9299] opacity-50 uppercase pointer-events-none">
                    <span>10</span>
                    <span>5</span>
                    <span>1</span>
                 </div>

                 {/* Grid Lines */}
                 <div className="absolute left-8 right-0 h-px bg-white/5 top-5" />
                 <div className="absolute left-8 right-0 h-px bg-white/5 top-1/2" />
                 <div className="absolute left-8 right-0 h-px bg-white/5 bottom-5" />

                 {/* SVG Chart */}
                 <svg 
                   viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                   className="w-full h-full"
                   preserveAspectRatio="none"
                 >
                   {/* Gradient Fill */}
                   <defs>
                     <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                       <stop offset="0%" stopColor="#C75F33" stopOpacity="0.2" />
                       <stop offset="100%" stopColor="#C75F33" stopOpacity="0" />
                     </linearGradient>
                   </defs>

                   {logsCount > 1 && (
                     <>
                       <path
                         d={`M ${experiment.logs.map((_, i) => (i / (experiment.durationDays - 1)) * (chartWidth - padding * 2) + padding).join(' ')} V ${chartHeight} H ${padding} Z`}
                         fill="url(#chartGradient)"
                         opacity={0.5}
                       />
                       <polyline
                         fill="none"
                         stroke="#C75F33"
                         strokeWidth="3"
                         strokeLinecap="round"
                         strokeLinejoin="round"
                         points={points}
                       />
                     </>
                   )}

                   {/* Points */}
                   {experiment.logs.map((log, i) => {
                     const x = (i / (Math.max(1, experiment.durationDays - 1))) * (chartWidth - padding * 2) + padding;
                     const y = chartHeight - ((log.metricValue / maxScore) * (chartHeight - padding * 2) + padding);
                     return (
                       <circle
                         key={i}
                         cx={x}
                         cy={y}
                         r="4"
                         fill="white"
                         stroke="#C75F33"
                         strokeWidth="2"
                       />
                     );
                   })}
                 </svg>
              </div>
           </div>
        </div>

        {/* Experiment Protocol Details */}
        <div className="bg-[#1a1b1e]/40 border border-white/10 rounded-3xl p-6 md:p-8 mb-8">
           <h2 className="text-lg font-bold text-white mb-6">Experiment Protocol</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                 <div className="text-[10px] font-bold text-[#8e9299] uppercase tracking-widest">Specified Action</div>
                 <div className="text-white bg-white/5 p-4 rounded-xl border border-white/5 italic">
                    "{experiment.action}"
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#8e9299] uppercase tracking-widest mb-1">Target Metric</span>
                    <span className="text-white font-bold">{experiment.metric} Level</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#8e9299] uppercase tracking-widest mb-1">Success Criteria</span>
                    <span className="text-sm text-[#8e9299]">Improvement or stabilization in {experiment.metric} via {experiment.action}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Daily Log Timeline */}
        <div className="bg-[#1a1b1e]/40 border border-white/10 rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-white flex items-center gap-3">
              <Clock size={20} className="text-[#8e9299]" />
              Submission Log
            </h2>
            <div className="text-[10px] font-bold text-[#8e9299] uppercase tracking-widest">
              {logsCount} Entries Recorded
            </div>
          </div>

          <div className="space-y-4">
            {experiment.logs.length > 0 ? (
              [...experiment.logs].reverse().map((log, index) => (
                <div key={log.id} className="bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div className="flex items-start gap-4 flex-1">
                      <div className={`p-2 rounded-xl flex-shrink-0 ${log.completed === 'yes' ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#ef4444]/10 text-[#ef4444]'}`}>
                         {log.completed === 'yes' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-2">
                           <span className="text-sm font-bold text-white">Day {experiment.logs.length - index}</span>
                           <span className="text-[10px] text-[#8e9299] font-medium">• {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                         </div>
                         <p className="text-sm text-[#8e9299] italic leading-relaxed">
                            {log.notes || "No protocol notes recorded."}
                         </p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end">
                         <span className="text-[10px] font-bold text-[#8e9299] uppercase tracking-widest">Score</span>
                         <span className="text-lg font-black text-white">{log.metricValue}</span>
                      </div>
                      <div className="h-10 w-px bg-white/5 hidden md:block" />
                      <button className="text-[#8e9299] hover:text-white transition-colors">
                        <ArrowRight size={18} />
                      </button>
                   </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-[#8e9299] text-sm italic">
                Gathering initial evidence. Submit your first daily log to begin analytics.
              </div>
            )}
          </div>
        </div>

        {/* Global Footer Navigation */}
        <div className="mt-12 flex justify-between items-center px-4">
           <div className="text-[10px] font-medium text-[#8e9299] uppercase tracking-[0.2em] opacity-30 italic">
              Behavioral Science Engine v1.0
           </div>
           {experiment.status === 'active' && (
             <button 
                onClick={() => navigate('/daily-log')}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-[#C75F33] hover:text-white transition-all transform active:scale-95 shadow-xl shadow-black/20"
             >
                <span>Log Today</span>
                <ArrowRight size={18} />
             </button>
           )}
        </div>

      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Experiment"
        message="Are you sure you want to delete this experiment and all its data? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </DashboardLayout>
  );
};
