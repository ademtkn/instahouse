// AsyncStorage keys shared by the auth and favourites contexts, so deleting an
// account can also drop that account's favourites.
export const USER_KEY = 'instahouse.user.v1';
// Admin panel session (set after the code is accepted) and the persisted listing
// catalogue that the admin panel edits and the feed reads.
export const ADMIN_KEY = 'instahouse.admin.v1';
export const LISTINGS_KEY = 'instahouse.listings.v1';
export const favoritesKey = (phone: string) => `instahouse.favorites.v1.${phone}`;
