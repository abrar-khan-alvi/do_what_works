import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  Brain, Target, Activity, Zap, Shield, TrendingUp,
  ChevronRight, FlaskConical, Clock, Award
} from 'lucide-react';
import { useExperiments } from '../components/ExperimentContext';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { steps } from './Onboarding';
import { useAccess } from '../components/AccessContext';
import { SubscriptionModal } from '../components/SubscriptionModal';

import { DashboardLayout } from '../components/DashboardLayout';

// Animation variants
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const container = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const Overview = () => {
  const { isSubscribed } = useAccess();
  const { experiments, activeExperiment } = useExperiments();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState(true);
  const [showLockModal, setShowLockModal] = useState(false);

  const handlePremiumClick = (callback: () => void) => {
    if (isSubscribed) {
      callback();
    } else {
      setShowLockModal(true);
    }
  };

  useEffect(() => {
    const fetchOnboarding = async () => {
      try {
        const res = await api.get('/api/v1/auth/onboarding/');
        setOnboardingData(res.data);
      } catch (err) {
        console.error('Failed to fetch onboarding results:', err);
      } finally {
        setIsLoadingOnboarding(false);
      }
    };
    fetchOnboarding();
  }, []);

  // 1. Process Trend Data for the Active Experiment
  const trendData = useMemo(() => {
    if (!activeExperiment || !activeExperiment.logs.length) return [];

    // Fill in last 10 days (or actual duration)
    return activeExperiment.logs
      .slice(-10)
      .map((log, index) => ({
        day: `Day ${index + 1}`,
        value: log.metricValue,
      }));
  }, [activeExperiment]);

  // 2. Process Real Belief Data from Backend
  const processedBeliefData = useMemo(() => {
    if (!onboardingData || !onboardingData.answers) {
      // Fallback to high-fidelity placeholders if no data exists
      return [
        { name: 'Control', score: 85, color: '#C75F33' },
        { name: 'Capability', score: 72, color: '#C75F33' },
        { name: 'Adaptability', score: 91, color: '#8b5cf6' },
        { name: 'Awareness', score: 65, color: '#C75F33' },
        { name: 'Execution', score: 78, color: '#8b5cf6' },
        { name: 'Truth', score: 88, color: '#C75F33' },
      ];
    }

    const answers = onboardingData.answers;
    return steps.map((step) => {
      const stepAnswers = Object.entries(answers)
        .filter(([key]) => key.startsWith(`${step.id}-`))
        .map(([_, val]) => val as number);

      const avg = stepAnswers.length > 0
        ? stepAnswers.reduce((a, b) => a + b, 0) / stepAnswers.length
        : 2; // Default to neutral

      // Convert 0-4 scale to 0-100%
      const percentage = (avg / 4) * 100;

      return {
        name: step.title,
        score: Math.round(percentage),
        color: percentage >= 75 ? '#8b5cf6' : '#C75F33', // Highlight scores > 75%
      };
    });
  }, [onboardingData]);

  const stats = [
    { label: 'Active Sprint', value: activeExperiment ? `Day ${activeExperiment.logs.length + 1}` : 'None', icon: Target, color: 'text-[#C75F33]' },
    { label: 'Avg Focus', value: trendData.length ? (trendData.reduce((acc, curr) => acc + curr.value, 0) / trendData.length).toFixed(1) : '—', icon: Activity, color: 'text-[#8b5cf6]' },
    { label: 'Total Logs', value: experiments.reduce((acc, exp) => acc + exp.logs.length, 0), icon: Zap, color: 'text-yellow-500' },
  ];

  return (
    <DashboardLayout>
      <motion.div
        variants={container}
        initial="initial"
        animate="animate"
        className="space-y-8 pb-12"
      >

        {/* Stats Quick Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              className="bg-[#1a1b1e]/40 border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl bg-white/5 ${s.color}`}>
                  <s.icon size={24} />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{s.value}</div>
                  <div className="text-[10px] text-[#8e9299] uppercase font-bold tracking-[0.2em]">{s.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Performance Trend Area Chart */}
          <motion.div
            variants={fadeUp}
            className="bg-[#1a1b1e]/40 border border-white/[0.06] rounded-[2rem] p-8 space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <TrendingUp size={20} className="text-[#8b5cf6]" />
                Performance History
              </h3>
              <div className="text-[10px] font-mono text-[#8e9299] opacity-50 uppercase tracking-widest">Last 10 Logs</div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C75F33" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C75F33" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    domain={[0, 10]}
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1b1e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#C75F33"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Belief Audit Radar Chart - Data Driven */}
          <motion.div
            variants={fadeUp}
            className="bg-[#1a1b1e]/40 border border-white/[0.06] rounded-[2rem] p-8 space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <Brain size={20} className="text-[#C75F33]" />
                Belief Distribution
              </h3>
              <div className="text-[10px] font-mono text-[#8e9299] opacity-50 uppercase tracking-widest">Dig v1.0 Result</div>
            </div>

            <div className="h-[430px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={processedBeliefData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis
                    dataKey="name"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 500 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1b1e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                  <Radar
                    name="Belief Score"
                    dataKey="score"
                    stroke="#C75F33"
                    fill="#C75F33"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Strategist Insights - Surf latest AI verdicts */}
        {useMemo(() => {
          const analyzed = experiments
            .filter(e => e.aiAnalysis)
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

          if (!analyzed.length) return null;

          return (
            <motion.div variants={fadeUp} className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Shield size={20} className="text-[#10b981]" />
                  Strategist Insights
                </h3>
                <button
                  onClick={() => handlePremiumClick(() => navigate('/result'))}
                  className="text-[10px] font-bold text-[#8e9299] hover:text-white uppercase tracking-widest transition-colors"
                >
                  View Archive
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analyzed.slice(0, 2).map((exp) => (
                  <div
                    key={exp.id}
                    className="bg-[#1a1b1e]/40 border border-white/[0.06] rounded-[2rem] p-6 backdrop-blur-xl group hover:border-white/10 transition-all cursor-pointer"
                    onClick={() => handlePremiumClick(() => navigate(`/result/${exp.id}`))}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                        <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-widest">Tactical Verdict</span>
                      </div>
                      <span className="text-[10px] font-medium text-[#8e9299]">
                        {new Date(exp.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-white font-bold text-sm leading-tight group-hover:text-[#C75F33] transition-colors line-clamp-1">
                        "{exp.hypothesis}"
                      </h4>
                      <p className="text-[#8e9299] text-xs leading-relaxed line-clamp-3 italic">
                        {exp.aiAnalysis?.recommendation}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-[10px] font-bold text-[#8e9299] uppercase tracking-widest">Pragmatic Score</div>
                        <div className="text-xs font-black text-white">{exp.aiAnalysis?.pragmatic_score}/10</div>
                      </div>
                      <div className={`text-[10px] font-bold uppercase tracking-widest ${exp.aiAnalysis?.verdict === 'Verified' ? 'text-[#10b981]' : 'text-[#ef4444]'
                        }`}>
                        {exp.aiAnalysis?.verdict}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        }, [experiments, navigate])}

        {/* Lower Section: Active Experiment Details */}
        {activeExperiment && (
          <motion.div
            variants={fadeUp}
            className={`transition-all duration-500 border rounded-[2rem] p-8 ${activeExperiment.logs.length >= activeExperiment.durationDays
              ? 'bg-[#10b981]/5 border-[#10b981]/30'
              : 'bg-[#C75F33]/5 border-[#C75F33]/20'
              }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeExperiment.logs.length >= activeExperiment.durationDays
                    ? 'bg-[#10b981]/20 text-[#10b981]'
                    : 'bg-[#C75F33]/20 text-[#C75F33]'
                    }`}>
                    {activeExperiment.logs.length >= activeExperiment.durationDays ? <Shield size={20} /> : <FlaskConical size={20} />}
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {activeExperiment.logs.length >= activeExperiment.durationDays
                      ? 'Verification Complete'
                      : 'Active Experiment'
                    }
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl text-wrap break-words group hover:border-white/10 transition-colors">
                    <div className="text-[10px] text-[#8e9299] uppercase font-bold tracking-widest mb-1">Hypothesis</div>
                    <div className="text-white text-lg font-medium">"{activeExperiment.hypothesis}"</div>
                  </div>
                  <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl text-wrap break-words group hover:border-white/10 transition-colors">
                    <div className="text-[10px] text-[#8e9299] uppercase font-bold tracking-widest mb-1">Target Action</div>
                    <div className="text-white text-sm opacity-90">{activeExperiment.action}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#8e9299] text-xs font-bold uppercase tracking-wider">
                      <Clock size={12} /> Timeline
                    </div>
                    <div className="text-xl font-bold text-white">
                      {activeExperiment.logs.length >= activeExperiment.durationDays
                        ? `Finished ${activeExperiment.durationDays} Days`
                        : `${activeExperiment.logs.length} / ${activeExperiment.durationDays} Logs Gathered`
                      }
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#8e9299] text-xs font-bold uppercase tracking-wider">
                      <Award size={12} /> Current Metric
                    </div>
                    <div className={`text-xl font-bold ${activeExperiment.logs.length >= activeExperiment.durationDays ? 'text-[#10b981]' : 'text-[#facc15]'
                      }`}>
                      {activeExperiment.metric}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className={activeExperiment.logs.length >= activeExperiment.durationDays ? 'text-[#10b981]' : 'text-[#C75F33]'}>Progress</span>
                    <span className="text-white">{Math.round((activeExperiment.logs.length / activeExperiment.durationDays) * 100)}%</span>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(activeExperiment.logs.length / activeExperiment.durationDays) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${activeExperiment.logs.length >= activeExperiment.durationDays
                        ? 'bg-[#10b981]'
                        : 'bg-gradient-to-r from-[#C75F33] to-[#8b5cf6]'
                        }`}
                    />
                  </div>
                </div>

                {/* Call to action if complete */}
                {activeExperiment.logs.length >= activeExperiment.durationDays && (
                  <button
                    onClick={() => handlePremiumClick(() => navigate(`/result/${activeExperiment.id}`))}
                    className="w-full flex items-center justify-center gap-2 bg-[#10b981] text-black font-bold py-4 rounded-2xl hover:bg-[#10b981]/90 transition-all active:scale-[0.98] shadow-lg shadow-[#10b981]/20"
                  >
                    <span>Analyze Evidence</span>
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      <SubscriptionModal 
        isOpen={showLockModal} 
        onClose={() => setShowLockModal(false)} 
      />
    </DashboardLayout>
  );
};
