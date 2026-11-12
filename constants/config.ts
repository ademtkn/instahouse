// Demo mode shows a preview sheet instead of really opening WhatsApp / the
// dialer. It is off for now: every listing points at the test number
// +996 502 00 19 03, so the buttons can be tried end to end.
// Turn it back on if listings ever get numbers that could belong to strangers.
export const DEMO_MODE = false;

// A listing is shown for this many days after it was posted, then it drops
// out of the feed. Sellers are told to get in touch again to extend it.
export const LISTING_LIFETIME_DAYS = 15;

// Official USD rate of the National Bank of the Kyrgyz Republic on 12 Nov 2026
// (87.4496). Listings are stored in dollars; som is this rate, rounded for display.
export const SOM_PER_USD = 87.45;

// Only the administrator posts listings; people send their property details here.
// Telegram and e-mail are placeholders until the owner provides real ones.
export const ADMIN_CONTACTS = {
  whatsappPhone: '+996502001903',
  telegram: 'https://t.me/+996502001903',
  email: 'admin@instahouse.kg',
};
