import { useState } from 'react';
import {
  X, Monitor, Moon, Sun, Sliders, MessageSquare, Cpu,
  User, Brain, Shield, Keyboard, ChevronRight, ToggleLeft, ToggleRight,
  Download, Trash2, AlertTriangle, Check, Info,
} from 'lucide-react';
import type { AppSettings, Model, Mode, Appearance } from '../lib/types';
import { MODEL_MODES, MODEL_INFO, MODE_INFO } from '../lib/types';

interface SettingsProps {
  settings: AppSettings;
  model: Model;
  mode: Mode;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onModelChange: (m: Model) => void;
  onModeChange: (m: Mode) => void;
  onClose: () => void;
  onExportData: () => void;
  onClearHistory: () => void;
  initialTab?: string;
}

type Tab = 'general' | 'appearance' | 'chat' | 'models' | 'personalization' | 'memory' | 'privacy' | 'shortcuts';

const NAV: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'General', icon: Sliders },
  { id: 'appearance', label: 'Appearance', icon: Monitor },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'models', label: 'Models & Modes', icon: Cpu },
  { id: 'personalization', label: 'Personalization', icon: User },
  { id: 'memory', label: 'Memory', icon: Brain },
  { id: 'privacy', label: 'Privacy & Data', icon: Shield },
  { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
];

