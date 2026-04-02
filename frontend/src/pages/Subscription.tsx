import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Check, CreditCard, Sparkles, Zap, Shield, Clock } from 'lucide-react';
import { useAccess } from '../components/AccessContext';

export const Subscription = () => {
  const { isSubscribed, daysRemaining, subscribe } = useAccess();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = () => {
    setIsProcessing(true);
    // Simulate Stripe Checkout delay
    setTimeout(() => {
      subscribe();
      setIsProcessing(false);
    }, 2000);
  };

  const features = [
    "Unlimited Belief Refinement with Daniel",
    "Track up to 5 concurrent experiments",
    "Comprehensive Daily Logging & Visualization",
    "Exportable Result Reports",
    "Priority AI Response Time"
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Path</h1>
          <p className="text-[#8e9299] text-lg max-w-2xl mx-auto">
            Unlock the full power of Daniel's behavioral science engine to refine your habits and optimize your life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Subscription Card */}
          <div className={`relative bg-[#1a1b1e]/80 border ${isSubscribed ? 'border-[#10b981]/50 shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)]' : 'border-white/10 shadow-2xl'} rounded-2xl overflow-hidden backdrop-blur-xl transition-all duration-500`}>
            {isSubscribed && (
              <div className="absolute top-0 right-0 left-0 bg-[#10b981] text-black text-[10px] font-bold uppercase tracking-[0.2em] py-1.5 text-center">
                Active Subscription
              </div>
            )}
            
            <div className="p-8 pt-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Full Access</h3>
                  <p className="text-[#8e9299] text-sm mt-1">10-Day Experiment Window</p>
                </div>
                <div className="w-12 h-12 bg-[#C75F33]/20 rounded-xl flex items-center justify-center text-[#C75F33]">
                  <Zap size={24} fill="currentColor" />
                </div>
              </div>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-bold text-white">$29</span>
                <span className="text-[#8e9299]">/ 10 days</span>
              </div>

              <ul className="space-y-4 mb-10">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-[#10b981]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={12} className="text-[#10b981]" strokeWidth={3} />
                    </div>
                    <span className="text-white/80 text-sm leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleSubscribe}
                disabled={isSubscribed || isProcessing}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 ${
                  isSubscribed 
                    ? 'bg-transparent border border-[#10b981]/30 text-[#10b981] cursor-default' 
                    : 'bg-white text-black hover:bg-[#C75F33] hover:text-white hover:scale-[1.02] active:scale-[0.98]'
                } disabled:opacity-50`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : isSubscribed ? (
                  <>
                    <Shield size={20} />
                    <span>Enabled until {new Date(localStorage.getItem('expiresAt') ? parseInt(localStorage.getItem('expiresAt')!) : 0).toLocaleDateString()}</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    <span>Pay with Stripe</span>
                  </>
                )}
              </button>
              
              {!isSubscribed && (
                <p className="text-center text-[#8e9299] text-[10px] mt-4 uppercase tracking-[0.1em]">
                  Secure encrypted transaction via Stripe
                </p>
              )}
            </div>
          </div>

          {/* Status / Usage Info */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/5 rounded-lg">
                  <Clock size={20} className="text-[#8e9299]" />
                </div>
                <div>
                  <h4 className="text-white font-medium">Access Period</h4>
                  <p className="text-[#8e9299] text-xs">Standard 10-day window for MVP</p>
                </div>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full transition-all duration-1000 ${isSubscribed ? 'bg-[#10b981]' : 'bg-white/10'}`} 
                  style={{ width: isSubscribed ? `${(daysRemaining / 10) * 100}%` : '0%' }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider">
                <span className={isSubscribed ? 'text-[#10b981]' : 'text-[#8e9299]'}>
                  {isSubscribed ? `${daysRemaining} Days Remaining` : 'Not Activated'}
                </span>
                <span className="text-[#8e9299]">10 Days Total</span>
              </div>
            </div>

            <div className="bg-[#C75F33]/5 border border-[#C75F33]/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#C75F33]/10 rounded-lg">
                  <Sparkles size={20} className="text-[#C75F33]" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Why 10 Days?</h4>
                  <p className="text-[#8e9299] text-sm leading-relaxed">
                    Behavioral experiments are most effective when they have a fixed start and end. 10 days is the perfect window to gather initial data without fatigue.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
