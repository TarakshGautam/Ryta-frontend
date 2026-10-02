/* eslint-disable react-refresh/only-export-components */
import React, {
    createContext,
    useContext,
    useLayoutEffect,
    useEffect,
    useState,
    useCallback,
    useMemo,
} from "react";
import type { Appearance, ThemeName } from "../lib/types";

interface ThemeContextType {
    appearance: Appearance;
    resolvedAppearance: "light" | "dark";
    themeName: ThemeName;
    setAppearance: (mode: Appearance) => void;
    setThemeName: (theme: ThemeName) => void;
    toggleTheme: () => void;
    isDark: boolean;
    isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = "ryta_theme";
const APPEARANCE_KEY = "ryta_appearance";
const DEFAULT_THEME: ThemeName = "sweetheart";
const DEFAULT_APPEARANCE: Appearance = "light";

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

// ─── Apply theme attributes SYNCHRONOUSLY to <html> ───
function applyThemeToDOM(themeName: ThemeName, resolvedAppearance: "light" | "dark") {
    const root = document.documentElement;
    root.setAttribute("data-theme", themeName);
    root.setAttribute("data-appearance", resolvedAppearance);
    if (resolvedAppearance === "dark") {
        root.classList.add("dark");
    } else {
        root.classList.remove("dark");
    }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [appearance, setAppearanceState] = useState<Appearance>(() => {
        const stored = safeGetLocalStorage(APPEARANCE_KEY) as Appearance | null;
        return stored || DEFAULT_APPEARANCE;
    });

    const [themeName, setThemeNameState] = useState<ThemeName>(() => {
        const stored = safeGetLocalStorage(THEME_KEY) as ThemeName | null;
        return stored || DEFAULT_THEME;
    });

    const resolvedAppearance = useMemo<"light" | "dark">(
        () => resolveAppearance(appearance),
        [appearance]
    );

    // ⚡ useLayoutEffect: DOM update BEFORE paint — no flicker, no delay
    useLayoutEffect(() => {
        applyThemeToDOM(themeName, resolvedAppearance);
    }, [themeName, resolvedAppearance]);

    // Persist to localStorage (async, doesn't block)
    useEffect(() => {
        safeSetLocalStorage(THEME_KEY, themeName);
        safeSetLocalStorage(APPEARANCE_KEY, appearance);
    }, [appearance, themeName]);

    // System preference listener
    useEffect(() => {
        if (appearance !== "system") return;
        if (typeof window === "undefined") return;

        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => {
            // Force re-render so resolvedAppearance recomputes
            setAppearanceState((prev) => prev);
        };

        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [appearance]);

    const setAppearance = useCallback((mode: Appearance) => {
        // Apply IMMEDIATELY before React re-renders
        const resolved = resolveAppearance(mode);
        applyThemeToDOM(
            safeGetLocalStorage(THEME_KEY) as ThemeName || DEFAULT_THEME,
            resolved
        );
        setAppearanceState(mode);
    }, []);

    const setThemeName = useCallback((theme: ThemeName) => {
        // Apply IMMEDIATELY
        applyThemeToDOM(
            theme,
            resolveAppearance(
                (safeGetLocalStorage(APPEARANCE_KEY) as Appearance) ||
                DEFAULT_APPEARANCE
            )
        );
        setThemeNameState(theme);
    }, []);

    const toggleTheme = useCallback(() => {
        setAppearanceState((prev) => {
            const current = resolveAppearance(prev);
            const next = current === "dark" ? "light" : "dark";
            applyThemeToDOM(
                (safeGetLocalStorage(THEME_KEY) as ThemeName) || DEFAULT_THEME,
                next
            );
            return next;
        });
    }, []);

    const value = useMemo<ThemeContextType>(
        () => ({
            appearance,
            resolvedAppearance,
            themeName,
            setAppearance,
            setThemeName,
            toggleTheme,
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
        ]
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
}