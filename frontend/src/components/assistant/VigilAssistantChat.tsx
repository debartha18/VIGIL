import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Minimize2,
  Maximize2,
  Trash2,
  Send,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  RotateCcw,
  Mic,
  MicOff,
  ExternalLink,
  Shield,
  Layers,
  MapPin,
  Sliders,
  FileText,
  Palette,
  GripVertical
} from 'lucide-react';
import {
  AnalysisContext,
  ChatMessage,
  AssistantLanguage,
  UIActionTrigger
} from '../../types/assistant';
import { vigilAssistantService } from '../../services/VigilAssistantService';

export type AIThemeId = 'cyan' | 'amber' | 'emerald' | 'purple' | 'orange';

export interface AIThemeStyle {
  id: AIThemeId;
  name: string;
  badgeHex: string;
  glowRgba: string;
  borderHex: string;
  buttonHex: string;
  buttonHoverHex: string;
  textAccentHex: string;
  bgHex: string;
}

export const AI_THEMES: Record<AIThemeId, AIThemeStyle> = {
  cyan: {
    id: 'cyan',
    name: 'Cyber Cyan',
    badgeHex: '#00E5FF',
    glowRgba: 'rgba(0, 229, 255, 0.55)',
    borderHex: '#00E5FF',
    buttonHex: '#0284C7',
    buttonHoverHex: '#0369A1',
    textAccentHex: '#38BDF8',
    bgHex: 'rgba(0, 229, 255, 0.15)'
  },
  amber: {
    id: 'amber',
    name: 'Electric Amber',
    badgeHex: '#F59E0B',
    glowRgba: 'rgba(245, 158, 11, 0.6)',
    borderHex: '#F59E0B',
    buttonHex: '#D97706',
    buttonHoverHex: '#B45309',
    textAccentHex: '#FBBF24',
    bgHex: 'rgba(245, 158, 11, 0.18)'
  },
  emerald: {
    id: 'emerald',
    name: 'Neon Emerald',
    badgeHex: '#10B981',
    glowRgba: 'rgba(16, 185, 129, 0.55)',
    borderHex: '#10B981',
    buttonHex: '#059669',
    buttonHoverHex: '#047857',
    textAccentHex: '#34D399',
    bgHex: 'rgba(16, 185, 129, 0.18)'
  },
  purple: {
    id: 'purple',
    name: 'Cosmic Violet',
    badgeHex: '#C084FC',
    glowRgba: 'rgba(168, 85, 247, 0.6)',
    borderHex: '#A855F7',
    buttonHex: '#7C3AED',
    buttonHoverHex: '#6D28D9',
    textAccentHex: '#E879F9',
    bgHex: 'rgba(168, 85, 247, 0.18)'
  },
  orange: {
    id: 'orange',
    name: 'Solar Orange',
    badgeHex: '#FB923C',
    glowRgba: 'rgba(249, 115, 22, 0.6)',
    borderHex: '#F97316',
    buttonHex: '#EA580C',
    buttonHoverHex: '#C2410C',
    textAccentHex: '#FED7AA',
    bgHex: 'rgba(249, 115, 22, 0.18)'
  }
};

interface VigilAssistantChatProps {
  context: AnalysisContext;
  onExecuteUIAction?: (action: UIActionTrigger) => void;
  onTriggerSearch?: (query: string) => void;
  onViewFullReport?: () => void;
  isOpenDefault?: boolean;
}

