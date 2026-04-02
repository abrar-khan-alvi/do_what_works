import React, { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { ArrowRight, Sparkles, User, ArrowUpRight, CheckCircle2, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAccess } from '../components/AccessContext';

type Message = {
  id: string;
  sender: 'user' | 'daniel';
  text: string;
  isProposal?: boolean;
  proposalData?: {
    hypothesis: string;
    action: string;
    metric: string;
    duration: string;
  };
};

export const Pragmatist = () => {
  const { isSubscribed } = useAccess();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'init', 
      sender: 'daniel', 
      text: 'Welcome! State a problem, belief, or something you want to optimize. I will help you refine it into a testable experiment.' 
    }
  ]);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    const newUserMsg: Message = { id: Date.now().toString(), sender: 'user', text: userText };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate Daniel's thought process
    setTimeout(() => {
      setIsTyping(false);
      const userMessageCount = messages.filter(m => m.sender === 'user').length + 1;

      if (userMessageCount === 1) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'daniel',
          text: "That's an interesting belief. However, it's currently untestable because the outcome is too vague. What specific, measurable result are you hoping to see if this belief is true? (e.g., better sleep, more deep work hours, lower anxiety)"
        }]);
      } else if (userMessageCount === 2) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'daniel',
          text: "Perfect. Now we have a clear action and a measurable outcome. I've structured this into a testable experiment for you.",
          isProposal: true,
          proposalData: {
            hypothesis: `If I execute this behavior daily, then my ${userText.toLowerCase()} will improve.`,
            action: "Daily execution of the specified behavior",
            metric: userText,
            duration: "7 Days"
          }
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'daniel',
          text: "You can convert the experiment above, or we can start over with a new belief. What would you like to do?"
        }]);
      }
    }, 1500);
  };

  const handleConvertToExperiment = (proposalData: any) => {
    navigate('/experiment', { state: { proposalData } });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col flex-1 min-h-0 relative">
        <div className="mb-6 flex-shrink-0">
          <h1 className="text-3xl font-bold mb-2">Pragmatist</h1>
          <p className="text-[#8e9299] text-base">
            Refine your beliefs into testable experiments.
          </p>
        </div>

        {/* Chat Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto pr-4 mb-4 space-y-6 min-h-0" 
          style={{ scrollbarWidth: 'thin' }}
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.sender === 'daniel' ? 'bg-white/10 text-white' : 'bg-white text-black'
              }`}>
                {msg.sender === 'daniel' ? <Sparkles size={20} /> : <User size={20} />}
              </div>

              {/* Message Content */}
              <div className={`flex flex-col gap-2 max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-5 py-3.5 text-[15px] leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-white text-black rounded-2xl rounded-tr-sm' 
                    : 'bg-[#1a1b1e] border border-white/10 text-white/90 rounded-2xl rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>

                {/* Experiment Proposal Card */}
                {msg.isProposal && msg.proposalData && (
                  <div className="mt-2 w-full bg-[#1a1b1e] border border-white/10 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                      <CheckCircle2 className="text-[#10b981]" size={24} />
                      <h3 className="text-lg font-medium tracking-wide text-white">Experiment Ready</h3>
                    </div>

                    <div className="flex flex-col gap-5 mb-6">
                      <div>
                        <div className="text-[#8e9299] text-xs uppercase tracking-wider mb-1">Hypothesis</div>
                        <div className="text-white text-sm">{msg.proposalData.hypothesis}</div>
                      </div>
                      <div>
                        <div className="text-[#8e9299] text-xs uppercase tracking-wider mb-1">Action</div>
                        <div className="text-white text-sm">{msg.proposalData.action}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-[#8e9299] text-xs uppercase tracking-wider mb-1">Metric</div>
                          <div className="text-white text-sm">{msg.proposalData.metric}</div>
                        </div>
                        <div>
                          <div className="text-[#8e9299] text-xs uppercase tracking-wider mb-1">Duration</div>
                          <div className="text-white text-sm">{msg.proposalData.duration}</div>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleConvertToExperiment(msg.proposalData)}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors"
                    >
                      <span>Convert to Experiment</span>
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center flex-shrink-0">
                <Sparkles size={20} />
              </div>
              <div className="bg-[#1a1b1e] border border-white/10 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5">
                <div className="w-2 h-2 bg-[#8e9299] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#8e9299] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#8e9299] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form 
          onSubmit={handleSend}
          className="relative bg-[#1a1b1e] border border-white/10 rounded-xl overflow-hidden flex-shrink-0"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your belief or problem here..."
            className="w-full bg-transparent text-white px-6 py-4 pr-16 outline-none placeholder:text-[#8e9299]"
          />
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <button 
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="w-10 h-10 bg-white text-black rounded-lg flex items-center justify-center hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </form>

        {/* Subscription Lock Overlay */}
        {!isSubscribed && (
          <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-[6px] bg-[#0f1014]/40 rounded-2xl">
            <div className="bg-[#1a1b1e] border border-white/10 p-10 rounded-3xl max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-[#C75F33]/20 rounded-full flex items-center justify-center text-[#C75F33] mx-auto mb-8">
                <Lock size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Unlock the Pragmatist</h2>
              <p className="text-[#8e9299] mb-8 leading-relaxed">
                Refining beliefs into testable experiments requires premium AI access. Upgrade your account to start optimizing your life.
              </p>
              <Link 
                to="/subscription" 
                className="block w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-[#C75F33] hover:text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
