import React from "react";
import { PanelLeft, Sun, Moon } from "lucide-react";
import PersonaSelector from "./PersonaSelector";
import { usePersonaSwitch } from "./usePersonaSwitch";
import { useTheme } from "@/context/ThemeContext";
import { useChatStore } from "@/store/chatStore";
import { PERSONAS } from "@/types/chat";

interface ChatTopBarProps {
    title: string | null;
}

/**
 * Fixed 48px header. Solid background, one hairline border.
 * Persona selector on the right — a quiet shortcut.
 */
const ChatTopBar: React.FC<ChatTopBarProps> = ({ title }) => {
    const { resolvedAppearance, toggleTheme } = useTheme();
    const persona = useChatStore((s) => s.persona);
    const toggleSidebar = useChatStore((s) => s.toggleSidebar);
    const handlePersonaChange = usePersonaSwitch();

    const isDark = resolvedAppearance === "dark";

    return (
        <header className="h-12 shrink-0 flex items-center gap-2 px-3 sm:px-4 border-b border-[var(--ryta-border)] bg-[var(--ryta-bg)]/95 backdrop-blur-sm">
            {/* Sidebar toggle */}
            <button
                type="button"
                onClick={toggleSidebar}
                title="Toggle sidebar"
                aria-label="Toggle sidebar"
                className="shrink-0 p-2 rounded-lg text-[var(--ryta-text-muted)] hover:text-[var(--ryta-text)] hover:bg-[var(--ryta-surface)] transition-colors"
            >
                <PanelLeft className="w-4 h-4" />
            </button>

            {/* Title */}
            <h1 className="flex-1 min-w-0 truncate text-[13.5px] font-medium text-[var(--ryta-text-muted)]">
                {title || (
                    <>
                        New conversation with{" "}
                        <span className="text-[var(--ryta-text)]">
                            {PERSONAS[persona].name}
                        </span>
                    </>
                )}
            </h1>

            {/* Persona selector — quiet */}
            <div className="shrink-0">
                <PersonaSelector
                    value={persona}
                    onChange={handlePersonaChange}
                    size="sm"
                />
            </div>

            {/* Appearance */}
            <button
                type="button"
                onClick={toggleTheme}
                title={isDark ? "Switch to light" : "Switch to dark"}
                aria-label={isDark ? "Switch to light" : "Switch to dark"}
                className="shrink-0 p-2 rounded-lg text-[var(--ryta-text-muted)] hover:text-[var(--ryta-text)] hover:bg-[var(--ryta-surface)] transition-colors"
            >
                {isDark ? (
                    <Sun className="w-4 h-4" />
                ) : (
                    <Moon className="w-4 h-4" />
                )}
            </button>
        </header>
    );
};

export default ChatTopBar;