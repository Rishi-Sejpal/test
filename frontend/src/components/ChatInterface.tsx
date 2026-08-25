'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { ChatMessage, ChatRequest, Vertical, ScorecardResponse } from '@/types';
import { sendChatMessage } from '@/lib/api';
import { cn, formatVertical, getGradeColor, getPriorityColor, formatCategory, generateSessionId } from '@/lib/utils';
import { exportScorecardToPDF } from '@/lib/pdf';
import ScorecardView from './ScorecardView';

interface ChatInterfaceProps {
  initialVertical?: Vertical;
}

export default function ChatInterface({ initialVertical }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vertical, setVertical] = useState<Vertical | null>(initialVertical || null);
  const [scorecard, setScorecard] = useState<ScorecardResponse | null>(null);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [sessionId] = useState(() => generateSessionId());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, scorecard, interviewComplete]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);
    setIsLoading(true);

    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);

    try {
      const request: ChatRequest = {
        message: userMessage,
        conversation_history: messages,
        vertical,
        session_id: sessionId,
      };

      const response = await sendChatMessage(request);

      if (response.scorecard) {
        setScorecard(response.scorecard);
        setInterviewComplete(true);
        setVertical(response.scorecard.vertical);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerticalSelect = (selectedVertical: Vertical) => {
    setVertical(selectedVertical);
    const msg = `I'll tailor the assessment for **${formatVertical(selectedVertical)}**. Let's begin.`;
    setMessages(prev => [...prev, { role: 'user', content: selectedVertical }, { role: 'assistant', content: msg }]);
  };

  const handleRestart = () => {
    setMessages([]);
    setVertical(null);
    setScorecard(null);
    setInterviewComplete(false);
    setError(null);
  };

  const handleDownloadPDF = async () => {
    if (!scorecard) return;
    try {
      await exportScorecardToPDF(scorecard, 'scorecard-content');
    } catch (err) {
      setError('Failed to generate PDF');
    }
  };

  if (!vertical && !interviewComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <img src="/images/logo.svg" alt="CyberCISO" className="w-24 h-24 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">CyberCISO</h1>
            <p className="text-gray-600 mt-2">Virtual CISO for Small Business</p>
          </div>
          <p className="text-gray-600 mb-6 text-center">
            Select your business vertical to begin a tailored cybersecurity assessment.
          </p>
          <div className="space-y-3">
            {(['retail', 'healthcare_clinic', 'professional_services'] as Vertical[]).map(v => (
              <button
                key={v}
                onClick={() => handleVerticalSelect(v)}
                className="w-full p-4 text-left border border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-colors group"
              >
                <div className="font-medium text-gray-900 group-hover:text-primary-600">
                  {formatVertical(v)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {v === 'retail' && 'POS, inventory, payment networks, seasonal staff'}
                  {v === 'healthcare_clinic' && 'EHR, PHI, HIPAA, medical devices, BAAs'}
                  {v === 'professional_services' && 'Client data, cloud services, IP protection, encrypted comms'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (interviewComplete && scorecard) {
    return (
      <div id="scorecard-content" className="min-h-screen bg-gray-50">
        <ScorecardView
          scorecard={scorecard}
          onRestart={handleRestart}
          onDownloadPDF={handleDownloadPDF}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/logo.svg" alt="CyberCISO" className="w-10 h-10" />
            <div>
              <h1 className="font-bold text-gray-900">CyberCISO</h1>
              <p className="text-xs text-gray-500">Virtual CISO Assessment</p>
            </div>
          </div>
          {vertical && (
            <span className="px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-full">
              {formatVertical(vertical)}
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn('flex gap-3', msg.role === 'user' && 'justify-end')}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3',
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-md'
                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md shadow-sm'
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-sm">
                <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                <span className="text-gray-500 text-sm">CyberCISO is thinking...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex gap-3 justify-center">
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-gray-200 pt-4 bg-white sticky bottom-0">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your response..."
              disabled={isLoading}
              rows={1}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none max-h-32"
              aria-label="Chat input"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                'px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                'bg-primary-600 text-white hover:bg-primary-700'
              )}
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </main>
    </div>
  );
}