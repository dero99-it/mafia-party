/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const THEMED_ADJECTIVES_EN = [
  'Suspicious', 'Innocent', 'Cunning', 'Sneaky', 'Gullible', 
  'Trusty', 'Shady', 'Vigilant', 'Silent', 'Noisy', 
  'Clever', 'Loyal', 'Mysterious', 'Wary', 'Crafty', 
  'Honest', 'Fearful', 'Clueless', 'Sly', 'Brazen'
];

const THEMED_NOUNS_EN = [
  'Steve', 'Irene', 'Mike', 'Dan', 'Donna', 
  'Chris', 'Clara', 'Sam', 'Gary', 'Tina', 
  'Sean', 'Val', 'Sarah', 'Nate', 'Chloe', 
  'Luke', 'Mary', 'Wyatt', 'Carl', 'Helen'
];

const THEMED_ADJECTIVES_AR = [
  'المشبوه', 'البريء', 'الماكر', 'الخفي', 'الطيب',
  'الهادئ', 'الذكي', 'الغامض', 'الحذر', 'الوفاء',
  'المرعب', 'المرتبك', 'اللطيف', 'الفضولي', 'الثرثار',
  'الصامت', 'الخواف', 'الشجاع', 'المتردد', 'المحنك'
];

const THEMED_NOUNS_AR = [
  'أبو شهاب', 'أبو غضب', 'كريم', 'جميلة', 'سليمان',
  'سميرة', 'سعيد', 'فارس', 'شروق', 'طريف',
  'شفيق', 'عاصم', 'مستور', 'نادر', 'ياسمين',
  'أميرة', 'عادل', 'حاتم', 'منى', 'منيرة'
];

const EMOJIS = [
  '🕵️', '😇', '🤫', '🩺', '👀', '🧐', '🤐', '😎', '🧙', '🧟',
  '🦊', '🦁', '🐼', '🦄', '🐙', '🦖', '🤠', '👻', '👽', '🤖'
];

export function generateSimpleNames(count: number, lang: 'en' | 'ar' = 'en'): string[] {
  const names: string[] = [];
  const base = lang === 'ar' ? 'لاعب' : 'Player';
  for (let i = 1; i <= count; i++) {
    names.push(`${base} ${i}`);
  }
  return names;
}

export function generateThemedNames(count: number, lang: 'en' | 'ar' = 'en'): string[] {
  const names: string[] = [];
  const used = new Set<string>();
  
  const adjectives = lang === 'ar' ? THEMED_ADJECTIVES_AR : THEMED_ADJECTIVES_EN;
  const nouns = lang === 'ar' ? THEMED_NOUNS_AR : THEMED_NOUNS_EN;

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let fullName = '';
    do {
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      fullName = lang === 'ar' ? `${noun} ${adj}` : `${adj} ${noun}`;
      attempts++;
    } while (used.has(fullName) && attempts < 100);
    
    used.add(fullName);
    names.push(fullName);
  }
  return names;
}

export function generateEmojiNames(count: number, lang: 'en' | 'ar' = 'en'): string[] {
  const names: string[] = [];
  const base = lang === 'ar' ? 'لاعب' : 'Player';
  for (let i = 1; i <= count; i++) {
    const emoji = EMOJIS[(i - 1) % EMOJIS.length];
    names.push(`${emoji} ${base} ${i}`);
  }
  return names;
}
