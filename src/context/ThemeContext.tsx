/* eslint-disable react-refresh/only-export-components */
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo,
} from "react";
import type { Appearance, ThemeName, Mode } from "../lib/types";
import { MODE_TO_THEME } from "../lib/types";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface ThemeContextType {
    appearance: Appearance;
    resolvedAppearance: "light" | "dark";
    themeName: ThemeName;
    setAppearance: (mode: Appearance) => void;
    setThemeName: (theme: ThemeName) => void;
    toggleTheme: () => void;
    applyPersonaTheme: (mode: Mode) => void;
    isDark: boolean;
    isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
const THEME_KEY = "ryta_theme";
const APPEARANCE_KEY = "ryta_appearance";
const DEFAULT_THEME: ThemeName = "sweetheart";
const DEFAULT_APPEARANCE: Appearance = "light";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function resolveAppearance(app: Appearance): "light" | "dark" {
    if (app === "system") {
        if (typeof window === "undefined") return "light";
        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    }
    return app;
}

function safeGetLocalStorage(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function safeSetLocalStorage(key: string, value: string): void {
    try {
        localStorage.setItem(key, value);
    } catch {
        /* ignore */
    }
}

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // ── State ──
    const [appearance, setAppearanceState] = useState<Appearance>(() => {
        const stored = safeGetLocalStorage(APPEARANCE_KEY) as Appearance | null;
        return stored || DEFAULT_APPEARANCE;
    });

    const [themeName, setThemeNameState] = useState<ThemeName>(() => {
        const stored = safeGetLocalStorage(THEME_KEY) as ThemeName | null;
        return stored || DEFAULT_THEME;
    });

    // ── Derived ──
    const resolvedAppearance = useMemo<"light" | "dark">(
        () => resolveAppearance(appearance),
        [appearance]
    );

    // ── Apply theme to <html> ──
    useEffect(() => {
        const root = document.documentElement;

        root.setAttribute("data-theme", themeName);
        root.setAttribute("data-appearance", resolvedAppearance);

        safeSetLocalStorage(THEME_KEY, themeName);
        safeSetLocalStorage(APPEARANCE_KEY, appearance);

        if (resolvedAppearance === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, [appearance, themeName, resolvedAppearance]);

    // ── Listen to system theme changes ──
    useEffect(() => {
        if (appearance !== "system") return;
        if (typeof window === "undefined") return;

        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => {
            // Force re-render by toggling a dummy state
            // (resolvedAppearance will auto-update via useMemo)
            setAppearanceState((prev) => prev);
        };

        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [appearance]);

    // ── Actions ──
    const setAppearance = useCallback((mode: Appearance) => {
        setAppearanceState(mode);
    }, []);

    const setThemeName = useCallback((theme: ThemeName) => {
        setThemeNameState(theme);
    }, []);

    const toggleTheme = useCallback(() => {
        setAppearanceState((prev) => {
            const current = resolveAppearance(prev);
            return current === "dark" ? "light" : "dark";
        });
    }, []);

    const applyPersonaTheme = useCallback((mode: Mode) => {
        const mappedTheme = MODE_TO_THEME[mode];
        if (mappedTheme) {
            setThemeNameState(mappedTheme);
        }
    }, []);

    // ── Memoized value ──
    const value = useMemo<ThemeContextType>(
        () => ({
            appearance,
            resolvedAppearance,
            themeName,
            setAppearance,
            setThemeName,
            toggleTheme,
            applyPersonaTheme,
            isDark: resolvedAppearance === "dark",
            isLight: resolvedAppearance === "light",
        }),
        [
            appearance,
            resolvedAppearance,
            themeName,
            setAppearance,
            setThemeName,
            toggleTheme,
            applyPersonaTheme,
        ]
    );

    // ═════════════════════════════════════════════════════════
    // RETURN — ye ZAROORI tha
    // ═════════════════════════════════════════════════════════
    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
}