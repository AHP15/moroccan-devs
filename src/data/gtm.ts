/**
 * Content for /for-serpapi — the English case page addressed to SerpApi's hiring team.
 * Kept as data rather than markup so the plan can be revised without touching layout.
 */

export interface Deliverable {
  text: string;
  /** Already done and published — shown as complete rather than promised. */
  done?: boolean;
}

export interface Phase {
  window: string;
  title: string;
  goal: string;
  deliverables: Deliverable[];
  /** What would prove this phase worked. */
  proof: string;
}

export const PHASES: Phase[] = [
  {
    window: 'Days 1–30',
    title: 'Establish the baseline',
    goal:
      'Find out what Arabic-speaking developers actually search for, and what SerpApi currently ranks for in Arabic. Nobody has this data today.',
    deliverables: [
      {
        text: 'Arabic keyword measurement across regional Google domains, built with SerpApi itself so the research doubles as a product demo.',
        done: true,
      },
      {
        text: 'A rank baseline for SerpApi on Arabic commercial-intent queries, with raw data published for audit.',
        done: true,
      },
      {
        text: 'Two open-source measurement tools, so every number here is reproducible rather than asserted.',
        done: true,
      },
      { text: 'Extend the baseline to competitors and to the remaining markets (MA, JO, IQ, KW, QA).' },
      {
        text: 'Localise the highest-traffic docs pages and the pricing page into Arabic, prioritised by that keyword data rather than by page order.',
      },
      {
        text: 'Map the Arabic developer channels worth being in, with an honest read on which are alive and which are abandoned.',
      },
    ],
    proof:
      'A keyword–market matrix and a documented rank baseline, both reproducible from a script. Done — see the findings above.',
  },
  {
    window: 'Days 31–60',
    title: 'Ship content and show up',
    goal:
      'Move from research to consistent output, and start being a recognisable presence rather than a link people occasionally see.',
    deliverables: [
      { text: 'Weekly Arabic tutorial cadence, each with a runnable code sample in Python, JavaScript and cURL.' },
      { text: 'First 4 Arabic screencasts — the format Arabic developer audiences consume most, and the one with the least competition.' },
      { text: 'Move the two measurement tools under the SerpApi org and harden them for public use.' },
      { text: 'Active participation in Arabic developer communities: answering real questions, not dropping links.' },
      { text: 'First webinar in Arabic, aimed at the SEO-agency segment rather than at developers.' },
    ],
    proof:
      'Published cadence held for 4 straight weeks, plus first inbound signups attributable to Arabic content.',
  },
  {
    window: 'Days 61–90',
    title: 'Convert and compound',
    goal:
      'Turn the audience into pipeline, and hand the product team something they did not have before.',
    deliverables: [
      { text: 'Outbound to the validated target accounts, led with the market data rather than with a pitch.' },
      { text: 'A written regional feedback report to product: what Arabic-market users need that the API does not do today.' },
      { text: 'A repeatable content system another advocate could run — templates, glossary, style guide.' },
      { text: 'First conference or meetup talk proposal submitted in the region.' },
    ],
    proof:
      'Attributable signups from Arabic channels, and at least one product change informed by regional feedback.',
  },
];

export interface Segment {
  name: string;
  why: string;
  examples: string[];
}

/**
 * Deliberately framed as hypotheses. Which of these segments actually converts is an
 * empirical question, and the first 30 days exist partly to answer it.
 */
export const SEGMENTS: Segment[] = [
  {
    name: 'Digital marketing and SEO agencies',
    why: 'Highest query volume per account. Agencies track hundreds of keywords per client, and Arabic rank tracking across multiple Google domains multiplies that. This is where the SERP data spend concentrates.',
    examples: ['Regional agencies in Dubai, Riyadh, Cairo', 'Freelance Arabic SEO consultants', 'In-house growth teams'],
  },
  {
    name: 'E-commerce and marketplaces',
    why: 'Price and rank monitoring across regional Google domains. A retailer selling into both Saudi Arabia and Egypt needs two rank pictures, not one.',
    examples: ['Noon', 'Salla', 'Zid', 'Jumia', 'Namshi'],
  },
  {
    name: 'Classifieds and property portals',
    why: 'Listing visibility is the entire business model. These companies already measure organic position obsessively and mostly do it with tooling that treats Arabic as an afterthought.',
    examples: ['Bayut', 'Property Finder', 'Dubizzle', 'Wuzzuf'],
  },
  {
    name: 'Media monitoring and market intelligence',
    why: 'Arabic news and financial data aggregation depends on structured search results. Google News and Google Finance endpoints map directly onto what these teams already build in-house.',
    examples: ['Argaam', 'Mubasher', 'Regional press-monitoring firms'],
  },
  {
    name: 'Universities and coding schools',
    why: 'Not a revenue segment — a pipeline one. Free or discounted API access for coursework puts SerpApi in front of developers at the moment they are choosing default tools.',
    examples: ['1337 / UM6P (Morocco)', 'AUC (Egypt)', 'KFUPM (Saudi Arabia)', 'ALX'],
  },
];

