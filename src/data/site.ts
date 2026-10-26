// Everything the page says lives in this file.

export type Org = { mark: string; name: string };

export const site = {
  name: 'Pavan Meka',
  role: 'Real Estate / Finance',
  location: 'Durham, NC',
  timeZone: 'America/New_York',
  email: 'pavankmeka@gmail.com',
  description:
    'Duke Fuqua finance graduate and NC-licensed real estate broker focused on CRE underwriting, financial modeling and due diligence.',
};

// A button only renders when its link is set, so an empty string never ships a dead link.
export const links = {
  linkedin: 'https://www.linkedin.com/in/pkm-profile/',
  resume: '/Pavan-Meka-Resume.pdf', // file lives in public/
  calendar: '', // e.g. a Calendly or Cal.com link
};

export const orgs = {
  duke: { mark: 'D', name: 'Duke Fuqua' },
  wake: { mark: 'W', name: 'Wake Forest' },
  fivePoints: { mark: 'F', name: 'Five Points Capital' },
  guggenheim: { mark: 'G', name: 'Guggenheim' },
} satisfies Record<string, Org>;

export const experience: { date: string; title: string; org?: Org; body: string }[] = [
  {
    date: '2021 — 2022',
    title: 'Analyst at',
    org: orgs.fivePoints,
    body: 'Private credit and growth equity. Ran public comps, precedent transactions and sector analyses to assess debt positioning, and did diligence on capital structures and debt service.',
  },
  {
    date: 'Summer 2022',
    title: 'IB Summer Analyst at',
    org: orgs.guggenheim,
    body: "Built LBO, DCF and accretion/dilution models. Supported live deals including LLR Partners' acquisition of Stratix and IBM's acquisition of Dialexa.",
  },
  {
    date: '2020 — Now',
    title: 'Licensed Real Estate Broker, NC',
    body: 'Passed the national and state licensing exams in 2020.',
  },
];

export const focus =
  'CRE Underwriting, Cash Flow Models, Credit Analysis, Valuation, Due Diligence And Portfolio Reporting.';

export const toolkit = [
  {
    label: 'Underwriting',
    items: ['NOI', 'DSCR', 'Debt Yield', 'Cap Rate', 'Levered / Unlevered IRR', 'ARGUS Enterprise'],
  },
  {
    label: 'Modeling',
    items: ['DCF', 'LBO', 'Accretion / Dilution', 'Public Comps', 'Precedents', 'Scenario Analysis'],
  },
  { label: 'Tools', items: ['Advanced Excel', 'PowerPoint', 'DealCloud'] },
];

// `stat` counts up from zero when the row scrolls into view.
export const projects = [
  {
    tag: 'Multifamily',
    title: 'Value-add acquisition',
    stat: '19.61% IRR',
    body: "DLP Capital case study. Underwrote a $3M capex plan on interest-only debt and flagged a 1.13x DSCR against the lender's 1.25x minimum.",
  },
  {
    tag: 'Retail',
    title: 'Commercial retail underwriting',
    stat: '100K SF',
    body: 'LoopNet asset. Multi-year cash flow projections with ARGUS Enterprise tenant rollover, renewal probabilities and downtime.',
  },
  {
    tag: 'Income',
    title: 'Income property analysis',
    stat: '1.17x DSCR',
    body: 'Compared two properties on NOI, DSCR, debt yield (9.29% vs. 4.22%), direct cap and DCF, then proposed a graduated payment mortgage to match debt service to NOI growth.',
  },
  {
    tag: 'Healthcare',
    title: 'Hospital bolt-on acquisition',
    stat: '17.9% CoC',
    body: 'Prime Healthcare, buy-side. Two-scenario model benchmarked to CHS deals ($102M–$459M implied value), 60/40 debt/equity at 7.5%, presented to the Founder/CEO and CFO.',
  },
];

export const education = [
  {
    date: '2026',
    title: 'MQM, Finance at',
    org: orgs.duke,
    body: 'Master of Quantitative Management. Fixed income, derivatives, real estate finance and data analytics.',
  },
  {
    date: '2023',
    title: 'B.S. Finance at',
    org: orgs.wake,
    body: 'School of Business. Real estate finance, financial accounting, quantitative finance and financial modeling.',
  },
];

export const personal = [
  {
    label: 'Leadership',
    body: 'Founded the Deacon Case Competition Club at Wake Forest and grew it to 50+ members. Junior Student Leader of the Year.',
  },
  {
    label: 'Clubs',
    body: 'Duke MBA Real Estate Club, with site visits to Merritt Properties, Village District REIT and Austin Lawrence Partners.',
  },
  {
    label: 'Community',
    body: "Volunteer and donor at Crossnore Children's Home and the Indo-US Cultural Association.",
  },
  { label: 'Tennis', body: 'Competitive USTA player, Level 3/4.' },
];
