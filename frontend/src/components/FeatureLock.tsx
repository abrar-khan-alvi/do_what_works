import React from 'react';
import { motion } from 'framer-motion';
import { Lock, LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureLockProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
}

export const FeatureLock: React.FC<FeatureLockProps> = ({ 
  title, 
  description, 
  icon: Icon = Lock,
  actionText = "Get Full Access"
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-2xl bg-[#0f1014]/60 p-4 md:p-8"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.1 }}
        className="bg-[#1a1b1e]/60 border border-white/10 p-8 md:p-12 rounded-[32px] md:rounded-[48px] max-w-lg w-full text-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] relative overflow-hidden group"
      >
        {/* Decorative Top Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C75F33] to-transparent opacity-50" />
        
        {/* Animated Lock Icon */}
        <div className="relative mb-8 md:mb-10">
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-[#C75F33] rounded-full blur-[40px] -z-10"
          />
          <div className="w-20 h-20 md:w-24 md:h-24 bg-[#C75F33]/20 rounded-3xl flex items-center justify-center text-[#C75F33] mx-auto ring-[8px] md:ring-[12px] ring-[#C75F33]/5 border border-[#C75F33]/20 shadow-xl">
            <Icon size={40} className="md:w-12 md:h-12" />
          </div>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl md:text-4xl font-black text-white mb-4 md:mb-6 tracking-tight">
            {title}
          </h2>
          <p className="text-[#8e9299] mb-8 md:mb-12 leading-relaxed text-sm md:text-lg font-medium px-2 md:px-4 opacity-80">
            {description}
          </p>
          
          <Link 
            to="/subscription" 
            className="group relative block w-full py-4 md:py-5 bg-white text-black rounded-2xl md:rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] md:text-xs hover:bg-[#C75F33] hover:text-white transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl overflow-hidden shadow-white/5"
          >
            <span className="relative z-10">{actionText}</span>
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
    </motion.div>
  );
};
