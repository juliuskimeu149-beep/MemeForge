import type { MemeTemplate } from '../types'

/*
 * Mock "AI" caption engine. Everything is local: suggestions are drawn from
 * curated pools and shuffled, with a short fake "thinking" delay for feel.
 * Swap `suggestCaptions` for a real API call later without touching the UI.
 */

export type Vibe = 'auto' | 'relatable' | 'work' | 'school' | 'gaming' | 'wholesome' | 'chaos'

export const VIBES: { id: Vibe; label: string; emoji: string }[] = [
  { id: 'auto', label: 'Smart', emoji: '✨' },
  { id: 'relatable', label: 'Relatable', emoji: '🫠' },
  { id: 'work', label: 'Work', emoji: '💼' },
  { id: 'school', label: 'School', emoji: '📚' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'wholesome', label: 'Wholesome', emoji: '🥹' },
  { id: 'chaos', label: 'Chaos', emoji: '🌀' },
]

const POOLS: Record<Exclude<Vibe, 'auto'>, string[][]> = {
  relatable: [
    ["Me: I'll sleep early tonight", 'Also me at 3am:'],
    ['When you say "you too"', 'after the waiter says enjoy your meal'],
    ['Opening the fridge for the 9th time', 'hoping new food appeared'],
    ['Me after one productive hour', 'time for a 3 hour break'],
    ['When the WiFi drops for 2 seconds', 'and you question your whole life'],
    ['Nobody:', 'Me rehearsing an argument in the shower'],
  ],
  work: [
    ['"Quick sync"', '2 hours later'],
    ['When the meeting', 'could have been an email'],
    ['Me: per my last email', 'Also me: screaming internally'],
    ['It works on my machine', 'Ship it'],
    ['Friday 4:59pm', 'Boss: got a sec?'],
    ['Out of office', 'but still checking Slack'],
  ],
  school: [
    ['The exam:', 'Stuff we never covered'],
    ['Me reading the syllabus', 'on the last day of class'],
    ['Group project', 'where I do everything'],
    ["Teacher: this won't be on the test", 'The test:'],
    ['Studying for 5 minutes', 'deserve a 3 hour nap'],
  ],
  gaming: [
    ['One more game', "It's 4am"],
    ['Me after losing', 'It was lag'],
    ['When the tutorial', 'is harder than the boss'],
    ['Spent 3 hours', 'customizing my character'],
    ['Teammate: I got this', 'They did not have this'],
  ],
  wholesome: [
    ['When your friend remembers', 'that tiny thing you said'],
    ['Me seeing a dog', 'on the street'],
    ['Drink water', 'You deserve it'],
    ["You're doing great", 'Seriously'],
    ['When mom says', '"I\'m proud of you"'],
  ],
  chaos: [
    ['Me', "Making it everyone's problem"],
    ['Sleep is for people', 'without snacks'],
    ['Instructions unclear', 'Now I own a goat'],
    ['Plan A failed', 'There is no plan B'],
    ['The vibes: immaculate', 'The decisions: questionable'],
  ],
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export interface Suggestion {
  lines: string[]
  /** true when lines map 1:1 to the template's text layers */
  fitsTemplate: boolean
}

export async function suggestCaptions(template: MemeTemplate | null, vibe: Vibe, count = 4): Promise<Suggestion[]> {
  await new Promise((r) => setTimeout(r, 650 + Math.random() * 500))
  if (vibe === 'auto') {
    const own = (template?.captions ?? []).map((lines) => ({ lines, fitsTemplate: true }))
    const generic = shuffle(Object.values(POOLS).flat()).map((lines) => ({ lines, fitsTemplate: false }))
    return [...shuffle(own), ...generic].slice(0, count)
  }
  return shuffle(POOLS[vibe])
    .slice(0, count)
    .map((lines) => ({ lines, fitsTemplate: false }))
}
