import { useEffect, useRef, useState } from 'react';
import { Copy, RefreshCw, ThumbsUp, ThumbsDown, Edit3, Trash2, Check, ChevronDown, AlertCircle } from 'lucide-react';
import type { Message, Model, Mode } from '../lib/types';
import { MODEL_INFO } from '../lib/types';

interface MessageListProps {
  messages: Message[];
  model: Model;
  mode: Mode;
  isGenerating: boolean;
  isThinking: boolean;
  autoScroll: boolean;
  showTimestamps: boolean;
  onRetry: () => void;
  onCopy: (text: string) => void;
  onEditMessage: (id: string, text: string) => void;
  onDeleteMessage: (id: string) => void;
}

export default function MessageList({
  messages, model, mode, isGenerating, isThinking,
  autoScroll, showTimestamps, onRetry, onCopy, onEditMessage, onDeleteMessage,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  useEffect(() => {
    if (autoScroll) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, autoScroll]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(distFromBottom > 120);
    };
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, []);

  return (
    <div ref={containerRef} className="ryta-scroll" style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 24px 16px' }}>
        {messages.map((msg, i) =>
          msg.role === 'user'
            ? <UserMessage key={msg.id} msg={msg} showTimestamps={showTimestamps} onCopy={onCopy} onEdit={onEditMessage} onDelete={onDeleteMessage} />
            : <AssistantMessage key={msg.id} msg={msg} model={model} mode={mode} showTimestamps={showTimestamps} onCopy={onCopy} onRetry={onRetry} isLast={i === messages.length - 1} />
        )}

        {/* Thinking indicator */}
        {isThinking && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px 0', animation: 'ryta-fade-in 200ms ease' }}>
            <ModelAvatar model={model} size={32} />
            <div style={{ paddingTop: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--ryta-text-muted)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {MODEL_INFO[model].name} is thinking…
                </span>
              </div>
              <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
                <span className="ryta-thinking-bar" />
                <span className="ryta-thinking-bar" />
                <span className="ryta-thinking-bar" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom */}
      {showScrollBtn && (
        <button
          onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
          aria-label="Scroll to bottom"
          style={{
            position: 'sticky', bottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 34, height: 34,
            margin: '0 auto',
            background: 'var(--ryta-surface-raised)',
            border: '1px solid var(--ryta-border-strong)',
            borderRadius: '50%', cursor: 'pointer',
            color: 'var(--ryta-text-muted)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'all 150ms ease',
          }}
        >
          <ChevronDown size={14} />
        </button>
      )}
    </div>
  );
}

function ModelAvatar({ model, size = 28 }: { model: Model; size?: number }) {
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      borderRadius: model === 'takshu' ? Math.round(size * 0.25) : '50%',
      background: 'var(--ryta-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: 0.88,
      transition: 'border-radius 300ms ease',
    }}>
      <span style={{ fontSize: size * 0.38, fontWeight: 700, color: 'var(--ryta-primary-fg)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {model === 'takshu' ? 'T' : 'R'}
      </span>
    </div>
  );
}

function UserMessage({ msg, showTimestamps, onCopy, onEdit, onDelete }: {
  msg: Message; showTimestamps: boolean;
  onCopy: (t: string) => void; onEdit: (id: string, t: string) => void; onDelete: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(msg.content);

  return (
    <div
      className="ryta-message-animate"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: 24, gap: 4 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {showTimestamps && (
        <span style={{ fontSize: 10.5, color: 'var(--ryta-text-subtle)', marginRight: 4 }}>
          {formatMsgTime(msg.timestamp)}
        </span>
      )}
      <div style={{
        maxWidth: '72%',
        background: 'var(--ryta-user-surface)',
        border: '1px solid var(--ryta-border)',
        borderRadius: '12px 12px 3px 12px',
        padding: editing ? '10px' : '11px 15px',
        position: 'relative',
      }}>
        {editing ? (
          <div>
            <textarea
              value={editVal}
              onChange={e => setEditVal(e.target.value)}
              autoFocus
              style={{
                width: '100%', background: 'transparent', border: 'none', outline: 'none',
                resize: 'none', fontSize: 14, color: 'var(--ryta-text)', fontFamily: "'Inter', sans-serif",
                lineHeight: 1.65, minHeight: 60,
              }}
              onKeyDown={e => {
                if (e.key === 'Escape') { setEditing(false); setEditVal(msg.content); }
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onEdit(msg.id, editVal); setEditing(false); }
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 6 }}>
              <ActionBtn label="Cancel" onClick={() => { setEditing(false); setEditVal(msg.content); }} />
              <ActionBtn label="Save" primary onClick={() => { onEdit(msg.id, editVal); setEditing(false); }} />
            </div>
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: 14, color: 'var(--ryta-text)', fontFamily: "'Inter', sans-serif", lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {msg.content}
          </p>
        )}
      </div>
      {hovered && !editing && (
        <div style={{ display: 'flex', gap: 3, marginRight: 4, animation: 'ryta-fade-in 120ms ease' }}>
          <MsgIconBtn icon={Copy} label="Copy" onClick={() => onCopy(msg.content)} />
          <MsgIconBtn icon={Edit3} label="Edit" onClick={() => setEditing(true)} />
          <MsgIconBtn icon={Trash2} label="Delete" onClick={() => onDelete(msg.id)} />
        </div>
      )}
    </div>
  );
}

