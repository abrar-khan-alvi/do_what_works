import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { DashboardLayout } from '../components/DashboardLayout';
import { 
  ArrowRight, 
  Sparkles, 
  User, 
  ArrowUpRight, 
  CheckCircle2, 
  Lock, 
  Lightbulb,
  Zap,
  Target,
  Brain
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAccess } from '../components/AccessContext';
import { useChat } from '../components/ChatContext';
import { useAuth } from '../components/AuthContext';
import { FeatureLock } from '../components/FeatureLock';

const SUGGESTIONS = [
  { icon: <Brain size={16} />, text: "I believe I work better at night." },
  { icon: <Zap size={16} />, text: "Testing my morning coffee routine." },
  { icon: <Target size={16} />, text: "I'm procrastinating on my project." },
  { icon: <Lightbulb size={16} />, text: "Is my diet affecting my focus?" },
];


export const Daniel = () => {
  const { isSubscribed } = useAccess();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { sessions, currentSession, currentSessionId, setCurrentSessionId, createNewSession, addMessage, updateSessionTitle, isLoading } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync state with URL parameter
  useEffect(() => {
    if (id && id !== currentSessionId) {
      setCurrentSessionId(id);
    }
  }, [id, currentSessionId, setCurrentSessionId]);

  // Handle auto-redirection for path without ID or invalid ID
  useEffect(() => {
    if (isLoading) return;
    
    // Case 1: No ID in URL, redirect to most recent session
    if (!id && sessions.length > 0) {
      navigate(`/daniel/${sessions[0].id}`, { replace: true });
      return;
    }

    // Case 2: ID in URL but it doesn't exist in our sessions list
    if (id && sessions.length > 0 && !sessions.some(s => s.id === id)) {
      navigate('/daniel', { replace: true });
    }
  }, [id, sessions, navigate, isLoading]);

  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const webhookUrl = import.meta.env.VITE_DANIEL_WEBHOOK_URL;

  const messages = currentSession?.messages || [];

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

  const handleSend = async (e?: React.FormEvent, text?: string) => {
    e?.preventDefault();
    const userText = text || inputValue.trim();
    if (!userText || !currentSessionId) return;

    const newUserMsg = { 
      id: Date.now().toString(), 
      sender: 'user' as const, 
      text: userText,
      timestamp: Date.now()
    };
    
    // If it's the first message, update the title
    if (messages.length === 0) {
      await updateSessionTitle(currentSessionId, userText);
    }
    
    await addMessage(currentSessionId, newUserMsg);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsTyping(true);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chatInput: userText, 
          sessionId: currentSessionId, 
          action: 'sendMessage',
          userid: String(user?.id || ''),
          userId: String(user?.id || '') // Redundancy for workflow compatibility
        }),
      });

      if (!response.ok) throw new Error('Network error');

      const data = await response.json();
      const responseText = Array.isArray(data) ? data[0]?.output || data[0]?.text : data.output || data.text;
      
      setIsTyping(false);

      if (responseText) {
        const parseExperimentData = (text: string) => {
          const findVal = (label: string) => {
            // Updated regex to be more lenient: matches label anywhere in line, handles various punctuation
            const regex = new RegExp(`(?:^|\\n).*?(?:${label}|${label.toLowerCase()}):?\\s*(?:\\*\\*)?\\s*(.*)`, 'i');
            const match = text.match(regex);
            if (match && match[1]) {
              let val = match[1].trim()
                .split('\n')[0] // Only take the first line of the value
                .replace(/\*\*$/, '')
                .replace(/^[:\s-]+/, '') // Clean up leading punctuation/whitespace
                .replace(/\*\*$/, '');

              // For Duration, we only want the primary number
              if (label === 'Duration') {
                const numericMatch = val.match(/\d+/);
                if (numericMatch) return numericMatch[0];
              }
              return val;
            }
            return null;
          };

          const hypothesis = findVal('Hypothesis');
          const action = findVal('Action');
          const metric = findVal('Metric');
          const duration = findVal('Duration');

          if (hypothesis && action && metric && duration) {
            return { hypothesis, action, metric, duration };
          }
          return null;
        };

        const proposalData = parseExperimentData(responseText);
        const newDanielMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'daniel' as const,
          text: responseText,
          timestamp: Date.now(),
          isProposal: !!proposalData,
          proposalData: proposalData || undefined
        };

        await addMessage(currentSessionId, newDanielMsg);
      }
    } catch (error) {
      setIsTyping(false);
      addMessage(currentSessionId, { 
        id: 'err', 
        sender: 'daniel' as const, 
        text: "I'm having trouble connecting. Try again?", 
        timestamp: Date.now() 
      });
    }
  };

  const formatTime = (ts?: number) => {
    if (!ts) return 'Just now';
    const date = new Date(ts);
    return isNaN(date.getTime()) ? 'Just now' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout noPadding>
      <div className={`flex flex-col flex-1 min-h-0 relative ${!isSubscribed ? 'h-full overflow-hidden' : 'h-full'}`}>
        {/* Main Content Centered Container */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-3xl mx-auto w-full px-4 md:px-6 py-8 md:py-20 flex flex-col min-h-full">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-[#C75F33] animate-pulse">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-[#C75F33]/10 rounded-3xl flex items-center justify-center ring-1 ring-[#C75F33]/20 shadow-2xl mb-4">
                  <Sparkles size={32} className="md:w-10 md:h-10" />
                </div>
                <p className="text-xs md:text-sm font-bold tracking-widest uppercase opacity-40">Connecting to Strategist...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-700">

                <div className="w-16 h-16 md:w-20 md:h-20 bg-[#C75F33]/10 rounded-3xl flex items-center justify-center text-[#C75F33] mb-6 md:mb-8 ring-1 ring-[#C75F33]/20 shadow-2xl">
                  <Sparkles size={32} className="md:w-10 md:h-10" />
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight px-4">Unlock Your Potential</h1>
                <p className="text-[#8e9299] text-base md:text-lg max-w-lg mb-8 md:mb-12 font-medium leading-relaxed px-6">
                  State a belief, a problem, or a habit you'd like to optimize. Daniel will help you turn it into a testable experiment.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl px-4">
                  {SUGGESTIONS.map((s, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleSend(undefined, s.text)}
                      className="flex items-start gap-3 md:gap-4 p-3 md:p-4 text-left border border-white/5 bg-white/5 rounded-2xl hover:bg-white/10 hover:border-white/10 transition-all group active:scale-95"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#C75F33] group-hover:scale-110 transition-transform flex-shrink-0">{s.icon}</div>
                      <span className="text-xs md:text-sm text-[#8e9299] mt-0.5 md:mt-1 group-hover:text-white transition-colors">{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8 md:space-y-12 pb-32">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                      msg.sender === 'daniel' ? 'bg-[#C75F33]/10 text-[#C75F33] ring-1 ring-[#C75F33]/20' : 'bg-white text-black'
                    }`}>
                      {msg.sender === 'daniel' ? <Sparkles size={16} className="md:w-5 md:h-5" /> : <User size={16} className="md:w-5 md:h-5" />}
                    </div>

                    <div className={`flex flex-col gap-2 md:gap-3 min-w-0 flex-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`text-sm md:text-[16px] leading-[1.6] md:leading-[1.7] markdown-content w-full ${
                        msg.sender === 'user' ? 'text-white font-medium bg-white/5 rounded-2xl p-4 md:p-6 border border-white/5' : 'text-white/90'
                      }`}>
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                      <div className="text-[9px] md:text-[10px] text-[#8e9299] font-bold uppercase tracking-widest px-1 opacity-40">{formatTime(msg.timestamp)}</div>

                      {msg.isProposal && msg.proposalData && (
                        <div className="mt-6 md:mt-8 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 w-full max-w-2xl">
                          <div className="w-full bg-[#111215] border border-white/10 rounded-2xl p-5 md:p-8 relative group">
                            {/* Header */}
                            <div className="flex flex-col gap-3 md:gap-4 mb-6 md:mb-8">
                              <div className="flex items-center gap-2 md:gap-3">
                                <CheckCircle2 size={20} className="text-[#10b981] md:w-6 md:h-6" />
                                <span className="text-xs md:text-sm font-bold tracking-widest text-white uppercase">DANIEL</span>
                              </div>
                              <p className="text-xs md:text-sm text-[#8e9299] font-medium opacity-80">Testable. This can be structured into an experiment.</p>
                              <div className="h-[1px] w-full bg-white/5 mt-1 md:mt-2" />
                            </div>

                            {/* Content */}
                            <div className="flex flex-col gap-6 md:gap-8">
                              {[
                                { label: 'Hypothesis', val: msg.proposalData.hypothesis },
                                { label: 'Action', val: msg.proposalData.action },
                                { label: 'Metric', val: msg.proposalData.metric },
                                { label: 'Duration', val: msg.proposalData.duration }
                              ].map((item, i) => (
                                <div key={i} className="flex flex-col gap-1.5 md:gap-2">
                                  <span className="text-xs md:text-sm text-[#8e9299] font-medium">{item.label}</span>
                                  <p className="text-white text-sm md:text-[15px] leading-relaxed font-medium">{item.val}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Button outside card */}
                          <button 
                            onClick={() => navigate('/experiment', { state: { proposalData: msg.proposalData } })} 
                            className="w-full md:w-fit flex items-center justify-center gap-2.5 px-6 py-3.5 md:py-4 bg-white text-black rounded-xl font-bold hover:bg-white/90 transition-all transform active:scale-95 shadow-2xl group"
                          >
                            <span className="text-sm">Convert to Experiment</span>
                            <ArrowUpRight size={18} className="stroke-[2.5]" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3 md:gap-6 animate-pulse">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#C75F33]/10 text-[#C75F33] flex items-center justify-center border border-[#C75F33]/20"><Sparkles size={16} className="md:w-5 md:h-5" /></div>
                    <div className="flex gap-2 items-center bg-white/5 rounded-2xl px-5 py-3 md:px-6 md:py-4 border border-white/5">
                      {[0, 150, 300].map(d => <div key={d} className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#C75F33] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Floating Input Area Centered */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/95 to-transparent pt-12 md:pt-20 pb-6 md:pb-10 px-4 md:px-6">
          <div className="max-w-3xl mx-auto w-full relative">
            <form 
              onSubmit={handleSend} 
              className="relative bg-[#1a1b1e] border border-white/10 rounded-[24px] md:rounded-[28px] shadow-2xl focus-within:border-[#C75F33]/50 transition-all group overflow-hidden p-1.5 md:p-2 flex items-end"
            >
              <textarea 
                ref={textareaRef}
                value={inputValue} 
                onChange={(e) => {

                  setInputValue(e.target.value);
                  // Auto-resize
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a belief or habit..." 
                rows={1}
                className="w-full bg-transparent text-white pl-4 md:pl-6 pr-14 md:pr-16 py-3 md:py-4 outline-none placeholder:text-[#8e9299]/60 text-base md:text-lg resize-none max-h-[200px] custom-scrollbar" 
              />
              <div className="absolute right-2 md:right-3 bottom-2 md:bottom-3">
                <button 
                  type="submit" 
                  disabled={!inputValue.trim() || isTyping || !currentSessionId} 
                  className="w-10 h-10 md:w-12 md:h-12 bg-white text-black rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-[#C75F33] hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed transform active:scale-90 shadow-xl group"
                >
                  <ArrowRight size={20} className="md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </form>
            <p className="text-[8px] md:text-[10px] text-[#8e9299]/40 text-center mt-3 md:mt-4 font-bold tracking-[0.2em] uppercase">Daniel Strategy protocol - Advanced Behavioral Analysis</p>
          </div>
        </div>

        {/* Subscription Lock Overlay */}
        {!isSubscribed && (
          <FeatureLock 
            title="Unlock Your Strategist"
            description="Experience the full power of Daniel's behavioral optimization. Upgrade now to build and track live experiments."
            icon={Sparkles}
          />
        )}
      </div>
    </DashboardLayout>
  );
};
