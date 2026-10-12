import React, { useState } from 'react';
import { Bot, Send, Sparkles, X, Loader2, Code2, Terminal, Cpu } from 'lucide-react';
import { askCopilot } from '../services/api';
import { Diagnostic, OptimizationRemark } from '../types/compiler';

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCode?: string;
  activeRemarks?: OptimizationRemark[];
  activeDiagnostics?: Diagnostic[];
  activeIr?: string;
  activeAssembly?: string;
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  isOpen,
  onClose,
  activeCode,
  activeRemarks,
  activeDiagnostics,
  activeIr,
  activeAssembly,
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    {
      sender: 'assistant',
      text: 'Hello! I am **Compiler Copilot**, your LLVM optimization assistant. Ask me to explain vectorization remarks, analyze missed SIMD loops, decode LLVM IR, or suggest cache locality improvements.',
    },
  ]);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userText = prompt.trim();
    setPrompt('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await askCopilot(userText, {
        sourceCode: activeCode,
        remarks: activeRemarks,
        diagnostics: activeDiagnostics,
        llvmIr: activeIr,
        assembly: activeAssembly,
      });

      setMessages((prev) => [...prev, { sender: 'assistant', text: res.explanation }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `⚠️ **Copilot Error:** ${err.message || 'Failed to query assistant.'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (q: string) => {
    setPrompt(q);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl font-sans">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-100 border border-blue-200 text-blue-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              Compiler Copilot <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">LLVM 14</span>
            </h3>
            <p className="text-xs text-slate-500">Contextual C++ & LLVM Optimization AI</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Context Badge Banner */}
      <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-blue-700 font-semibold">
          <Code2 className="w-3.5 h-3.5 text-blue-600" />
          {activeCode ? 'Source Loaded' : 'No Source Selected'}
        </span>
        <span className="flex items-center gap-1 font-mono text-[11px] text-emerald-700 font-semibold">
          <Cpu className="w-3.5 h-3.5" />
          {activeRemarks?.length || 0} Compiler Remarks
        </span>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm bg-slate-50">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-800 border border-slate-200 shadow-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Analyzing compiler diagnostics and LLVM pass tree...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Questions */}
      <div className="p-3 bg-white border-t border-slate-200 space-y-2">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Quick Inquiries</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleQuickQuestion('Why did LLVM fail or succeed in vectorizing this loop?')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors cursor-pointer"
          >
            Why vectorized/missed?
          </button>
          <button
            onClick={() => handleQuickQuestion('How does pointer aliasing affect vectorization in this code?')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors cursor-pointer"
          >
            Pointer aliasing check
          </button>
          <button
            onClick={() => handleQuickQuestion('Suggest C++ optimizations to improve cache locality.')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors cursor-pointer"
          >
            Cache & SIMD advice
          </button>
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask Copilot about compiler decisions..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
