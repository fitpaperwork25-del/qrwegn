import { useState } from "react";
import { aiReply } from "../../lib/wegnAi/aiReply";

type ChatMessage = { text: string; type: "bot" | "user" };

const SUGGESTIONS = [
  { label: "Grocery store", prompt: "Grocery store in Ethiopia" },
  { label: "Restaurant", prompt: "Restaurant in Ethiopia" },
  { label: "Salon", prompt: "Salon in Ethiopia" },
  { label: "Become a partner", prompt: "I want to become a partner" },
];

export default function AiFloatingLauncher() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { text: "Welcome to WEGN. What kind of business do you operate?", type: "bot" },
  ]);
  const [input, setInput] = useState("");

  function submitChat(text: string) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { text, type: "user" }]);
    window.setTimeout(() => {
      setMessages((m) => [...m, { text: aiReply(text), type: "bot" }]);
    }, 250);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input;
    setInput("");
    submitChat(text);
  }

  return (
    <>
      <button id="aiLauncher" className="ai-launcher" type="button" aria-label="Open Wegn AI" onClick={() => setOpen(true)}>
        <span>✨</span> <span className="ai-launcher-label">Ask Wegn AI</span>
      </button>

      <aside id="aiPanel" className={`ai-panel${open ? " open" : ""}`} aria-hidden={!open}>
        <div className="ai-panel-head">
          <div>
            <strong>Wegn AI</strong>
            <span>Website concierge prototype</span>
          </div>
          <button id="aiClose" type="button" aria-label="Close" onClick={() => setOpen(false)}>
            ×
          </button>
        </div>
        <div id="aiChat" className="ai-chat">
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.type}`}>
              {m.text}
            </div>
          ))}
        </div>
        <div className="ai-suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s.label} type="button" onClick={() => submitChat(s.prompt)}>
              {s.label}
            </button>
          ))}
        </div>
        <form id="aiForm" className="ai-form" onSubmit={handleSubmit}>
          <input
            id="aiInput"
            type="text"
            placeholder="Ask about products or pricing…"
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
        <small className="ai-disclosure">
          Prototype only. A production version would connect to an approved AI service and WEGN&rsquo;s published product and pricing data.
        </small>
      </aside>
    </>
  );
}
