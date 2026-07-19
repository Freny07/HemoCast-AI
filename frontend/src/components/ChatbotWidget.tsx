import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, MessageSquare, Sparkles, AlertTriangle, Database } from 'lucide-react';
import { api } from '../api';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  data?: any[];
  intent?: string;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Hello! I am HemoCast AI's assistant. 🩸\n\nI can check live stock availability, upcoming demand forecasts, and expiry alerts directly from the database. Try asking me one of the options below!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Are there any platelets expiring tomorrow?",
    "What is our AB- stock?",
    "Tell me about the O+ demand forecast",
    "How does the emergency SOS button work?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Append User Message
    const userMsg: Message = { sender: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Call API
      const res = await api.chatbotQuery(text);
      const botMsg: Message = {
        sender: 'bot',
        text: res.reply,
        timestamp: new Date(),
        data: res.data || undefined,
        intent: res.intent || undefined
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: "Sorry, I ran into an error connecting to the predictive engine. Please try again.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-crimson-600 hover:bg-crimson-700 text-white flex items-center justify-center shadow-lg shadow-crimson-900/40 border border-crimson-500 hover:scale-105 transition-all duration-300 group"
        >
          <Bot className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse"></span>
        </button>
      )}

      {/* Expanded Chat Dialog */}
      {isOpen && (
        <div className="w-96 h-[500px] rounded-2xl glass-panel-heavy shadow-2xl border border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          {/* Header */}
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-crimson-600/10 flex items-center justify-center border border-crimson-600/30">
                <Bot className="w-5 h-5 text-crimson-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">HemoCast AI Assistant</h3>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Predictive Engine Connected
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Chat Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-crimson-600 text-white rounded-tr-none'
                      : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-tl-none'
                  }`}
                >
                  <p className="white-space-pre-wrap">{msg.text}</p>

                  {/* Render Table/Data if available */}
                  {msg.data && msg.data.length > 0 && (
                    <div className="mt-3 border border-slate-700/80 rounded-xl overflow-hidden bg-slate-900/60">
                      <table className="w-full text-[10px] text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-800 text-slate-400 border-b border-slate-700/80">
                            <th className="p-2">Group</th>
                            {msg.intent === 'platelet_expiry' ? (
                              <th className="p-2">Expiry</th>
                            ) : (
                              <th className="p-2">Component</th>
                            )}
                            <th className="p-2 text-right">Units</th>
                          </tr>
                        </thead>
                        <tbody>
                          {msg.data.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-800/40 text-slate-300">
                              <td className="p-2 font-bold text-crimson-400">{item.blood_group}</td>
                              {msg.intent === 'platelet_expiry' ? (
                                <td className="p-2 font-mono">{item.expiry}</td>
                              ) : (
                                <td className="p-2 text-slate-400">{item.component}</td>
                              )}
                              <td className="p-2 text-right font-semibold text-white">{item.units}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400">
                <Bot className="w-4 h-4 animate-bounce text-crimson-500" />
                <span className="text-[10px] font-medium animate-pulse">Analyzing forecasting database...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions (if no user messages sent yet) */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-900/30">
              <p className="text-[10px] text-slate-500 font-semibold mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-crimson-500" /> Suggested Queries:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    className="text-[10px] text-left text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-700 border border-slate-700/60 rounded-lg px-2.5 py-1.5 transition-colors duration-150"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 bg-slate-900/90 border-t border-slate-800 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about platelets, stock, or forecasts..."
              className="flex-1 bg-slate-800/70 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-crimson-600 focus:ring-1 focus:ring-crimson-600 transition-all duration-200"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-crimson-600 hover:bg-crimson-700 disabled:bg-slate-800 text-white flex items-center justify-center transition-colors shadow-md disabled:shadow-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
