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
  FileText
} from 'lucide-react';
import {
  AnalysisContext,
  ChatMessage,
  AssistantLanguage,
  UIActionTrigger
} from '../../types/assistant';
import { vigilAssistantService } from '../../services/VigilAssistantService';

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

  // Initial welcome greeting
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Welcome to **VIGIL Assistant** — your AI geospatial intelligence copilot.\n\nContext loaded for **${context.aoi.name}**.\n\nAsk any question about this satellite imagery, or select a quick action below.`,
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
      {/* 1. COMPACT LAUNCHER BUTTON (Bottom-Right, safe offset z-40) */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-5 right-5 z-40 flex items-center space-x-2 px-3 py-2 rounded-md bg-surface border border-border text-text shadow-subtle hover:bg-raised transition-colors duration-150 cursor-pointer font-sans group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          title="Open VIGIL Assistant"
          aria-label="Open VIGIL Assistant"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-4 h-4 text-accent" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-ok" />
          </div>
          <span className="text-xs font-semibold font-mono text-text">
            VIGIL AI
          </span>
        </button>
      )}

      {/* 2. CHAT PANEL WINDOW */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-200 flex flex-col bg-surface border border-border shadow-subtle font-sans text-text ${
            isMinimized
              ? 'bottom-4 right-4 w-72 sm:w-80 h-12 rounded-md overflow-hidden'
              : isMaximized
              ? 'bottom-2 right-2 left-2 top-2 sm:bottom-4 sm:right-4 sm:left-auto sm:top-auto sm:w-[680px] sm:h-[760px] max-w-[calc(100vw-16px)] max-h-[calc(100vh-16px)] rounded-md'
              : 'bottom-4 right-4 w-[calc(100vw-32px)] sm:w-[440px] h-[590px] max-h-[calc(100vh-40px)] rounded-md'
          }`}
        >
          {/* A. HEADER */}
          <div className="flex items-center justify-between px-3 py-2 bg-surface border-b border-border rounded-t-md shrink-0 select-none">
            {/* Title & Status */}
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-6 h-6 rounded bg-raised border border-border flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-accent" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs font-semibold text-text tracking-normal truncate">
                    VIGIL Assistant
                  </h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-raised border border-border text-text-2">
                    {aiMode === 'LIVE_AI' ? 'Live AI' : 'Demo AI'}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-[10px] text-text-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-ok" />
                  <span className="truncate">Context: {context.aoi.name}</span>
                </div>
              </div>
            </div>

            {/* Header Control Buttons */}
            <div className="flex items-center space-x-1 shrink-0 text-text-2">
              {/* Clear History */}
              <button
                onClick={handleClearChat}
                className="p-1 hover:text-text hover:bg-raised rounded transition cursor-pointer"
                title="Clear conversation history"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Minimize / Restore */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:text-text hover:bg-raised rounded transition cursor-pointer"
                title={isMinimized ? 'Restore chat window' : 'Minimize chat window'}
              >
                {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Maximize / Normal (Only when not minimized) */}
              {!isMinimized && (
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-1 hover:text-text hover:bg-raised rounded transition cursor-pointer hidden sm:block"
                  title={isMaximized ? 'Dock window' : 'Expand window'}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:text-flag hover:bg-raised rounded transition cursor-pointer"
                title="Close VIGIL Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

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
                          {isUser ? 'Analyst' : 'VIGIL Assistant'}
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
                    className="p-2 rounded bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-[#0E1116] shadow-subtle transition cursor-pointer flex items-center justify-center shrink-0 font-medium"
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
