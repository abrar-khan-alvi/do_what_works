import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: "Control",
    questions: [
      "1. My actions directly influence my outcomes",
      "2. Luck plays a larger role than effort",
      "3. I can change my situation through consistent action",
      "4. External forces determine most of what happens to me"
    ]
  },
  {
    id: 2,
    title: "Capability",
    questions: [
      "1. I can execute difficult tasks when necessary",
      "2. I doubt my ability to follow through",
      "3. I can handle setbacks and continue",
      "4. I avoid challenges that test my limits"
    ]
  },
  {
    id: 3,
    title: "Adaptability",
    questions: [
      "1. I change my approach when results are poor",
      "2. I stick with methods even when they fail",
      "3. I adjust beliefs based on evidence",
      "4. I resist changing my views"
    ]
  },
  {
    id: 4,
    title: "Awareness",
    questions: [
      "1. I am aware of my daily behaviors",
      "2. I understand why I make decisions",
      "3. I act without reflecting",
      "4. I notice patterns in my behavior"
    ]
  },
  {
    id: 5,
    title: "Execution",
    questions: [
      "1. I follow through consistently",
      "2. I abandon plans easily",
      "3. I act even when uncertain",
      "4. I delay taking action"
    ]
  },
  {
    id: 6,
    title: "Truth Orientation",
    questions: [
      "1. I want accurate feedback, even if uncomfortable",
      "2. I avoid information that contradicts me",
      "3. I confront reality directly",
      "4. I rationalize poor results"
    ]
  },
  {
    id: 7,
    title: "Fate / Destiny",
    questions: [
      "1. My life is guided by a larger force or destiny",
      "2. Things happen for a reason beyond cause and effect",
      "3. My path is, in some way, predetermined"
    ]
  },
  {
    id: 8,
    title: "Luck / External Forces",
    questions: [
      "1. Luck plays a major role in success",
      "2. Some people are naturally \"lucky\"",
      "3. Success often depends on being in the right place at the right time"
    ]
  },
  {
    id: 9,
    title: "Manifestation / Energy",
    questions: [
      "1. My thoughts influence reality in a direct way",
      "2. Visualizing outcomes helps bring them into existence",
      "3. Energy or vibration affects what happens to me"
    ]
  },
  {
    id: 10,
    title: "Control Through Non-action",
    questions: [
      "1. Letting go and trusting the process is more effective than forcing outcomes",
      "2. Trying too hard can block success",
      "3. Things come when you stop chasing them"
    ]
  },
  {
    id: 11,
    title: "Intuition Vs Reality",
    questions: [
      "1. I trust my intuition over data or evidence",
      "2. Feelings are a reliable guide to truth",
      "3. If something feels right, it usually is"
    ]
  }
];

const options = [
  'Strongly Disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly Agree'
];

export const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // Initialize first option for all questions on mount
  useEffect(() => {
    const initialAnswers: Record<string, number> = {};
    steps.forEach((step) => {
      step.questions.forEach((q) => {
        initialAnswers[`${step.id}-${q}`] = 0; // Default to Strongly Disagree
      });
    });
    setAnswers(initialAnswers);
  }, []);

  const handleOptionChange = (questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      // Finish onboarding
      navigate('/pragmatist');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const stepData = steps[currentStep];

  return (
    <div className="h-screen animate-gradient-bg text-white font-sans relative overflow-hidden flex flex-col">
      {/* Moving background glows */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#C75F33]/10 rounded-full blur-[120px] pointer-events-none animate-float" />
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-[#C75F33]/10 rounded-full blur-[120px] pointer-events-none animate-float-reverse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C75F33]/5 rounded-full blur-[150px] pointer-events-none animate-float-alt" />

      <div className="max-w-6xl mx-auto px-8 py-8 relative z-10 flex flex-col h-full w-full">
        {/* Header */}
        <div className="mb-8 flex-shrink-0">
          <h1 className="text-3xl font-bold mb-2">The Dig</h1>
          <p className="text-[#8e9299] text-base">
            Answer honestly. This defines how the system evaluates your actions.
          </p>
        </div>

        <div className="flex gap-12 flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-[240px] flex-shrink-0 overflow-y-auto pr-4 pb-8" style={{ scrollbarWidth: 'none' }}>
            <div className="relative flex flex-col gap-4">
              {/* Dotted line connecting circles */}
              <div className="absolute left-4 top-4 bottom-4 w-[1px] border-l-2 border-dashed border-white/10" />
              
              {steps.map((step, index) => {
                const isActive = index === currentStep;
                return (
                  <div key={step.id} className="flex items-center gap-4 relative z-10">
                    <div 
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium bg-[#0f1014] transition-colors ${
                        isActive 
                          ? 'border-white text-white' 
                          : 'border-white/10 text-[#8e9299]'
                      }`}
                    >
                      {step.id}
                    </div>
                    <div 
                      className={`text-base transition-colors ${
                        isActive ? 'text-white' : 'text-[#8e9299]'
                      }`}
                    >
                      {step.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 border-l border-white/10 pl-12 pb-8 overflow-y-auto flex flex-col">
            <div className="flex flex-col gap-10 flex-1">
              {stepData.questions.map((question, qIndex) => {
                const questionId = `${stepData.id}-${question}`;
                const currentValue = answers[questionId];

                return (
                  <div key={qIndex}>
                    <h3 className="text-lg mb-4">{question}</h3>
                    <div className="flex items-center gap-6 flex-wrap">
                      {options.map((option, oIndex) => {
                        const isSelected = currentValue === oIndex;
                        return (
                          <label 
                            key={option} 
                            className="flex items-center gap-2 cursor-pointer group"
                            onClick={() => handleOptionChange(questionId, oIndex)}
                          >
                            <div 
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                                isSelected 
                                  ? 'border-[#e53935]' 
                                  : 'border-[#8e9299] group-hover:border-white/50'
                              }`}
                            >
                              {isSelected && <div className="w-2 h-2 rounded-full bg-[#e53935]" />}
                            </div>
                            <span 
                              className={`text-sm transition-colors ${
                                isSelected ? 'text-white' : 'text-[#8e9299] group-hover:text-white/80'
                              }`}
                            >
                              {option}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/5 flex-shrink-0">
              {currentStep > 0 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors"
                >
                  <ArrowLeft size={18} />
                  <span>Back</span>
                </button>
              ) : (
                <div /> // Placeholder for spacing
              )}
              
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black hover:bg-white/90 transition-colors ml-auto"
              >
                <span>Next</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
