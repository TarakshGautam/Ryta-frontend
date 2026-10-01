/* eslint-disable react-refresh/only-export-components */
import React, {
    createContext,
    useContext,
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

    useEffect(() => {
        if (appearance !== "system") return;
        if (typeof window === "undefined") return;

        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => {
            setAppearanceState((prev) => prev);
        };

        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [appearance]);

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