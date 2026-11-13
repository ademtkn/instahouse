// AsyncStorage keys shared by the auth and favourites contexts, so deleting an
// account can also drop that account's favourites.
export const USER_KEY = 'instahouse.user.v1';
export const favoritesKey = (phone: string) => `instahouse.favorites.v1.${phone}`;
