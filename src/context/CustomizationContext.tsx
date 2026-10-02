import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import type {
    AccentColor,
    Customization,
    FontFamily,
    RadiusPreset,
} from "@/lib/types";
import { DEFAULT_CUSTOMIZATION } from "@/lib/types";
import {
    ACCENT_PALETTES,
    FONT_STACKS,
    RADIUS_PRESETS,
} from "@/lib/customization";

interface CustomizationContextType {
    customization: Customization;
    setAccent: (accent: AccentColor) => void;
    setFont: (font: FontFamily) => void;
    setFontScale: (scale: number) => void;
    setRadius: (radius: RadiusPreset) => void;
    reset: () => void;
}

const CustomizationContext = createContext<
    CustomizationContextType | undefined
>(undefined);

const STORAGE_KEY = "ryta_customization";

function safeGet<T>(key: string): T | null {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
    }
}

function safeSet<T>(key: string, value: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* ignore */
    }
}

export function CustomizationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [customization, setCustomization] = useState<Customization>(() => {
        const stored = safeGet<Customization>(STORAGE_KEY);
        return stored
            ? { ...DEFAULT_CUSTOMIZATION, ...stored }
            : DEFAULT_CUSTOMIZATION;
    });

    useEffect(() => {
        const root = document.documentElement;

        const palette = ACCENT_PALETTES[customization.accent];
        root.style.setProperty("--ryta-primary", palette.primary);
        root.style.setProperty("--ryta-primary-hover", palette.primaryHover);
        root.style.setProperty("--ryta-primary-fg", palette.primaryFg);
        root.style.setProperty("--ryta-glow", palette.glow);

        root.style.setProperty(
            "--ryta-font-body",
            FONT_STACKS[customization.fontFamily]
        );
        root.style.setProperty(
            "--ryta-font-scale",
            String(customization.fontScale)
        );

        const r = RADIUS_PRESETS[customization.radius];
        root.style.setProperty("--ryta-radius-sm", r.sm);
        root.style.setProperty("--ryta-radius-md", r.md);
        root.style.setProperty("--ryta-radius-lg", r.lg);
        root.style.setProperty("--ryta-radius-xl", r.xl);
        root.style.setProperty("--ryta-radius-2xl", r["2xl"]);
        root.style.setProperty("--ryta-radius-3xl", r["3xl"]);

        safeSet(STORAGE_KEY, customization);
    }, [customization]);

    const setAccent = useCallback((accent: AccentColor) => {
        setCustomization((c) => ({ ...c, accent }));
    }, []);

    const setFont = useCallback((fontFamily: FontFamily) => {
        setCustomization((c) => ({ ...c, fontFamily }));
    }, []);

    const setFontScale = useCallback((fontScale: number) => {
        const clamped = Math.max(0.85, Math.min(1.15, fontScale));
        setCustomization((c) => ({ ...c, fontScale: clamped }));
    }, []);

    const setRadius = useCallback((radius: RadiusPreset) => {
        setCustomization((c) => ({ ...c, radius }));
    }, []);

    const reset = useCallback(() => {
        setCustomization(DEFAULT_CUSTOMIZATION);
    }, []);

    const value = useMemo<CustomizationContextType>(
        () => ({
            customization,
            setAccent,
            setFont,
            setFontScale,
            setRadius,
            reset,
        }),
        [customization, setAccent, setFont, setFontScale, setRadius, reset]
    );

    return (
        <CustomizationContext.Provider value={value}>
            {children}
        </CustomizationContext.Provider>
    );
}

export function useCustomization(): CustomizationContextType {
    const ctx = useContext(CustomizationContext);
    if (!ctx) {
        throw new Error(
            "useCustomization must be used within CustomizationProvider"
        );
    }
    return ctx;
}