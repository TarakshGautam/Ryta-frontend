import { useState, useRef, useEffect } from 'react';
import {
  Plus, Search, Pin, Archive, Trash2, MoreHorizontal,
  Settings, User, ChevronRight, X, Edit3, Download,
  MessageSquare, Moon, Sun, Monitor,
} from 'lucide-react';
import type { Conversation, Mode, Model, Appearance } from '../lib/types';
import { groupConversationsByDate } from '../lib/mockData';

interface SidebarProps {
  conversations: Conversation[];
  activeConvId: string | null;
  collapsed: boolean;
  mobileOpen: boolean;
  appearance: Appearance;
  onNewChat: () => void;
  onSelectConv: (id: string) => void;
  onDeleteConv: (id: string) => void;
  onRenameConv: (id: string, title: string) => void;
  onPinConv: (id: string) => void;
  onArchiveConv: (id: string) => void;
  onExportConv: (id: string) => void;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onOpenSettings: () => void;
  onCycleAppearance: () => void;
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function highlightMatch(text: string, query: string): JSX.Element {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: 'var(--ryta-primary)', color: 'var(--ryta-primary-fg)', borderRadius: 2, padding: '0 1px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

interface ContextMenuState {
  convId: string;
  x: number;
  y: number;
}

export default function Sidebar({
  conversations,
  activeConvId,
  collapsed,
  mobileOpen,
  appearance,
  onNewChat,
  onSelectConv,
  onDeleteConv,
  onRenameConv,
  onPinConv,
  onArchiveConv,
  onExportConv,
  onToggleCollapse,
  onCloseMobile,
  onOpenSettings,
  onCycleAppearance,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId && renameRef.current) renameRef.current.focus();
  }, [renamingId]);

  useEffect(() => {
    const handler = () => setContextMenu(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  const filtered = searchQuery.trim()
    ? conversations.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.preview.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const groups = groupConversationsByDate(filtered);

  function openContextMenu(e: React.MouseEvent, convId: string) {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ convId, x: e.clientX, y: e.clientY });
  }

  function startRename(conv: Conversation) {
    setContextMenu(null);
    setRenamingId(conv.id);
    setRenameValue(conv.title);
  }

  function commitRename(id: string) {
    if (renameValue.trim()) onRenameConv(id, renameValue.trim());
    setRenamingId(null);
  }

  const appearanceIcon = appearance === 'dark' ? Moon : appearance === 'light' ? Sun : Monitor;
  const AppearanceIcon = appearanceIcon;

  function ConvSection({ label, items }: { label: string; items: Conversation[] }) {
    if (!items.length) return null;
    return (
      <div>
        {!collapsed && (
          <div style={{ padding: '16px 12px 4px', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ryta-text-subtle)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {label}
          </div>
        )}
        {items.map(conv => (
          <ConvItem key={conv.id} conv={conv} />
        ))}
      </div>
    );
  }

  function ConvItem({ conv }: { conv: Conversation }) {
    const isActive = conv.id === activeConvId;
    const isRenaming = renamingId === conv.id;
    const [hovered, setHovered] = useState(false);

    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={conv.title}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => { onSelectConv(conv.id); onCloseMobile(); }}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { onSelectConv(conv.id); onCloseMobile(); } }}
        onContextMenu={e => openContextMenu(e, conv.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          alignItems: collapsed ? 'center' : 'flex-start',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 8,
          padding: collapsed ? '10px 0' : '8px 12px',
          margin: '1px 8px',
          borderRadius: 8,
          cursor: 'pointer',
          background: isActive
            ? 'var(--ryta-surface)'
            : hovered ? 'var(--ryta-surface)' : 'transparent',
          border: isActive ? '1px solid var(--ryta-border)' : '1px solid transparent',
          transition: 'background 150ms ease, border-color 150ms ease',
          outline: 'none',
          position: 'relative',
        }}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        {collapsed ? (
          <div style={{ width: 36, height: 36, borderRadius: 8, background: isActive ? 'var(--ryta-surface-raised)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', border: isActive ? '1px solid var(--ryta-border)' : '1px solid transparent' }}>
            <MessageSquare size={15} style={{ color: isActive ? 'var(--ryta-primary)' : 'var(--ryta-text-muted)', flexShrink: 0 }} />
          </div>
        ) : (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              {isRenaming ? (
                <input
                  ref={renameRef}
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onBlur={() => commitRename(conv.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitRename(conv.id);
                    if (e.key === 'Escape') setRenamingId(null);
                    e.stopPropagation();
                  }}
                  onClick={e => e.stopPropagation()}
                  style={{
                    width: '100%',
                    background: 'var(--ryta-surface-raised)',
                    border: '1px solid var(--ryta-primary)',
                    borderRadius: 4,
                    padding: '2px 6px',
                    fontSize: 13,
                    color: 'var(--ryta-text)',
                    outline: 'none',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                />
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {conv.pinned && <Pin size={10} style={{ color: 'var(--ryta-primary)', flexShrink: 0, opacity: 0.8 }} />}
                    <span style={{
                      display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      fontSize: 13, fontWeight: isActive ? 500 : 400, color: isActive ? 'var(--ryta-text)' : 'var(--ryta-text-muted)',
                      transition: 'color 150ms ease', lineHeight: '1.4',
                    }}>
                      {highlightMatch(conv.title, searchQuery)}
                    </span>
                  </div>
                  {!isActive && (
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11.5, color: 'var(--ryta-text-subtle)', marginTop: 1 }}>
                      {conv.preview.slice(0, 48)}{conv.preview.length > 48 ? '…' : ''}
                    </span>
                  )}
                </>
              )}
            </div>
            {(hovered || isActive) && !isRenaming && (
              <button
                onClick={e => openContextMenu(e, conv.id)}
                aria-label="Conversation options"
                style={{
                  flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
                  padding: '2px', borderRadius: 4, display: 'flex', alignItems: 'center',
                  color: 'var(--ryta-text-muted)', transition: 'color 120ms ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--ryta-text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--ryta-text-muted)')}
              >
                <MoreHorizontal size={14} />
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed', inset: 0, zIndex: 49,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(2px)',
            animation: 'ryta-fade-in 200ms ease',
          }}
        />
      )}

