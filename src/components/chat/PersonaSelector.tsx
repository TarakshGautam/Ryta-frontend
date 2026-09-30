import React from "react";
import type { Persona } from "@/types/chat";
import { PERSONA_ORDER, PERSONAS } from "@/types/chat";

interface PersonaSelectorProps {
    value: Persona;
    onChange: (persona: Persona) => void;
    disabled?: boolean;
    size?: "sm" | "md";
}

/**
 * Segmented persona switch. Deliberately quiet — the composer
 * carries the same choice, so this is a shortcut, not the focus.
 */
const PersonaSelector: React.FC<PersonaSelectorProps> = ({
    value,
    onChange,
    disabled = false,
    size = "md",
}) => {
    const pad = size === "sm" ? "px-2 py-1 text-[11px]" : "px-2.5 py-1 text-xs";

    return (
        <div
            className="inline-flex items-center gap-0.5 p-0.5 rounded-lg border border-[var(--ryta-border)] bg-[var(--ryta-surface)]"
            role="radiogroup"
            aria-label="Choose who to talk to"
        >
            {PERSONA_ORDER.map((p) => {
                const active = value === p;
                return (
                    <button
                        key={p}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        disabled={disabled}
                        onClick={() => {
                            if (!active) onChange(p);
                        }}
                        className={[
                            "rounded-md font-serif transition-colors duration-100",
                            pad,
                            active
                                ? "bg-[var(--ryta-surface-raised)] text-[var(--ryta-text)] font-semibold"
                                : "text-[var(--ryta-text-muted)] hover:text-[var(--ryta-text)]",
                            disabled ? "opacity-50 cursor-not-allowed" : "",
                        ].join(" ")}
                    >
                        {PERSONAS[p].name}
                    </button>
                );
            })}
        </div>
    );
};

export default PersonaSelector;
