import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { Model, Mode } from '../lib/types';
import { MODEL_MODES, MODEL_INFO, MODE_INFO } from '../lib/types';

interface ModelSelectorProps {
  model: Model;
  mode: Mode;
  onModelChange: (m: Model) => void;
  onModeChange: (m: Mode) => void;
}

export default function ModelSelector({ model, mode, onModelChange, onModeChange }: ModelSelectorProps) {
  const [modelOpen, setModelOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const modelRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) setModelOpen(false);
      if (modeRef.current && !modeRef.current.contains(e.target as Node)) setModeOpen(false);
    }
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, []);

  const modes = MODEL_MODES[model];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {/* Model selector */}
      <div ref={modelRef} style={{ position: 'relative' }}>
        <SelectorButton
          label={MODEL_INFO[model].name}
          sublabel="Model"
          open={modelOpen}
          onClick={() => { setModelOpen(v => !v); setModeOpen(false); }}
        />
        {modelOpen && (
          <Dropdown style={{ minWidth: 240 }}>
            <DropdownHeader>Select a model</DropdownHeader>
            {(['takshu', 'ryku'] as Model[]).map(m => (
              <DropdownOption
                key={m}
                selected={model === m}
                onClick={() => {
                  onModelChange(m);
                  onModeChange(MODEL_MODES[m][0]);
                  setModelOpen(false);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ModelDot model={m} />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ryta-text)' }}>{MODEL_INFO[m].name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ryta-text-muted)', marginTop: 1 }}>{MODEL_INFO[m].description}</div>
                  </div>
                  {model === m && <Check size={13} style={{ marginLeft: 'auto', color: 'var(--ryta-primary)', flexShrink: 0 }} />}
                </div>
              </DropdownOption>
            ))}
          </Dropdown>
        )}
      </div>

      <span style={{ color: 'var(--ryta-border-strong)', fontSize: 16, userSelect: 'none', margin: '0 2px' }}>/</span>

      {/* Mode selector */}
      <div ref={modeRef} style={{ position: 'relative' }}>
        <SelectorButton
          label={MODE_INFO[mode].name}
          sublabel="Mode"
          open={modeOpen}
          onClick={() => { setModeOpen(v => !v); setModelOpen(false); }}
          accent
        />
        {modeOpen && (
          <Dropdown style={{ minWidth: 260 }}>
            <DropdownHeader>{MODEL_INFO[model].name} modes</DropdownHeader>
            {modes.map(m => (
              <DropdownOption
                key={m}
                selected={mode === m}
                onClick={() => { onModeChange(m); setModeOpen(false); }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ryta-text)' }}>{MODE_INFO[m].name}</span>
                    {mode === m && <Check size={13} style={{ color: 'var(--ryta-primary)', flexShrink: 0 }} />}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ryta-text-muted)', marginTop: 2 }}>{MODE_INFO[m].description}</div>
                </div>
              </DropdownOption>
            ))}
          </Dropdown>
        )}
      </div>
    </div>
  );
}

function SelectorButton({ label, sublabel, open, onClick, accent }: {
  label: string; sublabel: string; open: boolean; onClick: () => void; accent?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-label={`${sublabel}: ${label}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '5px 9px', borderRadius: 7,
        background: open || hovered ? 'var(--ryta-surface)' : 'transparent',
        border: open ? '1px solid var(--ryta-border-strong)' : '1px solid transparent',
        cursor: 'pointer',
        transition: 'background 140ms ease, border-color 140ms ease',
      }}
    >
      <div style={{ textAlign: 'left' }}>
        <div style={{
          fontSize: 13.5, fontWeight: 600,
          color: accent ? 'var(--ryta-primary)' : 'var(--ryta-text)',
          lineHeight: 1.2, fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>{label}</div>
        <div style={{ fontSize: 10, color: 'var(--ryta-text-subtle)', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{sublabel}</div>
      </div>
      <ChevronDown size={12} style={{ color: 'var(--ryta-text-muted)', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease' }} />
    </button>
  );
}

function Dropdown({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
      background: 'var(--ryta-surface-raised)',
      border: '1px solid var(--ryta-border-strong)',
      borderRadius: 12, padding: '4px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
      animation: 'ryta-fade-up 150ms ease',
      ...style,
    }}>
      {children}
    </div>
  );
}

function DropdownHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '8px 12px 6px', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--ryta-text-subtle)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {children}
    </div>
  );
}

function DropdownOption({ children, selected, onClick }: { children: React.ReactNode; selected: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      role="option"
      aria-selected={selected}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', display: 'block', textAlign: 'left',
        padding: '9px 12px', borderRadius: 8,
        background: selected ? 'var(--ryta-surface)' : hovered ? 'var(--ryta-surface)' : 'transparent',
        border: 'none', cursor: 'pointer',
        transition: 'background 120ms ease',
      }}
    >
      {children}
    </button>
  );
}

function ModelDot({ model }: { model: Model }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: model === 'takshu' ? 8 : '50%',
      background: 'var(--ryta-primary)',
      opacity: 0.85,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ryta-primary-fg)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {model === 'takshu' ? 'T' : 'R'}
      </span>
    </div>
  );
}