function AssistantMessage({ msg, model, mode, showTimestamps, onCopy, onRetry, isLast }: {
  msg: Message; model: Model; mode: Mode; showTimestamps: boolean;
  onCopy: (t: string) => void; onRetry: () => void; isLast: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState<'up' | 'down' | null>(null);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    onCopy(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (msg.hasError) {
    return (
      <div className="ryta-message-animate" style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'flex-start' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ryta-surface)', border: '1px solid var(--ryta-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <AlertCircle size={14} style={{ color: '#e05555' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ background: 'rgba(220,80,80,0.08)', border: '1px solid rgba(220,80,80,0.18)', borderRadius: 10, padding: '12px 16px' }}>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--ryta-text)', fontFamily: "'Inter', sans-serif" }}>
              Something went wrong. Please try again.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <ActionBtn label="Retry" onClick={onRetry} primary />
            <ActionBtn label="Dismiss" onClick={() => {}} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="ryta-message-animate"
      style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'flex-start' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ModelAvatar model={model} size={32} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ryta-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {model === 'takshu' ? 'Takshu' : 'Ryku'}
          </span>
          <span style={{ fontSize: 11, color: 'var(--ryta-text-subtle)', fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: 'capitalize' }}>
            {mode}
          </span>
          {showTimestamps && (
            <span style={{ fontSize: 10.5, color: 'var(--ryta-text-subtle)', marginLeft: 'auto' }}>
              {formatMsgTime(msg.timestamp)}
            </span>
          )}
        </div>

        <div className="ryta-markdown" style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--ryta-text)', fontFamily: "'Inter', sans-serif" }}>
          <MarkdownRenderer content={msg.content} isStreaming={msg.isStreaming} />
        </div>

        {/* Message actions */}
        {(hovered || isLast) && !msg.isStreaming && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 10, animation: hovered ? 'ryta-fade-in 120ms ease' : 'none' }}>
            <MsgIconBtn icon={copied ? Check : Copy} label={copied ? 'Copied' : 'Copy'} onClick={handleCopy} active={copied} />
            {isLast && <MsgIconBtn icon={RefreshCw} label="Regenerate" onClick={onRetry} />}
            <MsgIconBtn icon={ThumbsUp} label="Good response" onClick={() => setLiked(liked === 'up' ? null : 'up')} active={liked === 'up'} />
            <MsgIconBtn icon={ThumbsDown} label="Bad response" onClick={() => setLiked(liked === 'down' ? null : 'down')} active={liked === 'down'} />
          </div>
        )}
      </div>
    </div>
  );
}

function MsgIconBtn({ icon: Icon, label, onClick, active }: {
  icon: React.ElementType; label: string; onClick: () => void; active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, borderRadius: 6,
        background: active ? 'var(--ryta-surface)' : 'none',
        border: 'none', cursor: 'pointer',
        color: active ? 'var(--ryta-primary)' : 'var(--ryta-text-subtle)',
        transition: 'background 120ms ease, color 120ms ease',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--ryta-surface)'; e.currentTarget.style.color = 'var(--ryta-text-muted)'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--ryta-text-subtle)'; } }}
    >
      <Icon size={13} />
    </button>
  );
}

