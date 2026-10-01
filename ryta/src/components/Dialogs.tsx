import { useState, useEffect } from 'react';
import { AlertTriangle, X, Check, Download } from 'lucide-react';
import type { Toast } from '../lib/types';
import { MODEL_MODES, MODEL_INFO, MODE_INFO } from '../lib/types';

/* ─── Delete Confirmation ─── */
interface DeleteDialogProps {
  convTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}
export function DeleteDialog({ convTitle, onConfirm, onCancel }: DeleteDialogProps) {
  return (
    <ModalOverlay onClose={onCancel}>
      <div style={{ padding: '24px', width: 380 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(220,80,80,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={16} style={{ color: '#e05555' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--ryta-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Delete conversation?</h3>
          </div>
        </div>
        <p style={{ margin: '0 0 20px', fontSize: 13.5, color: 'var(--ryta-text-muted)', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--ryta-text)' }}>&ldquo;{convTitle}&rdquo;</strong> will be permanently removed. This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <DialogBtn label="Cancel" onClick={onCancel} />
          <DialogBtn label="Delete" onClick={onConfirm} danger />
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ─── Rename Dialog ─── */
interface RenameDialogProps {
  currentTitle: string;
  onConfirm: (title: string) => void;
  onCancel: () => void;
}
export function RenameDialog({ currentTitle, onConfirm, onCancel }: RenameDialogProps) {
  const [value, setValue] = useState(currentTitle);
  return (
    <ModalOverlay onClose={onCancel}>
      <div style={{ padding: '24px', width: 380 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: 'var(--ryta-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Rename conversation</h3>
        <input
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') onConfirm(value);
            if (e.key === 'Escape') onCancel();
          }}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 8,
            background: 'var(--ryta-surface)',
            border: '1px solid var(--ryta-border-strong)',
            color: 'var(--ryta-text)', fontSize: 14,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            outline: 'none', marginBottom: 16,
            caretColor: 'var(--ryta-primary)',
          }}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <DialogBtn label="Cancel" onClick={onCancel} />
          <DialogBtn label="Save" onClick={() => onConfirm(value)} primary />
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ─── Export Dialog ─── */
interface ExportDialogProps {
  convTitle: string;
  onExport: (format: 'md' | 'txt' | 'json') => void;
  onCancel: () => void;
}
export function ExportDialog({ convTitle, onExport, onCancel }: ExportDialogProps) {
  const formats: { id: 'md' | 'txt' | 'json'; label: string; desc: string }[] = [
    { id: 'md', label: 'Markdown', desc: 'Formatted with headers and code blocks' },
    { id: 'txt', label: 'Plain text', desc: 'Simple readable format' },
    { id: 'json', label: 'JSON', desc: 'Structured data with metadata' },
  ];
  return (
    <ModalOverlay onClose={onCancel}>
      <div style={{ padding: '24px', width: 380 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Download size={16} style={{ color: 'var(--ryta-primary)' }} />
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--ryta-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Export conversation</h3>
        </div>
        <p style={{ margin: '0 0 16px', fontSize: 12.5, color: 'var(--ryta-text-muted)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Choose a format for &ldquo;{convTitle.slice(0, 40)}&rdquo;
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
          {formats.map(f => (
            <button
              key={f.id}
              onClick={() => onExport(f.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 14px', borderRadius: 9,
                border: '1px solid var(--ryta-border)',
                background: 'transparent', cursor: 'pointer',
                textAlign: 'left', transition: 'background 130ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--ryta-surface)'; e.currentTarget.style.borderColor = 'var(--ryta-border-strong)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--ryta-border)'; }}
            >
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ryta-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{f.label}</div>
                <div style={{ fontSize: 12, color: 'var(--ryta-text-muted)', marginTop: 2 }}>{f.desc}</div>
              </div>
              <Download size={13} style={{ color: 'var(--ryta-text-subtle)', flexShrink: 0 }} />
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <DialogBtn label="Cancel" onClick={onCancel} />
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ─── Modal Overlay ─── */
function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="ryta-modal-fade"
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--ryta-bg)',
        border: '1px solid var(--ryta-border-strong)',
        borderRadius: 14,
        boxShadow: '0 16px 48px rgba(0,0,0,0.24)',
        animation: 'ryta-fade-up 180ms ease',
      }}>
        {children}
      </div>
    </div>
  );
}

function DialogBtn({ label, onClick, primary, danger }: {
  label: string; onClick: () => void; primary?: boolean; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 18px', borderRadius: 8,
        fontSize: 13.5, fontWeight: 500,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        border: danger || primary ? 'none' : '1px solid var(--ryta-border)',
        background: danger ? '#c42a2a' : primary ? 'var(--ryta-primary)' : 'transparent',
        color: danger || primary ? '#fff' : 'var(--ryta-text-muted)',
        cursor: 'pointer', transition: 'opacity 140ms ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
    >
      {label}
    </button>
  );
}

/* ─── Toast System ─── */
interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}
export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 400,
      display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center',
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 3200);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px',
        background: 'var(--ryta-surface-raised)',
        border: '1px solid var(--ryta-border-strong)',
        borderRadius: 10,
        boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
        fontSize: 13.5, color: 'var(--ryta-text)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        pointerEvents: 'all',
        animation: 'ryta-toast-in 200ms ease',
        whiteSpace: 'nowrap',
      }}
    >
      {toast.type !== 'error' && <Check size={13} style={{ color: 'var(--ryta-primary)', flexShrink: 0 }} />}
      {toast.type === 'error' && <X size={13} style={{ color: '#e05555', flexShrink: 0 }} />}
      <span>{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ryta-text-subtle)', padding: 0, display: 'flex', marginLeft: 4 }}
      >
        <X size={12} />
      </button>
    </div>
  );
}

/* ─── Mobile Model/Mode Sheet ─── */
interface MobileModelSheetProps {
  model: import('../lib/types').Model;
  mode: import('../lib/types').Mode;
  onModelChange: (m: import('../lib/types').Model) => void;
  onModeChange: (m: import('../lib/types').Mode) => void;
  onClose: () => void;
}
export function MobileModelSheet({ model, mode, onModelChange, onModeChange, onClose }: MobileModelSheetProps) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end',
        animation: 'ryta-fade-in 200ms ease',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: '100%',
        background: 'var(--ryta-sidebar)',
        borderRadius: '16px 16px 0 0',
        border: '1px solid var(--ryta-border-strong)',
        padding: '16px',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.2)',
        animation: 'ryta-fade-up 220ms ease',
        maxHeight: '70vh', overflowY: 'auto',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--ryta-border-strong)', margin: '0 auto 20px' }} />
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--ryta-text-subtle)', marginBottom: 10, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Model</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {(['takshu', 'ryku'] as import('../lib/types').Model[]).map(m => (
            <button key={m} onClick={() => { onModelChange(m); onModeChange(MODEL_MODES[m][0]); }}
              style={{ flex: 1, padding: '12px', borderRadius: 10, background: model === m ? 'var(--ryta-surface)' : 'transparent', border: model === m ? '1px solid var(--ryta-border-strong)' : '1px solid var(--ryta-border)', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ryta-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{MODEL_INFO[m].name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ryta-text-muted)', marginTop: 2 }}>{MODEL_INFO[m].description}</div>
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--ryta-text-subtle)', marginBottom: 10, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Mode</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {MODEL_MODES[model].map((m: import('../lib/types').Mode) => (
            <button key={m} onClick={() => { onModeChange(m); onClose(); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, background: mode === m ? 'var(--ryta-surface)' : 'transparent', border: mode === m ? '1px solid var(--ryta-border-strong)' : '1px solid var(--ryta-border)', cursor: 'pointer', textAlign: 'left' }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ryta-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{MODE_INFO[m].name}</div>
                <div style={{ fontSize: 12, color: 'var(--ryta-text-muted)', marginTop: 2 }}>{MODE_INFO[m].description}</div>
              </div>
              {mode === m && <Check size={14} style={{ color: 'var(--ryta-primary)', flexShrink: 0 }} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
