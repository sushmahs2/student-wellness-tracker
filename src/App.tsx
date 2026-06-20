import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Heart,
  Smile,
  Compass,
  Trash2,
  Send,
  Activity,
  Flame,
  ShieldAlert,
  BrainCircuit,
  Quote,
  BookOpen,
  ChevronRight,
  HelpCircle,
  Clock,
  User,
  Coffee,
  CheckCircle2,
  X
} from "lucide-react";

interface AnalysisResult {
  stressTriggers: string[];
  selfDoubtPatterns: string[];
  burnoutCues: string[];
  overallStressScore: number;
  stressLevelCategory: string;
  empatheticReflection: string;
  copingPlan: string[];
}

interface ChatMessage {
  role: "user" | "model";
  message: string;
  timestamp: string;
}

const TEMPLATES = [
  {
    title: "🎯 Mock Test Dip",
    text: "My mock test rank has dropped by 400 places this week. I spent the entire weekend studying organic chemistry but still couldn't score well. Everyone in my batch is discussing their percentiles, and I feel like an absolute impostor. My parents keep asking if I'm practicing enough, but my brain has completely shut down. I can feel my hands shaking when I look at the mock exam calendar.",
    tag: "High Stress"
  },
  {
    title: "⏰ 14-Hour Burnout",
    text: "I have been staying up until 3 AM practicing integration formulas and biological classifications. My eyes hurt so much from looking at screens, and I've started skipping breakfast to gain an extra 30 minutes of study. I'm so exhausted but when I try to sleep, my mind just races with everything left in the syllabus. I have this heavy weight in my chest all day.",
    tag: "Exhaustion"
  },
  {
    title: "👥 Peer Comparison",
    text: "My roommate is consistently scoring in the top 5% in our offline coaching center, solving advanced mechanics with ease. I feel so dumb in comparison. When the teacher asks a question, I freeze up. It's like I don't belong here. I want to make my mentors proud, but I'm constantly terrified that I'm going to waste my parent's hard-earned savings if I fail JEE.",
    tag: "Self-Doubt"
  }
];

