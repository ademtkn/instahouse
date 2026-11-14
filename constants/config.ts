// A listing is shown for this many days after it was posted, then it drops
// out of the feed. Sellers are told to get in touch again to extend it.
export const LISTING_LIFETIME_DAYS = 15;

// Local-only WhatsApp OTP demo: the code is generated on the device and
// shown on screen so the flow can be tested without a backend. Replace it
// with a real provider (Supabase Send SMS Hook + local SMS, or WhatsApp via
// Twilio) before a public build. Never ship with this true.
export const LOCAL_AUTH_DEMO = true;

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
