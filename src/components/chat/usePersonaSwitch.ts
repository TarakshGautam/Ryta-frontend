import { useCallback } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useChatStore } from "@/store/chatStore";
import { PERSONA_THEME, type Persona } from "@/types/chat";

/**
 * Switching souls does two things: retargets the conversation
 * (clearing it, per ChatStore) and repaints the room.
 * Both the top bar and the composer call into this so the
 * two entry points can't drift apart.
 */
export function usePersonaSwitch() {
    const switchPersona = useChatStore((s) => s.switchPersona);
    const { setThemeName } = useTheme();

    return useCallback(
        (next: Persona) => {
            setThemeName(PERSONA_THEME[next]);
            switchPersona(next);
        },
        [setThemeName, switchPersona]
    );
}