      <aside
        className={`ryta-sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}
        aria-label="Chat navigation"
      >
        {/* Header */}
        <div style={{ padding: collapsed ? '16px 0 8px' : '16px 12px 8px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', flexShrink: 0 }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'var(--ryta-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ color: 'var(--ryta-primary-fg)', fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>R</span>
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ryta-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                RyTa<span style={{ color: 'var(--ryta-primary)', fontWeight: 400 }}>.AI</span>
              </span>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: 'var(--ryta-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: 'var(--ryta-primary-fg)', fontSize: 15, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>R</span>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={onCloseMobile}
              aria-label="Close sidebar"
              className="md-hide"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ryta-text-muted)', padding: 4, borderRadius: 4 }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* New Chat */}
        <div style={{ padding: collapsed ? '4px 10px' : '4px 12px', flexShrink: 0 }}>
          <button
            onClick={onNewChat}
            aria-label="New chat (Ctrl+K)"
            title="New chat  Ctrl+K"
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: collapsed ? 0 : 8, justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '9px 0' : '9px 12px',
              background: 'var(--ryta-primary)',
              color: 'var(--ryta-primary-fg)',
              border: 'none', borderRadius: 8, cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'background 150ms ease, opacity 150ms ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--ryta-primary-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--ryta-primary)')}
          >
            <Plus size={15} strokeWidth={2.5} />
            {!collapsed && <span>New chat</span>}
            {!collapsed && (
              <span style={{ marginLeft: 'auto', fontSize: 10.5, opacity: 0.65, letterSpacing: '0.02em' }}>⌘K</span>
            )}
          </button>
        </div>

        {/* Search */}
        {!collapsed && (
          <div style={{ padding: '6px 12px', flexShrink: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--ryta-surface)',
              border: '1px solid var(--ryta-border)',
              borderRadius: 8, padding: '7px 10px',
              transition: 'border-color 150ms ease',
            }}
              onFocusCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--ryta-border-strong)'; }}
              onBlurCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--ryta-border)'; }}
            >
              <Search size={13} style={{ color: 'var(--ryta-text-subtle)', flexShrink: 0 }} />
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search chats"
                aria-label="Search conversations"
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  fontSize: 12.5, color: 'var(--ryta-text)', fontFamily: "'Plus Jakarta Sans', sans-serif",
                  caretColor: 'var(--ryta-primary)',
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ryta-text-subtle)', padding: 0, display: 'flex' }}>
                  <X size={12} />
                </button>
              )}
              {!searchQuery && <span style={{ fontSize: 10, color: 'var(--ryta-text-subtle)', flexShrink: 0, letterSpacing: '0.02em' }}>⌘⇧K</span>}
            </div>
          </div>
        )}

        {/* Conversation List */}
        <div className="ryta-scroll" style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
          {searchQuery && filtered.length === 0 && (
            <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--ryta-text-subtle)', fontSize: 12.5 }}>
              No conversations found.
            </div>
          )}
          {!searchQuery && conversations.length === 0 && (
            <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--ryta-text-subtle)', fontSize: 12.5 }}>
              No conversations yet.
            </div>
          )}
          {searchQuery ? (
            filtered.map(conv => (
              <div key={conv.id}>
                <ConvItem conv={conv} />
              </div>
            ))
          ) : (
            <>
              <ConvSection label="Pinned" items={groups.pinned} />
              <ConvSection label="Today" items={groups.today} />
              <ConvSection label="Yesterday" items={groups.yesterday} />
              <ConvSection label="Previous 7 days" items={groups.week} />
              <ConvSection label="Older" items={groups.older} />
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid var(--ryta-border)',
          padding: collapsed ? '8px 10px' : '8px 12px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: collapsed ? 'column' : 'row',
          alignItems: 'center',
          gap: 6,
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'var(--ryta-surface-raised)',
                border: '1px solid var(--ryta-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <User size={14} style={{ color: 'var(--ryta-text-muted)' }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ryta-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>You</div>
                <div style={{ fontSize: 11, color: 'var(--ryta-text-subtle)' }}>Personal</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 4, flexDirection: collapsed ? 'column' : 'row' }}>
            <SidebarIconBtn icon={AppearanceIcon} label={`Appearance: ${appearance}`} onClick={onCycleAppearance} />
            <SidebarIconBtn icon={Settings} label="Settings" onClick={onOpenSettings} />
          </div>
        </div>
      </aside>

      {/* Context Menu */}
      {contextMenu && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: Math.min(contextMenu.y, window.innerHeight - 200),
            left: Math.min(contextMenu.x, window.innerWidth - 180),
            zIndex: 200,
            background: 'var(--ryta-surface-raised)',
            border: '1px solid var(--ryta-border-strong)',
            borderRadius: 10,
            padding: '4px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            minWidth: 168,
            animation: 'ryta-fade-up 150ms ease',
          }}
        >
          {[
            { icon: Edit3, label: 'Rename', action: () => { const c = conversations.find(x => x.id === contextMenu.convId); if (c) startRename(c); } },
            { icon: Pin, label: conversations.find(c => c.id === contextMenu.convId)?.pinned ? 'Unpin' : 'Pin', action: () => { onPinConv(contextMenu.convId); setContextMenu(null); } },
            { icon: Archive, label: 'Archive', action: () => { onArchiveConv(contextMenu.convId); setContextMenu(null); } },
            { icon: Download, label: 'Export', action: () => { onExportConv(contextMenu.convId); setContextMenu(null); } },
            { icon: Trash2, label: 'Delete', action: () => { onDeleteConv(contextMenu.convId); setContextMenu(null); }, danger: true },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', background: 'none', border: 'none',
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
          ))}
        </div>
      )}
    </>
  );
}

function SidebarIconBtn({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        width: 30, height: 30,
        background: 'none', border: 'none', cursor: 'pointer',
        borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--ryta-text-muted)',
        transition: 'background 120ms ease, color 120ms ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--ryta-surface)'; e.currentTarget.style.color = 'var(--ryta-text)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--ryta-text-muted)'; }}
    >
      <Icon size={15} />
    </button>
  );
}
