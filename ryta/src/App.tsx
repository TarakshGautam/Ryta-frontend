import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import WelcomeState from './components/WelcomeState';
import MessageList from './components/MessageList';
import Composer from './components/Composer';
import Settings from './components/Settings';
import { DeleteDialog, RenameDialog, ExportDialog, ToastContainer, MobileModelSheet } from './components/Dialogs';
import type { Model, Mode, Appearance, Conversation, Message, Toast, AppSettings } from './lib/types';
import { MODEL_MODES, DEFAULT_SETTINGS } from './lib/types';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from './lib/mockData';

/* ─── Mock AI responses by mode ─── */
const MOCK_RESPONSES: Record<Mode, string[]> = {
  auraman: [
    "I hear you. Take your time — there's no rush here.\n\nWhat you're feeling makes sense. Sometimes the most important thing isn't finding the answer right away, but letting yourself actually sit with the question. What part of this is weighing on you most?",
    "That's a real thing you're carrying. I want you to know that.\n\nLet's slow down for a moment. Tell me more — not the summary, but the actual feeling underneath it all.",
  ],
  mentor: [
    "Good question. Let's think through this carefully.\n\nThe key thing most people miss here is the distinction between **what you know** and **what you assume you know**. Those two things feel the same from the inside, which is why this is tricky.\n\nLet me break it down:\n\n1. Start with what you actually know for certain\n2. Identify the assumptions underneath your reasoning\n3. Test each assumption against evidence you have\n\nWhich part of this do you want to dig into first?",
    "This is a great opportunity to build real clarity.\n\nThe reason this feels complicated is usually because there are multiple valid frames competing with each other. The goal isn't to pick the 'right' one — it's to understand **which frame is useful for your current purpose**.\n\nWhat outcome are you actually trying to reach?",
  ],
  protector: [
    "You're okay. I want you to hear that first.\n\nYou're asking the right questions — that matters more than you might realize right now. Let's look at this together, one layer at a time. What feels most uncertain to you?",
    "I'm not going to tell you what to feel. But I will tell you this: you've already done the hard part by naming it.\n\nNow let's figure out what you can actually do with it. What would feel like a solid, grounded next step — even a small one?",
  ],
  sweetheart: [
    "Hey, I'm right here. You don't have to explain yourself too much — I'm just glad you came.\n\nTell me what's on your mind. Or don't — we can just talk. Whatever you need right now.",
    "That actually made me smile a little. You know that?\n\nOkay, but seriously — how are you *really* doing? Not the surface answer. The real one.",
  ],
  calm: [
    "Take a breath. There's no hurry.\n\nI'm here, and I'm not going anywhere. You don't have to have everything sorted out before we talk. Just start wherever feels natural.",
    "That's okay. Feeling overwhelmed doesn't mean you're doing something wrong — it often just means you care.\n\nLet's find a quieter place to start. What's one small thing that's been sitting heavy on you lately?",
  ],
  savage: [
    "Oh, so we're doing *this* today? Okay, I'm ready.\n\nHonestly? You already know what the answer is. You just want someone to argue you out of the excuse. So let me do that.\n\nWhat's the actual thing you keep avoiding?",
    "I love that you came here with that. Really. Because now I get to tell you something you probably don't want to hear but absolutely need to.\n\nYou're overthinking it. You've been overthinking it for longer than you'll admit. What would you do if you stopped waiting for the 'right' moment?",
  ],
};

function getResponse(mode: Mode): string {
  const opts = MOCK_RESPONSES[mode];
  return opts[Math.floor(Math.random() * opts.length)];
}

