import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { steps, options } from './Onboarding';
import { Settings, Bell, Palette, Database, Trash2, Edit2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Preferences = () => {
  const navigate = useNavigate();
  const [onboardingData, setOnboardingData] = useState<Record<string, number> | null>(null);
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [tempAnswers, setTempAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    const saved = localStorage.getItem('user_onboarding_data');
    if (saved) {
      try {
        setOnboardingData(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing onboarding data in preferences', e);
      }
    }
  }, []);

  const handleResetOnboarding = () => {
    if (window.confirm("Are you sure you want to reset your behavioral profile? This will clear all your answers and take you back to the onboarding process.")) {
      localStorage.removeItem('user_onboarding_data');
      navigate('/onboarding');
    }
  };

  const startEditing = (stepId: number) => {
    setEditingStep(stepId);
    setTempAnswers({ ...onboardingData });
  };

  const saveEdits = () => {
    if (tempAnswers) {
      setOnboardingData(tempAnswers);
      localStorage.setItem('user_onboarding_data', JSON.stringify(tempAnswers));
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
      <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Preferences</h1>
          <p className="text-[#8e9299]">Manage your application settings and behavioral profile.</p>
        </div>

        <div className="flex flex-col gap-8 md:gap-10">
          
          {/* General Settings Section */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-[#8e9299] uppercase tracking-widest px-2">App Settings</h2>
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5">
              
              {/* Notification Setting */}
              <div className="p-5 md:p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white/5 rounded-xl text-white group-hover:text-[#C75F33] transition-colors">
                    <Bell size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-white mb-0.5">Notifications</div>
                    <div className="text-sm text-[#8e9299]">Receive alerts for daily logs and experiment results</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10b981]"></div>
                </label>
              </div>

              {/* Theme Setting */}
              <div className="p-5 md:p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white/5 rounded-xl text-white group-hover:text-[#C75F33] transition-colors">
                    <Palette size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-white mb-0.5">Dark Mode</div>
                    <div className="text-sm text-[#8e9299]">The Elite theme is permanently applied for maximum focus.</div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold text-white uppercase tracking-wider opacity-60">Locked</div>
              </div>
            </div>
          </section>

          {/* Behavioral Profile Section */}
          <section className="space-y-4">
            <div className="flex items-end justify-between px-2 mb-2">
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
              <div className="space-y-3">
                {steps.map(step => {
                  const isEditing = editingStep === step.id;
                  const isExpanded = expandedStep === step.id || isEditing;
                  
                  return (
                    <div key={step.id} className="bg-white/[0.02] border border-white/5 rounded-2xl transition-all duration-300 relative overflow-hidden group hover:bg-white/[0.04]">
                      
                      <div 
                        onClick={() => !isEditing && setExpandedStep(isExpanded ? null : step.id)}
                        className={`flex items-center justify-between p-5 md:px-6 cursor-pointer select-none transition-colors ${isExpanded ? 'border-b border-white/5 pb-4' : 'hover:text-white'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold border transition-colors ${isExpanded || isEditing ? 'bg-[#C75F33]/10 text-[#C75F33] border-[#C75F33]/20' : 'bg-[#1a1b1e] text-[#8e9299] border-white/10'}`}>
                            {step.id}
                          </div>
                          <h3 className={`font-bold transition-colors ${isExpanded || isEditing ? 'text-white text-lg' : 'text-white/80 text-base group-hover:text-white'}`}>
                            {step.title}
                          </h3>
                        </div>
                        
                        {!isEditing ? (
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-[#8e9299] uppercase pr-2 border-r border-white/10">
                              {isExpanded ? 'Collapse' : 'Expand'}
                            </span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(step.id);
                              }}
                              className="p-1.5 text-[#8e9299] hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10 z-10"
                              title="Edit this section"
                            >
                              <Edit2 size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
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

                      {/* Expandable Content */}
                      {isExpanded && (
                        <div className="p-5 md:px-6 md:pl-[4.5rem] bg-black/20 space-y-5 animate-in slide-in-from-top-2 duration-300">
                          {step.questions.map((q, qIndex) => {
                            const questionId = `${step.id}-${q}`;
                            const answerValue = isEditing ? tempAnswers[questionId] : onboardingData[questionId];
                            const answerText = answerValue !== undefined ? options[answerValue] : 'Unanswered';
                            
                            return (
                              <div key={questionId} className="flex flex-col gap-3 pb-5 border-b border-white/5 last:border-0 last:pb-0">
                                <div className="text-sm font-medium text-white/90 leading-snug">
                                  {q}
                                </div>
                                
                                {!isEditing ? (
                                  <div className="inline-flex w-fit px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-[#C75F33]">
                                    {answerText.toUpperCase()}
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {options.map((opt, valIndex) => (
                                      <button
                                        key={opt}
                                        onClick={() => handleOptionChange(questionId, valIndex)}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                                          tempAnswers[questionId] === valIndex
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
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </div>
      </div>
    </DashboardLayout>
  );
};
