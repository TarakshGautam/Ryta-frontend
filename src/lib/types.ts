export type Appearance = 'system' | 'light' | 'dark';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type ThemeIntensity = 'subtle' | 'balanced' | 'vivid';
export type Animations = 'full' | 'reduced' | 'off';
export type ResponseStyle = 'concise' | 'balanced' | 'detailed';
export type PersonalityExpression = 'subtle' | 'natural' | 'expressive';

export type Model = 'takshu' | 'ryku';

// Theme names — must match index.css [data-theme="..."] values
export type ThemeName =
    | 'auraman' | 'mentor' | 'protector'
    | 'sweetheart' | 'calm' | 'savage';

// Takshu and Ryku Specific Modes / Personas
// FIXED: 'proptetor' -> 'protector' (must match backend)
export type Mode =
    | 'protector' | 'auraman' | 'mentor'
    | 'sweetheart' | 'calm_listener' | 'savage_bestie';

// Map persona mode -> theme name (auto-switch on persona change)
export const MODE_TO_THEME: Record<Mode, ThemeName> = {
    protector: 'protector',
    auraman: 'auraman',
    mentor: 'mentor',
    sweetheart: 'sweetheart',
    calm_listener: 'calm',
    savage_bestie: 'savage',
};

export interface AppSettings {
    appearance: Appearance;
    themeName: ThemeName;
    density: Density;
    themeIntensity: ThemeIntensity;
    ambientEffects: boolean;
    backgroundDepth: boolean;
    glassSurfaces: boolean;
    animations: Animations;
    enterToSend: boolean;
    showTimestamps: boolean;
    showMessageActions: boolean;
    autoScroll: boolean;
    markdownRendering: boolean;
    codeLineNumbers: boolean;
    compactMessages: boolean;
    showAiStatus: boolean;
    responseStyle: ResponseStyle;
    personalityExpression: PersonalityExpression;
    customInstructions: string;
    useConversationContext: boolean;
    memory: boolean;
    temporaryChat: boolean;
    chatHistory: boolean;
}

export const MODEL_MODES: Record<Model, Mode[]> = {
    takshu: ['protector', 'auraman', 'mentor'],
    ryku: ['sweetheart', 'calm_listener', 'savage_bestie'],
};

export const MODEL_INFO: Record<Model, { name: string; description: string }> = {
    takshu: {
        name: 'Takshu',
        description: 'Protective, high-aura presence and dedicated guidance.',
    },
    ryku: {
        name: 'Ryku',
        description: 'Warm companion, mindful listener, and witty friend.',
    },
};

export const MODE_INFO: Record<Mode, { name: string; description: string }> = {
    // Takshu Personas
    protector: {
        name: 'Protector',
        description: 'Guards your space, offers protective advice, and keeps things safe.',
    },
    auraman: {
        name: 'Aura Man',
        description: 'Unmatched confidence, strong vibes, and sharp clarity.',
    },
    mentor: {
        name: 'Mentor',
        description: 'Structured wisdom, growth-focused feedback, and strategic guidance.',
    },

    // Ryku Personas
    sweetheart: {
        name: 'Sweetheart',
        description: 'Affectionate, deeply caring, and comforting presence.',
    },
    calm_listener: {
        name: 'Calm Listener',
        description: 'Patient, zero-judgment space for venting and peaceful conversations.',
    },
    savage_bestie: {
        name: 'Savage Bestie',
        description: 'Unfiltered, hilarious, playful roast master and real talk partner.',
    },
};