import { useState, useRef, useEffect } from 'react';
import API from '../api';

const QUICK_TOPICS = [
  '🤖 My Risk Score',
  '📋 My Policy',
  '📝 My Claims',
  '💰 Premium Info',
  '🆘 How to Claim',
  '🌟 Plan Upgrade',
];

function getBotResponse(input, userData) {
  const q = input.toLowerCase();

  if (q.includes('risk') || q.includes('score')) {
    const r = userData?.risk;
    if (r) return `Your current AI risk score is **${r.risk_score}** (${r.risk_level} risk). Based on your location (${r.location}) and work platform (${r.work_type}), your estimated weekly premium is ₹${r.weekly_premium}. ${r.risk_level === 'HIGH' ? '⚠️ High risk users are more exposed to weather events — consider the Premium plan for maximum coverage.' : '✅ Good news! Your risk profile is favorable.'}`;
    return "I couldn't fetch your risk data. Please make sure your profile (location & work type) is complete and try again.";
  }

  if (q.includes('policy') || q.includes('plan') || q.includes('coverage')) {
    const p = userData?.policy;
    if (p) return `You have an **${p.status}** ${p.plan_name.toUpperCase()} policy. Coverage: ₹${p.coverage.toLocaleString()} | Premium: ₹${p.premium}/week | Expires: ${new Date(p.end_date).toLocaleDateString('en-IN')}. ${p.status === 'ACTIVE' ? '✅ Your policy is currently active.' : '⚠️ Your policy is not active. Please purchase a new one.'}`;
    return "You don't have an active policy yet. Visit the **Policies** page to buy one (Basic/Standard/Premium plans starting at ₹49/week).";
  }

  if (q.includes('claim') || q.includes('claims')) {
    const c = userData?.claims;
    if (c && c.length > 0) {
      const pending = c.filter(x => x.status === 'PENDING').length;
      const approved = c.filter(x => x.status === 'APPROVED').length;
      const paid = c.filter(x => x.status === 'PAID').length;
      return `You have **${c.length} total claims** — ${pending} pending, ${approved} approved, ${paid} paid. ${pending > 0 ? '⏳ Your pending claims are under review.' : ''}`;
    }
    return "You have no claims yet. If you experience a covered event (heavy rain, flood, heatwave, storm, cyclone), go to the **Claims** page to file one.";
  }

  if (q.includes('premium') || q.includes('price') || q.includes('cost')) {
    return "Your weekly premium is calculated using our AI Risk Engine:\n\n• **Basic**: ₹49–₹199/week | ₹5,000 coverage\n• **Standard**: 1.5× premium | ₹15,000 coverage\n• **Premium**: 2× premium | ₹30,000 coverage\n\nPremium depends on your city and delivery platform.";
  }

  if (q.includes('how') && (q.includes('claim') || q.includes('file'))) {
    return "To file a claim:\n1. Go to **My Claims** page\n2. Click **File New Claim**\n3. Select event type (flood, rain, etc.)\n4. Enter claim amount (up to your coverage limit)\n5. Our AI fraud engine reviews it\n6. Approved claims are paid within 1–2 business days.";
  }

  if (q.includes('upgrade') || q.includes('switch')) {
    return "To upgrade your plan, your current policy must expire first (policies are weekly). Once expired:\n1. Go to **My Policies**\n2. Choose a new plan\n3. Buy with your updated risk score\n\n💡 Premium plan gives ₹30,000 coverage — recommended for high-risk locations like Mumbai.";
  }

  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return `Hello ${userData?.username || 'there'}! 👋 I'm GuideBot, your AI insurance assistant. I can help you with risk scores, policies, claims, and more. What would you like to know?`;
  }

  if (q.includes('fraud') || q.includes('check')) {
    return "Our AI fraud detection engine automatically checks every claim for:\n• Valid event types (flood, heatwave, storm, etc.)\n• Reasonable claim amounts (within your coverage)\n• AI confidence scoring\n\nFlagged claims are rejected. Legitimate claims are approved instantly.";
  }

  if (q.includes('event') || q.includes('cover')) {
    return "Guidewares covers the following weather events:\n• 🌧️ Heavy Rain\n• 🌊 Flood\n• 🔥 Heatwave\n• ⛈️ Storm\n• 🌀 Cyclone\n\nThese are verified against real weather data from your region.";
  }

  return "I can help you with:\n• 🤖 Risk score & premium calculation\n• 📋 Policy details & plans\n• 📝 Claim filing & status\n• 💡 Coverage information\n\nTry asking one of the quick topics below, or type your question!";
}

export default function AIAssistant({ user }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, from: 'bot', text: `Hi! I'm GuideBot 🤖 — your AI insurance assistant. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [userData, setUserData] = useState({});
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && user?.user_id) {
      // Prefetch user context data for smart responses
      Promise.all([
        API.get(`/ai/risk/${user.user_id}`).catch(() => null),
        API.get(`/policy/${user.user_id}`).catch(() => null),
        API.get(`/claims/${user.user_id}`).catch(() => null),
      ]).then(([risk, policies, claims]) => {
        setUserData({
          username: user.username,
          risk: risk?.data,
          policy: policies?.data?.[0],
          claims: claims?.data,
        });
      });
    }
  }, [open, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = (text) => {
    const q = text || input;
    if (!q.trim()) return;

    setMessages(m => [...m, { id: Date.now(), from: 'user', text: q }]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const response = getBotResponse(q, userData);
      setTyping(false);
      setMessages(m => [...m, { id: Date.now() + 1, from: 'bot', text: response }]);
    }, 700 + Math.random() * 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <button className="ai-fab" onClick={() => setOpen(o => !o)} aria-label="Open AI Assistant">
        <div className="pulse" />
        {open ? '✕' : '🤖'}
      </button>

      {open && (
        <div className="ai-panel">
          <div className="ai-panel-header">
            <div className="ai-avatar">🤖</div>
            <div>
              <div className="ai-panel-name">GuideBot</div>
              <div className="ai-panel-status">
                <span className="ai-dot" /> Online — AI Assistant
              </div>
            </div>
            <button
              className="btn-icon"
              style={{ marginLeft: 'auto' }}
              onClick={() => setOpen(false)}
              aria-label="Close"
            >✕</button>
          </div>

          <div className="ai-messages">
            {messages.map(m => (
              <div key={m.id} className={`ai-msg ${m.from === 'bot' ? 'bot' : 'user'}`}>
                {m.text.split('\n').map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </div>
            ))}
            {typing && (
              <div className="ai-msg bot" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span className="loading-spinner" style={{ width: 14, height: 14 }} />
                <span style={{ color: 'var(--text-4)', fontSize: '0.8rem' }}>GuideBot is thinking…</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="ai-quick-btns">
            {QUICK_TOPICS.map(t => (
              <button key={t} className="ai-quick-btn" onClick={() => sendMessage(t)}>
                {t}
              </button>
            ))}
          </div>

          <div className="ai-input-row">
            <input
              className="ai-input"
              placeholder="Ask anything…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Type your question"
            />
            <button className="ai-send" onClick={() => sendMessage()} aria-label="Send">
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
