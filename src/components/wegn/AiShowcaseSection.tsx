import { useState } from "react";
import { aiReply } from "../../lib/wegnAi/aiReply";

const QUICK_ACTIONS = [
  { label: "I run a grocery store", prompt: "I run a grocery store in Ethiopia." },
  { label: "I own a restaurant", prompt: "I own a restaurant and need a digital menu." },
  { label: "I run a salon", prompt: "I need appointment booking for my salon." },
];

export default function AiShowcaseSection() {
  const [response, setResponse] = useState<string | null>(null);

  return (
    <section id="wegn-ai">
      <div className="wrap">
        <div className="ai-showcase">
          <div className="ai-copy">
            <div className="eyebrow">WEGN AI</div>
            <h2>Help visitors find the right product instantly.</h2>
            <p>
              A website concierge can ask a few simple questions, recommend the right WEGN product, explain
              pricing by country, and guide qualified visitors toward a demo or partner conversation.
            </p>
            <div className="ai-capabilities">
              <span>Product guidance</span>
              <span>Country pricing</span>
              <span>Demo qualification</span>
              <span>Partner guidance</span>
            </div>
          </div>

          <div className="ai-demo">
            <div className="ai-demo-head">
              <div className="ai-avatar">W</div>
              <div>
                <strong>WEGN AI Concierge</strong>
                <span>Online</span>
              </div>
            </div>
            <div className="ai-message bot">Tell me about your business, and I&rsquo;ll help you find the right WEGN product.</div>
            <div className="ai-quick-actions">
              {QUICK_ACTIONS.map((a) => (
                <button key={a.label} type="button" onClick={() => setResponse(aiReply(a.prompt))}>
                  {a.label}
                </button>
              ))}
            </div>
            {response && <div className="ai-message bot response">{response}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
