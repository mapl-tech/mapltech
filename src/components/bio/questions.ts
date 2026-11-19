/**
 * The call request on bio.mapltech.com, one question a screen (CallForm.tsx).
 *
 * The order follows the founder's ask at the end of the video ("Tell me what
 * you're building and your deadline"): the two one-tap answers first, then a
 * sentence about it, the budget, and the contact details last, once four
 * answers are already given (a small first yes, then the larger ones).
 * Everything here is plain data and pure functions, so it is unit-tested
 * (questions.spec.ts) and the component only renders it.
 */

export type QuestionId = 'build' | 'deadline' | 'details' | 'budget' | 'name' | 'email' | 'phone' | 'business';

export interface Choice {
  value: string;
  label: string;
}

interface Base {
  id: QuestionId;
  /** The question as the visitor reads it. `{first}` becomes their first name once they have given it. */
  title: string;
  /** A few words for the review screen and the email ("Budget"). */
  label: string;
  /** One line under the question. */
  hint?: string;
  required: boolean;
}

export interface ChoiceQuestion extends Base {
  kind: 'choice';
  choices: readonly Choice[];
}

export interface TextQuestion extends Base {
  kind: 'text' | 'email' | 'tel' | 'long';
  placeholder: string;
  autoComplete: string;
  maxLength: number;
}

export type Question = ChoiceQuestion | TextQuestion;

export type Answers = Partial<Record<QuestionId, string>>;

/** Projects start at the lowest published package (site.ts pricing: Automation & AI, $3,500). */
export const BUDGET_FLOOR = '$3,500';

export const QUESTIONS: readonly Question[] = [
  {
    id: 'build',
    label: 'Building',
    kind: 'choice',
    title: 'What are you building?',
    hint: 'Pick the closest one. You can tell us more next.',
    required: true,
    choices: [
      { value: 'website', label: 'A website' },
      { value: 'booking', label: 'A booking system' },
      { value: 'ai', label: 'An AI tool or automation' },
      { value: 'internal', label: 'An internal tool or dashboard' },
      { value: 'other', label: 'Something else' },
    ],
  },
  {
    id: 'deadline',
    label: 'Needs it live',
    kind: 'choice',
    title: 'When do you need it live?',
    hint: 'We agree the launch date with you on the call.',
    required: true,
    choices: [
      { value: 'month', label: 'Within a month' },
      { value: '1-3', label: 'In 1 to 3 months' },
      { value: '3-6', label: 'In 3 to 6 months' },
      { value: 'open', label: 'No fixed date yet' },
    ],
  },
  {
    id: 'details',
    label: 'What it should do',
    kind: 'long',
    title: 'What should it do?',
    hint: 'A sentence or two is plenty.',
    placeholder: 'For example: let guests pick a tour date and pay a deposit.',
    autoComplete: 'off',
    maxLength: 2000,
    required: true,
  },
  {
    id: 'budget',
    label: 'Budget',
    kind: 'choice',
    title: 'What budget have you set aside?',
    hint: `Projects start at ${BUDGET_FLOOR} (US dollars). You get a fixed quote after the call.`,
    required: true,
    choices: [
      { value: 'under', label: `Under ${BUDGET_FLOOR}` },
      { value: '3.5-10', label: `${BUDGET_FLOOR} to $10,000` },
      { value: '10-25', label: '$10,000 to $25,000' },
      { value: 'over', label: 'Over $25,000' },
      { value: 'unsure', label: 'Not sure yet' },
    ],
  },
  {
    id: 'name',
    label: 'Name',
    kind: 'text',
    title: 'What’s your name?',
    placeholder: 'Type your name',
    autoComplete: 'name',
    maxLength: 120,
    required: true,
  },
  {
    id: 'email',
    label: 'Email',
    kind: 'email',
    title: 'What’s your email, {first}?',
    hint: 'We reply within 24 hours to book your call.',
    placeholder: 'name@company.com',
    autoComplete: 'email',
    maxLength: 254,
    required: true,
  },
  {
    id: 'phone',
    label: 'Phone or WhatsApp',
    kind: 'tel',
    title: 'Phone or WhatsApp number',
    hint: 'Optional. Add your country code, for example +1 or +234.',
    placeholder: '+1 416 555 0123',
    autoComplete: 'tel',
    maxLength: 32,
    required: false,
  },
  {
    id: 'business',
    label: 'Business or website',
    kind: 'text',
    title: 'Your business name or website',
    hint: 'Optional.',
    placeholder: 'Business name or website',
    autoComplete: 'organization',
    maxLength: 200,
    required: false,
  },
];

/** The first word of the name they gave, for "What’s your email, Ada?" (never more than 40 characters). */
export function firstName(name: string | undefined): string {
  return (name ?? '').trim().split(/\s+/)[0]?.slice(0, 40) ?? '';
}

