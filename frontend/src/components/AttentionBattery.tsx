import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Play, ShieldAlert, Award, Clock, ArrowRight, X, ChevronRight, Zap, Target } from 'lucide-react';
import { api } from '../services/api';

interface AttentionBatteryProps {
  onComplete: (scores: {
    attention_score: number;
    capacity_score: number;
    control_score: number;
    endurance_score: number;
  }) => void;
  onSkip: () => void;
  isSkippable?: boolean;
}

type GameState = 'INTRO' | 'DIGIT_SPAN_INTRO' | 'DIGIT_SPAN_PLAY' | 'STROOP_INTRO' | 'STROOP_PLAY' | 'CPT_INTRO' | 'CPT_PLAY' | 'SUMMARY';

export const AttentionBattery: React.FC<AttentionBatteryProps> = ({ onComplete, onSkip, isSkippable = true }) => {
  const [gameState, setGameState] = useState<GameState>('INTRO');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Score states
  const [digitSpanScore, setDigitSpanScore] = useState<number>(0); // Max recalled length
  const [stroopScore, setStroopScore] = useState<number>(0);       // Accuracy %
  const [cptScore, setCptScore] = useState<number>(0);             // Accuracy %

  // Detailed scores to display
  const [digitSpanLength, setDigitSpanLength] = useState<number>(3);
  const [stroopAvgRt, setStroopAvgRt] = useState<number>(0);
  const [cptErrors, setCptErrors] = useState<{ omission: number; commission: number }>({ omission: 0, commission: 0 });

  // ----------------------------------------------------
  // DIGIT SPAN GAME STATE
  // ----------------------------------------------------
  const [digitSequence, setDigitSequence] = useState<number[]>([]);
  const [digitPlayIndex, setDigitPlayIndex] = useState<number>(-1);
  const [digitUserAnswer, setDigitUserAnswer] = useState<string>('');
  const [digitSpanPhase, setDigitSpanPhase] = useState<'SHOWING' | 'INPUT'>('SHOWING');
  const [digitSpanAttempts, setDigitSpanAttempts] = useState<number>(0); // failures at current length

  const generateSequence = (length: number) => {
    const seq = [];
    for (let i = 0; i < length; i++) {
      seq.push(Math.floor(Math.random() * 10));
    }
    return seq;
  };

  const startDigitSpan = () => {
    setDigitSpanLength(3);
    setDigitSpanAttempts(0);
    triggerDigitSequence(3);
  };

  const triggerDigitSequence = (length: number) => {
    const seq = generateSequence(length);
    setDigitSequence(seq);
    setDigitUserAnswer('');
    setDigitSpanPhase('SHOWING');
    setDigitPlayIndex(0);
  };

  useEffect(() => {
    if (gameState !== 'DIGIT_SPAN_PLAY' || digitSpanPhase !== 'SHOWING') return;
    if (digitPlayIndex < 0 || digitPlayIndex >= digitSequence.length) {
      // Finished showing
      const timer = setTimeout(() => {
        setDigitPlayIndex(-1);
        setDigitSpanPhase('INPUT');
      }, 1000);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setDigitPlayIndex(prev => prev + 1);
    }, 1200); // Display number for 1000ms + 200ms gap

    return () => clearTimeout(timer);
  }, [digitPlayIndex, digitSequence, digitSpanPhase, gameState]);

  const handleDigitSubmit = () => {
    const cleanAnswer = digitUserAnswer.trim();
    const correctStr = digitSequence.join('');

    if (cleanAnswer === correctStr) {
      // Success! Increase length and reset attempts
      const nextLength = digitSpanLength + 1;
      setDigitSpanLength(nextLength);
      setDigitSpanAttempts(0);
      setDigitSpanScore(digitSpanLength); // current length recalled successfully
      triggerDigitSequence(nextLength);
    } else {
      // Failed
      const nextAttempts = digitSpanAttempts + 1;
      setDigitSpanAttempts(nextAttempts);

      if (nextAttempts >= 2) {
        // Game Over for Digit Span, proceed to Stroop
        setGameState('STROOP_INTRO');
      } else {
        // Try again at the same length
        triggerDigitSequence(digitSpanLength);
      }
    }
  };

  // ----------------------------------------------------
  // STROOP GAME STATE
  // ----------------------------------------------------
  const STROOP_WORDS = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
  const STROOP_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b']; // Red, Blue, Green, Yellow HSL/Hex
  const STROOP_COLOR_NAMES = ['RED', 'BLUE', 'GREEN', 'YELLOW'];

  const [stroopTrial, setStroopTrial] = useState<number>(0);
  const [stroopCurrentWord, setStroopCurrentWord] = useState<string>('');
  const [stroopCurrentColorIdx, setStroopCurrentColorIdx] = useState<number>(0);
  const [stroopStartTime, setStroopStartTime] = useState<number>(0);
  const [stroopCorrectCount, setStroopCorrectCount] = useState<number>(0);
  const [stroopRtSum, setStroopRtSum] = useState<number>(0);
  const STROOP_TOTAL_TRIALS = 15;

  const startStroop = () => {
    setStroopTrial(0);
    setStroopCorrectCount(0);
    setStroopRtSum(0);
    nextStroopTrial();
  };

  const nextStroopTrial = () => {
    const wordIdx = Math.floor(Math.random() * STROOP_WORDS.length);
    // 50% chance of matching, 50% chance of mismatching
    let colorIdx = wordIdx;
    if (Math.random() > 0.5) {
      colorIdx = (wordIdx + Math.floor(Math.random() * 3) + 1) % STROOP_WORDS.length;
    }

    setStroopCurrentWord(STROOP_WORDS[wordIdx]);
    setStroopCurrentColorIdx(colorIdx);
    setStroopStartTime(Date.now());
  };

  const handleStroopAnswer = (selectedColorName: string) => {
    const rt = Date.now() - stroopStartTime;
    const targetColorName = STROOP_COLOR_NAMES[stroopCurrentColorIdx];
    const isCorrect = selectedColorName === targetColorName;

    if (isCorrect) {
      setStroopCorrectCount(prev => prev + 1);
      setStroopRtSum(prev => prev + rt);
    }

    const nextTrial = stroopTrial + 1;
    setStroopTrial(nextTrial);

    if (nextTrial >= STROOP_TOTAL_TRIALS) {
      // Calculate results
      const finalAccuracy = Math.round((stroopCorrectCount / STROOP_TOTAL_TRIALS) * 100);
      setStroopScore(finalAccuracy);
      const avgRt = stroopCorrectCount > 0 ? Math.round(stroopRtSum / stroopCorrectCount) : 0;
      setStroopAvgRt(avgRt);
      setGameState('CPT_INTRO');
    } else {
      nextStroopTrial();
    }
  };

  // ----------------------------------------------------
  // CPT GAME STATE
  // ----------------------------------------------------
  const CPT_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'Y'];
  const CPT_TOTAL_TRIALS = 30; // 30 flashes * 1000ms = 30s
  const [cptTrial, setCptTrial] = useState<number>(0);
  const [cptLetter, setCptLetter] = useState<string>('');
  const [cptFlashed, setCptFlashed] = useState<boolean>(false);
  const [cptHasClicked, setCptHasClicked] = useState<boolean>(false);
  const [cptCorrectHits, setCptCorrectHits] = useState<number>(0);
  const [cptCorrectRejections, setCptCorrectRejections] = useState<number>(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const clickRef = useRef<boolean>(false);
  const letterRef = useRef<string>('');

  const startCpt = () => {
    setCptTrial(0);
    setCptCorrectHits(0);
    setCptCorrectRejections(0);
    setCptErrors({ omission: 0, commission: 0 });
    setCptHasClicked(false);
    clickRef.current = false;
    nextCptTrial(0);
  };

  const nextCptTrial = (currentIdx: number) => {
    if (currentIdx >= CPT_TOTAL_TRIALS) {
      finishCpt();
      return;
    }

    // Determine letter: 80% chance of standard, 20% chance of 'X'
    const isX = Math.random() < 0.22; // approx 20%
    const currentLtr = isX ? 'X' : CPT_LETTERS[Math.floor(Math.random() * CPT_LETTERS.length)];
    
    setCptLetter(currentLtr);
    letterRef.current = currentLtr;
    setCptFlashed(true);
    setCptHasClicked(false);
    clickRef.current = false;
    setCptTrial(currentIdx + 1);

    // Flash duration: 700ms visible, then 300ms blank
    timerRef.current = setTimeout(() => {
      setCptFlashed(false);
      
      // Blank interval - wait 300ms, then check responses and run next trial
      timerRef.current = setTimeout(() => {
        evaluateCptTrial();
        nextCptTrial(currentIdx + 1);
      }, 30000 / CPT_TOTAL_TRIALS * 0.3); // 300ms blank
    }, 30000 / CPT_TOTAL_TRIALS * 0.7); // 700ms flash
  };

  const evaluateCptTrial = () => {
    const ltr = letterRef.current;
    const clicked = clickRef.current;

    if (ltr === 'X') {
      if (clicked) {
        // Commission Error (Clicked X)
        setCptErrors(prev => ({ ...prev, commission: prev.commission + 1 }));
      } else {
        // Correct Rejection
        setCptCorrectRejections(prev => prev + 1);
      }
    } else {
      if (clicked) {
        // Correct Hit
        setCptCorrectHits(prev => prev + 1);
      } else {
        // Omission Error (Missed letter)
        setCptErrors(prev => ({ ...prev, omission: prev.omission + 1 }));
      }
    }
  };

  const handleCptClick = () => {
    if (gameState !== 'CPT_PLAY' || cptHasClicked) return;
    setCptHasClicked(true);
    clickRef.current = true;
  };

  const finishCpt = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Evaluate the final trial if needed
    evaluateCptTrial();
    
    setGameState('SUMMARY');
  };

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Compute actual CPT score
  useEffect(() => {
    if (gameState === 'SUMMARY') {
      // Calculate endurance score
      const totalSuccesses = cptCorrectHits + cptCorrectRejections;
      const finalAccuracy = Math.round((totalSuccesses / CPT_TOTAL_TRIALS) * 100);
      setCptScore(finalAccuracy);
    }
  }, [gameState, cptCorrectHits, cptCorrectRejections]);

  // Save results to API
  const saveResults = async () => {
    setIsSubmitting(true);
    
    // Normalize digit span capacity score (3 to 9 -> 30 to 100)
    const capacityPercent = Math.min(100, Math.round((digitSpanScore / 9) * 100));
    const finalAttentionScore = Math.round((capacityPercent + stroopScore + cptScore) / 3);

    const scores = {
      attention_score: finalAttentionScore,
      capacity_score: digitSpanScore || 3,
      control_score: stroopScore,
      endurance_score: cptScore,
    };

    try {
      await api.post('/api/v1/auth/onboarding/', scores);
      onComplete(scores);
    } catch (err) {
      console.error('Failed to submit cognitive scores:', err);
      // Still trigger local complete even if network fails
      onComplete(scores);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // RENDERING
  // ----------------------------------------------------
  return (
    <div className="w-full max-w-2xl mx-auto bg-[#1a1b1e]/40 border border-white/[0.06] rounded-[2rem] backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden">
      {/* Background glow inside card */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#C75F33]/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#8b5cf6]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <Brain className="text-[#C75F33]" size={22} />
          <span className="text-xs font-bold text-[#8e9299] uppercase tracking-widest">Cognitive Baseline Test</span>
        </div>
        {isSkippable && (
          <button 
            onClick={onSkip}
            className="text-xs text-[#8e9299] hover:text-white transition-colors flex items-center gap-1"
          >
            Skip Test <X size={14} />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* INTRO SCREEN */}
        {gameState === 'INTRO' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 text-center py-6"
          >
            <div className="w-16 h-16 rounded-3xl bg-[#C75F33]/10 flex items-center justify-center mx-auto text-[#C75F33] mb-4">
              <Brain size={32} className="animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-white">Attention Baseline Battery</h2>
              <p className="text-sm text-[#8e9299] max-w-md mx-auto leading-relaxed">
                Measure three core cognitive dimensions: working memory capacity, cognitive control, and focus endurance. Takes about 2 minutes.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-left max-w-md mx-auto py-2">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                <Zap size={18} className="text-[#C75F33] mx-auto mb-1" />
                <div className="text-[10px] font-bold text-white uppercase tracking-wider">Capacity</div>
                <div className="text-xs text-[#8e9299]">Digit Span</div>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                <Target size={18} className="text-[#8b5cf6] mx-auto mb-1" />
                <div className="text-[10px] font-bold text-white uppercase tracking-wider">Control</div>
                <div className="text-xs text-[#8e9299]">Stroop Color</div>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                <Clock size={18} className="text-yellow-500 mx-auto mb-1" />
                <div className="text-[10px] font-bold text-white uppercase tracking-wider">Endurance</div>
                <div className="text-xs text-[#8e9299]">Continuous Hit</div>
              </div>
            </div>

            <button
              onClick={() => setGameState('DIGIT_SPAN_INTRO')}
              className="mt-6 px-8 py-3.5 bg-white text-black font-bold rounded-2xl hover:bg-white/90 active:scale-95 transition-all flex items-center gap-2 mx-auto shadow-xl shadow-white/5"
            >
              Begin Test <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {/* DIGIT SPAN INTRO */}
        {gameState === 'DIGIT_SPAN_INTRO' && (
          <motion.div
            key="digit_intro"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 text-center py-6"
          >
            <div className="text-xs font-bold text-[#C75F33] uppercase tracking-[0.25em]">Game 1 of 3</div>
            <h2 className="text-xl font-bold text-white">Digit Span (Working Memory Capacity)</h2>
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl max-w-md mx-auto text-left space-y-3">
              <p className="text-sm text-[#8e9299] leading-relaxed">
                1. A sequence of numbers will flash on the screen one by one.
              </p>
              <p className="text-sm text-[#8e9299] leading-relaxed">
                2. Key in the exact numbers in the correct order.
              </p>
              <p className="text-sm text-[#8e9299] leading-relaxed">
                3. The sequence length increases as you succeed. Two consecutive failures ends this round.
              </p>
            </div>

            <button
              onClick={() => {
                setGameState('DIGIT_SPAN_PLAY');
                startDigitSpan();
              }}
              className="px-8 py-3.5 bg-[#C75F33] text-white font-bold rounded-2xl hover:bg-[#C75F33]/90 active:scale-95 transition-all flex items-center gap-2 mx-auto"
            >
              Start Game <Play size={18} />
            </button>
          </motion.div>
        )}

        {/* DIGIT SPAN PLAY */}
        {gameState === 'DIGIT_SPAN_PLAY' && (
          <motion.div
            key="digit_play"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8 flex flex-col items-center justify-center min-h-[280px]"
          >
            <div className="text-xs font-mono text-[#8e9299] mb-8 uppercase tracking-widest">
              Level {digitSpanLength} | Attempt {digitSpanAttempts + 1}/2
            </div>

            {digitSpanPhase === 'SHOWING' ? (
              <div className="h-24 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {digitPlayIndex >= 0 && digitPlayIndex < digitSequence.length && (
                    <motion.div
                      key={digitPlayIndex}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-7xl font-black text-white font-mono tracking-tight"
                    >
                      {digitSequence[digitPlayIndex]}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 w-full max-w-xs"
              >
                <div className="text-sm text-[#8e9299] mb-2 font-medium">What sequence did you see?</div>
                <input
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={digitUserAnswer}
                  onChange={(e) => setDigitUserAnswer(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && digitUserAnswer) handleDigitSubmit();
                  }}
                  className="w-full bg-[#0f1014] border border-white/10 rounded-2xl py-4 px-6 text-3xl font-black text-center tracking-[0.2em] text-white focus:outline-none focus:border-[#C75F33] transition-colors font-mono"
                  placeholder="Enter digits"
                  autoFocus
                />
                
                <button
                  onClick={handleDigitSubmit}
                  disabled={!digitUserAnswer}
                  className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  Submit Answer
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* STROOP INTRO */}
        {gameState === 'STROOP_INTRO' && (
          <motion.div
            key="stroop_intro"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 text-center py-6"
          >
            <div className="text-xs font-bold text-[#8b5cf6] uppercase tracking-[0.25em]">Game 2 of 3</div>
            <h2 className="text-xl font-bold text-white">Stroop Color Match (Cognitive Control)</h2>
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl max-w-md mx-auto text-left space-y-3">
              <p className="text-sm text-[#8e9299] leading-relaxed">
                1. A color word will flash on screen (e.g. "RED").
              </p>
              <p className="text-sm text-[#8e9299] leading-relaxed">
                2. Tap the button corresponding to the <strong className="text-white font-bold">font ink color</strong>, NOT the text itself.
              </p>
              <p className="text-sm text-[#8e9299] leading-relaxed">
                3. Speed and accuracy both factor into your final score.
              </p>
            </div>

            <button
              onClick={() => {
                setGameState('STROOP_PLAY');
                startStroop();
              }}
              className="px-8 py-3.5 bg-[#8b5cf6] text-white font-bold rounded-2xl hover:bg-[#8b5cf6]/90 active:scale-95 transition-all flex items-center gap-2 mx-auto"
            >
              Start Game <Play size={18} />
            </button>
          </motion.div>
        )}

        {/* STROOP PLAY */}
        {gameState === 'STROOP_PLAY' && (
          <motion.div
            key="stroop_play"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-6 flex flex-col justify-between min-h-[300px]"
          >
            <div className="text-xs font-mono text-[#8e9299] uppercase tracking-widest">
              Trial {stroopTrial + 1} of {STROOP_TOTAL_TRIALS}
            </div>

            {/* FOCUSED WORD */}
            <div className="my-10 h-20 flex items-center justify-center">
              <div 
                className="text-5xl font-black font-sans tracking-tight"
                style={{ color: STROOP_COLORS[stroopCurrentColorIdx] }}
              >
                {stroopCurrentWord}
              </div>
            </div>

            {/* BUTTON OPTIONS */}
            <div className="space-y-4 max-w-md mx-auto w-full">
              <div className="text-xs text-[#8e9299] font-medium mb-2 uppercase tracking-wider">Choose ink color:</div>
              <div className="grid grid-cols-2 gap-4">
                {STROOP_COLOR_NAMES.map((name, idx) => (
                  <button
                    key={name}
                    onClick={() => handleStroopAnswer(name)}
                    className="py-4 rounded-2xl font-bold border border-white/5 bg-[#1a1b1e] hover:bg-[#27292e] active:scale-95 transition-all text-white text-base relative overflow-hidden"
                  >
                    {/* Tiny color indicator dot */}
                    <span 
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full" 
                      style={{ backgroundColor: STROOP_COLORS[idx] }}
                    />
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* CPT INTRO */}
        {gameState === 'CPT_INTRO' && (
          <motion.div
            key="cpt_intro"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 text-center py-6"
          >
            <div className="text-xs font-bold text-yellow-500 uppercase tracking-[0.25em]">Game 3 of 3</div>
            <h2 className="text-xl font-bold text-white">Sustained Response (Focus Endurance)</h2>
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl max-w-md mx-auto text-left space-y-3">
              <p className="text-sm text-[#8e9299] leading-relaxed">
                1. Letters will flash rapidly one after another.
              </p>
              <p className="text-sm text-[#8e9299] leading-relaxed">
                2. Tap the screen/tap button immediately on <strong className="text-white">ANY letter</strong>.
              </p>
              <p className="text-sm text-[#8e9299] leading-relaxed">
                3. Exception: <strong className="text-[#ef4444] font-bold">DO NOT TAP when you see "X"</strong>.
              </p>
            </div>

            <button
              onClick={() => {
                setGameState('CPT_PLAY');
                startCpt();
              }}
              className="px-8 py-3.5 bg-yellow-500 text-black font-bold rounded-2xl hover:bg-yellow-400 active:scale-95 transition-all flex items-center gap-2 mx-auto"
            >
              Start Game <Play size={18} />
            </button>
          </motion.div>
        )}

        {/* CPT PLAY */}
        {gameState === 'CPT_PLAY' && (
          <motion.div
            key="cpt_play"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-6 flex flex-col justify-between min-h-[300px] cursor-pointer select-none"
            onClick={handleCptClick}
          >
            <div className="text-xs font-mono text-[#8e9299] uppercase tracking-widest">
              Tap for all except "X" | {cptTrial} / {CPT_TOTAL_TRIALS}
            </div>

            {/* Letter Flash */}
            <div className="my-10 h-28 flex items-center justify-center">
              {cptFlashed ? (
                <div className={`text-8xl font-black font-mono tracking-tight transition-colors ${cptLetter === 'X' ? 'text-[#ef4444]' : 'text-white'}`}>
                  {cptLetter}
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-white/10" />
              )}
            </div>

            {/* TAP INTERACTION ZONE */}
            <div className="space-y-4">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Avoid double trigger
                  handleCptClick();
                }}
                disabled={cptHasClicked}
                className={`w-full max-w-xs mx-auto py-5 rounded-2xl font-bold uppercase tracking-widest text-lg transition-all ${
                  cptHasClicked 
                    ? 'bg-white/10 text-white/40 border border-white/5' 
                    : 'bg-[#C75F33] text-white hover:bg-[#C75F33]/90 active:scale-95 shadow-lg shadow-[#C75F33]/15'
                }`}
              >
                {cptHasClicked ? 'Registered' : 'Tap Screen'}
              </button>
              <div className="text-[10px] text-[#8e9299]">Tapping anywhere inside the card works</div>
            </div>
          </motion.div>
        )}

        {/* SUMMARY SCREEN */}
        {gameState === 'SUMMARY' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 text-center py-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#10b981]">
              <Award size={28} />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white tracking-tight">Test Completed</h2>
              <p className="text-xs text-[#8e9299]">Your cognitive baseline profiles have been generated.</p>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto py-4">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="text-[10px] font-bold text-[#8e9299] uppercase tracking-wider mb-2">Memory Capacity</div>
                <div className="text-3xl font-black text-white font-mono">{digitSpanScore || 3} <span className="text-xs font-normal text-[#8e9299]">digits</span></div>
                <div className="text-[9px] text-[#8e9299] mt-2">Digit Span Recall</div>
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="text-[10px] font-bold text-[#8e9299] uppercase tracking-wider mb-2">Cognitive Control</div>
                <div className="text-3xl font-black text-white font-mono">{stroopScore}%</div>
                <div className="text-[9px] text-[#8e9299] mt-2">{stroopAvgRt}ms response</div>
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="text-[10px] font-bold text-[#8e9299] uppercase tracking-wider mb-2">Focus Endurance</div>
                <div className="text-3xl font-black text-white font-mono">{cptScore}%</div>
                <div className="text-[9px] text-[#8e9299] mt-2">{cptErrors.commission} incorrect taps</div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
              {isSkippable && (
                <button
                  onClick={onSkip}
                  className="px-6 py-3.5 rounded-xl border border-white/15 text-white hover:bg-white/5 transition-colors font-bold text-sm"
                >
                  Discard & Skip
                </button>
              )}
              <button
                onClick={saveResults}
                disabled={isSubmitting}
                className="flex-1 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? 'Saving Baseline...' : 'Save & Sync Profile'} <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
