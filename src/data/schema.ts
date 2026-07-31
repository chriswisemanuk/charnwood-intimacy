/*
  Structured data (JSON-LD) for the site.

  Ground rules followed here:
  - Nothing is asserted that isn't true or visible on the site. No invented
    review scores, no fabricated coordinates, no social profiles until they
    exist.
  - The schema type is MedicalBusiness, not Psychologist. "Practitioner
    psychologist" is an HCPC-protected title in the UK and Jo is a
    psychotherapist, so claiming it would be inaccurate.
  - Every entity has a stable @id so the pages can reference each other
    rather than repeating the same details.
*/
import {
  SITE_URL,
  SITE_NAME,
  PARENT_SITE_URL,
  PARENT_SITE_NAME,
  PHONE,
  EMAIL,
  OPENING_HOURS,
  PRICE_RANGE,
} from '../consts';

export const ORG_ID = `${SITE_URL}/#organisation`;
export const THERAPIST_ID = `${SITE_URL}/#jo-wiseman`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/*
  WebSite schema. This is the signal Google uses to decide the site name shown
  above the URL in search results, and it has to be on the HOME PAGE to count.
  Without it Google falls back to guessing, which is why the domain was showing
  instead of "Charnwood Intimacy".

  `name` is the preferred form and `alternateName` gives Google a fallback for
  narrow layouts. Google treats both as hints, not instructions, so this makes
  the right name available rather than guaranteeing it.
*/
export const website = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${SITE_URL}/`,
  name: SITE_NAME,
  alternateName: 'Charnwood Intimacy Psychosexual Therapy',
  publisher: { '@id': ORG_ID },
  inLanguage: 'en-GB',
};

const address = {
  '@type': 'PostalAddress',
  streetAddress: 'Floor 2, The Old Arts College, 12 Frederick Street',
  addressLocality: 'Loughborough',
  addressRegion: 'Leicestershire',
  postalCode: 'LE11 3BJ',
  addressCountry: 'GB',
};

const areaServed = [
  { '@type': 'City', name: 'Loughborough' },
  { '@type': 'AdministrativeArea', name: 'Leicestershire' },
  { '@type': 'Country', name: 'United Kingdom' },
];

export const localBusiness = {
  '@context': 'https://schema.org',
  '@type': 'MedicalBusiness',
  '@id': ORG_ID,
  name: SITE_NAME,
  alternateName: 'Charnwood Intimacy Psychosexual Therapy',
  description:
    'Psychosexual and intimacy therapy, also known as sex therapy, in Loughborough and online across the UK.',
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/images/logo-intimacy-header.png`,
  image: `${SITE_URL}/images/og-image.jpg`,
  telephone: PHONE,
  email: EMAIL,
  address,
  areaServed,
  ...(PRICE_RANGE ? { priceRange: PRICE_RANGE } : {}),
  currenciesAccepted: 'GBP',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: OPENING_HOURS.days,
      opens: OPENING_HOURS.opens,
      closes: OPENING_HOURS.closes,
    },
  ],
  parentOrganization: {
    '@type': 'Organization',
    name: PARENT_SITE_NAME,
    url: PARENT_SITE_URL,
  },
  knowsAbout: [
    'Psychosexual therapy',
    'Sex therapy',
    'Low libido and mismatched desire',
    'Vaginismus and painful sex',
    'Erectile dysfunction and performance anxiety',
    'Sexual trauma',
    'Compulsive sexual behaviour',
    'Couples and intimacy therapy',
  ],
  availableLanguage: { '@type': 'Language', name: 'English' },
};

export const therapist = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': THERAPIST_ID,
  name: 'Jo Wiseman',
  jobTitle: 'Founder and Psychotherapist',
  url: `${SITE_URL}/your-therapist/`,
  image: `${SITE_URL}/images/jo-wiseman.jpg`,
  worksFor: { '@id': ORG_ID },
  memberOf: [
    {
      '@type': 'Organization',
      name: 'British Association for Counselling and Psychotherapy',
      alternateName: 'BACP',
      url: 'https://www.bacp.co.uk/',
    },
    {
      '@type': 'Organization',
      name: 'College of Sexual and Relationship Therapists',
      alternateName: 'COSRT',
      url: 'https://www.cosrt.org.uk/',
    },
  ],
};

/* One Service entity per condition page, tied back to the business. */
export function service(opts: {
  name: string;
  description: string;
  slug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    serviceType: 'Psychosexual therapy',
    description: opts.description,
    url: `${SITE_URL}/${opts.slug}/`,
    provider: { '@id': ORG_ID },
    areaServed,
    availableChannel: [
      {
        '@type': 'ServiceChannel',
        name: 'In person, Loughborough',
        servicePostalAddress: address,
      },
      {
        '@type': 'ServiceChannel',
        name: 'Online, across the UK',
        serviceUrl: `${SITE_URL}/online-therapy/`,
      },
    ],
  };
}

export function breadcrumb(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function faqPage(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
