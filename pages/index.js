import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

const TONES = [
  { key: 'professional', label: 'Professional', emoji: '💼', color: '#2563eb', bg: '#eff6ff', desc: 'Polished & business-ready' },
  { key: 'friendly',     label: 'Friendly',     emoji: '😊', color: '#16a34a', bg: '#f0fdf4', desc: 'Warm & approachable' },
  { key: 'concise',      label: 'Concise',      emoji: '⚡', color: '#d97706', bg: '#fffbeb', desc: 'Sharp & to the point' },
  { key: 'formal',       label: 'Formal',       emoji: '🎓', color: '#7c3aed', bg: '#f5f3ff', desc: 'Academic & elevated' },
  { key: 'casual',       label: 'Casual',       emoji: '☕', color: '#db2777', bg: '#fdf2f8', desc: 'Relaxed & natural' },
  { key: 'persuasive',   label: 'Persuasive',   emoji: '📣', color: '#dc2626', bg: '#fef2f2', desc: 'Compelling & motivating' },
  { key: 'empathetic',   label: 'Empathetic',   emoji: '💜', color: '#9333ea', bg: '#faf5ff', desc: 'Caring & supportive' },
  { key: 'assertive',    label: 'Assertive',    emoji: '🔥', color: '#ea580c', bg: '#fff7ed', desc: 'Bold & decisive' },
  { key: 'witty',        label: 'Witty',        emoji: '✨', color: '#0891b2', bg: '#ecfeff', desc: 'Clever & playful' },
  { key: 'diplomatic',   label: 'Diplomatic',   emoji: '🕊️', color: '#059669', bg: '#ecfdf5', desc: 'Tactful & balanced' },
];

const MAX_CHARS = 2000;

