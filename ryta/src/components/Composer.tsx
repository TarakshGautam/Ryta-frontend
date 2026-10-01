import { useRef, useState, useEffect } from 'react';
import {
  Send, Square, Paperclip, Globe, Mic,
  MicOff, FileText, Image, X, ChevronUp,
} from 'lucide-react';
import type { Model, Mode } from '../lib/types';
import { MODE_INFO, MODEL_INFO } from '../lib/types';

interface ComposerProps {
  model: Model;
  mode: Mode;
  isGenerating: boolean;
  isTemp: boolean;
  disabled?: boolean;
  onSend: (text: string, webSearch: boolean) => void;
  onStop: () => void;
}

interface AttachmentItem {
  id: string;
  name: string;
  type: 'file' | 'image';
  size: string;
}

export default function Composer({ model, mode, isGenerating, isTemp, disabled, onSend, onStop }: ComposerProps) {
  const [text, setText] = useState('');
  const [webSearch, setWebSearch] = useState(false);
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'processing'>('idle');
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 280) + 'px';
  }, [text]);

  // Close attach menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setAttachMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    if (isGenerating) { onStop(); return; }
    if (!text.trim() && attachments.length === 0) return;
    onSend(text.trim(), webSearch);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  function addAttachment(type: 'file' | 'image') {
    const id = Math.random().toString(36).slice(2);
    const name = type === 'image' ? `image_${Date.now()}.png` : `document_${Date.now()}.pdf`;
    setAttachments(prev => [...prev, { id, name, type, size: '142 KB' }]);
    setAttachMenuOpen(false);
  }

  function removeAttachment(id: string) {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }

  function toggleVoice() {
    if (voiceState === 'idle') {
      setVoiceState('listening');
      setTimeout(() => setVoiceState('processing'), 3000);
      setTimeout(() => {
        setText(prev => prev + (prev ? ' ' : '') + 'Voice input example text.');
        setVoiceState('idle');
      }, 4500);
    } else {
      setVoiceState('idle');
    }
  }

  const placeholder = `Message ${MODEL_INFO[model].name}…`;
  const canSend = (text.trim().length > 0 || attachments.length > 0) && !disabled;

  return (
    <div style={{ padding: '0 24px 20px', flexShrink: 0 }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Temp chat notice */}
        {isTemp && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '7px 14px', marginBottom: 8,
            background: 'var(--ryta-surface)',
            border: '1px solid var(--ryta-border)',
            borderRadius: 8,
            fontSize: 12, color: 'var(--ryta-text-muted)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ryta-primary)', opacity: 0.7, flexShrink: 0 }} />
            This is a temporary conversation and won't be saved to your history.
          </div>
        )}

        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {attachments.map(a => (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 8px 5px 10px',
                background: 'var(--ryta-surface)',
                border: '1px solid var(--ryta-border)',
                borderRadius: 8, fontSize: 12,
                color: 'var(--ryta-text-muted)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                {a.type === 'image' ? <Image size={12} /> : <FileText size={12} />}
                <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
                <span style={{ color: 'var(--ryta-text-subtle)', fontSize: 10.5 }}>{a.size}</span>
                <button onClick={() => removeAttachment(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ryta-text-subtle)', padding: 0, display: 'flex', marginLeft: 2 }}>
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main composer box */}
        <div className="ryta-composer">
          {/* Web search active bar */}
          {webSearch && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px 0',
              fontSize: 12, color: 'var(--ryta-primary)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              <Globe size={11} />
              <span>Web search enabled — response may use live sources</span>
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            aria-label="Message input"
            style={{
              width: '100%',
              minHeight: 60,
              maxHeight: 280,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              padding: '16px 16px 8px',
              fontSize: 14.5,
              color: 'var(--ryta-text)',
              fontFamily: "'Inter', sans-serif",
              lineHeight: 1.6,
              caretColor: 'var(--ryta-primary)',
              overflowY: 'auto',
            }}
          />

          {/* Toolbar */}
          <div style={{
            display: 'flex', alignItems: 'center',
            padding: '6px 10px 10px 12px',
            gap: 4,
          }}>
            {/* Attachment */}
            <div ref={attachMenuRef} style={{ position: 'relative' }}>
              <ToolbarBtn
                icon={Paperclip}
                label="Add attachment"
                onClick={() => setAttachMenuOpen(v => !v)}
                active={attachMenuOpen || attachments.length > 0}
              />
              {attachMenuOpen && (
                <div style={{
                  position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, zIndex: 100,
                  background: 'var(--ryta-surface-raised)',
                  border: '1px solid var(--ryta-border-strong)',
                  borderRadius: 10, padding: '4px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  minWidth: 160,
                  animation: 'ryta-fade-up 140ms ease',
                }}>
                  {[
                    { icon: FileText, label: 'Upload file', action: () => addAttachment('file') },
                    { icon: Image, label: 'Add image', action: () => addAttachment('image') },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px', background: 'none', border: 'none',
                        borderRadius: 7, cursor: 'pointer',
                        fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: 'var(--ryta-text)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--ryta-surface)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                    >
                      <item.icon size={13} style={{ opacity: 0.7 }} />
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Web search */}
            <ToolbarBtn
              icon={Globe}
              label={webSearch ? 'Disable web search' : 'Enable web search'}
              onClick={() => setWebSearch(v => !v)}
              active={webSearch}
              labelText={webSearch ? 'Web search' : undefined}
            />

            {/* Voice */}
            <ToolbarBtn
              icon={voiceState === 'idle' ? Mic : MicOff}
              label={voiceState === 'idle' ? 'Voice input' : 'Stop listening'}
              onClick={toggleVoice}
              active={voiceState !== 'idle'}
              pulse={voiceState === 'listening'}
            />

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Send / Stop */}
            {isGenerating ? (
              <button
                onClick={onStop}
                aria-label="Stop generation"
                title="Stop generation  Esc"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8,
                  background: 'var(--ryta-surface-raised)',
                  border: '1px solid var(--ryta-border-strong)',
                  cursor: 'pointer',
                  fontSize: 12.5, fontWeight: 600,
                  color: 'var(--ryta-text)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'background 140ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--ryta-surface)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--ryta-surface-raised)'; }}
              >
                <Square size={12} strokeWidth={2.5} />
                Stop
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!canSend}
                aria-label="Send message"
                title="Send  Enter"
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: canSend ? 'var(--ryta-send-bg)' : 'var(--ryta-surface)',
                  border: 'none', cursor: canSend ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: canSend ? 'var(--ryta-send-fg)' : 'var(--ryta-text-subtle)',
                  transition: 'background 200ms ease, color 200ms ease, opacity 150ms ease',
                  opacity: canSend ? 1 : 0.5,
                }}
                onMouseEnter={e => { if (canSend) e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                <Send size={14} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {/* Bottom hint */}
        <p style={{
          textAlign: 'center', fontSize: 11, color: 'var(--ryta-text-subtle)',
          margin: '8px 0 0', fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          {MODEL_INFO[model].name} · {MODE_INFO[mode].name} &nbsp;·&nbsp; Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

function ToolbarBtn({ icon: Icon, label, onClick, active, labelText, pulse }: {
  icon: React.ElementType; label: string; onClick: () => void;
  active?: boolean; labelText?: string; pulse?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: labelText ? '5px 10px' : '5px 7px',
        borderRadius: 7, background: 'none', border: 'none',
        cursor: 'pointer',
        color: active ? 'var(--ryta-primary)' : 'var(--ryta-text-subtle)',
        fontSize: 12, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500,
        transition: 'background 140ms ease, color 140ms ease',
        position: 'relative',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--ryta-surface)'; if (!active) (e.currentTarget.style.color = 'var(--ryta-text-muted)'); }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none'; if (!active) (e.currentTarget.style.color = 'var(--ryta-text-subtle)'); }}
    >
      <span style={{ position: 'relative' }}>
        <Icon size={15} />
        {pulse && (
          <span style={{
            position: 'absolute', top: -2, right: -2,
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--ryta-primary)',
            animation: 'ryta-pulse-dot 0.8s ease-in-out infinite',
          }} />
        )}
      </span>
      {labelText && <span>{labelText}</span>}
    </button>
  );
}
