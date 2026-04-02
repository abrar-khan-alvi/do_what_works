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
import { useNavigate, Link } from 'react-router-dom';
import { useAccess } from '../components/AccessContext';
import { useChat } from '../components/ChatContext';

const SUGGESTIONS = [
  { icon: <Brain size={16} />, text: "I believe I work better at night." },
  { icon: <Zap size={16} />, text: "Testing my morning coffee routine." },
  { icon: <Target size={16} />, text: "I'm procrastinating on my project." },
  { icon: <Lightbulb size={16} />, text: "Is my diet affecting my focus?" },
];


export const Daniel = () => {
  const { isSubscribed } = useAccess();
  const navigate = useNavigate();
  const { currentSession, currentSessionId, createNewSession, addMessage, updateSessionTitle } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const webhookUrl = 'https://thepragmatist.app.n8n.cloud/webhook/08ad6064-f2f8-4906-b642-38ee4c488b7e/chat';

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
      updateSessionTitle(currentSessionId, userText);
    }
    
    addMessage(currentSessionId, newUserMsg);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatInput: userText, sessionId: currentSessionId, action: 'sendMessage' }),
      });

      if (!response.ok) throw new Error('Network error');

      const data = await response.json();
      const responseText = Array.isArray(data) ? data[0]?.output || data[0]?.text : data.output || data.text;
      
      setIsTyping(false);

      if (responseText) {
        const parseExperimentData = (text: string) => {
          const findVal = (label: string) => {
            const regex = new RegExp(`(?:^|\\n)\\s*(?:\\*\\*)?${label}:?\\s*(?:\\*\\*)?\\s*(.*)`, 'i');
            const match = text.match(regex);
            if (match && match[1]) {
              return match[1].trim().replace(/\*\*$/, '');
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

        addMessage(currentSessionId, newDanielMsg);
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
      <div className="flex flex-col flex-1 h-full min-h-0 relative">
        {/* Main Content Centered Container */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-3xl mx-auto w-full px-6 py-12 md:py-20 flex flex-col min-h-full">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-700">
                <div className="w-20 h-20 bg-[#C75F33]/10 rounded-3xl flex items-center justify-center text-[#C75F33] mb-8 ring-1 ring-[#C75F33]/20 shadow-2xl">
                  <Sparkles size={40} />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Unlock Your Potential</h1>
                <p className="text-[#8e9299] text-lg max-w-lg mb-12 font-medium leading-relaxed">
                  State a belief, a problem, or a habit you'd like to optimize. Daniel will help you turn it into a testable experiment.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                  {SUGGESTIONS.map((s, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleSend(undefined, s.text)}
                      className="flex items-start gap-4 p-4 text-left border border-white/5 bg-white/5 rounded-2xl hover:bg-white/10 hover:border-white/10 transition-all group active:scale-95"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#C75F33] group-hover:scale-110 transition-transform">{s.icon}</div>
                      <span className="text-sm text-[#8e9299] mt-1 group-hover:text-white transition-colors">{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-12 pb-32">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                      msg.sender === 'daniel' ? 'bg-[#C75F33]/10 text-[#C75F33] ring-1 ring-[#C75F33]/20' : 'bg-white text-black'
                    }`}>
                      {msg.sender === 'daniel' ? <Sparkles size={20} /> : <User size={20} />}
                    </div>

                    <div className={`flex flex-col gap-3 min-w-0 flex-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`text-[16px] leading-[1.7] markdown-content w-full ${
                        msg.sender === 'user' ? 'text-white font-medium bg-white/5 rounded-2xl p-6 border border-white/5' : 'text-white/90'
                      }`}>
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                      <div className="text-[10px] text-[#8e9299] font-bold uppercase tracking-widest px-1 opacity-40">{formatTime(msg.timestamp)}</div>

                      {msg.isProposal && msg.proposalData && (
                        <div className="mt-6 w-full bg-[#1a1b1e] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C75F33]/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                          <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-[#10b981]/10 rounded-2xl flex items-center justify-center text-[#10b981] ring-1 ring-[#10b981]/20"><CheckCircle2 size={24} /></div>
                            <div>
                              <h3 className="text-xl font-bold text-white tracking-tight">Experiment Ready</h3>
                              <p className="text-[10px] text-[#8e9299] uppercase tracking-widest font-bold font-sans">Daniel Strategy Protocol</p>
                            </div>
                          </div>
                          <div className="space-y-6 mb-8 relative">
                            {[
                              { label: 'Hypothesis', val: msg.proposalData.hypothesis, color: '#C75F33' },
                              { label: 'Action Plan', val: msg.proposalData.action, color: '#C75F33' }
                            ].map((item, i) => (
                              <div key={i} className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                <div className="text-[#8e9299] text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                                  {item.label}
                                </div>
                                <div className="text-white text-[15px] leading-relaxed">{item.val}</div>
                              </div>
                            ))}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                <div className="text-[#8e9299] text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#C75F33] rounded-full" />Success Metric</div>
                                <div className="text-white font-medium">{msg.proposalData.metric}</div>
                              </div>
                              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-[#10b981]">
                                <div className="text-[#8e9299] text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#10b981] rounded-full" />Duration</div>
                                <div className="text-lg font-bold">{msg.proposalData.duration}</div>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => navigate('/experiment', { state: { proposalData: msg.proposalData } })} className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-white text-black rounded-2xl font-bold hover:bg-[#C75F33] hover:text-white transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl group ring-offset-4 ring-offset-[#0f1014] focus:ring-2 focus:ring-[#C75F33]">
                            <span className="text-lg">Activate Experiment</span>
                            <ArrowUpRight size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-6 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-[#C75F33]/10 text-[#C75F33] flex items-center justify-center border border-[#C75F33]/20"><Sparkles size={20} /></div>
                    <div className="flex gap-2 items-center bg-white/5 rounded-2xl px-6 py-4 border border-white/5">
                      {[0, 150, 300].map(d => <div key={d} className="w-2 h-2 bg-[#C75F33] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Floating Input Area Centered */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/95 to-transparent pt-20 pb-10 px-6">
          <div className="max-w-3xl mx-auto w-full relative">
            <form onSubmit={handleSend} className="relative bg-[#1a1b1e] border border-white/10 rounded-[28px] shadow-2xl focus-within:border-[#C75F33]/50 transition-all transition-all group overflow-hidden p-2">
              <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Type a belief or something you'd like to test..." className="w-full bg-transparent text-white pl-6 pr-16 py-4 outline-none placeholder:text-[#8e9299]/60 text-lg" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <button type="submit" disabled={!inputValue.trim() || isTyping || !currentSessionId} className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-[#C75F33] hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed transform active:scale-90 shadow-xl group">
                  <ArrowRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </form>
            <p className="text-[10px] text-[#8e9299]/40 text-center mt-4 font-bold tracking-[0.2em] uppercase">Daniel Strategy protocol - Advanced Behavioral Analysis</p>
          </div>
        </div>

        {/* Subscription Lock Overlay */}
        {!isSubscribed && (
          <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-xl bg-[#0f1014]/40 p-6 rounded-2xl">
            <div className="bg-[#1a1b1e] border border-white/10 p-12 rounded-[48px] max-w-lg w-full text-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-700 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#C75F33] to-transparent" />
              <div className="w-28 h-28 bg-[#C75F33]/20 rounded-full flex items-center justify-center text-[#C75F33] mx-auto mb-10 ring-[12px] ring-[#C75F33]/5 animate-pulse"><Lock size={56} /></div>
              <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Unlock Your Strategist</h2>
              <p className="text-[#8e9299] mb-12 leading-relaxed text-lg font-medium px-4">Experience the full power of Daniel's behavioral optimization. Upgrade now to build and track live experiments.</p>
              <Link to="/subscription" className="group relative block w-full py-6 bg-white text-black rounded-3xl font-bold hover:bg-[#C75F33] hover:text-white transition-all transform hover:scale-[1.05] active:scale-95 shadow-2xl overflow-hidden shadow-white/5"><span className="relative z-10 text-xl tracking-tight">Get Full Access</span></Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