export default function Home() {
  const [selectedTone, setSelectedTone] = useState(null);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const outputRef = useRef(null);
  const inputRef = useRef(null);

  const charPercent = Math.min((inputText.length / MAX_CHARS) * 100, 100);
  const charColor = charPercent > 90 ? '#dc2626' : charPercent > 70 ? '#d97706' : '#6c47ff';

  const canCorrect = inputText.trim().length > 0 && selectedTone && !loading;

  async function correctTone() {
    if (!canCorrect) return;
    setLoading(true);
    setError('');
    setOutputText('');

    try {
      const res = await fetch('/api/correct-tone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText.trim(), tone: selectedTone.key }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      setOutputText(data.result);
      const entry = {
        id: Date.now(),
        input: inputText.trim(),
        output: data.result,
        tone: selectedTone,
        time: new Date().toLocaleTimeString(),
      };
      setHistory(prev => [entry, ...prev].slice(0, 5));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function copyOutput() {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function loadHistory(entry) {
    setInputText(entry.input);
    setOutputText(entry.output);
    setSelectedTone(entry.tone);
    setShowHistory(false);
  }

  function clearAll() {
    setInputText('');
    setOutputText('');
    setError('');
    inputRef.current?.focus();
  }

  const activeTone = TONES.find(t => t.key === selectedTone?.key);

  return (
    <>
      <Head>
        <title>AI Tone Corrector — Rewrite with Precision</title>
      </Head>

      {/* Background orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        {/* Header */}
        <header style={{
          borderBottom: '1px solid var(--border)',
          background: 'rgba(248,247,255,0.8)',
          backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #6c47ff, #4a2fd6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, color: 'white', fontFamily: 'Syne, sans-serif', fontWeight: 700,
              }}>T</div>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
                ToneAI
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {history.length > 0 && (
                <button onClick={() => setShowHistory(!showHistory)} style={{
                  fontSize: 13, color: 'var(--text-secondary)',
                  background: 'none', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '5px 12px', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}>
                  History ({history.length})
                </button>
              )}
              <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{
                fontSize: 13, color: 'var(--accent)',
                textDecoration: 'none', fontWeight: 500,
              }}>
                Get API Key →
              </a>
            </div>
          </div>
        </header>

        {/* History dropdown */}
        {showHistory && history.length > 0 && (
          <div style={{
            position: 'fixed', top: 68, right: 24, zIndex: 200,
            background: 'white', border: '1px solid var(--border)',
            borderRadius: 12, padding: 12, width: 300,
            boxShadow: '0 8px 32px rgba(108,71,255,0.12)',
          }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Recent rewrites
            </p>
            {history.map(entry => (
              <button key={entry.id} onClick={() => loadHistory(entry)} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '10px 12px', borderRadius: 8, border: 'none',
                background: 'transparent', cursor: 'pointer', marginBottom: 4,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: entry.tone.color }}>
                    {entry.tone.emoji} {entry.tone.label}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{entry.time}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.input.slice(0, 60)}…
                </p>
              </button>
            ))}
          </div>
        )}

        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>

          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: 48 }} className="fade-up">
            <div style={{
              display: 'inline-block', padding: '4px 14px', borderRadius: 999,
              background: 'var(--accent-light)', color: 'var(--accent)',
              fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
              textTransform: 'uppercase', marginBottom: 20,
            }}>
              ✦ Powered by Groq + Llama 3
            </div>
            <h1 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 800,
              fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1.08,
              color: 'var(--text-primary)', marginBottom: 16,
              letterSpacing: '-2px',
            }}>
              Say it exactly<br />
              <span style={{
                background: 'linear-gradient(135deg, #6c47ff 0%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>how you mean it.</span>
            </h1>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
              Paste your text, pick a tone, and get a brilliant rewrite in under 2 seconds.
            </p>
          </div>

          {/* Tone selector */}
          <div style={{ marginBottom: 32 }}>
            <p style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--text-muted)', marginBottom: 14,
            }}>
              Choose your tone
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {TONES.map(tone => {
                const isActive = selectedTone?.key === tone.key;
                return (
                  <button
                    key={tone.key}
                    onClick={() => setSelectedTone(tone)}
                    className={isActive ? 'tone-btn-active' : ''}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
                      border: isActive ? `2px solid ${tone.color}` : '1.5px solid var(--border)',
                      background: isActive ? tone.bg : 'white',
                      color: isActive ? tone.color : 'var(--text-secondary)',
                      fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: 15 }}>{tone.emoji}</span>
                    {tone.label}
                  </button>
                );
              })}
            </div>

            {/* Tone description */}
            {activeTone && (
              <div className="slide-in" style={{
                marginTop: 14, padding: '10px 16px', borderRadius: 10,
                background: activeTone.bg, border: `1px solid ${activeTone.color}22`,
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 16 }}>{activeTone.emoji}</span>
                <span style={{ fontSize: 13, color: activeTone.color, fontWeight: 500 }}>
                  {activeTone.label}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>—</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{activeTone.desc}</span>
              </div>
            )}
          </div>

          {/* Main editor grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: 0,
            alignItems: 'stretch',
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 4px 40px rgba(108,71,255,0.06)',
          }}>
            {/* Input panel */}
            <div style={{ padding: 28, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <label style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: 'var(--text-muted)',
                }}>
                  Original Text
                </label>
                {inputText && (
                  <button onClick={clearAll} style={{
                    fontSize: 12, color: 'var(--text-muted)', background: 'none',
                    border: 'none', cursor: 'pointer', padding: '2px 6px',
                    borderRadius: 4,
                  }}>
                    Clear
                  </button>
                )}
              </div>

              <textarea
                ref={inputRef}
                value={inputText}
                onChange={e => {
                  if (e.target.value.length <= MAX_CHARS) setInputText(e.target.value);
                }}
                placeholder="Type or paste your text here…

