export const SITE_NAME = 'Charnwood Intimacy';
export const SITE_URL = 'https://www.charnwoodintimacy.co.uk';
export const PARENT_SITE_URL = 'https://charnwoodcounselling.co.uk';
export const PARENT_SITE_NAME = 'Charnwood Counselling';

export const PHONE = '07920 686343';
export const PHONE_HREF = 'tel:+447920686343';
export const EMAIL = 'talk@charnwoodcounselling.co.uk';
export const EMAIL_HREF = 'mailto:talk@charnwoodcounselling.co.uk';

export const ADDRESS_LINES = [
  'Floor 2',
  'The Old Arts College',
  '12 Frederick Street',
  'Loughborough',
  'LE11 3BJ',
];

// The site's own booking page, recreating the Charnwood Counselling
// booking experience with a form handled by Web3Forms.
export const BOOKING_URL = '/booking/';

// Used in the structured data (see src/data/schema.ts). Keep these in step
// with what the site actually says, or Google will treat the markup as
// misleading.
export const OPENING_HOURS = {
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  opens: '08:00',
  closes: '19:00',
};
// Empty until Jo confirms the introductory fee. The pages deliberately say
// fees are confirmed on enquiry rather than naming a number, so publishing one
// only in the markup would be the mismatch the note above warns about.
// Set it (e.g. 'From £60') and priceRange reappears in the structured data.
export const PRICE_RANGE: string = '';

// Form processing is handled by the Cloudflare Worker (worker/index.js),
// which sends email through the practice's Brevo account. See README.md
// for the one-off setup steps (API key secret and sender verification).

// Cloudflare Turnstile protects both forms from bots. The SITE key is public
// and belongs here; the SECRET key is set on the Worker (see README).
// Create a widget at Cloudflare dashboard > Turnstile, then paste its site
// key below. While this is left as the placeholder the widget is not shown
// and the Worker skips verification, so the forms keep working.
export const TURNSTILE_SITE_KEY = '0x4AAAAAAD-8XKm6wrJEyUYC';
