'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';

const SUGGESTED_QUESTIONS = [
  'When does the school day start and end?',
  'How do I report my child\'s absence?',
  'What is the school uniform policy?',
  'When are the school holidays?',
  'How do I contact my child\'s teacher?',
];

function CrossIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
      <rect x="17" y="2" width="6" height="36" rx="2" fill="white" />
      <rect x="2" y="14" width="36" height="6" rx="2" fill="white" />
    </svg>
  );
}

function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-school-teal flex items-center justify-center flex-shrink-0">
      <CrossIcon />
    </div>
  );
}

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
  });

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSuggestion(q: string) {
    handleInputChange({ target: { value: q } } as React.ChangeEvent<HTMLInputElement>);
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      {/* Header */}
      <header className="bg-school-teal text-white px-4 py-4 flex items-center gap-3 shadow-md flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-school-teal-dark flex items-center justify-center flex-shrink-0">
          <CrossIcon />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">School Parent Assistant</h1>
          <p className="text-sm text-teal-100">Ask me anything about school</p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <BotAvatar />
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-sm">
                <p className="text-gray-700 text-sm">
                  Hi! I&apos;m the school parent assistant. I can help you find information from school
                  policies, newsletters, and updates. What would you like to know?
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 flex-shrink-0" />
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => handleSuggestion(q)}
                    className="text-xs bg-school-teal-light text-school-teal-dark border border-school-teal/30 rounded-full px-3 py-1.5 hover:bg-school-teal/20 transition-colors text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map(m => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {m.role === 'assistant' && <BotAvatar />}

            <div
              className={`rounded-2xl px-4 py-3 max-w-sm shadow-sm text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-school-teal text-white rounded-tr-sm'
                  : 'bg-white text-gray-700 rounded-tl-sm'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <BotAvatar />
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-5">
                <span className="w-2 h-2 rounded-full bg-school-teal animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-school-teal animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-school-teal animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-center text-sm text-red-500">Something went wrong. Please try again.</p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-white px-4 py-3 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about school policies, events, news…"
            disabled={isLoading}
            className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-teal/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-school-teal text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-school-teal-dark transition-colors disabled:opacity-40 flex-shrink-0"
            aria-label="Send"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-2">
          Answers are based on official school documents only.
        </p>
      </div>
    </div>
  );
}
