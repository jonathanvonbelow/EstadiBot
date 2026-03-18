import React, { useState, useEffect, useRef } from 'react';
import { UnitId, Message } from '../types';
import { UNITS } from '../constants';
import { initChat, sendMessageToGemini } from '../services/geminiService';
import { Send, Bot, User, Loader2, RefreshCw, Sparkles, BookOpen, MessageSquare, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatInterfaceProps {
  currentUnit: UnitId;
  initialMessage?: string;
  onMessageSent?: () => void;
}

// Custom components to style tables like spreadsheets (Grid view)
// Using explicit borders on all cells to mimic Excel/Sheets
const markdownComponents = {
  table: ({ node, ...props }: any) => (
    <div className="overflow-x-auto my-4 shadow-sm">
      <table className="min-w-full border-collapse border border-slate-400 text-sm bg-white" {...props} />
    </div>
  ),
  thead: ({ node, ...props }: any) => (
    <thead className="bg-slate-100" {...props} />
  ),
  tbody: ({ node, ...props }: any) => (
    <tbody {...props} />
  ),
  tr: ({ node, ...props }: any) => (
    <tr className="hover:bg-slate-50 transition-colors" {...props} />
  ),
  th: ({ node, ...props }: any) => (
    <th className="border border-slate-400 px-4 py-2 text-left font-bold text-slate-800 bg-slate-100" {...props} />
  ),
  td: ({ node, ...props }: any) => (
    <td className="border border-slate-400 px-4 py-2 text-slate-700 align-top" {...props} />
  ),
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentUnit, initialMessage, onMessageSent }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTheory, setShowTheory] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const unitInfo = UNITS.find(u => u.id === currentUnit);

  const getWelcomeMessage = (): Message => ({
    id: 'welcome',
    role: 'model',
    content: `¡Hola! Soy tu **EstadísticaBot**. Estoy aquí para ayudarte con **${unitInfo?.title}**.\n\n¿En qué puedo orientarte hoy?`,
    timestamp: Date.now()
  });

  // Initialize chat when unit changes
  useEffect(() => {
    const initialize = async () => {
      setMessages([getWelcomeMessage()]);
      await initChat(unitInfo?.title || "Estadística General");
      setShowTheory(false);
    };
    initialize();
  }, [currentUnit, unitInfo]);

  // Handle initial message from Examples tab
  useEffect(() => {
    if (initialMessage) {
      setInputValue(initialMessage);
      setShowTheory(false);
    }
  }, [initialMessage]);

  // Scroll to bottom
  useEffect(() => {
    if (!showTheory) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showTheory]);

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    if (onMessageSent) onMessageSent();
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(userMsg.content, unitInfo?.title);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 128) + 'px';
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Unit Header context with Toggle */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-col md:flex-row md:items-center justify-between shadow-sm z-10 gap-3">
        <div>
          <h2 className="font-semibold text-slate-800">{unitInfo?.title}</h2>
          <p className="text-xs text-slate-500 truncate max-w-md">{unitInfo?.description}</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg shrink-0 self-start md:self-auto">
             <button
               onClick={() => setShowTheory(false)}
               className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${!showTheory ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <MessageSquare size={14} /> Chat
             </button>
             <button
               onClick={() => setShowTheory(true)}
               className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${showTheory ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <BookOpen size={14} /> Material de Estudio
             </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative">
          
          {/* THEORY VIEW */}
          {showTheory && (
              <div className="p-6 md:p-10 max-w-4xl mx-auto bg-white min-h-full animate-fade-in shadow-sm">
                  <article className="prose prose-emerald max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-p:text-slate-600 prose-li:text-slate-600">
                      <ReactMarkdown 
                        components={markdownComponents} 
                        remarkPlugins={[remarkGfm]}
                      >
                        {unitInfo?.content || ''}
                      </ReactMarkdown>
                  </article>
                  <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                      <p className="text-sm text-slate-500 mb-4">¿Tienes dudas sobre este contenido?</p>
                      <button 
                          onClick={() => setShowTheory(false)}
                          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
                      >
                          <MessageSquare size={16} /> Preguntar al Bot
                      </button>
                  </div>
              </div>
          )}

          {/* CHAT VIEW */}
          {!showTheory && (
              <div className="p-4 md:p-6 space-y-6 min-h-full">
                {messages.map((msg) => (
                <div 
                    key={msg.id} 
                    className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                    <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center shrink-0
                    ${msg.role === 'model' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}
                    `}>
                    {msg.role === 'model' ? <Bot size={18} /> : <User size={18} />}
                    </div>
                    
                    <div className={`
                    max-w-[95%] md:max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm group relative
                    ${msg.role === 'model'
                        ? 'bg-white border border-slate-200 text-slate-800'
                        : 'bg-emerald-600 text-white'}
                    `}>
                    {msg.role === 'model' ? (
                        <>
                          <div className="prose prose-sm max-w-none prose-emerald">
                            <ReactMarkdown
                              components={markdownComponents}
                              remarkPlugins={[remarkGfm]}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                          {msg.id !== 'welcome' && (
                            <button
                              onClick={() => handleCopy(msg.id, msg.content)}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-slate-100"
                              title="Copiar respuesta"
                            >
                              {copiedId === msg.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            </button>
                          )}
                        </>
                    ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                    </div>
                </div>
                ))}

                {/* Suggested Topics */}
                {messages.length === 1 && unitInfo?.topics && (
                <div className="pl-12 pr-4 animate-fade-in">
                    <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <Sparkles size={14} />
                    <span>Temas Sugeridos</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {unitInfo.topics.map((topic, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSendMessage(`Explícame sobre: ${topic} en el contexto de la unidad.`)}
                            className="bg-white border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full text-xs hover:bg-emerald-50 hover:border-emerald-300 transition-colors shadow-sm"
                        >
                            {topic}
                        </button>
                        ))}
                    </div>
                </div>
                )}

                {isLoading && (
                <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Bot size={18} />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
                        <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                </div>
                )}
                <div ref={messagesEndRef} />
              </div>
          )}
      </div>

      {/* Input Area - Only show in Chat Mode */}
      {!showTheory && (
        <div className="bg-white p-4 border-t border-slate-200 shrink-0">
            <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-slate-50 border border-slate-300 rounded-xl p-2 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all shadow-sm">
            <textarea
                ref={textareaRef}
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 py-2 px-2 text-slate-800 placeholder-slate-400 text-sm"
                placeholder="Escribe tu consulta... (Enter para enviar, Shift+Enter para nueva línea)"
                rows={1}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                style={{ minHeight: '44px' }}
            />
            <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className={`
                p-2 rounded-lg mb-0.5 transition-all
                ${!inputValue.trim() || isLoading 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'}
                `}
            >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
            </div>
            <div className="flex justify-between items-center mt-2 px-1">
                 <button
                    onClick={() => {
                        setMessages([getWelcomeMessage()]);
                        initChat(unitInfo?.title || "General");
                    }}
                    className="text-xs text-slate-400 hover:text-emerald-600 flex items-center gap-1 transition-colors"
                 >
                    <RefreshCw size={12} /> Reiniciar chat
                 </button>
                <p className="text-center text-xs text-slate-400">
                    Verifica la información con la bibliografía de la cátedra.
                </p>
                <div className="w-8"></div> {/* Spacer for alignment */}
            </div>
        </div>
      )}
    </div>
  );
};