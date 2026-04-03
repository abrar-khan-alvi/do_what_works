import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const steps = ['Hypothesis', 'Action', 'Metric', 'Duration'];
const predefinedMetrics = [
  'Mood', 'Energy', 'Stress', 'Focus', 
  'Diet', 'Movement', 'Social', 'Execution', 
  'Alignment', 'Custom'
];

export const Experiment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  
  const proposalData = location.state?.proposalData;

  const [hypothesis, setHypothesis] = useState(proposalData?.hypothesis || 'If I daily execution of specified behavior, then sleep hours will improve');
  const [action, setAction] = useState(proposalData?.action || 'Daily execution of specified behavior');
  const [metric, setMetric] = useState(proposalData?.metric || '');
  const [customMetric, setCustomMetric] = useState('');
  const [duration, setDuration] = useState(proposalData?.duration || '7 Days');

  useEffect(() => {
    if (!proposalData) {
      navigate('/daniel', { replace: true });
      return;
    }
    
    if (proposalData.metric && !predefinedMetrics.includes(proposalData.metric)) {
      setMetric('Custom');
      setCustomMetric(proposalData.metric);
    }
  }, [proposalData, navigate]);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleLaunch = () => {
    navigate('/result');
  };

  return (
    <DashboardLayout>
      <div className="mb-8 md:mb-10 px-1 md:px-0">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {currentStep === 4 ? 'Review & Launch' : 'New Experiment'}
        </h1>
        {currentStep < 4 && (
          <p className="text-[#8e9299] text-sm md:text-base">
            Define a testable experiment step by step.
          </p>
        )}
      </div>

      {currentStep < 4 && (
        <div className="flex gap-2 md:gap-4 mb-8 md:mb-12 px-1 md:px-0">
          {steps.map((step, index) => {
            const isActive = index <= currentStep;
            return (
              <div key={step} className="flex-1 flex flex-col gap-2 md:gap-3">
                <div className={`h-1.5 md:h-2 rounded-full ${isActive ? 'bg-[#e53935]' : 'bg-white/5'}`} />
                <div className={`text-center text-[10px] md:text-sm font-bold uppercase tracking-widest ${isActive ? 'text-white' : 'text-white/20'}`}>{step}</div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-8">
        {currentStep === 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-medium text-white">What do you believe?</h2>
              {proposalData && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full">
                  <Sparkles size={12} className="text-[#8e9299]" />
                  <span className="text-[10px] font-medium text-[#8e9299] uppercase tracking-wider">AI Generated</span>
                </div>
              )}
            </div>
            <p className="text-[#8e9299] text-sm mb-6">
              {proposalData 
                ? "This hypothesis was refined by Daniel to be testable." 
                : "State a clear, testable hypothesis. This will be auto-generated from your action and metric, or you can write your own."
              }
            </p>
            <textarea
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              readOnly={!!proposalData}
              className={`w-full h-32 bg-transparent border border-white/10 rounded-xl p-6 text-white outline-none resize-none transition-colors ${
                proposalData ? 'cursor-not-allowed opacity-80' : 'focus:border-white/30'
              }`}
              placeholder="If I..."
            />
          </div>
        )}

        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-medium text-white">What will you do?</h2>
              {proposalData && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full">
                  <Sparkles size={12} className="text-[#8e9299]" />
                  <span className="text-[10px] font-medium text-[#8e9299] uppercase tracking-wider">AI Generated</span>
                </div>
              )}
            </div>
            <p className="text-[#8e9299] text-sm mb-6">
              {proposalData 
                ? "This action was defined during your chat with Daniel." 
                : "Define a specific, repeatable action. Be precise."
              }
            </p>
            <textarea
              value={action}
              onChange={(e) => setAction(e.target.value)}
              readOnly={!!proposalData}
              className={`w-full h-32 bg-transparent border border-white/10 rounded-xl p-6 text-white outline-none resize-none transition-colors ${
                proposalData ? 'cursor-not-allowed opacity-80' : 'focus:border-white/30'
              }`}
              placeholder="Daily execution of..."
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg md:text-xl font-medium mb-3">How will you measure it?</h2>
            <div className="bg-[#10b981]/10 border border-[#10b981]/20 rounded-2xl p-4 md:p-5 mb-6 md:mb-8">
              <p className="text-[#10b981] text-xs md:text-sm leading-relaxed">
                <span className="font-bold">Note:</span> Selected metrics will automatically become part of your Daily Log for the duration of this experiment.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
              {predefinedMetrics.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMetric(m);
                    if (m !== 'Custom') setCustomMetric('');
                  }}
                  className={`py-3 md:py-3.5 px-4 rounded-xl border transition-all text-xs md:text-sm font-bold tracking-tight active:scale-95 ${
                    metric === m 
                      ? 'bg-white border-white text-black' 
                      : 'bg-white/5 border-white/5 text-[#8e9299] hover:border-white/20 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={customMetric}
              onChange={(e) => {
                setCustomMetric(e.target.value);
                setMetric('Custom');
              }}
              placeholder="Define your metric..."
              className="w-full bg-[#1a1b1e] border border-white/10 rounded-xl px-5 md:px-6 py-3.5 md:py-4 text-white outline-none focus:border-[#C75F33]/50 transition-all text-sm md:text-base"
            />
          </div>
        )}

        {currentStep === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-medium mb-2">How long will you test?</h2>
            <p className="text-[#8e9299] text-sm mb-6">
              Minimum 7 days recommended for meaningful data.
            </p>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-transparent border border-white/10 rounded-xl px-6 py-4 text-white outline-none focus:border-white/30 transition-colors"
              placeholder="7 Days"
            />
          </div>
        )}

        {currentStep === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-transparent border border-white/10 rounded-xl p-8 flex flex-col gap-8">
              <div>
                <div className="text-[#8e9299] text-sm mb-2">Hypothesis</div>
                <div className="text-white">{hypothesis}</div>
              </div>
              
              <div>
                <div className="text-[#8e9299] text-sm mb-2">Action</div>
                <div className="text-white">{action}</div>
              </div>
              
              <div>
                <div className="text-[#8e9299] text-sm mb-2">Metric</div>
                <div className="text-white">{metric === 'Custom' ? customMetric : metric || 'Not specified'}</div>
              </div>
              
              <div>
                <div className="text-[#8e9299] text-sm mb-2">Duration</div>
                <div className="text-white">{duration}</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-4">
          {currentStep > 0 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 bg-transparent text-white hover:bg-white/5 transition-colors"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}
          
          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black hover:bg-white/90 transition-colors"
            >
              <span>Next</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleLaunch}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black hover:bg-white/90 transition-colors"
            >
              <span>Launch Experiment</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
