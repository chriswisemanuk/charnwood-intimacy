export const SITE_NAME = 'Charnwood Intimacy';
export const SITE_URL = 'https://charnwoodintimacy.co.uk';
export const PARENT_SITE_URL = 'https://charnwoodcounselling.co.uk';
export const PARENT_SITE_NAME = 'Charnwood Counselling';

export const PHONE = '07920 686343';
export const PHONE_HREF = 'tel:+447920686343';
export const EMAIL = 'talk@charnwoodintimacy.co.uk';
export const EMAIL_HREF = 'mailto:talk@charnwoodintimacy.co.uk';

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

// Form processing is handled by the Cloudflare Worker (worker/index.js),
// which sends email through the practice's Brevo account. See README.md
// for the one-off setup steps (API key secret and sender verification).