function ActionBtn({ label, onClick, primary }: { label: string; onClick: () => void; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px', borderRadius: 6, fontSize: 12.5,
        fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500,
        border: primary ? 'none' : '1px solid var(--ryta-border)',
        background: primary ? 'var(--ryta-primary)' : 'transparent',
        color: primary ? 'var(--ryta-primary-fg)' : 'var(--ryta-text-muted)',
        cursor: 'pointer', transition: 'opacity 120ms ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
    >
      {label}
    </button>
  );
}

function formatMsgTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/* ─── Lightweight Markdown Renderer ─── */
function MarkdownRenderer({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim() || 'text';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(<CodeBlock key={i} lang={lang} code={codeLines.join('\n')} />);
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('### ')) { elements.push(<h3 key={i}>{parseInline(line.slice(4))}</h3>); i++; continue; }
    if (line.startsWith('## ')) { elements.push(<h2 key={i}>{parseInline(line.slice(3))}</h2>); i++; continue; }
    if (line.startsWith('# ')) { elements.push(<h1 key={i}>{parseInline(line.slice(2))}</h1>); i++; continue; }

    // Blockquote
    if (line.startsWith('> ')) { elements.push(<blockquote key={i}>{parseInline(line.slice(2))}</blockquote>); i++; continue; }

    // Unordered list
    if (line.match(/^[-*+] /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*+] /)) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(<ul key={i}>{items.map((it, j) => <li key={j}>{parseInline(it)}</li>)}</ul>);
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\. /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\. /, ''));
        i++;
      }
      elements.push(<ol key={i}>{items.map((it, j) => <li key={j}>{parseInline(it)}</li>)}</ol>);
      continue;
    }

    // Empty line
    if (!line.trim()) { i++; continue; }

    // Paragraph
    elements.push(<p key={i}>{parseInline(line)}</p>);
    i++;
  }

  return (
    <div>
      {elements}
      {isStreaming && <span style={{ display: 'inline-block', width: 2, height: '1em', background: 'var(--ryta-primary)', marginLeft: 1, verticalAlign: 'text-bottom', animation: 'ryta-pulse-dot 0.8s ease-in-out infinite' }} />}
    </div>
  );
}

function parseInline(text: string): React.ReactNode {
  // Bold, italic, inline code, links
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let idx = 0;

  const patterns = [
    { re: /\*\*(.+?)\*\*/, render: (m: RegExpMatchArray) => <strong key={m.index}>{m[1]}</strong> },
    { re: /\*(.+?)\*/, render: (m: RegExpMatchArray) => <em key={m.index}>{m[1]}</em> },
    { re: /`(.+?)`/, render: (m: RegExpMatchArray) => <code key={m.index}>{m[1]}</code> },
    { re: /\[(.+?)\]\((.+?)\)/, render: (m: RegExpMatchArray) => <a key={m.index} href={m[2]} target="_blank" rel="noopener noreferrer">{m[1]}</a> },
  ];

  while (remaining.length > 0) {
    let earliest: { index: number; length: number; node: React.ReactNode } | null = null;

    for (const { re, render } of patterns) {
      const match = remaining.match(re);
      if (match && match.index !== undefined) {
        if (!earliest || match.index < earliest.index) {
          earliest = { index: match.index, length: match[0].length, node: render(match) };
        }
      }
    }

    if (!earliest) {
      parts.push(<span key={idx++}>{remaining}</span>);
      break;
    }

    if (earliest.index > 0) parts.push(<span key={idx++}>{remaining.slice(0, earliest.index)}</span>);
    parts.push(earliest.node);
    remaining = remaining.slice(earliest.index + earliest.length);
  }

  return <>{parts}</>;
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={{ position: 'relative', margin: '12px 0' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '7px 14px',
        background: 'var(--ryta-surface-raised)',
        borderRadius: '8px 8px 0 0',
        borderBottom: '1px solid var(--ryta-border)',
      }}>
        <span style={{ fontSize: 11, color: 'var(--ryta-text-muted)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.03em' }}>{lang}</span>
        <button
          onClick={handleCopy}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ryta-text-muted)', fontSize: 11, fontFamily: "'Plus Jakarta Sans', sans-serif", padding: '2px 4px' }}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre style={{ margin: 0, padding: '14px', background: 'var(--ryta-surface)', border: '1px solid var(--ryta-border)', borderTop: 'none', borderRadius: '0 0 8px 8px', overflowX: 'auto' }}>
        <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: 'var(--ryta-text)', lineHeight: 1.65 }}>
          {code}
        </code>
      </pre>
    </div>
  );
}