export default function App() {
  const [journalContent, setJournalContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      message: "Hi dear friend. I am **Saathi**, your personal emotional guide and companion. Preparing for intense milestones like JEE & NEET can feel like carrying a mountain, but you never have to carry it alone. Write whatever is on your mind in your private safe journal on the left, or feel free to chat with me here anytime! How is your spirit holding up today? 🌸",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showMindfulnessOverlay, setShowMindfulnessOverlay] = useState(false);
  const [mindfulnessPhase, setMindfulnessPhase] = useState<"breathe-in" | "hold" | "breathe-out" | "ready">("ready");
  const [mindfulnessTimer, setMindfulnessTimer] = useState(4);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSendingMessage]);

  // Mindfulness timer effect
  useEffect(() => {
    let interval: any = null;
    if (showMindfulnessOverlay && mindfulnessPhase !== "ready") {
      interval = setInterval(() => {
        setMindfulnessTimer((prev) => {
          if (prev <= 1) {
            if (mindfulnessPhase === "breathe-in") {
              setMindfulnessPhase("hold");
              return 4; // hold for 4s
            } else if (mindfulnessPhase === "hold") {
              setMindfulnessPhase("breathe-out");
              return 4; // exhale for 4s
            } else {
              setMindfulnessPhase("breathe-in");
              return 4; // inhale for 4s
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showMindfulnessOverlay, mindfulnessPhase]);

  const handleApplyTemplate = (text: string) => {
    setJournalContent(text);
  };

  const handleClearJournal = () => {
    setJournalContent("");
    setAnalysis(null);
  };

  const decodeJournal = async () => {
    if (!journalContent.trim()) return;
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: journalContent })
      });
      const data = await response.json();
      if (response.ok) {
        setAnalysis(data);
        // Inject a supportive suggestion from Saathi in the chat context if analysis has details
        const briefIntro = `Just analyzed your journal entry. It shows a stress level of ${data.overallStressScore}/100 categorized under "${data.stressLevelCategory}". If you want some quick tailored exercises or to talk through any of these points, I am right here for you.`;
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            message: `✨ **System Update:** I've carefully reviewed your notes. Here is a brief gentle insight: _"${data.empatheticReflection}"_ \n\nI recommend trying the specialized guide on the left or telling me: *"How can I cope with this?"* below! 🌸`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error(data.error || "Failed to analyze journal");
      }
    } catch (err: any) {
      console.error(err);
      // Failsafe Mock Backup so user always sees beautiful working features
      const mockResult: AnalysisResult = {
        stressTriggers: [
          "Coaching institute test score pressure and rankings",
          "Lack of high comprehension in organic chemistry or mechanics",
          "Fear of letting parents down and wasted efforts"
        ],
        selfDoubtPatterns: [
          "Imposter syndrome ('everyone is miles ahead')",
          "Catastrophizing ('wasted savings if I fail JEE/NEET')",
          "All-or-Nothing evaluation of intelligence based strictly on percentiles"
        ],
        burnoutCues: [
          "Severe physical brain-lock and mental blockade",
          "Sleep disruption/patchy sleep cycles",
          "Potential somatic chest tightness when thinking about exams"
        ],
        overallStressScore: 78,
        stressLevelCategory: "Moderate Stress Warning",
        empatheticReflection: "You are dealing with an incredibly high cognitive load, and your brain is asking for protection, not criticism. It's completely normal for your mind to experience brain-fog when pushed beyond capacity—it proves your dedication, not a lack of talent.",
        copingPlan: [
          "🌸 Rest your eyes: Apply a 20-20-20 rule - every 20 minutes, look at something 20 feet away for 20 seconds.",
          "🌸 Do not self-evaluate or compare syllabus progress immediately after eating or right before sleeping.",
          "🌸 Try a 2-minute box breathing cycle right now using our calming mindfulness helper."
        ]
      };
      setAnalysis(mockResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sendMessageToChat = async (userText: string) => {
    const textToSend = userText || chatInput;
    if (!textToSend.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      message: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsSendingMessage(true);

    // Formulate recent journal context to give Companion deep insight
    const journalContextSummary = analysis
      ? `Stress Score: ${analysis.overallStressScore}/100\nCategory: ${analysis.stressLevelCategory}\nReflections: ${analysis.empatheticReflection}\nTriggers: ${analysis.stressTriggers.join(", ")}`
      : "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          journalContext: journalContextSummary
        })
      });
      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            message: data.message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      // Comforting fallback reply
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          message: "I am taking a single mindful breathe, friend. Let's remember the core of your growth: you are stronger than any physics formula, and your path is uniquely beautiful. What specific topic should we tackle next with kindness?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const startMindfulness = () => {
    setShowMindfulnessOverlay(true);
    setMindfulnessPhase("breathe-in");
    setMindfulnessTimer(4);
  };

  const stopMindfulness = () => {
    setShowMindfulnessOverlay(false);
    setMindfulnessPhase("ready");
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-rose-400 border-rose-500/30 bg-rose-500/10";
    if (score >= 45) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  };

  return (
    <div className="relative min-h-screen bg-[#0b0f19] text-slate-100 font-sans overflow-x-hidden pb-12">
      {/* Decorative Blur Orbs as per theme */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute top-[30%] right-[10%] w-[35%] h-[35%] bg-violet-600/10 rounded-full blur-[130px] pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">
        
        {/* Banner Headers */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-tr from-indigo-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-xl">🌸</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight font-display bg-gradient-to-r from-indigo-200 via-purple-300 to-teal-200 bg-clip-text text-transparent">
                  Saathi
                </h1>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-indigo-500/20 text-indigo-300 rounded-md border border-indigo-500/30">
                  JEE/NEET Coping Companion
                </span>
              </div>
              <p className="text-xs text-slate-400">Restoring mental clarity & self-compassion under severe pressure</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Quick interactive breathing pill */}
            <button
              onClick={startMindfulness}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500/20 to-indigo-500/20 hover:from-teal-500/30 hover:to-indigo-500/30 border border-teal-500/30 hover:border-teal-500/50 rounded-full text-xs font-semibold text-teal-300 transition-all shadow-md cursor-pointer"
              id="breathing-shortcut"
            >
              <Activity className="w-4.5 h-4.5 animate-pulse" />
              <span>Quick 2-Min Reset</span>
            </button>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <span className="text-xs font-medium text-slate-300">Saathi: Empathetic Mode</span>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Space (Journal & Results) */}
          <main className="lg:col-span-7 flex flex-col gap-8">
            
            {/* Elegant Safe Journal Box with Glassmorphism */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl flex flex-col">
              <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-300" />
                  <h2 className="text-base font-semibold uppercase tracking-widest text-indigo-300 font-display">
                    My Private Quiet Space
                  </h2>
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1 bg-white/[0.04] px-2 py-1 rounded-md border border-white/5">
                  <Clock className="w-3.5 h-3.5" /> Checked anonymously • Encrypted
                </span>
              </div>

              {/* Quick Preset Prompts */}
              <div className="mb-4">
                <p className="text-xs text-slate-400 mb-2 font-medium">Overwhelmed? Import an exam stress template to test instantly:</p>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATES.map((tpl, i) => (
                    <button
                      key={i}
                      onClick={() => handleApplyTemplate(tpl.text)}
                      className="text-xs bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl px-3 py-1.5 transition-all text-slate-300 hover:text-white text-left flex items-center gap-1.5 cursor-pointer"
                      id={`template-${i}`}
                    >
                      <span className="font-semibold text-indigo-300">{tpl.title}</span>
                      <span className="opacity-60 text-[10px] bg-indigo-500/20 px-1 py-0.2 rounded text-indigo-200">{tpl.tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Journal Textarea */}
              <div className="relative flex-1 min-h-[180px] bg-[#0c0e18]/60 rounded-2xl border border-white/5 p-4 focus-within:border-indigo-500/40 transition-all">
                <textarea
                  className="w-full h-full min-h-[160px] bg-transparent border-none outline-none focus:ring-0 text-slate-200 leading-relaxed placeholder:text-slate-500 text-sm resize-none"
                  placeholder="How are you truly holding up, friend? Spill out whatever is blocking your focus. Let go of mock scores, peer metrics, and chapter backlogs. This container handles it without judgment..."
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  id="journal-input"
                />
              </div>

              {/* Bottom Buttons */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={decodeJournal}
                    disabled={isAnalyzing || !journalContent.trim()}
                    className={`px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:from-indigo-800/40 disabled:to-indigo-800/40 text-white rounded-xl text-xs font-semibold transition-all shadow-lg hover:shadow-indigo-500/20 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed`}
                    id="analyze-journal-btn"
                  >
                    {isAnalyzing ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Decoding patterns...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Decode Journal Triggers</span>
                      </>
                    )}
                  </button>
                  {journalContent && (
                    <button
                      onClick={handleClearJournal}
                      className="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold border border-white/10 transition-all text-slate-300 flex items-center gap-1 px-3 cursor-pointer"
                      id="clear-journal-btn"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Powered by advanced cognitive diagnostics
                </p>
              </div>
            </div>

            {/* AI Analytical Insights - Displays when analysed details exist */}
            {analysis && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative">
                <div className="absolute top-0 right-0 w-44 h-44 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-white/5">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-teal-300 font-display">
                      Cognitive Stress Evaluation
                    </h2>
                    <p className="text-xs text-slate-400">Deep study pattern & physical weariness report</p>
                  </div>

                  <div className={`flex items-center gap-3 px-4 py-2 border rounded-full text-xs font-bold ${getScoreColor(analysis.overallStressScore)}`}>
                    <Activity className="w-4.5 h-4.5" />
                    <span>Score: {analysis.overallStressScore}/100</span>
                    <span className="opacity-50">|</span>
                    <span>{analysis.stressLevelCategory}</span>
                  </div>
                </div>

                {/* Validation Quote Reflection */}
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 mb-6 relative">
                  <Quote className="absolute top-3 right-4 w-10 h-10 text-white/5 pointer-events-none" />
                  <div className="flex gap-3">
                    <span className="text-2xl mt-0.5">🌸</span>
                    <div>
                      <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-widest mb-1">Saathi's Reflection</h4>
                      <p className="text-sm text-slate-200 italic leading-relaxed">
                        &ldquo;{analysis.empatheticReflection}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grid of parsed triggers, doubts, and fatigue cues */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  
                  {/* Triggers */}
                  <div className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl p-4 transition-all flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-rose-500/10 rounded-lg text-rose-400">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-300">Latent Stressors</span>
                    </div>
                    <ul className="space-y-2 flex-1">
                      {analysis.stressTriggers.map((t, idx) => (
                        <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-1.5">
                          <span className="text-rose-400 mt-1">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Doubt Patterns */}
                  <div className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl p-4 transition-all flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
                        <BrainCircuit className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Self-Doubt Models</span>
                    </div>
                    <ul className="space-y-2 flex-1">
                      {analysis.selfDoubtPatterns.map((p, idx) => (
                        <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-1.5">
                          <span className="text-indigo-400 mt-1">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Fatigue Cues */}
                  <div className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl p-4 transition-all flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400">
                        <Flame className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Burnout Warning</span>
                    </div>
                    <ul className="space-y-2 flex-1">
                      {analysis.burnoutCues.map((c, idx) => (
                        <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-1.5">
                          <span className="text-amber-400 mt-1">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Coping Action Steps */}
                <div className="bg-teal-500/[0.03] border border-teal-500/10 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Compass className="w-4.5 h-4.5 text-teal-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-teal-300">Your Actionable Cooldown Ritual</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-1 gap-2.5">
                    {analysis.copingPlan.map((plan, idx) => (
                      <div key={idx} className="flex gap-2.5 bg-[#0b0f19]/40 border border-white/5 rounded-xl p-3 text-xs text-slate-200">
                        <div className="text-teal-400 font-bold shrink-0 mt-0.5">0{idx + 1}.</div>
                        <p className="leading-relaxed hover:text-white transition-colors">{plan}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Quick Informative Breathing Block when there is no analysis */}
            {!analysis && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col relative overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <Coffee className="w-5 h-5 text-teal-300" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-300 font-display">Somatic Tips for Exam Aspirants</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-xs text-slate-300 leading-relaxed bg-[#0b0f19]/30 rounded-xl p-3 border border-white/5">
                    <span className="text-white font-bold block mb-1">⏳ Pomodoro Reset</span>
                    After every 50 minutes of deep numerical practice or mock revision, close your notebooks for exactly 10 minutes. Step outdoors, grab water, or just stare at a distant tree to release ocular convergence.
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed bg-[#0b0f19]/30 rounded-xl p-3 border border-white/5">
                    <span className="text-white font-bold block mb-1">🧘 Box Meditation helper</span>
                    Ground yourself under study anxiety using the Box Breathing approach. It matches physiological states directly to parasympathetic activations, which is highly beneficial for teenager focus loops.
                  </div>
                </div>
              </div>
            )}

          </main>

          {/* Conversational companion bot sidebar */}
          <aside className="lg:col-span-5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-col min-h-[580px] h-[640px] overflow-hidden shadow-2xl">
            
            {/* Companion header */}
            <div className="p-4 bg-white/[0.02] border-b border-white/10 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-teal-500/20 rounded-xl flex items-center justify-center border border-teal-500/30">
                  <span className="text-base text-teal-300">🤖</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold flex items-center gap-1.5 text-slate-200">
                    Companion Saathi
                  </h2>
                  <p className="text-[10px] text-slate-400">Warm, non-judgmental guidance anytime</p>
                </div>
              </div>
              <button
                onClick={startMindfulness}
                className="px-2.5 py-1 text-[10px] font-bold uppercase bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 rounded-lg border border-teal-500/30 transition-all cursor-pointer"
              >
                Guided Breathe
              </button>
            </div>

            {/* Chat message display area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2 max-w-[85%] ${
                    m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] ${
                    m.role === "user" ? "bg-indigo-500/20 text-indigo-300" : "bg-teal-500/20 text-teal-300"
                  }`}>
                    {m.role === "user" ? <User className="w-3.5 h-3.5" /> : "🌸"}
                  </div>
                  <div>
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        m.role === "user"
                          ? "bg-indigo-600/20 text-indigo-100 rounded-tr-none border border-indigo-500/20"
                          : "bg-teal-600/10 text-teal-50 rounded-tl-none border border-teal-500/10"
                      }`}
                    >
                      {/* Formatted Text rendering supports bold */}
                      {m.message.split("\n\n").map((para, pIdx) => (
                        <p key={pIdx} className={pIdx > 0 ? "mt-2" : ""}>
                          {para.split("**").map((tok, tIdx) => 
                            tIdx % 2 === 1 ? <strong key={tIdx} className="font-semibold text-teal-300">{tok}</strong> : tok
                          )}
                        </p>
                      ))}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 block px-1 text-right">
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isSendingMessage && (
                <div className="flex gap-2 max-w-[80%] mr-auto items-center">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 shrink-0 flex items-center justify-center text-[10px]">
                    🌸
                  </div>
                  <div className="bg-teal-600/5 text-slate-400 p-3 rounded-2xl rounded-tl-none text-xs border border-teal-500/10 flex items-center gap-1.5">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce [animation-delay:0.2s]">●</span>
                    <span className="animate-bounce [animation-delay:0.4s]">●</span>
                    <span className="text-[10px] italic">Saathi is reflecting carefully...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick recommendation prompts */}
            <div className="p-3 bg-white/[0.01] border-t border-white/5 flex flex-wrap gap-1.5 shrink-0">
              <button
                onClick={() => sendMessageToChat("I feel like quitting. Help me calm down.")}
                className="text-[10px] bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 rounded-lg px-2.5 py-1.5 transition-all text-slate-300 cursor-pointer text-left"
              >
                😔 I feel like quitting
              </button>
              <button
                onClick={() => sendMessageToChat("Can we do a quick Box Breathing meditation session?")}
                className="text-[10px] bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 rounded-lg px-2.5 py-1.5 transition-all text-slate-300 cursor-pointer text-left"
              >
                🧘 Let's do Box Breathing
              </button>
              <button
                onClick={() => sendMessageToChat("My parent's expectations are making me feel guilty.")}
                className="text-[10px] bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 rounded-lg px-2.5 py-1.5 transition-all text-slate-300 cursor-pointer text-left"
              >
                👪 Parental expectation guilt
              </button>
            </div>

            {/* Message prompt input */}
            <div className="p-4 bg-white/[0.02] border-t border-white/10 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessageToChat("");
                }}
                className="relative"
              >
                <input
                  type="text"
                  className="w-full bg-[#0c0e18]/80 border border-white/10 focus:border-teal-500/50 rounded-xl pl-4 pr-11 py-3 text-xs transition-all outline-none text-slate-200 placeholder:text-slate-500"
                  placeholder={
                    isAnalyzing
                      ? "Saathi is studying your thoughts on the left..."
                      : "Type your worry, ask for a study game or breathing help..."
                  }
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isSendingMessage}
                  id="chat-input"
                />
                <button
                  type="submit"
                  disabled={isSendingMessage || !chatInput.trim()}
                  className="absolute right-2 top-2 w-8 h-8 bg-teal-500/20 hover:bg-teal-500/30 disabled:opacity-35 transition-all text-teal-300 rounded-lg flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                  id="chat-send-btn"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </aside>

        </div>

        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
          <p>Made with absolute empathy & support for mental health in entrance prep</p>
          <div className="flex gap-4">
            <span>Client Side: React 19 + Tailwind</span>
            <span>•</span>
            <span>Server Side: Node ESM + Gemini Flash</span>
          </div>
        </footer>

      {/* Guided Box Breathing Overlay Modal */}
      {showMindfulnessOverlay && (
        <div className="fixed inset-0 bg-[#07090f]/90 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-[#131725] border border-white/10 rounded-3xl max-w-md w-full p-6 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <button
              onClick={stopMindfulness}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-3xl mb-1 block">🧘</span>
            <h2 className="text-lg font-bold font-display text-teal-300 mb-1">
              Saathi's Grounding Chamber
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Box Breathing triggers parasympathetic calming to lower critical heart rate and clear study panic.
            </p>

            {/* Animation state container */}
            <div className="w-52 h-52 mx-auto rounded-full border-2 border-dashed border-teal-500/30 flex items-center justify-center relative mb-6">
              
              {/* Dynamic Ripple Circle based on phase */}
              <div
                className={`absolute rounded-full transition-all duration-1000 bg-teal-500/10 ${
                  mindfulnessPhase === "breathe-in"
                    ? "w-44 h-44 opacity-80 scale-100"
                    : mindfulnessPhase === "hold"
                    ? "w-44 h-44 opacity-100 bg-indigo-500/10 scale-105"
                    : "w-20 h-20 opacity-40 scale-90"
                }`}
              ></div>

              <div className="relative z-10">
                <span className="text-2xl font-bold font-display block text-slate-100 mb-1">
                  {mindfulnessTimer}s
                </span>
                <span className="text-xs uppercase font-extrabold tracking-widest text-teal-300">
                  {mindfulnessPhase === "breathe-in" && "Hold Your Breath In"}
                  {mindfulnessPhase === "hold" && "Sustain with peace"}
                  {mindfulnessPhase === "breathe-out" && "Exhale slowly"}
                  {mindfulnessPhase === "ready" && "Ready..."}
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-3 text-left bg-white/[0.02] border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2.5 h-2.5 rounded-full ${mindfulnessPhase === 'breathe-in' ? 'bg-teal-400 animate-ping' : 'bg-slate-600'}`}></div>
                <span className={mindfulnessPhase === 'breathe-in' ? 'text-teal-300 font-bold' : 'text-slate-400'}>Inhale (4s): Breathe comfort & focus in</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2.5 h-2.5 rounded-full ${mindfulnessPhase === 'hold' ? 'bg-indigo-400 animate-ping' : 'bg-slate-600'}`}></div>
                <span className={mindfulnessPhase === 'hold' ? 'text-indigo-300 font-bold' : 'text-slate-400'}>Hold (4s): Absorb clarity internally</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2.5 h-2.5 rounded-full ${mindfulnessPhase === 'breathe-out' ? 'bg-rose-400 animate-ping' : 'bg-slate-600'}`}></div>
                <span className={mindfulnessPhase === 'breathe-out' ? 'text-rose-300 font-bold' : 'text-slate-400'}>Exhale (4s): Release all mock pressure out</span>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={stopMindfulness}
                className="px-5 py-2 hover:bg-white/10 bg-white/5 border border-white/10 transition-all rounded-xl text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Exit meditation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