export interface Channel {
  name: string;
  role: string;
  cadence: string;
}

export const CHANNELS: Channel[] = [
  { name: 'Arabic blog and tutorials', role: 'Owns organic search. Compounds; slowest to start.', cadence: 'Weekly' },
  { name: 'Screencasts (YouTube)', role: 'Highest-consumption format in Arabic tech, least competition.', cadence: 'Bi-weekly' },
  { name: 'X and LinkedIn in Arabic', role: 'Distribution and visible presence. Not a content channel on its own.', cadence: 'Daily-ish' },
  { name: 'Community participation', role: 'Hsoub I/O, Arabic dev Discords and Telegram groups, Reddit. Answering questions, not link-dropping.', cadence: 'Daily' },
  { name: 'Webinars and meetups', role: 'Depth and direct contact. Converts far better than any written channel.', cadence: 'Monthly' },
  { name: 'Outbound', role: 'Led with market data. The keyword research is the opening, not the pitch.', cadence: 'Weekly batches' },
];

export interface MarketFact {
  figure: string;
  label: string;
  note: string;
  source: { label: string; url: string };
}

export const MARKET: MarketFact[] = [
  {
    figure: '~422M',
    label: 'Arabic speakers worldwide',
    note: 'Roughly 313M of them native speakers, spread across 22 countries — each with its own Google domain.',
    source: { label: 'Babbel', url: 'https://www.babbel.com/en/magazine/how-many-speak-arabic' },
  },
  {
    figure: '<1%–3%',
    label: 'Share of web content in Arabic',
    note: 'Estimates disagree sharply — which is itself the point. The gap between speakers and content is the opportunity, and it is largest in technical content.',
    source: { label: 'MIT Technology Review', url: 'https://www.technologyreview.com/2015/03/06/168966/the-online-language-barrier/' },
  },
  {
    figure: '~$7.5B',
    label: 'MENA startup funding, 2025',
    note: 'A funded, API-buying software market, not an emerging one. $1.7B more across 242 rounds in H1 2026.',
    source: { label: 'Wamda', url: 'https://www.wamda.com/2026/01/record-year-mena-startups-funding-climbs-7-5-billion-n-2025' },
  },
  {
    figure: '~100%',
    label: 'Internet penetration, Saudi Arabia and UAE',
    note: 'Two of the highest-connectivity markets on earth, and the two with the most concentrated regional software spend.',
    source: { label: 'DataReportal', url: 'https://datareportal.com/reports/digital-2026-united-arab-emirates' },
  },
];


/** Measured 2026-08-30 via SerpApi. Raw data lives in tools/rank-tracker/data/. */
export const BASELINE = {
  measuredOn: '30 August 2026',
  searchesUsed: 42,
  markets: ['eg', 'sa', 'ae'] as const,
  ranks: [
    { keyword: 'serp api', script: 'latin' as const, eg: 1, sa: 1, ae: 1 },
    { keyword: 'google search api', script: 'latin' as const, eg: 2, sa: 3, ae: 3 },
    { keyword: 'واجهة برمجة نتائج البحث', script: 'arabic' as const, eg: null, sa: null, ae: null },
    { keyword: 'استخراج نتائج بحث جوجل', script: 'arabic' as const, eg: null, sa: null, ae: null },
    { keyword: 'سحب بيانات محركات البحث', script: 'arabic' as const, eg: null, sa: null, ae: null },
  ],
  /** Jaccard overlap of top-10 domain sets, averaged over the three market pairs. */
  overlap: [
    { keyword: 'تعلم البرمجة', intent: 'Educational', mean: 0.59, shared: 5 },
    { keyword: 'تصميم مواقع', intent: 'Service, global tools', mean: 0.42, shared: 4 },
    { keyword: 'استضافة مواقع', intent: 'Service, local', mean: 0.10, shared: 1 },
    { keyword: 'افضل بنك', intent: 'Locally regulated', mean: 0.03, shared: 0 },
    { keyword: 'شركة تسويق الكتروني', intent: 'Local service', mean: 0.0, shared: 0 },
  ],
} as const;
