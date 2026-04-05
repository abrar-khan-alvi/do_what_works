import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence, type Variants } from 'motion/react';
import {
  ArrowRight, Menu, X, FlaskConical, BookOpen, BarChart3,
  Folder, Brain, Lock, Check, Shield, Sparkles, ChevronDown,
  Zap, Clock, Target, TrendingUp
} from 'lucide-react';
import logo from '../assets/Logo.png';

/* ------------------------------------------------------------------ */
/* UTILITY                                                              */
/* ------------------------------------------------------------------ */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

/* ------------------------------------------------------------------ */
/* SECTION WRAPPER                                                      */
/* ------------------------------------------------------------------ */
const Section = ({
  id,
  children,
  className = '',
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
      className={`relative z-10 ${className}`}
    >
      {children}
    </motion.section>
  );
};

/* ------------------------------------------------------------------ */
/* NAVBAR                                                               */
/* ------------------------------------------------------------------ */
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'How It Works', href: '#how' },
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
  ];

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0f1014]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/40'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-18 flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src={logo} alt="Do What Works" className="h-10 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <button
                key={l.label}
                onClick={() => scrollTo(l.href)}
                className="text-sm text-[#8e9299] hover:text-white transition-colors font-medium"
              >
                {l.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-[#8e9299] hover:text-white font-medium transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="flex items-center gap-2 bg-[#C75F33] hover:bg-[#C75F33]/90 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-[#C75F33]/25 active:scale-95"
            >
              Get Started <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-[#8e9299] hover:text-white transition-colors p-2"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-72 z-[70] bg-[#1a1b1e]/98 border-l border-white/10 flex flex-col p-8"
            >
              <div className="flex items-center justify-between mb-10">
                <img src={logo} alt="Do What Works" className="h-8 w-auto" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-[#8e9299] hover:text-white p-1"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex flex-col gap-2 flex-1">
                {navLinks.map((l) => (
                  <button
                    key={l.label}
                    onClick={() => scrollTo(l.href)}
                    className="text-left text-base text-[#8e9299] hover:text-white py-3 px-4 rounded-xl hover:bg-white/5 transition-all font-medium"
                  >
                    {l.label}
                  </button>
                ))}
              </nav>
              <div className="flex flex-col gap-3 mt-8">
                <Link
                  to="/login"
                  className="text-center text-sm text-[#8e9299] hover:text-white font-medium py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center justify-center gap-2 bg-[#C75F33] text-white text-sm font-bold py-3 rounded-xl"
                >
                  Get Started <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* MOCK CHAT UI (Hero visual)                                           */
/* ------------------------------------------------------------------ */
const MockChat = () => {
  const messages = [
    {
      role: 'user',
      text: 'I think working out in the morning will make me more productive.',
    },
    {
      role: 'daniel',
      text: "Interesting hypothesis. Let's test it properly. I'll design a 10-day experiment: wake at 6AM, 30-min workout, then rate your focus from 1–10 each day. We measure — we don't guess.",
    },
    {
      role: 'system',
      text: '⚡ Experiment Created — \"Morning Workout Protocol\" — 10 Days',
    },
  ];

  return (
    <motion.div
      variants={fadeUp}
      custom={0.3}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-[#1a1b1e]/60 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-2xl shadow-2xl shadow-black/50">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
          <div className="w-8 h-8 rounded-xl bg-[#C75F33] flex items-center justify-center shadow-lg shadow-[#C75F33]/30">
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <div className="text-white text-sm font-bold">Daniel</div>
            <div className="text-[#10b981] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              AI Strategist — Online
            </div>
          </div>
        </div>
        {/* Messages */}
        <div className="p-4 flex flex-col gap-3">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.35, duration: 0.5 }}
              className={`${
                m.role === 'system'
                  ? 'text-center'
                  : m.role === 'user'
                  ? 'flex justify-end'
                  : 'flex justify-start'
              }`}
            >
              {m.role === 'system' ? (
                <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-[#C75F33]/10 border border-[#C75F33]/20 text-[#C75F33] px-3 py-1.5 rounded-full">
                  {m.text}
                </div>
              ) : (
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-white text-black font-medium rounded-br-sm'
                      : 'bg-white/5 border border-white/10 text-white/90 rounded-bl-sm'
                  }`}
                >
                  {m.text}
                </div>
              )}
            </motion.div>
          ))}
          {/* Typing indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.1 }}
            className="flex items-center gap-1.5 pl-1"
          >
            {[0, 1, 2].map((dot) => (
              <motion.div
                key={dot}
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: dot * 0.15 }}
                className="w-1.5 h-1.5 rounded-full bg-[#8e9299]"
              />
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/* HERO                                                                 */
/* ------------------------------------------------------------------ */
const Hero = () => {
  const scrollToHow = () => {
    document.querySelector('#how')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-6 overflow-hidden">
      {/* Animated orbs */}
      <div className="absolute -top-40 -right-40 w-[700px] h-[700px] bg-[#C75F33]/10 rounded-full blur-[140px] pointer-events-none animate-float" />
      <div className="absolute -bottom-40 -left-40 w-[700px] h-[700px] bg-[#C75F33]/8 rounded-full blur-[140px] pointer-events-none animate-float-reverse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#C75F33]/4 rounded-full blur-[180px] pointer-events-none animate-float-alt" />

      <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left — copy */}
        <div>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#C75F33]/10 border border-[#C75F33]/25 rounded-full text-[#C75F33] text-[10px] font-black uppercase tracking-widest mb-6"
          >
            <Sparkles size={11} />
            AI-Powered Personal Science
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-6"
          >
            Stop{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C75F33] to-[#e87d52]">
              Guessing.
            </span>
            <br />
            Start Proving
            <br />
            What Works.
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-[#8e9299] text-base sm:text-lg leading-relaxed mb-8 max-w-xl"
          >
            Daniel is your AI strategist. Transform vague beliefs into rigorous
            10-day experiments — and finally{' '}
            <span className="text-white font-medium">
              know what actually changes your life.
            </span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.38 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#C75F33] text-black hover:text-white font-black text-sm px-7 py-4 rounded-xl transition-all duration-300 shadow-xl shadow-white/10 hover:shadow-[#C75F33]/25 active:scale-95"
            >
              Start Your First Experiment
              <ArrowRight size={16} />
            </Link>
            <button
              onClick={scrollToHow}
              className="inline-flex items-center justify-center gap-2 text-[#8e9299] hover:text-white border border-white/10 hover:border-white/30 font-bold text-sm px-7 py-4 rounded-xl transition-all duration-300 hover:bg-white/5"
            >
              See How It Works
            </button>
          </motion.div>

          {/* Social proof micro-stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-6 mt-8"
          >
            {[
              { value: '10-Day', label: 'Sprint Format' },
              { value: '11', label: 'Belief Categories' },
              { value: '100%', label: 'Evidence-Based' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-white font-black text-lg leading-none">
                  {stat.value}
                </div>
                <div className="text-[#8e9299] text-[10px] font-bold uppercase tracking-wider mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — Mock UI */}
        <MockChat />
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToHow}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 text-[#8e9299] hover:text-white transition-colors"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        >
          <ChevronDown size={18} />
        </motion.div>
      </motion.button>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* HOW IT WORKS                                                         */
/* ------------------------------------------------------------------ */
const HowItWorks = () => {
  const steps = [
    {
      num: '01',
      icon: Brain,
      title: 'The Dig',
      desc: 'Complete a deep-dive 11-category belief audit. Reveal how you really think about control, luck, capability, fate, and execution.',
      color: '#C75F33',
    },
    {
      num: '02',
      icon: FlaskConical,
      title: 'The Experiment',
      desc: 'Daniel designs a rigorous, tailored 10-day test based on your exact belief profile. One hypothesis. One sprint. No noise.',
      color: '#8b5cf6',
    },
    {
      num: '03',
      icon: BarChart3,
      title: 'The Evidence',
      desc: 'Log daily. Rate your metric. Capture observations. When the sprint ends, you have real data \u2014 not hope, not guesswork.',
      color: '#10b981',
    },
  ];

  return (
    <Section id="how" className="py-24 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[#8e9299] text-[10px] font-black uppercase tracking-widest mb-4"
          >
            <Target size={11} />
            The Method
          </motion.div>
          <motion.h2
            variants={fadeUp}
            custom={0.05}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight"
          >
            From Belief to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#C75F33] to-[#C75F33]/50">
              Breakthrough
            </span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={0.1}
            className="text-[#8e9299] mt-4 text-base max-w-xl mx-auto leading-relaxed"
          >
            Three precise phases designed to replace intuition with evidence.
          </motion.p>
        </div>

        {/* Cinematic alternating steps */}
        <div className="relative flex flex-col gap-0">
          {/* Vertical spine */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block pointer-events-none" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            const isEven = i % 2 === 1;

            return (
              <motion.div
                key={step.num}
                variants={fadeUp}
                custom={i * 0.14}
                className={`relative grid grid-cols-1 md:grid-cols-2 gap-0 items-center py-14 md:py-24 ${
                  i < steps.length - 1 ? 'border-b border-white/[0.05]' : ''
                }`}
              >
                {/* Spine node */}
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 z-20 hidden md:flex items-center justify-center transform hover:scale-125 transition-transform"
                  style={{
                    background: '#0f1014',
                    borderColor: step.color,
                    boxShadow: `0 0 16px ${step.color}90`,
                  }}
                />

                {/* Orb Column */}
                <div 
                  className={`flex items-center justify-center mb-12 md:mb-0 ${
                    isEven ? 'md:order-1' : 'md:order-2'
                  }`}
                >
                  <div className="relative flex items-center justify-center w-56 h-56 md:w-72 md:h-72">
                    {/* Giant ghost number */}
                    <div
                      className="absolute inset-0 flex items-center justify-center text-[180px] md:text-[240px] font-black leading-none select-none pointer-events-none"
                      style={{ color: step.color, opacity: 0.04 }}
                    >
                      {step.num}
                    </div>

                    {/* Animated outer glow */}
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.3, 0.1] }}
                      transition={{ repeat: Infinity, duration: 4 + i, ease: 'easeInOut' }}
                      className="absolute w-full h-full rounded-full"
                      style={{ background: `radial-gradient(circle, ${step.color}25 0%, transparent 70%)` }}
                    />

                    {/* Icon orb */}
                    <div
                      className="relative w-28 h-28 md:w-32 md:h-32 rounded-[2rem] flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${step.color}30 0%, ${step.color}10 100%)`,
                        border: `1px solid ${step.color}40`,
                        boxShadow: `0 0 60px ${step.color}20, inset 0 1px 0 ${step.color}20`,
                      }}
                    >
                      <Icon size={48} style={{ color: step.color }} strokeWidth={1.5} />
                    </div>
                  </div>
                </div>

                {/* Text Column */}
                <div
                  className={`flex flex-col justify-center px-6 md:px-0 ${
                    isEven 
                      ? 'md:order-2 md:pl-24 lg:pl-32 text-left' 
                      : 'md:order-1 md:pr-24 lg:pr-32 md:text-right items-end'
                  }`}
                >
                  {/* Step label */}
                  <div className={`flex items-center gap-3 mb-6 ${isEven ? 'justify-start' : 'md:flex-row-reverse'}`}>
                    <div
                      className="h-px w-12 flex-shrink-0"
                      style={{ background: `linear-gradient(${isEven ? 'to right' : 'to left'}, ${step.color}, transparent)` }}
                    />
                    <span
                      className="text-[10px] font-black uppercase tracking-[0.4em]"
                      style={{ color: step.color }}
                    >
                      Step {step.num}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6 leading-none">
                    {step.title}
                  </h3>

                  {/* Divider line */}
                  <div
                    className="w-16 h-1 mb-8 rounded-full"
                    style={{ background: step.color, opacity: 0.6 }}
                  />

                  {/* Description */}
                  <p className={`text-[#8e9299] text-base md:text-lg leading-relaxed max-w-sm ${isEven ? '' : 'md:text-right'}`}>
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
};

/* ------------------------------------------------------------------ */
/* FEATURES                                                             */
/* ------------------------------------------------------------------ */

const Features = () => {
  const features = [
    {
      id: 'ST-01',
      icon: Brain,
      title: 'AI Strategist (Daniel)',
      desc: 'Not a chatbot. A rigorous thinking partner who challenges your assumptions and designs evidence-first experiments tailored to you.',
      accent: '#C75F33',
      className: 'md:col-span-2 md:row-span-2',
    },
    {
      id: 'XP-02',
      icon: FlaskConical,
      title: 'Controlled Experiments',
      desc: 'Focused 10-day sprints. Science applied to your daily habits with zero noise.',
      accent: '#8b5cf6',
      className: 'md:col-span-1 md:row-span-2',
    },
    {
      id: 'LG-03',
      icon: BookOpen,
      title: 'Daily Logging',
      desc: 'Rate metrics from 1-10 and capture daily observations.',
      accent: '#3b82f6',
      className: 'md:col-span-1 md:row-span-1',
    },
    {
      id: 'HS-04',
      icon: Folder,
      title: 'Experiment History',
      desc: 'A growing personal evidence archive of every sprint.',
      accent: '#10b981',
      className: 'md:col-span-1 md:row-span-1',
    },
    {
      id: 'DG-05',
      icon: Target,
      title: 'The Dig Onboarding',
      desc: 'An 11-category belief audit mapping your core assumptions.',
      accent: '#f59e0b',
      className: 'md:col-span-3 md:row-span-1',
    },
    {
      id: 'SC-06',
      icon: Lock,
      title: 'Secure & Private',
      desc: 'Bank-grade encryption for your personal lab.',
      accent: '#6b7280',
      className: 'md:col-span-1 md:row-span-1',
    },
  ];

  return (
    <Section id="features" className="py-24 px-6 md:px-12 relative overflow-hidden">
      {/* Background visual elements */}
      <div className="absolute inset-0 -z-10 bg-[#0f1014]">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#C75F33]/5 rounded-full blur-[160px]" />
        <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#8b5cf6]/5 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[#8e9299] text-[10px] font-black uppercase tracking-widest mb-4"
          >
            <Zap size={11} />
            System Capabilities
          </motion.div>
          <motion.h2
            variants={fadeUp}
            custom={0.05}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight"
          >
            Your Personal{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#C75F33] to-[#C75F33]/50">
              Science Lab
            </span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={0.1}
            className="text-[#8e9299] mt-6 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            A high-performance environment designed to isolate variables, measure results, and evolve your executive function.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:auto-rows-[220px]">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                variants={fadeUp}
                custom={i * 0.08}
                whileHover={{ y: -4, scale: 1.005 }}
                className={`group relative bg-[#1a1b1e]/40 border border-white/[0.06] rounded-3xl p-6 md:p-8 backdrop-blur-3xl overflow-hidden hover:border-white/20 transition-all duration-500 flex flex-col justify-between ${feat.className}`}
              >
                {/* Spotlight effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at center, ${feat.accent}15 0%, transparent 70%)`,
                  }}
                />

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
                />

                <div className="relative z-10">
                  {/* Top Header in card */}
                  <div className="flex items-center justify-between mb-6 md:mb-8">
                    <div
                      className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500"
                      style={{
                        background: `${feat.accent}20`,
                        border: `1px solid ${feat.accent}30`,
                        boxShadow: `0 0 20px ${feat.accent}15`,
                      }}
                    >
                      <Icon size={feat.className.includes('col-span-2') ? 24 : 20} style={{ color: feat.accent }} strokeWidth={1.5} />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-[#8e9299]/30 tracking-wider">
                      {feat.id}
                    </span>
                  </div>

                  <h3 className={`text-white font-black tracking-tight mb-2 md:mb-3 ${feat.className.includes('col-span-2') ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}`}>
                    {feat.title}
                  </h3>
                  <p className={`text-[#8e9299] leading-relaxed max-w-sm ${feat.className.includes('row-span-1') ? 'text-xs md:text-sm line-clamp-3' : 'text-sm'}`}>
                    {feat.desc}
                  </p>
                </div>

              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
};

/* ------------------------------------------------------------------ */
/* QUOTE / SOCIAL PROOF                                                 */
/* ------------------------------------------------------------------ */
const Quote = () => (
  <Section className="py-20 px-6">
    <div className="max-w-4xl mx-auto text-center relative">
      {/* Glow */}
      <div className="absolute -inset-20 bg-[#C75F33]/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Decorative quote mark */}
      <motion.div
        variants={fadeUp}
        className="text-[120px] leading-none text-[#C75F33]/15 font-black select-none -mb-8"
      >
        "
      </motion.div>

      <motion.blockquote
        variants={fadeUp}
        custom={0.08}
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-white/90 leading-tight tracking-tight"
      >
        Real change isn't a destination; it's a series of{' '}
        <span className="text-[#C75F33]">observed sprints.</span> I've designed
        these 10-day windows to prevent data fatigue and force rigorous
        execution.
      </motion.blockquote>

      <motion.div variants={fadeUp} custom={0.16} className="mt-8">
        <div className="inline-flex items-center gap-3">
          <div className="h-[1px] w-12 bg-white/20" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#C75F33] rounded-lg flex items-center justify-center">
              <Sparkles size={13} className="text-white" />
            </div>
            <span className="text-[10px] font-black text-[#C75F33] uppercase tracking-[0.25em]">
              Daniel, AI Strategist
            </span>
          </div>
          <div className="h-[1px] w-12 bg-white/20" />
        </div>
      </motion.div>
    </div>
  </Section>
);

/* ------------------------------------------------------------------ */
/* PRICING                                                              */
/* ------------------------------------------------------------------ */
const Pricing = () => {
  const tiltRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.01)`;
  };

  const handleMouseLeave = () => {
    if (tiltRef.current) {
      tiltRef.current.style.transform = 'perspective(600px) rotateY(0) rotateX(0) scale(1)';
    }
  };

  const featuresList = [
    'Unlimited AI Strategy Sessions',
    'Controlled 10-Day Experiment Sprints',
    'Daily Logging with 1–10 Metric Tracking',
    'Full Experiment History & Evidence Archive',
    'Priority AI Processing — instant responses',
  ];

  return (
    <Section id="pricing" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#C75F33]/10 border border-[#C75F33]/25 rounded-full text-[#C75F33] text-[10px] font-black uppercase tracking-widest mb-4"
          >
            <Sparkles size={11} />
            Elite Access
          </motion.div>
          <motion.h2
            variants={fadeUp}
            custom={0.05}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight"
          >
            Invest in Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#C75F33] to-[#C75F33]/50">
              Evolution
            </span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={0.1}
            className="text-[#8e9299] mt-4 text-base max-w-xl mx-auto leading-relaxed"
          >
            One plan. Everything included. Run your first experiment within
            minutes.
          </motion.p>
        </div>

        {/* Card + aside */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start max-w-5xl mx-auto">
          {/* Main pricing card */}
          <motion.div
            variants={fadeUp}
            custom={0.05}
            className="lg:col-span-3"
          >
            <div
              ref={tiltRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ transition: 'transform 0.15s ease' }}
              className="bg-[#1a1b1e]/50 border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
            >
              {/* Background shine */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#C75F33]/10 rounded-full blur-[80px] pointer-events-none" />

              {/* Plan header */}
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div>
                  <div className="text-[10px] font-black text-[#8e9299] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Clock size={10} />
                    10-Day Evidence Sprint
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    Prime Cycle Access
                  </h3>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-5xl font-black text-white leading-none">
                      $29
                    </span>
                    <span className="text-[#8e9299] text-xs font-mono">.00</span>
                  </div>
                  <div className="text-[#8e9299] text-[10px] font-bold uppercase tracking-wider mt-1">
                    per cycle
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-col gap-3.5 mb-8 relative z-10">
                {featuresList.map((feat) => (
                  <div key={feat} className="flex items-center gap-3 group">
                    <div className="w-5 h-5 rounded-lg bg-[#10b981]/10 border border-[#10b981]/25 flex items-center justify-center flex-shrink-0">
                      <Check size={11} className="text-[#10b981]" strokeWidth={3} />
                    </div>
                    <span className="text-white/80 text-sm group-hover:text-white transition-colors">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>

              <div className="h-px w-full bg-white/5 mb-8" />

              {/* CTA */}
              <Link
                to="/signup"
                className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-white hover:bg-[#C75F33] text-black hover:text-white font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-xl shadow-white/10 hover:shadow-[#C75F33]/25 relative z-10 active:scale-95"
              >
                <TrendingUp size={16} />
                Initialize Protocol
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          {/* Right sidebar cards */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Daniel's principle quote */}
            <motion.div
              variants={fadeUp}
              custom={0.12}
              className="bg-[#C75F33]/5 border border-[#C75F33]/20 rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-[#C75F33]/10 rounded-full blur-2xl" />
              <div className="flex items-start gap-3 relative z-10">
                <div className="w-9 h-9 bg-[#C75F33] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#C75F33]/25">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm mb-1.5">
                    The 10-Day Principle
                  </h4>
                  <p className="text-[#8e9299] text-xs leading-relaxed">
                    "Short enough to maintain intensity. Long enough to generate
                    real signal."
                  </p>
                  <p className="text-[9px] font-black text-[#C75F33] uppercase tracking-[0.2em] mt-2">
                    — Daniel
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Included details */}
            <motion.div
              variants={fadeUp}
              custom={0.18}
              className="bg-white/3 border border-white/8 rounded-2xl p-6"
            >
              <div className="text-[10px] font-black text-[#8e9299] uppercase tracking-widest mb-4 opacity-60">
                What You Get
              </div>
              <div className="flex flex-col gap-2">
                {[
                  ['10 Days', 'Full access window'],
                  ['1 Active', 'Experiment at a time'],
                  ['Unlimited', 'Chat with Daniel'],
                  ['Instant', 'AI responses'],
                ].map(([val, label]) => (
                  <div key={val} className="flex items-center justify-between">
                    <span className="text-[#8e9299] text-xs">{label}</span>
                    <span className="text-white text-xs font-bold">{val}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Trust badge */}
            <motion.div
              variants={fadeUp}
              custom={0.24}
              className="flex items-center justify-center gap-2 text-[#8e9299] opacity-50 hover:opacity-100 transition-opacity"
            >
              <Shield size={11} />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em]">
                Bank-Grade Encryption · Stripe Secure
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </Section>
  );
};

/* ------------------------------------------------------------------ */
/* FINAL CTA                                                            */
/* ------------------------------------------------------------------ */
const FinalCTA = () => (
  <Section className="py-28 px-6">
    <div className="max-w-3xl mx-auto text-center relative">
      {/* Pulsing glow ring */}
      <div className="absolute inset-0 flex items-center justify-center -z-10">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="w-80 h-80 rounded-full bg-[#C75F33]/20 blur-[80px]"
        />
      </div>

      <motion.div
        variants={fadeUp}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[#8e9299] text-[10px] font-black uppercase tracking-widest mb-6"
      >
        <Sparkles size={11} />
        Join the Pragmatists
      </motion.div>

      <motion.h2
        variants={fadeUp}
        custom={0.06}
        className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.05] mb-6"
      >
        Ready to Find Out{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C75F33] to-[#e87d52]">
          What Actually Works?
        </span>
      </motion.h2>

      <motion.p
        variants={fadeUp}
        custom={0.12}
        className="text-[#8e9299] text-lg leading-relaxed mb-10"
      >
        Stop believing. Start knowing. Your first experiment is one conversation
        with Daniel away.
      </motion.p>

      <motion.div variants={fadeUp} custom={0.18}>
        <Link
          to="/signup"
          className="inline-flex items-center gap-3 bg-white hover:bg-[#C75F33] text-black hover:text-white font-black text-sm uppercase tracking-widest px-10 py-5 rounded-2xl transition-all duration-300 shadow-2xl shadow-white/10 hover:shadow-[#C75F33]/30 active:scale-95"
        >
          Start Free Today
          <ArrowRight size={17} />
        </Link>
      </motion.div>

      <motion.p variants={fadeUp} custom={0.22} className="text-[#8e9299]/50 text-xs mt-6">
        No card required to sign up. Cancel anytime.
      </motion.p>
    </div>
  </Section>
);

/* ------------------------------------------------------------------ */
/* FOOTER                                                               */
/* ------------------------------------------------------------------ */
const Footer = () => (
  <footer className="relative z-10 border-t border-white/5 px-6 py-10">
    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="flex flex-col items-center sm:items-start gap-1">
        <img src={logo} alt="Do What Works" className="h-8 w-auto" />
        <p className="text-[#8e9299] text-xs mt-1">
          © 2026 Do What Works. All rights reserved.
        </p>
      </div>

      <div className="flex items-center gap-6">
        {[
          { label: 'Privacy Policy', href: '#' },
          { label: 'Terms of Service', href: '#' },
          { label: 'Contact', href: '#' },
        ].map((l) => (
          <a
            key={l.label}
            href={l.href}
            className="text-[#8e9299] hover:text-white text-xs font-medium transition-colors"
          >
            {l.label}
          </a>
        ))}
      </div>
    </div>
  </footer>
);

/* ------------------------------------------------------------------ */
/* PAGE ROOT                                                            */
/* ------------------------------------------------------------------ */
export const LandingPage = () => {
  return (
    <div className="min-h-screen animate-gradient-bg text-white font-sans overflow-x-hidden">
      {/* Global floating orbs */}
      <div className="fixed -top-60 -left-60 w-[800px] h-[800px] bg-[#C75F33]/5 rounded-full blur-[200px] pointer-events-none -z-10 animate-float-reverse" />
      <div className="fixed -bottom-60 -right-60 w-[800px] h-[800px] bg-[#C75F33]/5 rounded-full blur-[200px] pointer-events-none -z-10 animate-float" />

      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Quote />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
};
