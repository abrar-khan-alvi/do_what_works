import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

interface SuccessProps {
  title: string;
  subtitle: string;
  nextText?: string;
  nextRoute?: string;
}

export const Success = ({ title, subtitle, nextText = "Sign in", nextRoute = "/login" }: SuccessProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f1014] p-6">
      <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] bg-[#C75F33]/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-[#C75F33]/15 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-[#1a1b1e]/60 border border-white/5 backdrop-blur-2xl rounded-[32px] p-8 md:p-12 text-center relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles size={40} className="text-[#C75F33]" />
        </div>

        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, delay: 0.2 }}
          className="w-20 h-20 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#10b981]/20 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]"
        >
          <CheckCircle2 size={40} className="text-[#10b981]" />
        </motion.div>

        <h1 className="text-2xl font-black text-white mb-4 tracking-tight">
          {title}
        </h1>
        
        <p className="text-[#8e9299] text-sm leading-relaxed mb-10">
          {subtitle}
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(nextRoute)}
          className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#C75F33] hover:text-white transition-all shadow-[0_20px_40px_-12px_rgba(255,255,255,0.2)]"
        >
          <span>{nextText}</span>
          <ArrowRight size={18} />
        </motion.button>
      </motion.div>
    </div>
  );
};
