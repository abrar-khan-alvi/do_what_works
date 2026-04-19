import React from 'react';
import { motion } from 'framer-motion';
import { Lock, LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureLockProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  variant?: 'full' | 'inline';
}

export const FeatureLock: React.FC<FeatureLockProps> = ({ 
  title, 
  description, 
  icon: Icon = Lock,
  actionText = "Get Full Access",
  variant = 'full'
}) => {
  const isInline = variant === 'inline';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`absolute inset-0 z-50 flex items-center justify-center ${
        isInline ? 'backdrop-blur-xl bg-[#0f1014]/40 p-6' : 'backdrop-blur-2xl bg-[#0f1014]/60 p-4 md:p-8'
      }`}
    >
      <motion.div 
        initial={{ scale: 0.95, y: 10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.1 }}
        className={`${
          isInline 
          ? 'bg-white/[0.03] border border-white/10 p-6 md:p-8 rounded-[2rem] max-w-sm' 
          : 'bg-[#1a1b1e]/60 border border-white/10 p-8 md:p-12 rounded-[32px] md:rounded-[48px] max-w-lg shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)]'
        } w-full text-center relative overflow-hidden group backdrop-blur-md`}
      >
        {/* Decorative Top Line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C75F33] to-transparent opacity-50" />
        
        {/* Animated Lock Icon */}
        <div className={`relative ${isInline ? 'mb-4 md:mb-6' : 'mb-8 md:mb-10'}`}>
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute inset-0 bg-[#C75F33] rounded-full ${isInline ? 'blur-[20px]' : 'blur-[40px]'} -z-10`}
          />
          <div className={`${
            isInline ? 'w-12 h-12 md:w-14 md:h-14' : 'w-20 h-20 md:w-24 md:h-24'
          } bg-[#C75F33]/20 rounded-2xl flex items-center justify-center text-[#C75F33] mx-auto ring-[6px] md:ring-[8px] ring-[#C75F33]/5 border border-[#C75F33]/10`}>
            <Icon size={isInline ? 24 : 40} className="" />
          </div>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 5 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
        >
          <h2 className={`${
            isInline ? 'text-lg md:text-xl' : 'text-2xl md:text-4xl'
          } font-black text-white mb-2 md:mb-4 tracking-tight`}>
            {title}
          </h2>
          <p className={`${
            isInline ? 'text-[10px] md:text-xs' : 'text-sm md:text-lg'
          } text-[#8e9299] mb-6 md:mb-8 leading-relaxed font-medium px-4 opacity-70`}>
            {description}
          </p>
          
          <Link 
            to="/subscription" 
            className={`group relative block w-full transition-all transform hover:scale-[1.02] active:scale-95 overflow-hidden rounded-xl md:rounded-2xl ${
              isInline 
              ? 'py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10' 
              : 'py-4 md:py-5 bg-white text-black hover:bg-[#C75F33] hover:text-white shadow-2xl shadow-white/5'
            } font-bold uppercase tracking-[0.2em] text-[8px] md:text-[10px]`}
          >
            <span className="relative z-10">{actionText}</span>
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
          </Link>
        </motion.div>

        {!isInline && (
          <p className="mt-8 text-[8px] md:text-[10px] text-[#8e9299]/30 font-bold uppercase tracking-[0.3em]">
            Strategic protocol required
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};
