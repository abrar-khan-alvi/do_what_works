import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Check, CreditCard, Sparkles, Zap, Shield, Clock, ArrowRight, Info, AlertCircle } from 'lucide-react';
import { useAccess } from '../components/AccessContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Subscription = () => {
  const { isSubscribed, daysRemaining, subscribe, expiresAt } = useAccess();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(false);

  const handleSubscribe = () => {
    setIsProcessing(true);
    // Simulate Stripe Checkout delay
    setTimeout(() => {
      subscribe();
      setIsProcessing(false);
    }, 2000);
  };

  const features = [
    { title: "Daniel's Strategic Insight", desc: "Unlimited belief refinement with our advanced behavioral engine." },
    { title: "Concurrent Experiments", desc: "Track up to 5 concurrent behavioral tests simultaneously." },
    { title: "Deep Analytics", desc: "Comprehensive daily logging with advanced trend visualization." },
    { title: "Evidence Reports", desc: "Exportable summary reports of your experiment results." },
    { title: "Priority Processing", desc: "Instant AI responses even during peak system usage." }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <DashboardLayout noPadding>
      <div className="min-h-full lg:h-full flex flex-col items-center lg:justify-center pt-10 pb-12 px-6 md:p-12 lg:p-16 relative overflow-y-auto lg:overflow-hidden custom-scrollbar">
        {/* Animated Background Highlights */}
        <div className="absolute -top-[5%] -left-[5%] w-[500px] h-[500px] bg-[#C75F33]/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-float" />
        <div className="absolute -bottom-[5%] -right-[5%] w-[400px] h-[400px] bg-[#C75F33]/15 rounded-full blur-[100px] pointer-events-none -z-10 animate-float-reverse" />

        <div className="max-w-6xl w-full mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 md:mb-12 mt-4 lg:mt-0"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C75F33]/10 border border-[#C75F33]/20 rounded-full text-[#C75F33] text-[10px] font-bold uppercase tracking-widest mb-2">
              <Sparkles size={12} />
              Elite Access
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2 tracking-tight px-4 leading-[1.1]">
              Invest in your <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#C75F33] to-[#C75F33]/50">Evolution</span>
            </h1>
            <p className="text-[#8e9299] text-sm md:text-lg max-w-2xl mx-auto leading-relaxed px-4">
              Unlock Daniel's full strategic suite to transform vague beliefs into rigorous, testable hypotheses and concrete results.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start w-full">
            {/* Left: Pricing & Purchase */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-7 xl:col-span-8"
            >
              <div 
                className={`relative group transition-all duration-500 rounded-[32px] overflow-hidden flex flex-col justify-between ${
                  isSubscribed 
                  ? 'bg-gradient-to-br from-[#10b981]/10 to-transparent border-[#10b981]/30 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]' 
                  : 'bg-[#1a1b1e]/40 border-white/5 backdrop-blur-2xl hover:bg-[#1a1b1e]/60 hover:border-white/10 shadow-2xl'
                } border p-6 md:p-8 lg:p-10 ${isSubscribed ? 'pt-12 md:pt-16' : ''}`}
                onMouseEnter={() => setHoveredCard(true)}
                onMouseLeave={() => setHoveredCard(false)}
              >
                {/* Status Badge */}
                <AnimatePresence>
                  {isSubscribed && (
                    <motion.div 
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="absolute top-0 right-0 left-0 bg-[#10b981] text-black text-[10px] font-bold uppercase tracking-[0.2em] py-2 text-center"
                    >
                      Elite Strategist Protocol Active
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="space-y-0.5">
                    <h3 className="text-xl font-black text-white tracking-tight">Prime Cycle Access</h3>
                    <div className="flex items-center gap-2 text-[#8e9299]">
                      <Clock size={10} />
                      <span className="text-[9px] font-bold uppercase tracking-widest">10-Day Evidence Sprint</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">$29</span>
                    <span className="text-[#8e9299] font-medium font-mono text-xs">.00</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 mb-6">
                  {features.map((feature, i) => (
                    <motion.div 
                      key={i} 
                      variants={itemVariants}
                      className="flex items-start gap-3 group/item"
                    >
                      <div className="w-5 h-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:border-[#C75F33]/50 transition-colors">
                        <Check size={12} className="text-[#10b981]" strokeWidth={3} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-white text-[13px] font-bold tracking-tight">{feature.title}</p>
                        <p className="text-[#8e9299] text-[11px] leading-snug opacity-60 group-hover/item:opacity-100 transition-opacity">{feature.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="h-[1px] w-full bg-white/5 mb-6 opacity-40" />

                <motion.button
                  whileHover={{ scale: isSubscribed ? 1 : 1.02 }}
                  whileTap={{ scale: isSubscribed ? 1 : 0.98 }}
                  onClick={handleSubscribe}
                  disabled={isSubscribed || isProcessing}
                  className={`w-full py-5 md:py-6 rounded-[16px] md:rounded-[20px] font-black text-[11px] md:text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden ${
                    isSubscribed
                      ? 'bg-transparent border border-[#10b981]/20 text-[#10b981] cursor-default'
                      : 'bg-white text-black hover:bg-[#C75F33] hover:text-white shadow-[0_20px_40px_-12px_rgba(255,255,255,0.2)]'
                    } disabled:opacity-50`}
                >
                  <AnimatePresence mode="wait">
                    {isProcessing ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-5 h-5 border-3 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Protocol...</span>
                      </motion.div>
                    ) : isSubscribed ? (
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-3"
                      >
                        <Shield size={16} className="fill-[#10b981]/20 text-[#10b981]" />
                        <span className="text-[10px] sm:text-xs text-[#10b981]">Verified until {new Date(expiresAt || 0).toLocaleDateString()}</span>
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ x: 10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-center gap-3"
                      >
                        <CreditCard size={20} />
                        <span>Initialize Stripe Checkout</span>
                        <ArrowRight size={18} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>

            {/* Right: Insights & Progress */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 md:gap-6">
              {/* Progress Tracker */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[#1a1b1e]/40 border border-white/5 rounded-2xl p-6 md:p-8 md:pb-10 backdrop-blur-xl relative group flex flex-col"
              >
                <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Zap size={32} className="text-[#C75F33]" />
                </div>
                
                <h4 className="text-white font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Clock size={14} className="text-[#8e9299]" />
                  Session Lifecycle
                </h4>

                <div className="flex-1 flex flex-col justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className={`text-[44px] md:text-5xl font-black leading-none tracking-tighter ${isSubscribed ? 'text-white' : 'text-white/10'}`}>
                          {isSubscribed ? (daysRemaining < 10 ? `0${daysRemaining}` : daysRemaining) : '00'}
                        </span>
                        <p className="text-[8px] md:text-[9px] font-bold text-[#8e9299] uppercase tracking-widest mt-1">Days Remaining</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg">Quota: 10D</span>
                        {isSubscribed ? (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#10b981]/10 rounded-full">
                            <div className="w-1 h-1 bg-[#10b981] rounded-full animate-pulse" />
                            <span className="text-[7px] md:text-[8px] font-bold text-[#10b981] uppercase tracking-widest">Active Protocol</span>
                          </div>
                        ) : (
                          <span className="text-[7px] md:text-[8px] font-bold text-white/20 uppercase tracking-widest">Protocol Inactive</span>
                        )}
                      </div>
                    </div>

                    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px] ring-1 ring-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: isSubscribed ? `${(daysRemaining / 10) * 100}%` : '0%' }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className={`h-full rounded-full ${isSubscribed ? 'bg-gradient-to-r from-[#C75F33] to-[#ef4444]' : 'bg-white/5'}`}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-[#C75F33]/5 border border-[#C75F33]/20 rounded-xl mt-auto">
                    <Info size={14} className="text-[#C75F33] flex-shrink-0" />
                    <p className="text-[10px] text-[#8e9299] font-medium leading-relaxed italic">
                      Protocol reset occurs automatically upon expiration. Ensure data logging is complete before cycle end.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Daniel's Philosophy */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-[#C75F33]/5 border border-[#C75F33]/20 rounded-2xl p-6 md:p-8 relative overflow-hidden"
              >
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#C75F33]/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-start gap-3 relative z-10">
                  <div className="w-10 h-10 bg-[#C75F33] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#C75F33]/20 flex-shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-white text-sm font-bold tracking-tight">The 10-Day Principle</h4>
                    <p className="text-[#8e9299] text-[11px] leading-relaxed font-medium">
                      "Real change isn't a destination; it's a series of observed sprints. I've designed these 10-day windows to prevent data fatigue and force rigorous execution."
                    </p>
                    <p className="text-[9px] font-black text-[#C75F33] uppercase tracking-[0.2em]">— DANIEL, STRATEGIST AI</p>
                  </div>
                </div>
              </motion.div>

              {/* Security Note */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-2 text-[#8e9299] opacity-40 hover:opacity-100 transition-opacity"
              >
                <Shield size={12} />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Bank-Grade encryption • Stripe Secure</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
