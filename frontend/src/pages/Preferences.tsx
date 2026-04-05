import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { steps, options } from './Onboarding';
import { Settings, Bell, Palette, Database, Trash2, Edit2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal } from '../components/ConfirmModal';
import { api } from '../services/api';

export const Preferences = () => {
  const navigate = useNavigate();
  const [onboardingData, setOnboardingData] = useState<Record<string, number> | null>(null);
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [tempAnswers, setTempAnswers] = useState<Record<string, number>>({});
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    // First try localStorage cache, then fetch from API to get latest
    const cached = localStorage.getItem('user_onboarding_data');
    if (cached) {
      try { setOnboardingData(JSON.parse(cached)); } catch { }
    }
    api.get('/api/v1/auth/onboarding/').then(res => {
      if (res.data.answers && Object.keys(res.data.answers).length > 0) {
        setOnboardingData(res.data.answers);
        localStorage.setItem('user_onboarding_data', JSON.stringify(res.data.answers));
      }
    }).catch(() => {/* use cached */ });
  }, []);

  const handleResetOnboarding = () => {
    setIsResetModalOpen(true);
  };

  const confirmReset = async () => {
    try {
      // Delete onboarding record on the backend by posting empty answers
      // The /onboarding POST will overwrite; we handle reset by clearing and redirecting
      await api.post('/api/v1/auth/onboarding/', { answers: {} });
    } catch { }
    localStorage.removeItem('user_onboarding_data');
    navigate('/onboarding');
  };

  const startEditing = (stepId: number) => {
    setEditingStep(stepId);
    setTempAnswers({ ...onboardingData });
  };

  const saveEdits = async () => {
    if (tempAnswers) {
      setOnboardingData(tempAnswers);
      localStorage.setItem('user_onboarding_data', JSON.stringify(tempAnswers));
      try {
        await api.post('/api/v1/auth/onboarding/', { answers: tempAnswers });
      } catch { /* localStorage already updated */ }
    }
    setEditingStep(null);
  };

  const cancelEdits = () => {
    setEditingStep(null);
  };

  const handleOptionChange = (questionId: string, value: number) => {
    setTempAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Preferences</h1>
          <p className="text-[#8e9299]">Manage your application behavioral profile.</p>
        </div>
        
        <div className="flex flex-col gap-8 md:gap-10">
          {/* Behavioral Profile Section */}
          <section className="space-y-6">
            <div className="flex items-end justify-between px-2">
              <h2 className="text-xs font-bold text-[#8e9299] uppercase tracking-widest">The Dig Profile</h2>
              <button
                onClick={handleResetOnboarding}
                className="text-xs font-bold text-[#e53935] hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={12} />
                RESET ALL
              </button>
            </div>

            {!onboardingData ? (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-4">
                <Database size={32} className="text-[#8e9299] opacity-50" />
                <div>
                  <div className="font-bold text-white mb-1">No Profile Found</div>
                  <div className="text-sm text-[#8e9299]">You haven't completed the onboarding process yet.</div>
                </div>
                <button
                  onClick={() => navigate('/onboarding')}
                  className="mt-2 px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-transform active:scale-95"
                >
                  Start The Dig
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {steps.map(step => {
                  const isEditing = editingStep === step.id;

                  return (
                    <div key={step.id} className="bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col relative group hover:bg-white/[0.04] transition-all duration-300 hover:border-white/10 hover:shadow-xl hover:shadow-[#C75F33]/5 overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center justify-between p-5 md:px-6 border-b border-white/5 bg-black/10">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold border transition-colors ${isEditing ? 'bg-[#C75F33]/10 text-[#C75F33] border-[#C75F33]/20' : 'bg-[#1a1b1e] text-[#8e9299] border-white/10'}`}>
                            {step.id}
                          </div>
                          <h3 className={`font-bold transition-colors ${isEditing ? 'text-white text-lg' : 'text-white/90 text-base group-hover:text-white'}`}>
                            {step.title}
                          </h3>
                        </div>

                        {!isEditing ? (
                          <button
                            onClick={() => startEditing(step.id)}
                            className="p-1.5 text-[#8e9299] hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10 z-10"
                            title="Edit this section"
                          >
                            <Edit2 size={16} />
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={cancelEdits}
                              className="p-1.5 text-[#8e9299] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                            <button
                              onClick={saveEdits}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C75F33] text-white font-bold text-xs rounded-lg hover:bg-[#C75F33]/90 transition-all shadow-lg"
                            >
                              <Check size={14} />
                              SAVE
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Expandable Content visually replaced by full content */}
                      <div className="p-5 md:px-6 flex flex-col gap-6 flex-1 bg-black/20">
                        {step.questions.map((q) => {
                          const questionId = `${step.id}-${q}`;
                          const answerValue = isEditing ? tempAnswers[questionId] : onboardingData[questionId];

                          return (
                            <div key={questionId} className="flex flex-col gap-3">
                              <div className="text-sm font-medium text-white/90 leading-snug">
                                {q}
                              </div>

                              {!isEditing ? (
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1.5">
                                    {[0, 1, 2, 3, 4].map((dotVal) => (
                                      <div
                                        key={dotVal}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${answerValue === dotVal ? 'w-6 bg-[#C75F33]' : 'w-1.5 bg-white/10'}`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#8e9299]">
                                    {answerValue !== undefined ? options[answerValue] : 'Unanswered'}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {options.map((opt, valIndex) => (
                                    <button
                                      key={opt}
                                      onClick={() => handleOptionChange(questionId, valIndex)}
                                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${tempAnswers[questionId] === valIndex
                                        ? 'bg-white text-black border-white shadow-md'
                                        : 'bg-[#0f1014] text-[#8e9299] border-white/10 hover:border-white/30 hover:text-white'
                                        }`}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </div>
      </div>

      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={confirmReset}
        title="Reset Profile"
        message="Are you sure you want to reset your behavioral profile? This will clear all your answers and take you back to the onboarding process. This action cannot be undone."
        confirmText="Reset Profile"
        variant="danger"
      />
    </DashboardLayout>
  );
};
