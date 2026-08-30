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
  { href: '/en', label: 'English' },
] as const;

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
