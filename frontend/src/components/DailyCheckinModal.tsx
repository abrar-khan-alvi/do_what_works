import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface DailyCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const METRICS = [
  { id: 'sleep', label: 'Sleep Quality', icon: '🌙', desc: 'Rest & recovery load' },
  { id: 'exercise', label: 'Exercise & Activity', icon: '🏃', desc: 'Movement & workout intensity' },
  { id: 'focus', label: 'Focus & Attention', icon: '🎯', desc: 'Clarity, flow state, & drive' },
  { id: 'energy', label: 'Energy Levels', icon: '⚡', desc: 'Physical & mental vitality' },
  { id: 'mood', label: 'General Mood', icon: '🎭', desc: 'Emotional frequency' },
  { id: 'stress', label: 'Stress Levels', icon: '🌊', desc: 'Perceived anxiety or tension' },
  { id: 'social', label: 'Connection / Social', icon: '🤝', desc: 'Social friction or support' },
  { id: 'progress', label: 'Daily Progress', icon: '📈', desc: 'Execution on key objectives' },
];

export const DailyCheckinModal: React.FC<DailyCheckinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [metrics, setMetrics] = useState<Record<string, number>>({
    sleep: 5,
    exercise: 5,
    focus: 5,
    energy: 5,
    mood: 5,
    stress: 5,
    social: 5,
    progress: 5,
  });
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post('/api/v1/experiments/daily-checkin/', {
        ...metrics,
        notes,
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to submit daily check-in:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-[#1a1b1e]/90 border border-white/10 rounded-[32px] p-6 md:p-8 text-left shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] overflow-y-auto max-h-[90vh] backdrop-blur-xl custom-scrollbar flex flex-col gap-6"
          >
            {/* Decorative Top Line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C75F33] to-transparent opacity-50" />

            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C75F33]/15 text-[#C75F33] flex items-center justify-center border border-[#C75F33]/10">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                    Daily Metrics Check-in
                  </h2>
                  <p className="text-[10px] text-[#8e9299] font-bold uppercase tracking-widest">Calibrate Daniel AI</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-[#8e9299] hover:text-white hover:bg-white/5 rounded-xl transition-all active:scale-95"
              >
                <X size={20} />
              </button>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
              {METRICS.map((m) => (
                <div
                  key={m.id}
                  className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col gap-3"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-xl w-6 h-6 flex items-center justify-center">{m.icon}</span>
                      <div>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">{m.label}</span>
                        <p className="text-[9px] text-[#8e9299] opacity-75">{m.desc}</p>
                      </div>
                    </div>
                    <span className="w-8 h-8 rounded-lg bg-[#C75F33]/10 border border-[#C75F33]/20 text-[#C75F33] flex items-center justify-center font-bold text-xs">
                      {metrics[m.id]}
                    </span>
                  </div>

                  <div className="relative h-2 w-full bg-white/5 rounded-full px-1 flex items-center">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={metrics[m.id]}
                      onChange={(e) =>
                        setMetrics((prev) => ({ ...prev, [m.id]: parseInt(e.target.value) }))
                      }
                      className="w-full h-1 bg-transparent appearance-none cursor-pointer accent-[#C75F33]"
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-bold text-[#8e9299]/30 uppercase tracking-widest px-1">
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>
              ))}

              {/* Notes */}
              <div className="col-span-1 md:col-span-2 bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col gap-3">
                <label className="text-xs font-bold text-white uppercase tracking-wider">General Daily Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Log any notable events, food intake, work achievements, or lifestyle remarks..."
                  className="w-full h-24 bg-black/20 border border-white/10 rounded-xl p-3 text-white outline-none resize-none focus:border-[#C75F33]/50 transition-all text-xs placeholder:text-[#8e9299]/30"
                />
              </div>
            </div>

            {/* Footer / Submit */}
            <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="group relative w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[#C75F33] hover:text-white transition-all transform active:scale-95 shadow-2xl overflow-hidden shadow-white/5 flex items-center justify-center gap-2"
              >
                <Sparkles size={14} />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Daily Check-in'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
