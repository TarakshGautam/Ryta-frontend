import type { Conversation, Message } from './types';

const now = new Date();
const d = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600 * 1000);

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-pinned-1',
    title: 'Weekly reflection and priorities',
    preview: 'Let\'s think about what actually moved the needle this week...',
    timestamp: d(2),
    model: 'takshu',
    mode: 'mentor',
    pinned: true,
  },
  {
    id: 'conv-1',
    title: 'Processing a difficult conversation',
    preview: 'I felt dismissed and I don\'t know how to handle it.',
    timestamp: d(1),
    model: 'takshu',
    mode: 'auraman',
  },
  {
    id: 'conv-2',
    title: 'Understanding cognitive biases',
    preview: 'Can you explain confirmation bias in a way that actually sticks?',
    timestamp: d(3),
    model: 'takshu',
    mode: 'mentor',
  },
  {
    id: 'conv-3',
    title: 'Just needed to vent today',
    preview: 'Everything felt too loud and I needed somewhere quiet.',
    timestamp: d(25),
    model: 'ryku',
    mode: 'calm',
  },
  {
    id: 'conv-4',
    title: 'Morning check-in routine',
    preview: 'Good morning, what are we doing today?',
    timestamp: d(48),
    model: 'ryku',
    mode: 'sweetheart',
  },
  {
    id: 'conv-5',
    title: 'Career decision: stay or leave?',
    preview: 'I\'ve been at this company for 3 years and I feel stuck.',
    timestamp: d(72),
    model: 'takshu',
    mode: 'protector',
  },
  {
    id: 'conv-6',
    title: 'Late night thoughts, ignore me',
    preview: 'It\'s 2am and I can\'t stop thinking about this.',
    timestamp: d(100),
    model: 'ryku',
    mode: 'sweetheart',
  },
  {
    id: 'conv-7',
    title: 'Explaining recursion again',
    preview: 'I keep losing the thread when it gets too deep.',
    timestamp: d(130),
    model: 'takshu',
    mode: 'mentor',
  },
  {
    id: 'conv-8',
    title: 'You vs my excuses',
    preview: 'I need someone to call out my nonsense today.',
    timestamp: d(200),
    model: 'ryku',
    mode: 'savage',
  },
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'Can you explain how recursion actually works? I understand it conceptually but I keep losing the thread when code gets too deep.',
    timestamp: d(3.1),
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: `Good — let's fix the thread problem, not just restate the concept.

Recursion works through something called the **call stack**. Every time a function calls itself, a new frame is pushed onto this stack. That frame holds the current state: the arguments, local variables, and where to return to when it's done.

Here's the key insight most explanations miss: **the function doesn't "know" it's recurring**. Each call is completely isolated. It only knows its own inputs and what gets returned to it.

\`\`\`python
def factorial(n):
    if n == 0:      # base case — where the stack starts unwinding
        return 1
    return n * factorial(n - 1)  # recursive case
\`\`\`

When you call \`factorial(3)\`, here's what actually happens:

1. \`factorial(3)\` waits for \`factorial(2)\`
2. \`factorial(2)\` waits for \`factorial(1)\`
3. \`factorial(1)\` waits for \`factorial(0)\`
4. \`factorial(0)\` returns **1** — base case hit
5. The stack **unwinds**: \`1 × 1 × 2 × 3 = 6\`

The part where people lose the thread is usually step 4 → 5. The trick is to trust the base case. Once you know \`factorial(0)\` will return 1, you can reason backward without simulating every step.

**What specifically trips you up — is it tracking what gets returned, or is it the depth itself?**`,
    timestamp: d(3),
  },
  {
    id: 'msg-3',
    role: 'user',
    content: 'It\'s the unwinding part. I can trace going down but when it comes back up I lose track of what value is being passed where.',
    timestamp: d(2.9),
  },
  {
    id: 'msg-4',
    role: 'assistant',
    content: `That's the most honest answer you could give — and it points to exactly the right thing to fix.

The problem isn't your understanding of recursion. It's that you're trying to **simulate the whole stack at once**. You don't need to.

Here's a different way to read recursive code:

> "Assume \`factorial(n-1)\` already works correctly and returns the right value. Given that, does my current line of code do the right thing?"

That's it. You're not simulating. You're **trusting** the recursive call and only reasoning about the current level.

Let's trace just two levels — not the whole thing:

\`\`\`
factorial(3)
  └─ calls factorial(2), which returns 2
  └─ so: return 3 × 2 = 6  ✓
\`\`\`

You don't care how \`factorial(2)\` got to 2. You just trust it did.

**The mental model shift:** Stop reading recursion like a loop (which forces you to track every step). Read it like a **contract**: "If this smaller version works, does the larger version work?"

If the base case is correct and the recursive step is correct — the whole thing is correct. That's mathematical induction, and it's the actual reasoning behind recursion.

Try rewriting one of your own examples using this contract model. What are you working on?`,
    timestamp: d(2.8),
  },
];

export function groupConversationsByDate(conversations: Conversation[]): {
  pinned: Conversation[];
  today: Conversation[];
  yesterday: Conversation[];
  week: Conversation[];
  older: Conversation[];
} {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
  const startOfWeek = new Date(startOfToday.getTime() - 6 * 86400000);

  const pinned: Conversation[] = [];
  const today: Conversation[] = [];
  const yesterday: Conversation[] = [];
  const week: Conversation[] = [];
  const older: Conversation[] = [];

  for (const conv of conversations) {
    if (conv.pinned) { pinned.push(conv); continue; }
    const t = conv.timestamp;
    if (t >= startOfToday) today.push(conv);
    else if (t >= startOfYesterday) yesterday.push(conv);
    else if (t >= startOfWeek) week.push(conv);
    else older.push(conv);
  }

  return { pinned, today, yesterday, week, older };
}