export default function Settings({ settings, model, mode, onUpdateSettings, onModelChange, onModeChange, onClose, onExportData, onClearHistory, initialTab = 'general' }: SettingsProps) {
  const [tab, setTab] = useState<Tab>(initialTab as Tab);
  const [clearConfirm, setClearConfirm] = useState(false);

  const s = settings;
  const set = (patch: Partial<AppSettings>) => onUpdateSettings(patch);

  return (
    <div
      className="ryta-modal-fade"
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--ryta-bg)',
        border: '1px solid var(--ryta-border-strong)',
        borderRadius: 16,
        width: '100%', maxWidth: 720,
        maxHeight: '88vh',
        display: 'flex',
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
      }}>
        {/* Left nav */}
        <nav style={{
          width: 196, flexShrink: 0,
          background: 'var(--ryta-sidebar)',
          borderRight: '1px solid var(--ryta-border)',
          display: 'flex', flexDirection: 'column',
          padding: '16px 8px',
        }}>
          <div style={{ padding: '4px 8px 16px', fontSize: 13, fontWeight: 700, color: 'var(--ryta-text)', letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Settings
          </div>
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 10px', borderRadius: 8,
                background: tab === n.id ? 'var(--ryta-surface)' : 'transparent',
                border: tab === n.id ? '1px solid var(--ryta-border)' : '1px solid transparent',
                cursor: 'pointer',
                fontSize: 13, fontWeight: tab === n.id ? 500 : 400,
                color: tab === n.id ? 'var(--ryta-text)' : 'var(--ryta-text-muted)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                marginBottom: 2,
                transition: 'all 130ms ease',
                textAlign: 'left',
              }}
            >
              <n.icon size={14} style={{ opacity: tab === n.id ? 1 : 0.65 }} />
              {n.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid var(--ryta-border)',
            flexShrink: 0,
          }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--ryta-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {NAV.find(n => n.id === tab)?.label}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close settings"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ryta-text-muted)', borderRadius: 6, padding: 4, display: 'flex' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--ryta-surface)'; e.currentTarget.style.color = 'var(--ryta-text)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--ryta-text-muted)'; }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Tab content */}
          <div className="ryta-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

            {tab === 'general' && (
              <Section>
                <Row label="Appearance" desc="Choose between light and dark interface">
                  <SegmentedControl
                    value={s.appearance}
                    options={[
                      { value: 'system', label: 'System', icon: Monitor },
                      { value: 'light', label: 'Light', icon: Sun },
                      { value: 'dark', label: 'Dark', icon: Moon },
                    ]}
                    onChange={v => set({ appearance: v as Appearance })}
                  />
                </Row>
                <Row label="Interface density" desc="Adjust spacing throughout the interface">
                  <SegmentedControl
                    value={s.density}
                    options={[
                      { value: 'compact', label: 'Compact' },
                      { value: 'comfortable', label: 'Comfortable' },
                      { value: 'spacious', label: 'Spacious' },
                    ]}
                    onChange={v => set({ density: v as AppSettings['density'] })}
                  />
                </Row>
              </Section>
            )}

            {tab === 'appearance' && (
              <Section>
                <Row label="Appearance" desc="Light, dark, or follow system preference">
                  <SegmentedControl
                    value={s.appearance}
                    options={[
                      { value: 'system', label: 'System', icon: Monitor },
                      { value: 'light', label: 'Light', icon: Sun },
                      { value: 'dark', label: 'Dark', icon: Moon },
                    ]}
                    onChange={v => set({ appearance: v as Appearance })}
                  />
                </Row>
                <Divider />
                <Row label="Accent intensity" desc="How strongly personality colors appear">
                  <SegmentedControl
                    value={s.themeIntensity}
                    options={[
                      { value: 'subtle', label: 'Subtle' },
                      { value: 'balanced', label: 'Balanced' },
                      { value: 'vivid', label: 'Vivid' },
                    ]}
                    onChange={v => set({ themeIntensity: v as AppSettings['themeIntensity'] })}
                  />
                </Row>
                <Row label="Ambient effects" desc="Subtle background depth and lighting"><Toggle value={s.ambientEffects} onChange={v => set({ ambientEffects: v })} /></Row>
                <Row label="Background depth" desc="Layered visual environment behind the interface"><Toggle value={s.backgroundDepth} onChange={v => set({ backgroundDepth: v })} /></Row>
                <Row label="Glass surfaces" desc="Frosted-glass effect on panels and overlays"><Toggle value={s.glassSurfaces} onChange={v => set({ glassSurfaces: v })} /></Row>
                <Divider />
                <Row label="Animations" desc="Control motion throughout the interface">
                  <SegmentedControl
                    value={s.animations}
                    options={[
                      { value: 'full', label: 'Full' },
                      { value: 'reduced', label: 'Reduced' },
                      { value: 'off', label: 'Off' },
                    ]}
                    onChange={v => set({ animations: v as AppSettings['animations'] })}
                  />
                </Row>
                <Row label="Interface density" desc="Spacing and size of interface elements">
                  <SegmentedControl
                    value={s.density}
                    options={[
                      { value: 'compact', label: 'Compact' },
                      { value: 'comfortable', label: 'Comfortable' },
                      { value: 'spacious', label: 'Spacious' },
                    ]}
                    onChange={v => set({ density: v as AppSettings['density'] })}
                  />
                </Row>
              </Section>
            )}

            {tab === 'chat' && (
              <Section>
                <Row label="Enter to send" desc="Press Enter to send messages. Use Shift+Enter for new lines."><Toggle value={s.enterToSend} onChange={v => set({ enterToSend: v })} /></Row>
                <Row label="Show timestamps" desc="Display time next to each message"><Toggle value={s.showTimestamps} onChange={v => set({ showTimestamps: v })} /></Row>
                <Row label="Show message actions" desc="Show copy, edit, and feedback options on hover"><Toggle value={s.showMessageActions} onChange={v => set({ showMessageActions: v })} /></Row>
                <Row label="Auto-scroll" desc="Automatically scroll to new messages"><Toggle value={s.autoScroll} onChange={v => set({ autoScroll: v })} /></Row>
                <Divider />
                <Row label="Markdown rendering" desc="Render bold, code, lists, and other formatting"><Toggle value={s.markdownRendering} onChange={v => set({ markdownRendering: v })} /></Row>
                <Row label="Code line numbers" desc="Show line numbers in code blocks"><Toggle value={s.codeLineNumbers} onChange={v => set({ codeLineNumbers: v })} /></Row>
                <Row label="Compact messages" desc="Reduce spacing between messages"><Toggle value={s.compactMessages} onChange={v => set({ compactMessages: v })} /></Row>
                <Row label="Show AI status" desc="Show when the AI is thinking or generating"><Toggle value={s.showAiStatus} onChange={v => set({ showAiStatus: v })} /></Row>
              </Section>
            )}

            {tab === 'models' && (
              <Section>
                <SectionTitle>Active Model</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                  {(['takshu', 'ryku'] as Model[]).map(m => (
                    <button
                      key={m}
                      onClick={() => { onModelChange(m); onModeChange(MODEL_MODES[m][0]); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px', borderRadius: 10,
                        background: model === m ? 'var(--ryta-surface)' : 'transparent',
                        border: model === m ? '1px solid var(--ryta-border-strong)' : '1px solid var(--ryta-border)',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all 140ms ease',
                      }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: m === 'takshu' ? 9 : '50%',
                        background: 'var(--ryta-primary)', opacity: 0.85,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ryta-primary-fg)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {m === 'takshu' ? 'T' : 'R'}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ryta-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{MODEL_INFO[m].name}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--ryta-text-muted)', marginTop: 2 }}>{MODEL_INFO[m].description}</div>
                      </div>
                      {model === m && <Check size={15} style={{ color: 'var(--ryta-primary)', flexShrink: 0 }} />}
                    </button>
                  ))}
                </div>
                <SectionTitle>Active Mode</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {MODEL_MODES[model].map(m => (
                    <button
                      key={m}
                      onClick={() => onModeChange(m)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 14px', borderRadius: 10,
                        background: mode === m ? 'var(--ryta-surface)' : 'transparent',
                        border: mode === m ? '1px solid var(--ryta-border-strong)' : '1px solid var(--ryta-border)',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all 140ms ease',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ryta-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{MODE_INFO[m].name}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--ryta-text-muted)', marginTop: 2 }}>{MODE_INFO[m].description}</div>
                      </div>
                      {mode === m && <Check size={15} style={{ color: 'var(--ryta-primary)', flexShrink: 0 }} />}
                    </button>
                  ))}
                </div>
              </Section>
            )}

            {tab === 'personalization' && (
              <Section>
                <Row label="Response style" desc="How detailed and verbose responses should be">
                  <SegmentedControl
                    value={s.responseStyle}
                    options={[
                      { value: 'concise', label: 'Concise' },
                      { value: 'balanced', label: 'Balanced' },
                      { value: 'detailed', label: 'Detailed' },
                    ]}
                    onChange={v => set({ responseStyle: v as AppSettings['responseStyle'] })}
                  />
                </Row>
                <Row label="Personality expression" desc="How strongly RyTa's personality comes through">
                  <SegmentedControl
                    value={s.personalityExpression}
                    options={[
                      { value: 'subtle', label: 'Subtle' },
                      { value: 'natural', label: 'Natural' },
                      { value: 'expressive', label: 'Expressive' },
                    ]}
                    onChange={v => set({ personalityExpression: v as AppSettings['personalityExpression'] })}
                  />
                </Row>
                <Divider />
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13.5, fontWeight: 500, color: 'var(--ryta-text)', marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Custom instructions
                  </label>
                  <p style={{ fontSize: 12.5, color: 'var(--ryta-text-muted)', marginBottom: 10, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.5 }}>
                    Tell RyTa anything you'd like it to always keep in mind — your preferences, context, or how you like to communicate.
                  </p>
                  <textarea
                    value={s.customInstructions}
                    onChange={e => set({ customInstructions: e.target.value })}
                    placeholder="E.g. I prefer concise responses. I'm a software engineer. Always give examples when explaining concepts..."
                    rows={5}
                    style={{
                      width: '100%', padding: '12px', borderRadius: 8,
                      background: 'var(--ryta-surface)',
                      border: '1px solid var(--ryta-border)',
                      color: 'var(--ryta-text)', fontSize: 13.5,
                      fontFamily: "'Inter', sans-serif", lineHeight: 1.6,
                      resize: 'vertical', outline: 'none',
                      transition: 'border-color 150ms ease',
                      caretColor: 'var(--ryta-primary)',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--ryta-border-strong)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--ryta-border)'; }}
                  />
                </div>
                <Row label="Use conversation context" desc="Let RyTa refer back to earlier parts of your conversation"><Toggle value={s.useConversationContext} onChange={v => set({ useConversationContext: v })} /></Row>
              </Section>
            )}

            {tab === 'memory' && (
              <Section>
                <Row label="Memory" desc="RyTa remembers things across conversations to give you a more personal experience">
                  <Toggle value={s.memory} onChange={v => set({ memory: v })} />
                </Row>
                <Row label="Use previous context" desc="Reference memories when crafting responses">
                  <Toggle value={s.useConversationContext} onChange={v => set({ useConversationContext: v })} />
                </Row>
                <Divider />
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ryta-text)', marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Saved memories</div>
                  <p style={{ fontSize: 12.5, color: 'var(--ryta-text-muted)', marginBottom: 16, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.5 }}>
                    Things RyTa has remembered about you from past conversations.
                  </p>
                  <div style={{ padding: '16px', background: 'var(--ryta-surface)', border: '1px solid var(--ryta-border)', borderRadius: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 12.5, color: 'var(--ryta-text-subtle)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No saved memories yet.</div>
                  </div>
                </div>
                <button
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '9px 14px', borderRadius: 8,
                    border: '1px solid var(--ryta-border)',
                    background: 'transparent', cursor: 'pointer',
                    fontSize: 13, color: 'var(--ryta-text-muted)',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    transition: 'background 130ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--ryta-surface)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <Trash2 size={13} />
                  Clear all memories
                </button>
              </Section>
            )}

            {tab === 'privacy' && (
              <Section>
                <Row label="Temporary chat" desc="Conversations in temporary mode are not saved to your history">
                  <Toggle value={s.temporaryChat} onChange={v => set({ temporaryChat: v })} />
                </Row>
                <Row label="Save chat history" desc="Keep a record of your past conversations">
                  <Toggle value={s.chatHistory} onChange={v => set({ chatHistory: v })} />
                </Row>
                <Row label="Memory" desc="Allow RyTa to remember things across conversations">
                  <Toggle value={s.memory} onChange={v => set({ memory: v })} />
                </Row>
                <Divider />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <DestructiveAction
                    icon={Download}
                    label="Export my data"
                    desc="Download a copy of your conversations and settings"
                    onClick={onExportData}
                    buttonLabel="Export"
                  />
                  <DestructiveAction
                    icon={Trash2}
                    label="Clear conversation history"
                    desc="Permanently delete all saved conversations"
                    onClick={() => { if (clearConfirm) { onClearHistory(); setClearConfirm(false); } else setClearConfirm(true); }}
                    buttonLabel={clearConfirm ? 'Confirm delete' : 'Clear history'}
                    danger={clearConfirm}
                  />
                </div>
                {clearConfirm && (
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(220,80,80,0.08)', border: '1px solid rgba(220,80,80,0.18)', borderRadius: 8, fontSize: 12.5, color: 'var(--ryta-text-muted)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    <AlertTriangle size={13} style={{ color: '#e05555', flexShrink: 0 }} />
                    This action is permanent and cannot be undone.
                    <button onClick={() => setClearConfirm(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ryta-text-muted)', fontSize: 12 }}>Cancel</button>
                  </div>
                )}
              </Section>
            )}

            {tab === 'shortcuts' && (
              <Section>
                <SectionTitle>Navigation</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 20 }}>
                  {[
                    { action: 'New chat', keys: ['⌘', 'K'] },
                    { action: 'Search chats', keys: ['⌘', '⇧', 'K'] },
                    { action: 'Toggle sidebar', keys: ['⌘', 'B'] },
                    { action: 'Focus composer', keys: ['/'] },
                  ].map(s => <ShortcutRow key={s.action} action={s.action} keys={s.keys} />)}
                </div>
                <SectionTitle>Conversation</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 20 }}>
                  {[
                    { action: 'Send message', keys: ['↵'] },
                    { action: 'New line', keys: ['⇧', '↵'] },
                    { action: 'Stop generation', keys: ['Esc'] },
                  ].map(s => <ShortcutRow key={s.action} action={s.action} keys={s.keys} />)}
                </div>
              </Section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function Section({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>{children}</div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ryta-text-subtle)', marginBottom: 10, marginTop: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{children}</div>;
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--ryta-border)', margin: '16px 0' }} />;
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--ryta-border)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ryta-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: 'var(--ryta-text-muted)', marginTop: 2, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.45 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        width: 40, height: 22, borderRadius: 11,
        background: value ? 'var(--ryta-primary)' : 'var(--ryta-surface-raised)',
        border: '1px solid ' + (value ? 'var(--ryta-primary)' : 'var(--ryta-border-strong)'),
        cursor: 'pointer', padding: 0, position: 'relative',
        transition: 'background 200ms ease, border-color 200ms ease',
      }}
    >
      <span style={{
        position: 'absolute', top: 2,
        left: value ? 20 : 2,
        width: 16, height: 16, borderRadius: '50%',
        background: value ? 'var(--ryta-primary-fg)' : 'var(--ryta-text-muted)',
        transition: 'left 200ms ease',
      }} />
    </button>
  );
}

