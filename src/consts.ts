export const SITE = {
  url: 'https://moroccandevs.com',
  name: 'MoroccanDevs',
  nameAr: 'مغربي ديفز',
  /** Pan-Arab positioning: Moroccan is the origin, the audience is every Arabic-speaking developer. */
  taglineAr: 'محتوى تقني بالعربية لمطوّري العالم العربي',
  taglineEn: 'Technical content in Arabic for developers across the Arab world',
  descriptionAr:
    'دروس ومقالات تقنية بالعربية حول واجهات برمجة التطبيقات، واستخراج بيانات الويب، وتحليل نتائج محرّكات البحث العربية.',
  descriptionEn:
    'Arabic-language tutorials on APIs, web scraping, and analysing Arabic search engine results.',
  locale: 'ar',
  ogLocale: 'ar_AR',
  defaultOgImage: '/og/site.png',
  /** Public repo for the site and the measurement tools; posts link to it. */
  repo: 'https://github.com/ahp15/moroccan-devs',
} as const;

export const AUTHOR = {
  name: 'Abdessittir Harkati',
  nameAr: 'عبد الستير حركاتي',
  email: 'harkati.web.dev@gmail.com',
  bioAr:
    'مطوّر ويب من المغرب. أكتب بالعربية عن واجهات برمجة التطبيقات واستخراج البيانات من محرّكات البحث.',
  bioEn:
    'Web developer from Morocco, writing in Arabic about APIs and search engine data extraction.',
  github: 'https://github.com/ahp15',
  x: 'https://x.com/',
  linkedin: 'https://www.linkedin.com/in/abdessittirharkati',
  youtube: '',
} as const;

export const NAV_AR = [
  { href: '/', label: 'الرئيسية' },
  { href: '/tags', label: 'المواضيع' },
  { href: '/about', label: 'من أنا' },
] as const;

/**
 * The language item is a toggle, so it always points at the language you are *not*
 * reading. As a fixed 'English -> /en' nav entry it marked itself the current page once
 * you were on /en, and the only route back to Arabic was 'الرئيسية' — a word an English
 * reader has no reason to recognise as the way home.
 */
export const LANG_SWITCH = {
  ar: { href: '/en', label: 'English', lang: 'en', title: 'Read about this site in English' },
  en: { href: '/', label: 'العربية', lang: 'ar', title: 'اقرأ الموقع بالعربية' },
} as const;

/** Arabic labels for post metadata, kept in one place so the register stays consistent. */
export const UI_AR = {
  readingTime: (m: number) => `${m} دقائق قراءة`,
  publishedOn: 'نُشر في',
  updatedOn: 'حُدّث في',
  toc: 'محتويات المقال',
  tags: 'المواضيع',
  allPosts: 'كل المقالات',
  latestPosts: 'أحدث المقالات',
  nextPost: 'المقال التالي',
  prevPost: 'المقال السابق',
  englishSummary: 'English summary',
  share: 'شارك المقال',
  notFound: 'الصفحة غير موجودة',
} as const;
