import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-md bg-[#1a1b1e]/90 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            {/* Visual Decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 -mr-12 -mt-12 rounded-full ${variant === 'danger' ? 'bg-[#ef4444]' : 'bg-[#C75F33]'}`} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl ${variant === 'danger' ? 'bg-[#ef4444]/10 text-[#ef4444]' : 'bg-[#C75F33]/10 text-[#C75F33]'}`}>
                  <AlertTriangle size={24} />
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-[#8e9299] hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
              <div className="text-[#8e9299] text-sm leading-relaxed mb-8">
                {message}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold uppercase text-xs tracking-widest hover:bg-white/10 transition-all active:scale-95"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-xl ${
                    variant === 'danger' 
                      ? 'bg-[#ef4444] text-white hover:bg-[#dc2626] shadow-[#ef4444]/20' 
                      : 'bg-white text-black hover:bg-[#C75F33] hover:text-white shadow-black/20'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
