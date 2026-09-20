export function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleString('ar-EG', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function firstLetter(name) {
  return Array.from(name || '؟').slice(0, 1).join('').toUpperCase();
}

export const AVATAR_COLORS = [
  'linear-gradient(135deg,#ff6e7f,#8e7cff)',
  'linear-gradient(135deg,#4fc3f7,#2f9fe0)',
  'linear-gradient(135deg,#2ec4b6,#23a790)',
  'linear-gradient(135deg,#ff9f43,#ff6e7f)',
  'linear-gradient(135deg,#8e7cff,#6d5ae6)',
];

export function avatarColor(name = '') {
  let sum = 0;
  for (const ch of name) sum += ch.codePointAt(0) || 0;
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export const REWARDS = [
  { icon: 'Star', label: 'سلوك ممتاز' },
  { icon: 'GraduationCap', label: 'تفوق دراسي' },
  { icon: 'HeartHandshake', label: 'مساعدة الآخرين' },
  { icon: 'MessageCircle', label: 'مشاركة بالفصل' },
  { icon: 'Palette', label: 'أعمال فنية رائعة' },
  { icon: 'Trophy', label: 'نشاط رياضي' },
  { icon: 'Zap', label: 'مثابرة ومجهود' },
];

export const DEDUCTIONS = [
  { icon: 'Gamepad2', label: 'لهو أثناء الحصة' },
  { icon: 'AlarmClock', label: 'تأخر عن الحصة' },
  { icon: 'Smartphone', label: 'استخدام الهاتف' },
  { icon: 'AlertTriangle', label: 'سلوك غير لائق' },
];