function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function resolveAppearance(appearance: Appearance): 'light' | 'dark' {
  if (appearance === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return appearance;
}

export default function App() {
  const [model, setModel] = useState<Model>('takshu');
  const [mode, setMode] = useState<Mode>('mentor');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string | null>('conv-2');
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    'conv-2': MOCK_MESSAGES,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('general');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ convId: string; title: string } | null>(null);
  const [renameDialog, setRenameDialog] = useState<{ convId: string; title: string } | null>(null);
  const [exportDialog, setExportDialog] = useState<{ convId: string; title: string } | null>(null);
  const [mobileModelSheetOpen, setMobileModelSheetOpen] = useState(false);
  const stopRef = useRef(false);

  const resolved = resolveAppearance(settings.appearance);

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.setAttribute('data-appearance', resolved);
  }, [mode, resolved]);

  // Keyboard shortcuts
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === 'k' && !e.shiftKey) { e.preventDefault(); newChat(); }
      if (meta && e.key === 'b') { e.preventDefault(); setSidebarCollapsed(v => !v); }
      if (e.key === 'Escape' && isGenerating) stopGeneration();
      if (e.key === 'Escape' && settingsOpen) setSettingsOpen(false);
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isGenerating, settingsOpen]);

  function addToast(message: string, type: Toast['type'] = 'success') {
    const id = genId();
    setToasts(prev => [...prev, { id, message, type }]);
  }

  function dismissToast(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  function newChat() {
    setActiveConvId(null);
    setMobileSidebarOpen(false);
  }

  function selectConv(id: string) {
    setActiveConvId(id);
    const conv = conversations.find(c => c.id === id);
    if (conv) { setModel(conv.model); setMode(conv.mode); }
  }

  function handleSend(text: string, webSearch: boolean) {
    let convId = activeConvId;

    // Create conversation on first message
    if (!convId) {
      convId = genId();
      const newConv: Conversation = {
        id: convId,
        title: text.slice(0, 55) + (text.length > 55 ? '…' : ''),
        preview: text.slice(0, 80),
        timestamp: new Date(),
        model, mode,
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConvId(convId);
    }

    const userMsg: Message = {
      id: genId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => ({
      ...prev,
      [convId!]: [...(prev[convId!] ?? []), userMsg],
    }));

    // Simulate AI
    setIsThinking(true);
    setIsGenerating(true);
    stopRef.current = false;

    const thinkingTime = 900 + Math.random() * 800;
    setTimeout(() => {
      if (stopRef.current) { setIsThinking(false); setIsGenerating(false); return; }
      setIsThinking(false);

      const responseText = getResponse(mode);
      const assistantMsgId = genId();
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages(prev => ({
        ...prev,
        [convId!]: [...(prev[convId!] ?? []), assistantMsg],
      }));

      // Stream character by character
      let charIdx = 0;
      const streamInterval = setInterval(() => {
        if (stopRef.current) {
          clearInterval(streamInterval);
          setMessages(prev => ({
            ...prev,
            [convId!]: (prev[convId!] ?? []).map(m =>
              m.id === assistantMsgId ? { ...m, isStreaming: false } : m
            ),
          }));
          setIsGenerating(false);
          return;
        }
        charIdx += Math.floor(Math.random() * 4) + 2;
        const partial = responseText.slice(0, charIdx);
        const done = charIdx >= responseText.length;
        setMessages(prev => ({
          ...prev,
          [convId!]: (prev[convId!] ?? []).map(m =>
            m.id === assistantMsgId ? { ...m, content: done ? responseText : partial, isStreaming: !done } : m
          ),
        }));
        if (done) {
          clearInterval(streamInterval);
          setIsGenerating(false);
        }
      }, 28);
    }, thinkingTime);
  }

  function stopGeneration() {
    stopRef.current = true;
  }

  function handleModelChange(m: Model) {
    setModel(m);
    setMode(MODEL_MODES[m][0]);
  }

  function handleModeChange(m: Mode) {
    setMode(m);
  }

  function handleDeleteConv(convId: string) {
    const conv = conversations.find(c => c.id === convId);
    if (conv) setDeleteDialog({ convId, title: conv.title });
  }

  function confirmDelete() {
    if (!deleteDialog) return;
    setConversations(prev => prev.filter(c => c.id !== deleteDialog.convId));
    if (activeConvId === deleteDialog.convId) setActiveConvId(null);
    setMessages(prev => { const n = { ...prev }; delete n[deleteDialog.convId]; return n; });
    setDeleteDialog(null);
    addToast('Conversation deleted.');
  }

  function handleRenameConv(convId: string, title: string) {
    const conv = conversations.find(c => c.id === convId);
    if (conv) setRenameDialog({ convId, title: conv.title });
  }

  function confirmRename(title: string) {
    if (!renameDialog) return;
    setConversations(prev => prev.map(c => c.id === renameDialog.convId ? { ...c, title } : c));
    setRenameDialog(null);
    addToast('Conversation renamed.');
  }

  function handlePinConv(convId: string) {
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, pinned: !c.pinned } : c));
    const conv = conversations.find(c => c.id === convId);
    addToast(conv?.pinned ? 'Conversation unpinned.' : 'Conversation pinned.');
  }

  function handleArchiveConv(convId: string) {
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (activeConvId === convId) setActiveConvId(null);
    addToast('Conversation archived.');
  }

  function handleExportConv(convId: string) {
    const conv = conversations.find(c => c.id === convId);
    if (conv) setExportDialog({ convId, title: conv.title });
  }

  function confirmExport(_format: string) {
    setExportDialog(null);
    addToast('Export prepared.');
  }

  function handleCopyText(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    addToast('Copied to clipboard.');
  }

  function handleEditMessage(id: string, text: string) {
    if (!activeConvId) return;
    setMessages(prev => ({
      ...prev,
      [activeConvId]: (prev[activeConvId] ?? []).map(m => m.id === id ? { ...m, content: text } : m),
    }));
  }

  function handleDeleteMessage(id: string) {
    if (!activeConvId) return;
    setMessages(prev => ({
      ...prev,
      [activeConvId]: (prev[activeConvId] ?? []).filter(m => m.id !== id),
    }));
  }

  function handleRetry() {
    if (!activeConvId) return;
    const msgs = messages[activeConvId] ?? [];
    const lastUser = [...msgs].reverse().find(m => m.role === 'user');
    if (lastUser) handleSend(lastUser.content, false);
  }

  function handleStarterPrompt(text: string) {
    handleSend(text, false);
  }

  const activeConv = conversations.find(c => c.id === activeConvId);
  const activeMessages = activeConvId ? (messages[activeConvId] ?? []) : [];
  const isTemp = settings.temporaryChat;

  return (
    <div
      data-theme={mode}
      data-appearance={resolved}
      className="ryta-shell"
      style={{ position: 'relative' }}
    >
      {/* Ambient background */}
      <div className="ryta-ambient-bg" aria-hidden />

      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConvId={activeConvId}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        appearance={settings.appearance}
        onNewChat={newChat}
        onSelectConv={selectConv}
        onDeleteConv={handleDeleteConv}
        onRenameConv={handleRenameConv}
        onPinConv={handlePinConv}
        onArchiveConv={handleArchiveConv}
        onExportConv={handleExportConv}
        onToggleCollapse={() => setSidebarCollapsed(v => !v)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenSettings={() => { setSettingsOpen(true); setSettingsTab('general'); }}
        onCycleAppearance={() => {
          const cycle: Appearance[] = ['dark', 'light', 'system'];
          const idx = cycle.indexOf(settings.appearance);
          setSettings(prev => ({ ...prev, appearance: cycle[(idx + 1) % 3] }));
        }}
      />

      {/* Main workspace */}
      <main className="ryta-workspace" style={{ position: 'relative', zIndex: 1 }}>
        <ChatHeader
          model={model}
          mode={mode}
          activeConvId={activeConvId}
          isPinned={activeConv?.pinned}
          isTemp={isTemp}
          sidebarCollapsed={sidebarCollapsed}
          onModelChange={handleModelChange}
          onModeChange={handleModeChange}
          onToggleSidebar={() => setSidebarCollapsed(v => !v)}
          onOpenSettings={() => { setSettingsOpen(true); setSettingsTab('appearance'); }}
          onNewChat={newChat}
          onToggleTemp={() => setSettings(prev => ({ ...prev, temporaryChat: !prev.temporaryChat }))}
          onDeleteConv={activeConvId ? () => handleDeleteConv(activeConvId) : undefined}
          onExportConv={activeConvId ? () => handleExportConv(activeConvId) : undefined}
          onRenameConv={activeConvId ? () => handleRenameConv(activeConvId, activeConv?.title ?? '') : undefined}
          onPinConv={activeConvId ? () => handlePinConv(activeConvId) : undefined}
          onArchiveConv={activeConvId ? () => handleArchiveConv(activeConvId) : undefined}
          onMobileMenu={() => setMobileSidebarOpen(true)}
        />

        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {activeMessages.length > 0 ? (
            <MessageList
              messages={activeMessages}
              model={model}
              mode={mode}
              isGenerating={isGenerating}
              isThinking={isThinking}
              autoScroll={settings.autoScroll}
              showTimestamps={settings.showTimestamps}
              onRetry={handleRetry}
              onCopy={handleCopyText}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
            />
          ) : (
            <WelcomeState model={model} mode={mode} onPrompt={handleStarterPrompt} />
          )}
        </div>

        <Composer
          model={model}
          mode={mode}
          isGenerating={isGenerating}
          isTemp={isTemp}
          onSend={handleSend}
          onStop={stopGeneration}
        />
      </main>

      {/* Settings */}
      {settingsOpen && (
        <Settings
          settings={settings}
          model={model}
          mode={mode}
          onUpdateSettings={patch => {
            setSettings(prev => ({ ...prev, ...patch }));
            addToast('Settings saved.');
          }}
          onModelChange={handleModelChange}
          onModeChange={handleModeChange}
          onClose={() => setSettingsOpen(false)}
          onExportData={() => addToast('Export prepared.')}
          onClearHistory={() => { setConversations([]); setMessages({}); setActiveConvId(null); addToast('History cleared.'); }}
          initialTab={settingsTab}
        />
      )}

      {/* Delete dialog */}
      {deleteDialog && (
        <DeleteDialog
          convTitle={deleteDialog.title}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteDialog(null)}
        />
      )}

      {/* Rename dialog */}
      {renameDialog && (
        <RenameDialog
          currentTitle={renameDialog.title}
          onConfirm={confirmRename}
          onCancel={() => setRenameDialog(null)}
        />
      )}

      {/* Export dialog */}
      {exportDialog && (
        <ExportDialog
          convTitle={exportDialog.title}
          onExport={confirmExport}
          onCancel={() => setExportDialog(null)}
        />
      )}

      {/* Mobile model sheet */}
      {mobileModelSheetOpen && (
        <MobileModelSheet
          model={model}
          mode={mode}
          onModelChange={handleModelChange}
          onModeChange={handleModeChange}
          onClose={() => setMobileModelSheetOpen(false)}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Responsive utility classes */}
      <style>{`
        @media (max-width: 767px) {
          .desktop-only { display: none !important; }
        }
        @media (min-width: 768px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}
