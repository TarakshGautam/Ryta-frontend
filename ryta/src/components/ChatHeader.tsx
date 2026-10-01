import { useState } from 'react';
import {
  PanelLeft, Search, Settings, MoreHorizontal,
  EyeOff, Trash2, Download, Edit3, Pin, Archive,
  Clock,
} from 'lucide-react';
import type { Model, Mode } from '../lib/types';
import ModelSelector from './ModelSelector';

interface ChatHeaderProps {
  model: Model;
  mode: Mode;
  activeConvId: string | null;
  isPinned?: boolean;
  isTemp: boolean;
  sidebarCollapsed: boolean;
  onModelChange: (m: Model) => void;
  onModeChange: (m: Mode) => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onNewChat: () => void;
  onToggleTemp: () => void;
  onDeleteConv?: () => void;
  onExportConv?: () => void;
  onRenameConv?: () => void;
  onPinConv?: () => void;
  onArchiveConv?: () => void;
  onMobileMenu: () => void;
}

export default function ChatHeader({
  model, mode, activeConvId, isPinned, isTemp,
  sidebarCollapsed, onModelChange, onModeChange,
  onToggleSidebar, onOpenSettings, onToggleTemp,
  onDeleteConv, onExportConv, onRenameConv, onPinConv, onArchiveConv,
  onMobileMenu,
}: ChatHeaderProps) {
  const [convMenuOpen, setConvMenuOpen] = useState(false);

  return (
    <header style={{
      height: 56,
      borderBottom: '1px solid var(--ryta-border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 8,
      flexShrink: 0,
      position: 'relative',
      zIndex: 10,
      backdropFilter: 'blur(12px)',
      background: 'var(--ryta-bg)',
      transition: 'background 300ms ease, border-color 200ms ease',
    }}>
      {/* Left: toggle + selectors */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
        {/* Sidebar toggle — desktop */}
        <button
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? 'Expand sidebar  ⌘B' : 'Collapse sidebar  ⌘B'}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={headerIconBtn}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--ryta-surface)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          className="desktop-only"
        >
          <PanelLeft size={16} />
        </button>

        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenu}
          aria-label="Open sidebar"
          style={headerIconBtn}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--ryta-surface)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          className="mobile-only"
        >
          <PanelLeft size={16} />
        </button>

        {/* Model / Mode — desktop */}
        <div className="desktop-only">
          <ModelSelector model={model} mode={mode} onModelChange={onModelChange} onModeChange={onModeChange} />
        </div>

        {/* Model / Mode compact — mobile */}
        <div className="mobile-only" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => {/* mobile model/mode handled via bottom sheet in App */}}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
              background: 'var(--ryta-surface)', border: '1px solid var(--ryta-border)',
              borderRadius: 8, cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: 'var(--ryta-text)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <span style={{ color: 'var(--ryta-primary)' }}>
              {model === 'takshu' ? 'Takshu' : 'Ryku'}
            </span>
            <span style={{ color: 'var(--ryta-text-subtle)', fontSize: 12 }}>·</span>
            <span>{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
          </button>
        </div>
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Temp chat indicator */}
        {isTemp && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 6,
            background: 'var(--ryta-surface)',
            border: '1px solid var(--ryta-border-strong)',
            fontSize: 11.5, color: 'var(--ryta-text-muted)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            marginRight: 4,
          }}>
            <Clock size={12} />
            <span>Temporary</span>
          </div>
        )}

        {/* Temp chat toggle */}
        <HeaderIconBtn
          icon={EyeOff}
          label={isTemp ? 'Exit temporary chat' : 'Start temporary chat'}
          onClick={onToggleTemp}
          active={isTemp}
        />

        {/* Conversation actions — only when conv is active */}
        {activeConvId && (
          <div style={{ position: 'relative' }}>
            <HeaderIconBtn
              icon={MoreHorizontal}
              label="Conversation options"
              onClick={() => setConvMenuOpen(v => !v)}
              active={convMenuOpen}
            />
            {convMenuOpen && (
              <div
                onClick={() => setConvMenuOpen(false)}
                style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 100,
                  background: 'var(--ryta-surface-raised)',
                  border: '1px solid var(--ryta-border-strong)',
                  borderRadius: 10, padding: '4px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.16)',
                  minWidth: 180,
                  animation: 'ryta-fade-up 150ms ease',
                }}
              >
                {[
                  { icon: Edit3, label: 'Rename', action: onRenameConv },
                  { icon: Pin, label: isPinned ? 'Unpin' : 'Pin to top', action: onPinConv },
                  { icon: Archive, label: 'Archive', action: onArchiveConv },
                  { icon: Download, label: 'Export', action: onExportConv },
                  { icon: Trash2, label: 'Delete', action: onDeleteConv, danger: true },
                ].map(item => item.action ? (
                  <button
                    key={item.label}
                    onClick={() => { item.action?.(); setConvMenuOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', background: 'none', border: 'none',
                      borderRadius: 7, cursor: 'pointer',
                      fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: item.danger ? '#e05555' : 'var(--ryta-text)',
                      transition: 'background 120ms ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = item.danger ? 'rgba(220,80,80,0.10)' : 'var(--ryta-surface)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                  >
                    <item.icon size={13} style={{ opacity: 0.7 }} />
                    {item.label}
                  </button>
                ) : null)}
              </div>
            )}
          </div>
        )}

        <HeaderIconBtn icon={Settings} label="Settings" onClick={onOpenSettings} />
      </div>
    </header>
  );
}

const headerIconBtn: React.CSSProperties = {
  width: 34, height: 34,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'transparent',
  border: 'none', borderRadius: 7, cursor: 'pointer',
  color: 'var(--ryta-text-muted)',
  transition: 'background 140ms ease, color 140ms ease',
};

function HeaderIconBtn({ icon: Icon, label, onClick, active }: {
  icon: React.ElementType; label: string; onClick: () => void; active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        ...headerIconBtn,
        background: active ? 'var(--ryta-surface)' : 'transparent',
        color: active ? 'var(--ryta-text)' : 'var(--ryta-text-muted)',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--ryta-surface)'; e.currentTarget.style.color = 'var(--ryta-text)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = active ? 'var(--ryta-surface)' : 'transparent'; e.currentTarget.style.color = active ? 'var(--ryta-text)' : 'var(--ryta-text-muted)'; }}
    >
      <Icon size={16} />
    </button>
  );
}