E.g. 'Hey, just wanted to check in about that thing we talked about. Let me know when you get a chance.'"
                style={{
                  flex: 1, minHeight: 260, resize: 'none',
                  border: 'none', outline: 'none',
                  fontFamily: 'Inter, sans-serif', fontSize: 15, lineHeight: 1.7,
                  color: 'var(--text-primary)',
                  background: 'transparent',
                }}
              />

              {/* Char count bar */}
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {inputText.length} / {MAX_CHARS}
                  </span>
                  {inputText.length > MAX_CHARS * 0.9 && (
                    <span style={{ fontSize: 12, color: '#dc2626' }}>Approaching limit</span>
                  )}
                </div>
                <div style={{ height: 3, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                  <div className="char-bar" style={{
                    height: '100%', width: `${charPercent}%`,
                    background: charColor, borderRadius: 99,
                  }} />
                </div>
              </div>
            </div>

            {/* Divider + action button */}
            <div style={{
              width: 1, background: 'var(--border)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '28px 0', position: 'relative',
            }}>
              <button
                onClick={correctTone}
                disabled={!canCorrect}
                style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: canCorrect
                    ? 'linear-gradient(135deg, #6c47ff, #4a2fd6)'
                    : 'var(--border)',
                  border: 'none', cursor: canCorrect ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, color: 'white',
                  transition: 'all 0.2s ease',
                  boxShadow: canCorrect ? '0 4px 16px rgba(108,71,255,0.4)' : 'none',
                  position: 'absolute',
                  transform: 'translateX(-50%)',
                  left: '50%',
                }}
                title="Correct Tone"
              >
                {loading ? <div className="spinner" /> : '→'}
              </button>
            </div>

            {/* Output panel */}
            <div style={{ padding: 28, display: 'flex', flexDirection: 'column', background: outputText ? 'white' : '#fafaf9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <label style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: 'var(--text-muted)',
                }}>
                  {activeTone ? `${activeTone.emoji} ${activeTone.label} Version` : 'Rewritten Text'}
                </label>
                {outputText && (
                  <button onClick={copyOutput} style={{
                    fontSize: 12, fontWeight: 500,
                    color: copied ? 'var(--success)' : 'var(--accent)',
                    background: copied ? 'var(--success-bg)' : 'var(--accent-light)',
                    border: 'none', cursor: 'pointer',
                    padding: '4px 12px', borderRadius: 6,
                  }}>
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                )}
              </div>

              <div style={{ flex: 1, minHeight: 260 }}>
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
                    {[100, 85, 92, 70, 60].map((w, i) => (
                      <div key={i} style={{
                        height: 16, width: `${w}%`, borderRadius: 4,
                        background: 'var(--border)',
                        animation: `shimmer 1.5s ease ${i * 0.1}s infinite`,
                        backgroundSize: '200% auto',
                        backgroundImage: 'linear-gradient(90deg, var(--border) 25%, #e8e4ff 50%, var(--border) 75%)',
                      }} />
                    ))}
                  </div>
                ) : error ? (
                  <div style={{
                    padding: 16, borderRadius: 10, background: '#fef2f2',
                    border: '1px solid #fecaca', color: '#dc2626', fontSize: 14,
                  }}>
                    ⚠️ {error}
                  </div>
                ) : outputText ? (
                  <p ref={outputRef} className="slide-in" style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 15, lineHeight: 1.7,
                    color: 'var(--text-primary)', whiteSpace: 'pre-wrap',
                  }}>
                    {outputText}
                  </p>
                ) : (
                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 15, lineHeight: 1.7,
                    color: 'var(--text-muted)', fontStyle: 'italic',
                  }}>
                    Your rewritten text will appear here…
                  </p>
                )}
              </div>

              {outputText && (
                <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 12, padding: '3px 10px', borderRadius: 99,
                    background: activeTone?.bg, color: activeTone?.color, fontWeight: 500,
                  }}>
                    {activeTone?.emoji} {activeTone?.label}
                  </span>
                  <span style={{
                    fontSize: 12, padding: '3px 10px', borderRadius: 99,
                    background: 'var(--success-bg)', color: 'var(--success)', fontWeight: 500,
                  }}>
                    ✓ Rewrite complete
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', padding: '3px 0' }}>
                    {outputText.length} chars
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Correct button (mobile-friendly below the grid) */}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button
              onClick={correctTone}
              disabled={!canCorrect}
              style={{
                padding: '14px 40px', borderRadius: 12,
                background: canCorrect
                  ? 'linear-gradient(135deg, #6c47ff, #4a2fd6)'
                  : 'var(--border)',
                border: 'none', cursor: canCorrect ? 'pointer' : 'not-allowed',
                fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700,
                color: canCorrect ? 'white' : 'var(--text-muted)',
                display: 'inline-flex', alignItems: 'center', gap: 10,
                transition: 'all 0.2s ease',
                boxShadow: canCorrect ? '0 4px 20px rgba(108,71,255,0.35)' : 'none',
              }}
            >
              {loading ? (
                <><div className="spinner" /> Rewriting…</>
              ) : (
                <>✦ Correct Tone</>
              )}
            </button>
            {!selectedTone && inputText && (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10 }}>
                ↑ Select a tone above first
              </p>
            )}
          </div>

          {/* Stats */}
          <div style={{ marginTop: 64, display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
            {[
              { label: 'Tones available', value: '10' },
              { label: 'Avg response time', value: '<2s' },
              { label: 'Powered by', value: 'Groq' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: 'var(--accent)' }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--border)', padding: '24px',
          textAlign: 'center', color: 'var(--text-muted)', fontSize: 13,
        }}>
          Built with Next.js + Groq API — 
          <a href="https://console.groq.com" target="_blank" rel="noreferrer"
             style={{ color: 'var(--accent)', textDecoration: 'none', marginLeft: 4 }}>
            Get your free API key →
          </a>
        </footer>
      </div>
    </>
  );
}