function SegmentedControl({ value, options, onChange }: {
  value: string;
  options: { value: string; label: string; icon?: React.ElementType }[];
  onChange: (v: string) => void;
}) {
  return (
    <div style={{
      display: 'flex', gap: 2,
      background: 'var(--ryta-surface)', border: '1px solid var(--ryta-border)',
      borderRadius: 8, padding: 3,
    }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 6,
            background: value === opt.value ? 'var(--ryta-surface-raised)' : 'transparent',
            border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: value === opt.value ? 500 : 400,
            color: value === opt.value ? 'var(--ryta-text)' : 'var(--ryta-text-muted)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: 'all 140ms ease',
          }}
        >
          {opt.icon && <opt.icon size={12} />}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function DestructiveAction({ icon: Icon, label, desc, onClick, buttonLabel, danger }: {
  icon: React.ElementType; label: string; desc: string; onClick: () => void; buttonLabel: string; danger?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 14px', background: 'var(--ryta-surface)', border: '1px solid var(--ryta-border)', borderRadius: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon size={15} style={{ color: 'var(--ryta-text-muted)', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ryta-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</div>
          <div style={{ fontSize: 12, color: 'var(--ryta-text-muted)', marginTop: 1 }}>{desc}</div>
        </div>
      </div>
      <button
        onClick={onClick}
        style={{
          padding: '6px 12px', borderRadius: 7, fontSize: 12.5, fontWeight: 500,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          border: danger ? 'none' : '1px solid var(--ryta-border)',
          background: danger ? 'rgba(220,80,80,0.12)' : 'transparent',
          color: danger ? '#e05555' : 'var(--ryta-text-muted)',
          cursor: 'pointer', transition: 'all 140ms ease', flexShrink: 0,
        }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function ShortcutRow({ action, keys }: { action: string; keys: string[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--ryta-border)' }}>
      <span style={{ fontSize: 13.5, color: 'var(--ryta-text-muted)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{action}</span>
      <div style={{ display: 'flex', gap: 4 }}>
        {keys.map((k, i) => (
          <kbd key={i} style={{
            padding: '2px 7px', borderRadius: 5,
            background: 'var(--ryta-surface-raised)',
            border: '1px solid var(--ryta-border-strong)',
            fontSize: 12, color: 'var(--ryta-text-muted)',
            fontFamily: "'JetBrains Mono', monospace",
          }}>{k}</kbd>
        ))}
      </div>
    </div>
  );
}