/** The question's title with their first name in it; without a name, the sentence still reads ("What’s your email?"). */
export function questionTitle(question: Question, answers: Answers): string {
  const first = firstName(answers.name);
  return first ? question.title.replace('{first}', first) : question.title.replace(/, \{first\}/, '').replace('{first}', '');
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/** 7 to 15 digits (E.164 allows 15), written with only digits, spaces, dots, dashes, brackets and a leading +. */
export function isPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!/^\+?[\d\s().-]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, '').length;
  return digits >= 7 && digits <= 15;
}

/**
 * What is wrong with an answer, in words that say how to fix it, or '' when
 * it can be sent. An optional question left empty is fine.
 */
export function answerError(question: Question, raw: string | undefined): string {
  const value = (raw ?? '').trim();
  if (!value) {
    if (!question.required) return '';
    if (question.kind === 'choice') return 'Please pick one of the answers.';
    if (question.id === 'name') return 'Please type your name.';
    if (question.id === 'email') return 'Please type your email, so we can reply.';
    return 'Please tell us a little about it.';
  }
  if (question.kind === 'choice' && !question.choices.some((choice) => choice.value === value)) {
    return 'Please pick one of the answers.';
  }
  if (question.kind === 'email' && !isEmail(value)) {
    return 'That email doesn’t look complete. Check it, for example name@company.com.';
  }
  if (question.kind === 'tel' && !isPhone(value)) {
    return 'That number doesn’t look complete. Use digits and your country code, for example +1 416 555 0123.';
  }
  return '';
}

/** The first question that still needs an answer (or has a wrong one), or -1 when all can be sent. */
export function firstUnanswered(answers: Answers): number {
  return QUESTIONS.findIndex((question) => answerError(question, answers[question.id]) !== '');
}

/** The label a choice answer shows ("A booking system"), or the typed answer itself. */
export function answerLabel(question: Question, raw: string | undefined): string {
  const value = (raw ?? '').trim();
  if (question.kind === 'choice') return question.choices.find((choice) => choice.value === value)?.label ?? '';
  return value;
}

export function questionById(id: QuestionId): Question {
  const question = QUESTIONS.find((q) => q.id === id);
  if (!question) throw new Error(`Unknown question ${id}`);
  return question;
}

/** Where the visitor came from, kept for the first page view of the session (CallForm). */
export interface Attribution {
  landing?: string;
  referrer?: string;
  utm?: Partial<Record<'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_content' | 'utm_term', string>>;
}

/** How much of the video they watched (VslPlayer): the furthest point, and whether the sound was on. */
export interface VideoWatch {
  furthest: number;
  withSound: boolean;
}

export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

/** Reads the UTM tags from a query string (each cut to 100 characters), and nothing else. */
export function readUtm(search: string): Attribution['utm'] {
  const params = new URLSearchParams(search);
  const utm: NonNullable<Attribution['utm']> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim();
    if (value) utm[key] = value.slice(0, 100);
  }
  return Object.keys(utm).length ? utm : undefined;
}

export function videoLine(watch: VideoWatch | null | undefined): string {
  if (!watch || watch.furthest <= 0) return 'Not played';
  const percent = Math.min(100, Math.round(watch.furthest * 100));
  const how = watch.withSound ? 'with sound' : 'muted';
  return percent >= 97 ? `Watched to the end, ${how}` : `Watched ${percent}%, ${how}`;
}

/**
 * The email's subject line and body for /api/contact: the answers first, in
 * the order asked, then where the visitor came from and how much of the
 * video they watched (what the reply can open with).
 */
export function composeLead(answers: Answers, attribution: Attribution | null, watch: VideoWatch | null) {
  const label = (id: QuestionId) => answerLabel(questionById(id), answers[id]);
  const subject = [label('build'), label('deadline'), label('budget')].filter(Boolean).join(' · ');
  const line = (id: QuestionId) => `${questionById(id).label}: ${label(id) || 'Not given'}`;
  const lines = [
    line('build'),
    line('deadline'),
    line('budget'),
    line('business'),
    line('phone'),
    '',
    `${questionById('details').label}:`,
    label('details'),
    '',
    `Video: ${videoLine(watch)}`,
  ];
  const utm = attribution?.utm;
  if (utm && Object.keys(utm).length) {
    lines.push(`Campaign: ${UTM_KEYS.filter((key) => utm[key]).map((key) => `${key}=${utm[key]}`).join(', ')}`);
  }
  if (attribution?.referrer) lines.push(`Referrer: ${attribution.referrer}`);
  if (attribution?.landing) lines.push(`Landing page: ${attribution.landing}`);
  return {
    name: label('name'),
    email: label('email'),
    phone: label('phone') || undefined,
    subject,
    message: lines.join('\n'),
  };
}
