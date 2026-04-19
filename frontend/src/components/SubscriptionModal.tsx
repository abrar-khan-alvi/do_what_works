import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, X, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  title = "Unlock Elite Protocol",
  description = "Access advanced behavioral analytics, tactical strategist verdicts, and high-fidelity experimental evidence."
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-[#1a1b1e]/60 border border-white/10 rounded-[32px] md:rounded-[48px] p-8 md:p-12 text-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-xl group"
          >
            {/* Decorative Top Line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C75F33] to-transparent opacity-50" />
            
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-[#8e9299] hover:text-white hover:bg-white/5 rounded-xl transition-all active:scale-95 z-20"
            >
              <X size={20} />
            </button>

            {/* Animated Icon Container */}
            <div className="relative mb-8 md:mb-10 mt-4 md:mt-0">
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-[#C75F33] rounded-full blur-[40px] -z-10"
              />
              <div className="w-20 h-20 md:w-24 md:h-24 bg-[#C75F33]/20 rounded-3xl flex items-center justify-center text-[#C75F33] mx-auto ring-[8px] md:ring-[12px] ring-[#C75F33]/5 border border-[#C75F33]/10 shadow-xl">
                <Shield size={40} className="md:w-12 md:h-12" />
              </div>
            </div>

            <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C75F33]/10 border border-[#C75F33]/20 text-[#C75F33] text-[10px] font-bold uppercase tracking-widest mb-6">
                <Sparkles size={12} />
                Elite Access Required
              </div>

              <h2 className="text-2xl md:text-4xl font-black text-white mb-4 md:mb-6 tracking-tight leading-tight px-4">
                {title}
              </h2>
              <p className="text-[#8e9299] mb-8 md:mb-12 leading-relaxed text-sm md:text-lg font-medium px-4 opacity-70">
                {description}
              </p>
              
              <Link 
                to="/subscription" 
                onClick={onClose}
                className="group relative block w-full py-4 md:py-5 bg-white text-black rounded-2xl md:rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] md:text-xs hover:bg-[#C75F33] hover:text-white transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl overflow-hidden shadow-white/5"
              >
                <span className="relative z-10">Upgrade Now</span>
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </Link>
            </motion.div>

            {/* Daniel's Subtle Branding */}
            <p className="mt-8 text-[8px] md:text-[10px] text-[#8e9299]/30 font-bold uppercase tracking-[0.3em]">
              Strategic protocol required
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
