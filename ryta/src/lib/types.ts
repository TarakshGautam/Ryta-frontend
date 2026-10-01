export type Model = 'takshu' | 'ryku';
export type Mode = 'auraman' | 'mentor' | 'protector' | 'sweetheart' | 'calm' | 'savage';
export type Appearance = 'light' | 'dark' | 'system';

export const MODEL_MODES: Record<Model, Mode[]> = {
  takshu: ['auraman', 'mentor', 'protector'],
  ryku: ['sweetheart', 'calm', 'savage'],
};

export const MODEL_INFO: Record<Model, { name: string; description: string }> = {
  takshu: {
    name: 'Takshu',
    description: 'Structured, thoughtful, deeply present',
  },
  ryku: {
    name: 'Ryku',
    description: 'Warm, expressive, emotionally fluid',
  },
};

export const MODE_INFO: Record<Mode, { name: string; description: string }> = {
  auraman: { name: 'Auraman', description: 'Deep emotional intelligence and warmth' },
  mentor: { name: 'Mentor', description: 'Thoughtful guidance, clarity and reasoning' },
  protector: { name: 'Protector', description: 'Confidence, reassurance and support' },
  sweetheart: { name: 'Sweetheart', description: 'Warm, affectionate, playful and caring' },
  calm: { name: 'Calm', description: 'Peaceful, patient, grounding and comforting' },
  savage: { name: 'Savage', description: 'Bold, witty, teasing and direct' },
};

export interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  model: Model;
  mode: Mode;
  pinned?: boolean;
  temporary?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  hasError?: boolean;
}

export interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

export interface AppSettings {
  appearance: Appearance;
  themeIntensity: 'subtle' | 'balanced' | 'vivid';
  ambientEffects: boolean;
  backgroundDepth: boolean;
  glassSurfaces: boolean;
  animations: 'full' | 'reduced' | 'off';
  density: 'compact' | 'comfortable' | 'spacious';
  enterToSend: boolean;
  showTimestamps: boolean;
  showMessageActions: boolean;
  autoScroll: boolean;
  markdownRendering: boolean;
  codeLineNumbers: boolean;
  compactMessages: boolean;
  showAiStatus: boolean;
  responseStyle: 'concise' | 'balanced' | 'detailed';
  personalityExpression: 'subtle' | 'natural' | 'expressive';
  customInstructions: string;
  memory: boolean;
  useConversationContext: boolean;
  temporaryChat: boolean;
  chatHistory: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  appearance: 'dark',
  themeIntensity: 'balanced',
  ambientEffects: true,
  backgroundDepth: true,
  glassSurfaces: true,
  animations: 'full',
  density: 'comfortable',
  enterToSend: true,
  showTimestamps: false,
  showMessageActions: true,
  autoScroll: true,
  markdownRendering: true,
  codeLineNumbers: true,
  compactMessages: false,
  showAiStatus: true,
  responseStyle: 'balanced',
  personalityExpression: 'natural',
  customInstructions: '',
  memory: true,
  useConversationContext: true,
  temporaryChat: false,
  chatHistory: true,
};

export const STARTER_PROMPTS: Record<Mode, string[]> = {
  auraman: [
    'I need someone to talk to right now.',
    'Help me process what I\'m feeling.',
    'I\'m going through something and I don\'t know where to start.',
    'Talk to me about something that actually matters.',
  ],
  mentor: [
    'Help me think through a difficult decision.',
    'Explain something I\'ve been struggling to understand.',
    'I want to learn how to think more clearly.',
    'Break down a concept I keep getting wrong.',
  ],
  protector: [
    'I need your honest perspective on something.',
    'Help me feel more grounded right now.',
    'I\'m worried about a situation — let\'s talk through it.',
    'Tell me what I might be missing.',
  ],
  sweetheart: [
    'Talk to me for a bit.',
    'Tell me something that will make me smile.',
    'Help me put my feelings into words.',
    'I just need to feel heard right now.',
  ],
  calm: [
    'I need to slow down and clear my head.',
    'Help me find some stillness right now.',
    'I\'m feeling overwhelmed — help me breathe.',
    'Just talk to me softly.',
  ],
  savage: [
    'Roast me lovingly — I can take it.',
    'Give me the truth, no filter.',
    'Challenge me on something I believe.',
    'I\'m in the mood for some banter.',
  ],
};

export const GREETINGS: Record<Model, Record<string, string>> = {
  takshu: {
    morning: 'Good morning.',
    afternoon: 'Good afternoon.',
    evening: 'Good evening.',
    default: 'Good to see you.',
  },
  ryku: {
    morning: 'Morning, you.',
    afternoon: 'Hey, you.',
    evening: 'There you are.',
    default: 'Hey.',
  },
};

export function getGreeting(model: Model): string {
  const hour = new Date().getHours();
  const map = GREETINGS[model];
  if (hour < 12) return map.morning;
  if (hour < 17) return map.afternoon;
  if (hour < 21) return map.evening;
  return map.default;
}

export function getSubGreeting(mode: Mode): string {
  const map: Record<Mode, string> = {
    auraman: 'How can I help?',
    mentor: 'What would you like to explore?',
    protector: 'What\'s on your mind?',
    sweetheart: 'What do you need right now?',
    calm: 'Take your time. I\'m here.',
    savage: 'Let\'s get into it.',
  };
  return map[mode];
}
