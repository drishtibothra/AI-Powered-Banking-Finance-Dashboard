import { useState, useRef, useEffect } from "react";
import type { FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Send, Sparkles } from "lucide-react";
import type { AppDispatch, RootState } from "../app/store";
import { sendMessage, addUserMessage } from "../features/aiChat/aiChatSlice";

const suggestedPrompts = [
  "How much did I spend on Goa stuff?",
  "Can I afford a ₹50,000 trip in September?",
  "How does my food spending compare to last month?",
  "Is anything unusual about my spending this month?",
];

export default function ChatPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { messages, isSending, error } = useSelector((state: RootState) => state.aiChat);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSend = (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || isSending) return;
    dispatch(addUserMessage(message));
    dispatch(sendMessage(message));
    setInput("");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <h1 className="font-display text-3xl text-ink">Ask AI</h1>
        <p className="text-sm text-slate-soft mt-1">Grounded in your real transaction data — not guesses.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-4">
        {messages.length === 0 && (
          <div className="max-w-lg mx-auto mt-10">
            <div className="flex items-center gap-2 mb-4 text-slate-soft">
              <Sparkles size={16} className="text-gold" />
              <p className="text-sm">Try asking:</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="text-left text-sm bg-white border border-border rounded-lg px-4 py-3
                    text-ink hover:border-gold/60 hover:bg-gold/5 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
                  ${msg.role === "user"
                    ? "bg-navy text-white rounded-br-sm"
                    : "bg-white border border-border text-ink rounded-bl-sm"}`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex justify-start">
              <div className="bg-white border border-border rounded-xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-soft animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-soft animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-soft animate-bounce" />
                </div>
              </div>
            </div>
          )}

          {error && <p role="alert" className="text-sm text-negative text-center">{error}</p>}

          <div ref={bottomRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-8 py-5 border-t border-border bg-white shrink-0">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your spending, budgets, or affordability…"
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm text-ink
              focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            aria-label="Send message"
            className="p-2.5 rounded-lg bg-navy text-white hover:bg-navy-light transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}