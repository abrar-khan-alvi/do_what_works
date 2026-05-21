import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { ArrowRight, ArrowLeft, Sparkles, History, BookOpen, Sliders, Search, Play } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useExperiments } from '../components/ExperimentContext';
import { api } from '../services/api';

const steps = ['Hypothesis', 'Action', 'Metric', 'Duration'];
const predefinedMetrics = [
  'Mood', 'Energy', 'Stress', 'Focus', 
  'Diet', 'Movement', 'Social', 'Execution', 
  'Alignment', 'Custom'
];

export const Experiment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { experiments, launchExperiment } = useExperiments();
  
  const hasActiveExperiment = experiments.some(e => e.status === 'active');
  const proposalData = location.state?.proposalData;
  const isRefining = location.state?.isRefining;

  const [selectedTab, setSelectedTab] = useState<'explore' | 'custom'>('explore');
  const [templates, setTemplates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const [currentStep, setCurrentStep] = useState(0);
  const [hypothesis, setHypothesis] = useState(proposalData?.hypothesis || '');
  const [action, setAction] = useState(proposalData?.action || '');
  const [metric, setMetric] = useState(proposalData?.metric || '');
  const [customMetric, setCustomMetric] = useState('');
  const [duration, setDuration] = useState(proposalData?.duration || '7 Days');
  const [metricsConfig, setMetricsConfig] = useState<any>(proposalData?.metricsConfig || null);
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    // If proposalData is provided, switch to the custom tab and prefill
    if (proposalData) {
      setSelectedTab('custom');
      setHypothesis(proposalData.hypothesis || '');
      setAction(proposalData.action || '');
      if (proposalData.metric) {
        if (!predefinedMetrics.includes(proposalData.metric)) {
          setMetric('Custom');
          setCustomMetric(proposalData.metric);
        } else {
          setMetric(proposalData.metric);
        }
      }
      if (proposalData.durationDays) {
        setDuration(`${proposalData.durationDays} Days`);
      } else if (proposalData.duration) {
        setDuration(proposalData.duration);
      }
      if (proposalData.metricsConfig) {
        setMetricsConfig(proposalData.metricsConfig);
      }
    }
  }, [proposalData]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await api.get('/api/v1/experiments/templates/');
        setTemplates(res.data);
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      }
    };
    fetchTemplates();
  }, []);

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

  const handleLaunch = async () => {
    const durationNum = parseInt(duration.replace(/[^0-9]/g, '')) || 7;
    
    setIsLaunching(true);
    try {
      await launchExperiment({
        hypothesis,
        action,
        metric: metric === 'Custom' ? customMetric : metric,
        durationDays: durationNum,
        metricsConfig: metricsConfig,
      });
      navigate('/result');
    } catch (err) {
      console.error('Launch failed', err);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleLaunchPreset = async (template: any) => {
    setIsLaunching(true);
    try {
      await launchExperiment({
        hypothesis: template.hypothesis,
        action: template.action,
        metric: template.metrics[0]?.label || 'Metric',
        durationDays: template.duration_days,
        metricsConfig: template.metrics,
      });
      navigate('/result');
    } catch (err) {
      console.error('Launch preset failed', err);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleCustomizePreset = (template: any) => {
    setHypothesis(template.hypothesis);
    setAction(template.action);
    if (template.metrics && template.metrics.length > 0) {
      setMetric('Custom');
      setCustomMetric(template.metrics[0].label);
    } else {
      setMetric('');
      setCustomMetric('');
    }
    setDuration(`${template.duration_days} Days`);
    setMetricsConfig(template.metrics);
    setCurrentStep(0);
    setSelectedTab('custom');
  };

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'discipline': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'attention': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'execution': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'energy': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'social': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-white/60 bg-white/5 border-white/10';
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = 
      selectedCategory === 'All' ||
      (selectedCategory === 'Core' && !t.id.startsWith('social_level')) ||
      (selectedCategory === 'Social' && t.id.startsWith('social_level'));
    
    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.hypothesis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.action.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto w-full pb-12">
        {/* Header */}
        <div className="mb-8 md:mb-10 px-1 md:px-0">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {selectedTab === 'explore'
              ? 'Explore Protocols'
              : currentStep === 4
              ? (isRefining ? 'Review Refined Protocol' : 'Review & Launch')
              : (isRefining ? 'Refine Protocol' : 'New Experiment')}
          </h1>
          <p className="text-[#8e9299] text-sm md:text-base leading-relaxed">
            {selectedTab === 'explore'
              ? 'Choose from 17 standardized behavioral templates, or build your own custom protocol.'
              : currentStep < 4
              ? 'Define a testable experiment step by step.'
              : ''}
          </p>
        </div>

        {/* Tab Selection */}
        {!proposalData && (
          <div className="flex border-b border-white/10 mb-8 font-sans">
            <button
              onClick={() => setSelectedTab('explore')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm tracking-wide transition-all ${
                selectedTab === 'explore'
                  ? 'border-[#e53935] text-white font-black'
                  : 'border-transparent text-[#8e9299] hover:text-white'
              }`}
            >
              <BookOpen size={16} />
              Explore Protocols
            </button>
            <button
              onClick={() => setSelectedTab('custom')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm tracking-wide transition-all ${
                selectedTab === 'custom'
                  ? 'border-[#e53935] text-white font-black'
                  : 'border-transparent text-[#8e9299] hover:text-white'
              }`}
            >
              <Sliders size={16} />
              Custom Protocol
            </button>
          </div>
        )}

        {selectedTab === 'explore' ? (
          /* Explore Protocols Tab */
          <div className="animate-in fade-in duration-300 font-sans">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search protocols (e.g. social, sleep, diet)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#1a1b1e] border border-white/10 rounded-xl text-white outline-none focus:border-white/30 transition-all text-sm"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                {['All', 'Core', 'Social'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                      selectedCategory === cat
                        ? 'bg-white border-white text-black shadow-lg shadow-white/5'
                        : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {cat === 'All' ? 'All' : cat === 'Core' ? 'Core Health & Focus' : 'Social Exposure'}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Cards Grid */}
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12 bg-[#1a1b1e]/20 border border-white/5 rounded-2xl">
                <p className="text-white/40 text-sm">No protocols found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTemplates.map((t) => (
                  <div key={t.id} className="bg-[#1a1b1e]/40 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-white/20 transition-all group shadow-xl">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${getCategoryColor(t.category)}`}>
                          {t.category}
                        </span>
                        <span className="text-xs text-white/40 font-bold">{t.duration_days} Days</span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#e53935] transition-colors">{t.title}</h3>
                      
                      <p className="text-white/80 text-sm italic mb-4 leading-relaxed font-medium">
                        "{t.hypothesis}"
                      </p>
                      
                      <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 mb-4">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Action to execute</span>
                        <p className="text-white/90 text-xs leading-relaxed">{t.action}</p>
                      </div>
                    </div>

                    <div>
                      <div className="border-t border-white/5 pt-4">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Metrics tracked</span>
                        <div className="flex flex-wrap gap-1.5">
                          {t.metrics?.map((m: any) => (
                            <span key={m.id} className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 text-white/60 border border-white/5">
                              {m.label.split(' (')[0]}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-6">
                        <button
                          onClick={() => handleCustomizePreset(t)}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/10 bg-transparent text-white hover:bg-white/5 transition-all text-xs font-bold active:scale-95"
                        >
                          <Sliders size={14} />
                          Customize
                        </button>
                        <button
                          onClick={() => handleLaunchPreset(t)}
                          disabled={isLaunching}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white text-black hover:bg-[#e53935] hover:text-white transition-all text-xs font-black uppercase tracking-wider active:scale-95 disabled:opacity-50"
                        >
                          <Play size={14} />
                          Launch Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Custom Wizard Tab */
          <div className="animate-in fade-in duration-300 font-sans">
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
                    readOnly={!!proposalData && !isRefining}
                    className={`w-full h-32 bg-transparent border border-white/10 rounded-xl p-6 text-white outline-none resize-none transition-colors ${
                      (!!proposalData && !isRefining) ? 'cursor-not-allowed opacity-80' : 'focus:border-white/30 hover:border-white/20'
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
                          setMetricsConfig(null); // Clear custom config when picking standard
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
                      setMetricsConfig(null); // Reset metricsConfig for pure custom single-metric
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
                    disabled={
                      (currentStep === 0 && !hypothesis.trim()) ||
                      (currentStep === 1 && !action.trim()) ||
                      (currentStep === 2 && (!metric || (metric === 'Custom' && !customMetric.trim()))) ||
                      (currentStep === 3 && !duration)
                    }
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    onClick={handleLaunch}
                    disabled={
                      isLaunching || 
                      !hypothesis.trim() || 
                      !action.trim() || 
                      (!metric || (metric === 'Custom' && !customMetric.trim()))
                    }
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black hover:bg-white/90 transition-colors shadow-2xl shadow-white/5 disabled:opacity-30 disabled:cursor-not-allowed min-w-[160px] justify-center"
                  >
                    {isLaunching ? (
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{hasActiveExperiment ? 'Add to Queue' : 'Launch Experiment'}</span>
                        {hasActiveExperiment ? <History size={18} /> : <ArrowRight size={18} />}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