export const VigilAssistantChat: React.FC<VigilAssistantChatProps> = ({
  context,
  onExecuteUIAction,
  onTriggerSearch,
  onViewFullReport,
  isOpenDefault = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(isOpenDefault);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [language, setLanguage] = useState<AssistantLanguage>('en');
  const [analystMode, setAnalystMode] = useState<boolean>(false);
  const [aiMode, setAiMode] = useState<'LIVE_AI' | 'DEMO_AI'>('DEMO_AI');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedEvidenceIds, setExpandedEvidenceIds] = useState<Record<string, boolean>>({});
  const [isListening, setIsListening] = useState<boolean>(false);

  // Theme Customization State
  const [currentThemeId, setCurrentThemeId] = useState<AIThemeId>(() => {
    try {
      const saved = localStorage.getItem('orbital_ai_theme') as AIThemeId;
      if (saved && AI_THEMES[saved]) return saved;
    } catch {}
    return 'cyan';
  });
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const activeTheme = AI_THEMES[currentThemeId] || AI_THEMES.cyan;

  // Floating Launcher Position (Draggable anywhere on screen with strict viewport boundary validation)
  const [btnPosition, setBtnPosition] = useState<{ x?: number; y?: number }>(() => {
    try {
      const saved = localStorage.getItem('orbital_ai_btn_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          typeof parsed.x === 'number' &&
          typeof parsed.y === 'number' &&
          Number.isFinite(parsed.x) &&
          Number.isFinite(parsed.y) &&
          parsed.x >= 10 &&
          parsed.x <= (typeof window !== 'undefined' ? Math.max(window.innerWidth - 80, 200) : 1920) &&
          parsed.y >= 10 &&
          parsed.y <= (typeof window !== 'undefined' ? Math.max(window.innerHeight - 50, 200) : 1080)
        ) {
          return parsed;
        }
      }
    } catch {}
    return { x: undefined, y: undefined };
  });

  const [isDraggingBtn, setIsDraggingBtn] = useState<boolean>(false);

  // Chat Window Position (Draggable by header with viewport boundary validation)
  const [windowPosition, setWindowPosition] = useState<{ x?: number; y?: number }>(() => {
    try {
      const saved = localStorage.getItem('orbital_ai_window_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          typeof parsed.x === 'number' &&
          typeof parsed.y === 'number' &&
          Number.isFinite(parsed.x) &&
          Number.isFinite(parsed.y) &&
          parsed.x >= 10 &&
          parsed.x <= (typeof window !== 'undefined' ? Math.max(window.innerWidth - 120, 200) : 1920) &&
          parsed.y >= 10 &&
          parsed.y <= (typeof window !== 'undefined' ? Math.max(window.innerHeight - 100, 200) : 1080)
        ) {
          return parsed;
        }
      }
    } catch {}
    return { x: undefined, y: undefined };
  });

  const [isDraggingWindow, setIsDraggingWindow] = useState<boolean>(false);
  const launcherRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const windowRafRef = useRef<number | null>(null);

  // Initial welcome greeting
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Welcome to **Orbital Intel Assistant** — your AI geospatial intelligence copilot.\n\nContext loaded for **${context.aoi.name}**.\n\nAsk any question about this satellite imagery, or select a quick action below.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: [
        'What changed here?',
        'What is the confidence?',
        'Give me the coordinates',
        'Compare the two dates',
        'What satellite was used?'
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize context to service on updates
  useEffect(() => {
    vigilAssistantService.setContext(context);
  }, [context]);

  // Viewport validation and remote open listener
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (
        btnPosition.x !== undefined &&
        (btnPosition.x < 10 || btnPosition.x > window.innerWidth - 80 || !Number.isFinite(btnPosition.x))
      ) {
        setBtnPosition({ x: undefined, y: undefined });
        try { localStorage.removeItem('orbital_ai_btn_pos'); } catch {}
      }
      if (
        btnPosition.y !== undefined &&
        (btnPosition.y < 10 || btnPosition.y > window.innerHeight - 50 || !Number.isFinite(btnPosition.y))
      ) {
        setBtnPosition({ x: undefined, y: undefined });
        try { localStorage.removeItem('orbital_ai_btn_pos'); } catch {}
      }
      if (
        windowPosition.x !== undefined &&
        (windowPosition.x < 10 || windowPosition.x > window.innerWidth - 100 || !Number.isFinite(windowPosition.x))
      ) {
        setWindowPosition({ x: undefined, y: undefined });
        try { localStorage.removeItem('orbital_ai_window_pos'); } catch {}
      }
      if (
        windowPosition.y !== undefined &&
        (windowPosition.y < 10 || windowPosition.y > window.innerHeight - 80 || !Number.isFinite(windowPosition.y))
      ) {
        setWindowPosition({ x: undefined, y: undefined });
        try { localStorage.removeItem('orbital_ai_window_pos'); } catch {}
      }
    }

    const handleOpenAI = () => {
      setWindowPosition({ x: undefined, y: undefined });
      setBtnPosition({ x: undefined, y: undefined });
      try {
        localStorage.removeItem('orbital_ai_btn_pos');
        localStorage.removeItem('orbital_ai_window_pos');
      } catch {}
      setIsOpen(true);
      setIsMinimized(false);
    };

    window.addEventListener('open-orbital-ai', handleOpenAI);
    return () => window.removeEventListener('open-orbital-ai', handleOpenAI);
  }, []);

  const openChatSafe = () => {
    setWindowPosition((prev) => {
      if (
        prev.x === undefined ||
        prev.y === undefined ||
        prev.x < 10 ||
        (typeof window !== 'undefined' && prev.x > window.innerWidth - 100) ||
        prev.y < 10 ||
        (typeof window !== 'undefined' && prev.y > window.innerHeight - 100)
      ) {
        try { localStorage.removeItem('orbital_ai_window_pos'); } catch {}
        return { x: undefined, y: undefined };
      }
      return prev;
    });
    setIsOpen(true);
    setIsMinimized(false);
  };

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen, isMinimized]);

  // Speech Recognition support check
  const hasSpeech = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  const toggleSpeechRecognition = () => {
    if (!hasSpeech) return;
    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'bn' ? 'bn-BD' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputQuery(transcript);
        }
      };
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSendMessage = async (queryToSend?: string) => {
    const query = (queryToSend || inputQuery).trim();
    if (!query || isTyping) return;

    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: userTimestamp,
      language
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      // Simulate realistic analytical thinking latency (350ms - 600ms)
      await new Promise((res) => setTimeout(res, 400));

      const { responseMessage, uiAction, mode } = await vigilAssistantService.submitMessage(
        query,
        language,
        analystMode
      );

      setAiMode(mode);
      setMessages((prev) => [...prev, responseMessage]);

      // Execute UI Action if triggered
      if (uiAction) {
        if (uiAction.type === 'EXECUTE_SEARCH' && onTriggerSearch) {
          onTriggerSearch(uiAction.payload);
        } else if (uiAction.type === 'VIEW_FULL_REPORT' && onViewFullReport) {
          onViewFullReport();
        } else if (onExecuteUIAction) {
          onExecuteUIAction(uiAction);
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Encountered an internal error processing your request. Please try again or select a suggested question.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleClearChat = () => {
    vigilAssistantService.clearHistory();
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Conversation cleared. Context active for **${context.aoi.name}**.\n\nWhat would you like to know about this imagery?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: ['What changed here?', 'Compare the two dates', 'Why was this detected?', 'Generate an analyst summary']
      }
    ]);
  };

  // Resize listener to prevent elements from going off-screen
  useEffect(() => {
    const handleResize = () => {
      setBtnPosition((prev) => {
        if (prev.x !== undefined && prev.x > window.innerWidth - 140) {
          return { ...prev, x: Math.max(12, window.innerWidth - 220) };
        }
        return prev;
      });
      setWindowPosition((prev) => {
        if (prev.x !== undefined && prev.x > window.innerWidth - 200) {
          return { ...prev, x: Math.max(10, window.innerWidth - 460) };
        }
        return prev;
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const dragDistRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  // Floating Launcher Drag Handler (Zero-lag, 120 FPS butter-smooth)
  const handleBtnPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.prevent-drag')) return;

    const el = launcherRef.current;
    if (!el) return;

    dragDistRef.current = 0;
    isDraggingRef.current = false;

    const rect = el.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = rect.left;
    const initialY = rect.top;
    let currentX = initialX;
    let currentY = initialY;
    let pointerCaptured = false;
    const targetElement = e.currentTarget;

    const handlePointerMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const dist = Math.hypot(dx, dy);
      dragDistRef.current = dist;

      // Only start dragging if moved more than 7px
      if (dist > 7) {
        if (!isDraggingRef.current) {
          isDraggingRef.current = true;
          setIsDraggingBtn(true);
          el.style.transition = 'none';
          el.style.willChange = 'left, top';
          document.body.style.userSelect = 'none';
          try {
            targetElement.setPointerCapture(e.pointerId);
            pointerCaptured = true;
          } catch {}
        }

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          const newX = Math.max(10, Math.min(window.innerWidth - rect.width - 10, initialX + dx));
          const newY = Math.max(10, Math.min(window.innerHeight - rect.height - 10, initialY + dy));
          currentX = newX;
          currentY = newY;
          el.style.left = `${newX}px`;
          el.style.top = `${newY}px`;
          el.style.right = 'auto';
          el.style.bottom = 'auto';
        });
      }
    };

    const handlePointerUp = () => {
      if (pointerCaptured) {
        try {
          targetElement.releasePointerCapture(e.pointerId);
        } catch {}
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      el.style.transition = '';
      el.style.willChange = '';
      document.body.style.userSelect = '';

      if (isDraggingRef.current) {
        setBtnPosition({ x: currentX, y: currentY });
        try {
          localStorage.setItem('orbital_ai_btn_pos', JSON.stringify({ x: currentX, y: currentY }));
        } catch {}
        setTimeout(() => {
          isDraggingRef.current = false;
          setIsDraggingBtn(false);
          dragDistRef.current = 0;
        }, 120);
      } else {
        // Direct tap or click: OPEN CHAT IMMEDIATELY!
        isDraggingRef.current = false;
        setIsDraggingBtn(false);
        openChatSafe();
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Chat Window Header Drag Handler (Zero-lag, 120 FPS butter-smooth)
  const handleHeaderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isMaximized) return;
    if ((e.target as HTMLElement).closest('button, input, select, a, .prevent-drag')) return;

    const windowEl = chatWindowRef.current;
    if (!windowEl) return;

    const captureTarget = e.currentTarget;
    try {
      captureTarget.setPointerCapture(e.pointerId);
    } catch {}

    const rect = windowEl.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = rect.left;
    const initialY = rect.top;
    let hasMoved = false;
    let currentX = initialX;
    let currentY = initialY;

    windowEl.style.transition = 'none';
    windowEl.style.willChange = 'left, top';
    document.body.style.userSelect = 'none';

    const handlePointerMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      if (!hasMoved && Math.hypot(dx, dy) > 3) {
        hasMoved = true;
        setIsDraggingWindow(true);
      }

      if (hasMoved) {
        if (windowRafRef.current) cancelAnimationFrame(windowRafRef.current);
        windowRafRef.current = requestAnimationFrame(() => {
          const newX = Math.max(8, Math.min(window.innerWidth - rect.width - 8, initialX + dx));
          const newY = Math.max(8, Math.min(window.innerHeight - rect.height - 8, initialY + dy));
          currentX = newX;
          currentY = newY;
          windowEl.style.left = `${newX}px`;
          windowEl.style.top = `${newY}px`;
          windowEl.style.right = 'auto';
          windowEl.style.bottom = 'auto';
        });
      }
    };

    const handlePointerUp = (ev: PointerEvent) => {
      try {
        captureTarget.releasePointerCapture(ev.pointerId);
      } catch {}
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      if (windowRafRef.current) cancelAnimationFrame(windowRafRef.current);

      windowEl.style.transition = '';
      windowEl.style.willChange = '';
      document.body.style.userSelect = '';

      if (hasMoved) {
        setWindowPosition({ x: currentX, y: currentY });
        try {
          localStorage.setItem('orbital_ai_window_pos', JSON.stringify({ x: currentX, y: currentY }));
        } catch {}
        setTimeout(() => setIsDraggingWindow(false), 50);
      } else {
        setIsDraggingWindow(false);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
  };

  const quickActions = [
    { label: 'What changed?', query: 'What changed here?' },
    { label: 'Compare dates', query: 'Compare the two dates' },
    { label: 'Confidence score', query: 'What is the confidence?' },
    { label: 'Coordinates', query: 'Give me the coordinate for this location' },
    { label: 'Satellite used', query: 'What satellite was used?' },
    { label: 'Observation dates', query: 'What are the dates?' },
    { label: 'Full analysis', query: 'Give me the full analysis' }
  ];

  return (
    <>
      {/* 1. MOVABLE & HIGH-VISIBILITY CUSTOMIZABLE LAUNCHER PILL */}
      {!isOpen && (
        <div
          ref={launcherRef}
          style={
            btnPosition.x !== undefined && btnPosition.y !== undefined
              ? { left: `${btnPosition.x}px`, top: `${btnPosition.y}px`, right: 'auto', bottom: 'auto' }
              : { right: '24px', bottom: '86px' }
          }
          className={`fixed z-[9999] flex items-center select-none group ${isDraggingBtn ? 'scale-105 opacity-90' : ''}`}
        >
          {/* Main Floating Badge */}
          <div
            role="button"
            tabIndex={0}
            onPointerDown={handleBtnPointerDown}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('.prevent-drag')) return;
              if (dragDistRef.current <= 7) {
                openChatSafe();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openChatSafe();
              }
            }}
            style={{
              boxShadow: `0 0 24px ${activeTheme.glowRgba}, 0 8px 24px rgba(0,0,0,0.65)`,
              borderColor: activeTheme.borderHex
            }}
            className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-full bg-[#080F1A]/95 border-2 text-white backdrop-blur-xl transition-[transform,colors] hover:scale-105 active:scale-95 shadow-2xl cursor-pointer"
            title="Orbital Intel AI (Click to Open • Drag anywhere to Move)"
            aria-label="Orbital Intel AI (Click to Open • Drag anywhere to Move)"
          >
            {/* Drag Handle Indicator */}
            <div
              className="text-white/40 group-hover:text-white/80 transition-colors pl-0.5"
              title="Drag to move anywhere"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>

            {/* Glowing Bot Icon with Pulsing Radar Ring */}
            <div
              style={{ backgroundColor: activeTheme.bgHex, borderColor: activeTheme.borderHex }}
              className="relative flex items-center justify-center w-7 h-7 rounded-full border shadow-inner shrink-0"
            >
              <Bot className="w-4 h-4" style={{ color: activeTheme.badgeHex }} />
              <span
                style={{ borderColor: activeTheme.badgeHex }}
                className="absolute inset-0 rounded-full animate-ping opacity-60 border"
              />
              <span
                style={{ backgroundColor: activeTheme.badgeHex }}
                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#080F1A]"
              />
            </div>

            {/* Label and Hint */}
            <div className="flex flex-col text-left pr-0.5 leading-tight">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold font-mono tracking-wide text-white drop-shadow-sm">
                  Orbital Intel AI
                </span>
                <span
                  style={{ color: activeTheme.textAccentHex, backgroundColor: activeTheme.bgHex }}
                  className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full uppercase"
                >
                  LIVE
                </span>
              </div>
              <span className="text-[10px] text-white/60 font-sans">
                Drag to move • Click to open
              </span>
            </div>

            {/* Palette / Color Customizer Trigger Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker((prev) => !prev);
              }}
              className="prevent-drag p-1 rounded-full hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer ml-0.5"
              title="Customize AI Color & Theme"
              aria-label="Customize AI Color & Theme"
            >
              <Palette className="w-3.5 h-3.5" style={{ color: activeTheme.badgeHex }} />
            </button>
          </div>

          {/* Color Customizer Popover Menu */}
          {showColorPicker && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="prevent-drag absolute bottom-full mb-2.5 right-0 bg-[#070D16]/95 border border-[#182A40] rounded-xl p-3 shadow-2xl backdrop-blur-xl flex flex-col space-y-2 z-50 min-w-[210px] animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-white/90 border-b border-[#182A40] pb-1.5">
                <span className="flex items-center space-x-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>AI Color Theme</span>
                </span>
                <button
                  onClick={() => setShowColorPicker(false)}
                  className="text-white/60 hover:text-white text-xs cursor-pointer px-1"
                >
                  ✕
                </button>
              </div>

              <div className="text-[10px] text-white/70">Choose high-visibility glow:</div>

              <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                {Object.values(AI_THEMES).map((thm) => (
                  <button
                    key={thm.id}
                    onClick={() => {
                      setCurrentThemeId(thm.id);
                      try {
                        localStorage.setItem('orbital_ai_theme', thm.id);
                      } catch {}
                    }}
                    title={thm.name}
                    style={{
                      backgroundColor: thm.badgeHex,
                      boxShadow: currentThemeId === thm.id ? `0 0 10px ${thm.badgeHex}` : 'none'
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      currentThemeId === thm.id
                        ? 'ring-2 ring-white scale-110 shadow-lg'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    {currentThemeId === thm.id && <Check className="w-3.5 h-3.5 text-[#070D16] stroke-[3]" />}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-white/70 pt-1 border-t border-[#182A40]/60">
                <span>Selected:</span>
                <span className="font-bold" style={{ color: activeTheme.textAccentHex }}>
                  {activeTheme.name}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. CHAT PANEL WINDOW (Draggable by header, Theme-styled) */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          style={
            !isMaximized && windowPosition.x !== undefined && windowPosition.y !== undefined
              ? {
                  left: `${windowPosition.x}px`,
                  top: `${windowPosition.y}px`,
                  right: 'auto',
                  bottom: 'auto',
                  borderColor: activeTheme.borderHex,
                  boxShadow: `0 0 26px ${activeTheme.glowRgba}, 0 20px 40px rgba(0, 0, 0, 0.75)`
                }
              : {
                  borderColor: activeTheme.borderHex,
                  boxShadow: `0 0 26px ${activeTheme.glowRgba}, 0 20px 40px rgba(0, 0, 0, 0.75)`
                }
          }
          className={`assistant-chat-window fixed z-[9999] flex flex-col bg-[#080F1A]/95 border-2 shadow-2xl backdrop-blur-xl font-sans text-text ${
            isDraggingWindow ? 'transition-none select-none' : 'transition-[opacity,transform] duration-150'
          } ${
            isMinimized
              ? 'bottom-4 right-4 w-72 sm:w-80 h-12 rounded-xl overflow-hidden'
              : isMaximized
              ? 'inset-2 sm:inset-4 w-auto h-auto rounded-xl'
              : windowPosition.x !== undefined && windowPosition.y !== undefined
              ? 'w-[calc(100vw-32px)] sm:w-[450px] h-[590px] max-h-[calc(100vh-40px)] rounded-xl'
              : 'bottom-4 right-4 w-[calc(100vw-32px)] sm:w-[450px] h-[590px] max-h-[calc(100vh-40px)] rounded-xl'
          }`}
        >
          {/* A. HEADER (Draggable on desktop) */}
          <div
            onPointerDown={handleHeaderPointerDown}
            className={`flex items-center justify-between px-3.5 py-2.5 bg-[#0B1523] border-b border-[#182A40] rounded-t-xl shrink-0 select-none ${
              !isMaximized ? (isDraggingWindow ? 'cursor-grabbing' : 'cursor-grab') : ''
            }`}
            title={!isMaximized ? 'Drag header to move window anywhere' : ''}
          >
            {/* Title & Status with Drag Grip */}
            <div className="flex items-center space-x-2.5 min-w-0">
              {!isMaximized && (
                <div className="text-white/40 hover:text-white/80 transition-colors" title="Drag to move">
                  <GripVertical className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                style={{ backgroundColor: activeTheme.bgHex, borderColor: activeTheme.borderHex }}
                className="w-7 h-7 rounded-lg border flex items-center justify-center shrink-0"
              >
                <Bot className="w-4 h-4" style={{ color: activeTheme.badgeHex }} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs font-bold text-white tracking-normal truncate">
                    Orbital Intel Assistant
                  </h3>
                  <span
                    style={{ color: activeTheme.textAccentHex, backgroundColor: activeTheme.bgHex }}
                    className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-bold"
                  >
                    {aiMode === 'LIVE_AI' ? 'Live AI' : 'Demo AI'}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-[10px] text-text-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeTheme.badgeHex }} />
                  <span className="truncate">Context: {context.aoi.name}</span>
                </div>
              </div>
            </div>

            {/* Header Control Buttons */}
            <div className="flex items-center space-x-1 shrink-0 text-text-2">
              {/* Palette / Theme Customizer Button */}
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-1 hover:text-white hover:bg-white/10 rounded transition cursor-pointer"
                title="Change AI theme color"
              >
                <Palette className="w-3.5 h-3.5" style={{ color: activeTheme.badgeHex }} />
              </button>

              {/* Reset Window Position button (if dragged) */}
              {windowPosition.x !== undefined && (
                <button
                  onClick={() => {
                    setWindowPosition({ x: undefined, y: undefined });
                    try {
                      localStorage.removeItem('orbital_ai_window_pos');
                    } catch {}
                  }}
                  className="p-1 hover:text-white hover:bg-white/10 rounded transition cursor-pointer"
                  title="Reset window position to bottom-right"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Clear History */}
              <button
                onClick={handleClearChat}
                className="p-1 hover:text-white hover:bg-white/10 rounded transition cursor-pointer"
                title="Clear conversation history"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Minimize / Restore */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:text-white hover:bg-white/10 rounded transition cursor-pointer"
                title={isMinimized ? 'Restore chat window' : 'Minimize chat window'}
              >
                {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Maximize / Normal */}
              {!isMinimized && (
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-1 hover:text-white hover:bg-white/10 rounded transition cursor-pointer hidden sm:block"
                  title={isMaximized ? 'Dock window' : 'Expand window'}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:text-red-400 hover:bg-white/10 rounded transition cursor-pointer"
                title="Close Orbital Intel Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Theme Palette Bar inside chat when toggled */}
          {showColorPicker && (
            <div className="px-3.5 py-2 bg-[#060D17] border-b border-[#182A40] flex items-center justify-between animate-in fade-in duration-150">
              <div className="flex items-center space-x-2 text-[10px] text-white/80 font-mono">
                <Palette className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>AI Theme Color:</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {Object.values(AI_THEMES).map((thm) => (
                  <button
                    key={thm.id}
                    onClick={() => {
                      setCurrentThemeId(thm.id);
                      try {
                        localStorage.setItem('orbital_ai_theme', thm.id);
                      } catch {}
                    }}
                    title={thm.name}
                    style={{ backgroundColor: thm.badgeHex }}
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      currentThemeId === thm.id ? 'ring-2 ring-white scale-110 shadow' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    {currentThemeId === thm.id && <Check className="w-3 h-3 text-[#070D16] stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* If minimized, hide body and show mini prompt */}
          {!isMinimized && (
            <>
              {/* B. ANALYST CONTEXT BAR & SUBHEADER CONTROLS */}
              <div className="px-3 py-1.5 bg-bg border-b border-border flex flex-wrap items-center justify-between gap-1.5 text-[10px] shrink-0 font-sans">
                {/* Active AOI Tag */}
                <div className="flex items-center space-x-1.5 text-text truncate max-w-[210px] sm:max-w-[260px]">
                  <MapPin className="w-3 h-3 text-accent shrink-0" />
                  <span className="font-medium truncate">{context.aoi.name}</span>
                  <span className="text-text-2 font-mono text-[9px] shrink-0 hidden sm:inline">
                    ({context.imagery.sensor.split(' ')[0]})
                  </span>
                </div>

                {/* Right controls: Language + Analyst Mode Toggle */}
                <div className="flex items-center space-x-2 ml-auto">
                  {/* Language Selector */}
                  <div className="flex items-center bg-surface border border-border rounded p-0.5">
                    <button
                      onClick={() => setLanguage('en')}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition cursor-pointer ${
                        language === 'en' ? 'bg-raised text-accent font-semibold' : 'text-text-2 hover:text-text'
                      }`}
                      title="English language"
                    >
                      EN
                    </button>
                    <button
                      onClick={() => setLanguage('hi')}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition cursor-pointer ${
                        language === 'hi' ? 'bg-raised text-accent font-semibold' : 'text-text-2 hover:text-text'
                      }`}
                      title="हिन्दी (Hindi)"
                    >
                      हिन्दी
                    </button>
                    <button
                      onClick={() => setLanguage('bn')}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition cursor-pointer ${
                        language === 'bn' ? 'bg-raised text-accent font-semibold' : 'text-text-2 hover:text-text'
                      }`}
                      title="বাংলা (Bengali)"
                    >
                      বাংলা
                    </button>
                  </div>

                  {/* Analyst Mode Toggle */}
                  <button
                    onClick={() => setAnalystMode(!analystMode)}
                    className={`px-2 py-0.5 rounded border text-[9px] font-mono uppercase transition flex items-center space-x-1 cursor-pointer ${
                      analystMode
                        ? 'bg-raised border-accent text-accent font-medium'
                        : 'bg-surface border-border text-text-2 hover:text-text'
                    }`}
                    title="Toggle Analyst Mode"
                  >
                    <Shield className="w-2.5 h-2.5" />
                    <span>Analyst Mode</span>
                  </button>
                </div>
              </div>

              {/* C. QUICK ACTION CAROUSEL */}
              <div className="px-3 py-1.5 bg-bg/60 border-b border-border overflow-x-auto no-scrollbar flex items-center space-x-1.5 shrink-0">
                {quickActions.map((qa) => (
                  <button
                    key={qa.label}
                    onClick={() => handleSendMessage(qa.query)}
                    className="whitespace-nowrap px-2 py-0.5 rounded bg-surface hover:bg-raised border border-border text-[10px] text-text-2 hover:text-text transition cursor-pointer flex items-center space-x-1 shrink-0"
                  >
                    <span>{qa.label}</span>
                  </button>
                ))}
              </div>

              {/* D. MESSAGES SCROLL CONTAINER */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 min-h-0 text-xs font-sans">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  const isEvidenceExpanded = !!expandedEvidenceIds[msg.id];

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
                    >
                      {/* Sender Tag & Timestamp */}
                      <div className="flex items-center space-x-1.5 text-[10px] text-[#64748B] mb-1 px-1">
                        {!isUser && <Bot className="w-3 h-3 text-[#00E5FF]" />}
                        <span className="font-semibold text-[#94A3B8]">
                          {isUser ? 'Analyst' : 'Orbital Intel Assistant'}
                        </span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                        {msg.isAnalystMode && (
                          <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono text-[8px]">
                            STRUCTURED
                          </span>
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`relative max-w-[92%] sm:max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-lg ${
                          isUser
                            ? 'bg-[#0284C7] text-white rounded-tr-xs font-medium'
                            : msg.isError
                            ? 'bg-red-950/40 border border-red-500/40 text-red-200 rounded-tl-xs'
                            : 'bg-[#0E1A2B] border border-[#182A40] text-[#E2E8F0] rounded-tl-xs'
                        }`}
                      >
                        {/* Text Content with Markdown Formatting */}
                        <div className="whitespace-pre-line break-words space-y-1">
                          {msg.text.split('\n\n').map((para, idx) => (
                            <p key={idx} className="leading-relaxed">
                              {para.split('**').map((part, pIdx) =>
                                pIdx % 2 === 1 ? (
                                  <strong key={pIdx} className="text-[#00E5FF] font-bold">
                                    {part}
                                  </strong>
                                ) : (
                                  part
                                )
                              )}
                            </p>
                          ))}
                        </div>

                        {/* Interactive UI Action Button in message */}
                        {msg.uiAction && (
                          <div className="mt-2.5 pt-2 border-t border-[#182A40]/80 flex flex-wrap gap-2">
                            {msg.uiAction.type === 'SET_VIEW_MODE' && (
                              <button
                                onClick={() => onExecuteUIAction?.(msg.uiAction!)}
                                className="px-2.5 py-1 rounded-md bg-[#00E5FF]/20 border border-[#00E5FF] text-[#00E5FF] font-mono text-[10px] font-bold hover:bg-[#00E5FF]/30 transition cursor-pointer flex items-center space-x-1"
                              >
                                <Sliders className="w-3 h-3" />
                                <span>Switch View: {msg.uiAction.payload}</span>
                              </button>
                            )}

                            {msg.uiAction.type === 'VIEW_FULL_REPORT' && (
                              <button
                                onClick={() => onViewFullReport?.()}
                                className="px-3 py-1 rounded-md bg-[#10B981]/20 border border-[#10B981] text-[#10B981] font-sans text-[10px] font-bold hover:bg-[#10B981]/30 transition cursor-pointer flex items-center space-x-1.5 shadow"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Generate Full Report Dossier</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            )}

                            {msg.uiAction.type === 'SET_SPECTRAL_MODE' && (
                              <button
                                onClick={() => onExecuteUIAction?.(msg.uiAction!)}
                                className="px-2.5 py-1 rounded-md bg-[#10B981]/20 border border-[#10B981] text-[#10B981] font-mono text-[10px] font-bold hover:bg-[#10B981]/30 transition cursor-pointer flex items-center space-x-1"
                              >
                                <Layers className="w-3 h-3" />
                                <span>Active Filter: {msg.uiAction.payload}</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Expandable Evidence Section (If Available) */}
                        {msg.evidence && msg.evidence.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-[#182A40]/60">
                            <button
                              onClick={() =>
                                setExpandedEvidenceIds((prev) => ({
                                  ...prev,
                                  [msg.id]: !prev[msg.id]
                                }))
                              }
                              className="text-[10px] text-[#38BDF8] hover:text-white flex items-center space-x-1 cursor-pointer font-mono font-medium"
                            >
                              <span>Geospatial Evidence ({msg.evidence.length} points)</span>
                              {isEvidenceExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>

                            {isEvidenceExpanded && (
                              <div className="mt-1.5 grid grid-cols-2 gap-1.5 p-2 bg-[#070D16] border border-[#182A40] rounded-lg text-[9px] font-mono animate-in fade-in duration-200">
                                {msg.evidence.map((ev, i) => (
                                  <div key={i} className="flex flex-col">
                                    <span className="text-[#64748B] uppercase">{ev.label}</span>
                                    <span className="text-white font-bold truncate">{ev.value}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Copy / Action Toolbar for Assistant message */}
                        {!isUser && (
                          <div className="mt-1.5 flex items-center justify-end space-x-1 text-[#64748B] pt-1">
                            <button
                              onClick={() => handleCopyText(msg.id, msg.text)}
                              className="p-1 hover:text-white transition cursor-pointer"
                              title="Copy response to clipboard"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3 h-3 text-[#10B981]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                            <button
                              onClick={() => handleSendMessage(messages[messages.length - 2]?.text || 'Explain again')}
                              className="p-1 hover:text-white transition cursor-pointer"
                              title="Regenerate response"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Follow-up question pills */}
                      {msg.suggestedFollowUps && !isUser && (
                        <div className="flex flex-wrap gap-1 mt-1.5 ml-1 max-w-[85%]">
                          {msg.suggestedFollowUps.map((fu, fIdx) => (
                            <button
                              key={fIdx}
                              onClick={() => handleSendMessage(fu)}
                              className="text-[9px] px-2 py-0.5 rounded-full bg-[#0B1523] hover:bg-[#15273F] text-[#94A3B8] hover:text-[#00E5FF] border border-[#182A40] transition cursor-pointer"
                            >
                              + {fu}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Animated Typing Indicator */}
                {isTyping && (
                  <div className="flex items-start space-y-1">
                    <div className="bg-[#0E1A2B] border border-[#182A40] rounded-2xl rounded-tl-xs px-3.5 py-2.5 flex items-center space-x-1.5 text-xs text-[#94A3B8]">
                      <Bot className="w-3.5 h-3.5 text-[#00E5FF] animate-spin" />
                      <span className="font-mono text-[10px]">Analyzing satellite context</span>
                      <span className="w-1 h-1 rounded-full bg-[#00E5FF] animate-bounce" />
                      <span className="w-1 h-1 rounded-full bg-[#00E5FF] animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1 h-1 rounded-full bg-[#00E5FF] animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* E. FIXED BOTTOM INPUT BAR */}
              <div className="p-3 bg-surface border-t border-border rounded-b-md shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center space-x-1.5"
                >
                  {/* Microphone Speech Input */}
                  {hasSpeech && (
                    <button
                      type="button"
                      onClick={toggleSpeechRecognition}
                      className={`p-2 rounded border transition cursor-pointer ${
                        isListening
                          ? 'bg-flag/20 border-flag text-flag'
                          : 'bg-bg border-border text-text-2 hover:text-text hover:border-text-2'
                      }`}
                      title={isListening ? 'Stop listening' : 'Speak your question'}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}

                  {/* Text Input Field */}
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      placeholder={
                        language === 'hi'
                          ? 'इस उपग्रह दृश्य के बारे में पूछें...'
                          : language === 'bn'
                          ? 'এই স্যাটেলাইট চিত্র সম্পর্কে জিজ্ঞাসা করুন...'
                          : 'Ask about this satellite imagery...'
                      }
                      className="w-full bg-bg border border-border focus:border-accent focus:outline-none rounded px-3 py-1.5 text-xs text-text placeholder-text-2/60 transition font-sans"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!inputQuery.trim() || isTyping}
                    style={{ backgroundColor: activeTheme.buttonHex }}
                    className="p-2 rounded hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg transition cursor-pointer flex items-center justify-center shrink-0 font-medium"
                    title="Send query"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                {/* AI Assistant Disclaimer: Compact and muted */}
                <div className="mt-1.5 text-center text-[11px] text-text-2 font-sans select-none">
                  AI-assisted detection. Analyst verification required.
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
