import type { Model, Mode } from '../lib/types';
import { getGreeting, getSubGreeting, STARTER_PROMPTS } from '../lib/types';

interface WelcomeStateProps {
  model: Model;
  mode: Mode;
  onPrompt: (text: string) => void;
}

export default function WelcomeState({ model, mode, onPrompt }: WelcomeStateProps) {
  const greeting = getGreeting(model);
  const sub = getSubGreeting(mode);
  const prompts = STARTER_PROMPTS[mode];

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px 80px',
        animation: 'ryta-fade-up 240ms ease',
      }}
    >
      {/* Avatar mark */}
      <div style={{
        width: 48, height: 48, marginBottom: 24,
        borderRadius: model === 'takshu' ? 12 : '50%',
        background: 'var(--ryta-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: 0.9,
        boxShadow: '0 0 0 8px var(--ryta-ambient-a)',
        transition: 'border-radius 300ms ease, background 300ms ease',
      }}>
        <span style={{
          fontSize: 20, fontWeight: 700, color: 'var(--ryta-primary-fg)',
          fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em',
        }}>
          {model === 'takshu' ? 'T' : 'R'}
        </span>
      </div>

      {/* Greeting */}
      <h1 style={{
        margin: '0 0 6px',
        fontSize: 'clamp(24px, 4vw, 32px)',
        fontWeight: 700,
        letterSpacing: '-0.04em',
        color: 'var(--ryta-text)',
        textAlign: 'center',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        lineHeight: 1.1,
        transition: 'color 300ms ease',
      }}>
        {greeting}
      </h1>
      <p style={{
        margin: '0 0 36px',
        fontSize: 16,
        color: 'var(--ryta-text-muted)',
        textAlign: 'center',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        transition: 'color 300ms ease',
      }}>
        {sub}
      </p>

      {/* Starter prompts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 10,
        maxWidth: 580,
        width: '100%',
      }}
        className="starter-grid"
      >
        {prompts.map((prompt, i) => (
          <StarterPrompt key={i} text={prompt} onClick={() => onPrompt(prompt)} delay={i * 40} />
        ))}
      </div>

      <style>{`
        @media (max-width: 520px) {
          .starter-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function StarterPrompt({ text, onClick, delay }: { text: string; onClick: () => void; delay: number }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: 'left',
        padding: '14px 16px',
        background: 'var(--ryta-surface)',
        border: '1px solid var(--ryta-border)',
        borderRadius: 10,
        cursor: 'pointer',
        fontSize: 13.5,
        color: 'var(--ryta-text-muted)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        lineHeight: 1.5,
        transition: 'background 150ms ease, border-color 150ms ease, color 150ms ease',
        animation: `ryta-fade-up 220ms ${delay}ms ease both`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--ryta-surface-raised)';
        e.currentTarget.style.borderColor = 'var(--ryta-border-strong)';
        e.currentTarget.style.color = 'var(--ryta-text)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--ryta-surface)';
        e.currentTarget.style.borderColor = 'var(--ryta-border)';
        e.currentTarget.style.color = 'var(--ryta-text-muted)';
      }}
    >
      {text}
    </button>
  );
}
