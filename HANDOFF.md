# InstaHouse — handoff / roadmap

> Bu dosya, projede çalışan her yapay zeka asistanı (Claude, Codex, …) ve insan için
> devir notudur. **Bir göreve başlamadan önce oku; görevi bitirince "Done log" ve
> "Next" bölümlerini güncelle.** Owner Türkçe yazar; kod ve commit mesajları İngilizce.

## What this is
Instagram/Reels-style vertical feed for real-estate listings (apartments, houses, dachas,
land, commercial) in Kyrgyzstan. Expo SDK 58 + Expo Router + TypeScript. Local-first prototype:
the web build (GitHub Pages) is an internal preview; native is not built yet. The 2026-11-14
Mashinam pass has **not** been ported yet — see the incoming-port section below.

- Repo: https://github.com/ademtkn/instahouse (branch `main` = source, `gh-pages` = built site)
- Live: https://ademtkn.github.io/instahouse/ (base path `/instahouse`, lower-case)
- Sibling project: Mashinam (`../Mashinam`, same structure, used cars). The owner's standing
  rule: **every task given for one app must also be applied to the other** where it makes sense.
  InstaHouse was derived from Mashinam; when in doubt, look at how Mashinam did it.

## Incoming port from Mashinam (2026-11-14)

Mashinam is the reference implementation; InstaHouse is still at the 2026-11-13 state. Before coding, read
`../Mashinam/HANDOFF.md` and `../Mashinam/AGENTS.md` (work log), then use these reference commits:
`ed233be` (app-first pass), `196994c` (960 px images), `53f47a6` (Android nav bar/release), `b6254ca`
(release image transition), `8e6d795` (cleanup). Live reference: https://ademtkn.github.io/Mashinam/.
Release APK: `../Mashinam/android/app/build/outputs/apk/release/app-release.apk`.

Port the **patterns**, not the car content. Keep InstaHouse-specific: `CurrencySwitch`/`CurrencyContext`
(USD/som, `SOM_PER_USD`), `dealType` sale/rent, property types, rooms/area/floor/documents/series/condition/
furnished, `utils/title.ts`, and the 16 local demo photos (licensing still unconfirmed — do not replace them
in this pass).

### Ordered checklist

1. **Brand & native config:** generate an InstaHouse-specific house/monogram icon + splash (do not reuse the
   Mashinam car "M"); placeholder bundle IDs `kg.instahouse.app`; `expo-splash-screen`; adaptive icon background
   navy (not `#E6F4FE`); version/build numbers. `tools/brand/generate_assets.py` is the template.
2. **One-step account:** phone (+996) + WhatsApp OTP local demo (`LOCAL_AUTH_DEMO`), no password/e-mail in the
   form. `AuthContext.User` drops `password`; purge legacy plaintext passwords from AsyncStorage; add
   `utils/phone.ts`; consent checkbox. Update `SignInSheet`, `profile.tsx` (remove the password field) and the
   sign-out/delete flows.
3. **Legal (rewrite, don't copy):** `constants/legal.ts` for real estate (sale/rent, placeholder company **X**,
   Kyrgyz personal-data law, explicit consent to publish the seller's phone/WhatsApp). Add
   `LegalSheet`/`LegalScreen`/`LegalDocumentView`/`ConsentCheck`, `app/legal/privacy.tsx`, `app/legal/terms.tsx`,
   and links in Profile, sign-in and the seller form. Car-specific legal text must not be copied.
4. **Admin listing form:** replace the WhatsApp/Telegram/e-mail-only `sell.tsx` with a structured form:
   dealType (sale/rent), property type, rooms, area m², land sotka, floor/total floors, year, series, condition,
   documents, furnished, city/district, price USD (+ som preview via `CurrencyContext`), seller type
   (owner/agent), phone, photo guide, public-phone consent. Compose a Russian message and open the admin
   WhatsApp; photos are attached in the chat. Admin-only, free, 15-day lifetime.
5. **Kyrgyzstan-wide cities:** expand the 8-city union to the same 15 as Mashinam (`Batken`, `Kara-Balta`, `Kant`,
   `Cholpon-Ata`/`Çolpon-Ata`, `Uzgen`, `Bazar-Korgon`, `Sülüktü`, `Kızıl-Kiya`); update `label.city` and add a
   city modal to `FilterBar`, preserving deal type/property type/rooms/price/currency chips.
6. **Feed:** remove the `isDefaultFilters` guard so every pull/tab press reshuffles unseen listings even with
   filters; keep seen listings below; set `SEEN_AFTER_MS` to 3 s. Preserve the sale/rent segment and currency.
7. **Card:** remove `transition={250}` from the main `ListingCard` image (release-only invisible-photo bug).
   InstaHouse uses local `public/media` files, so the Wikimedia 960 px issue does not apply.
8. **Android:** add `expo-navigation-bar` 58.0.4, `NavigationBar.setStyle('dark')` (SDK 58 API, not
   `setBackgroundColorAsync`), plugin `enforceContrast: false`, `utils/navigationBar(.android).ts`, and the
   centred 560 px tablet frame in `app/_layout.tsx`. Build with `npx expo run:android --device <id>`; release:
   `cd android && ./gradlew app:assembleRelease -PreactNativeArchitectures=arm64-v8a`.
9. **Cleanup:** delete `DemoContactModal`/`DEMO_MODE`; remove `isDefaultFilters` if unused, `daysAgo`, `orange`,
   unused `icon-512`; audit unused i18n keys/styles; verify all 16 media files are referenced.
10. **Verify & publish:** `npx tsc --noEmit` + `npx expo lint`; web export
    `EXPO_BASE_URL=/instahouse npx expo export --platform web`; install the release APK on the Poco X3 Pro
    (Android 12) and test feed / OTP / seller form / legal / city; publish gh-pages with base path `/instahouse`
    (lower-case) and verify the live entry hash.

### Android/MIUI gotchas (from the Mashinam pass)

- `adb install` fails with `INSTALL_FAILED_USER_RESTRICTED` on MIUI even with "Install via USB" on; the
  `AdbInstallActivity` prompt auto-rejects after 10 s and ignores `input tap`. Workaround: push the APK to
  `/sdcard/Download/`, open Downloads, tap the APK, then **DEVAM → GÜNCELLE/Yükle**; use `uiautomator dump` for
  exact bounds. Play Protect may appear: press Back to reach the MIUI scan, wait for "Güvenlik testlerini geçti",
  then tap **Aç** (or start the app with `am start`).
- The debug app needs Metro (`npx expo start`, `adb reverse tcp:8081 tcp:8081`); the release APK is standalone.
- The release build uses the generated debug keystore — local testing only, not store distribution.
- `expo-system-ui` is not installed; the declarative `userInterfaceStyle` warning is expected and the app is
  visually dark anyway.

## Run / check / publish
```bash
npm ci
npx expo start                      # dev server (web: press w)
npx tsc --noEmit && npx expo lint    # must both pass before any commit
EXPO_BASE_URL=/instahouse npx expo export --platform web   # production web build -> dist/
```
Publishing is **manual** (the owner's GitHub account is billing-locked, so the
`.github/workflows/deploy-pages.yml` workflow never runs):
```bash
git clone --branch gh-pages https://github.com/ademtkn/instahouse.git /tmp/ghp
cd /tmp/ghp && git rm -rq . && cp -R <repo>/dist/. . && cp index.html 404.html && touch .nojekyll
git add -A && git commit -m "Web build for GitHub Pages (from main <sha>)" && git push origin gh-pages
# live after ~20-80 s; verify: curl -s https://ademtkn.github.io/instahouse/ | grep -oE 'entry-[a-f0-9]+\.js'
```
Commit messages end with a `Co-Authored-By:` line naming the assistant that wrote the change.

## Testing the web build (what has worked)
Serve `dist/` under the base path (`mkdir site && ln -s <repo>/dist site/instahouse && cd site && python3 -m http.server 8766`)
and drive it with Playwright + Chrome (`executablePath: /Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
`devices['iPhone 13']`). Gotchas:
- **Never scroll the feed programmatically** (`scrollTo`/`scrollTop`): Chrome's scroll-snap snaps back to card 0.
  Use slow touch drags via CDP `Input.dispatchTouchEvent` (one card per drag). Pull-to-refresh = drag down from the top.
- Far cards render as empty placeholders on web, so only ~3 cards exist in the DOM at a time.
- A card active ≥ 1.5 s is marked "seen" (localStorage `instahouse.seen.v1`) and changes the next load's order.
- `?home=<id>` pins a listing to the top — use it to screenshot a specific card.
- `python3 -m http.server` has no SPA fallback: don't `reload()` on `/instahouse/profile`, `goto` the root instead;
  GitHub Pages serves `404.html` so deep links work live.
- Tabs stay mounted on web: a text that exists on two tabs (e.g. the "Создать аккаунт" button on Favourites and
  Profile) matches twice; pick the element whose centre `elementFromPoint` hit-tests to itself. The registration
  sheet is a `[role="dialog"]`; scope its inputs/buttons to it. The notifications switch is `input[role="switch"]`.
- `Alert.alert` is a no-op on react-native-web; use in-app confirmations (see delete-account in `profile.tsx`).
- Deferred actions run after sign-in must receive the user as an argument (closures captured before sign-in see
  `user = null`): `requireAuth((u) => …)` in `context/AuthContext.tsx`.
- Storage keys (`constants/storage.ts` + contexts): `instahouse.user.v1`, `instahouse.favorites.v1.<phone>`,
  `instahouse.lang.v1`, `instahouse.currency.v1`, `instahouse.seen.v1`.

## Conventions & product decisions
- Every seller phone number is the owner's test number **+996 502 00 19 03**; `DEMO_MODE` (constants/config.ts) is off so
  WhatsApp/Call really open wa.me / tel:. Keep it that way until real listings exist.
- UI languages: Russian (default), Kyrgyz, Turkish — `constants/i18n.ts`. Every new string goes into all three.
  The Kyrgyz strings were written by non-native speakers; the owner should review them.
- Prices are stored in USD; the header switch shows USD or som (`SOM_PER_USD` in constants/config.ts, NBKR rate of
  12 Nov 2026, update by hand). Rent prices are per month.
- Listings expire **15 days** after `createdAt` (`LISTING_LIFETIME_DAYS`). Demo dates are relative to "now" and clamped ≤ 14 days.
- Only the admin posts listings: the "Подать" tab shows WhatsApp / Telegram / e-mail buttons (`ADMIN_CONTACTS`).
  Telegram link and `admin@instahouse.kg` are **placeholders** until the owner provides real ones.
- Accounts are on-device only (name, phone, optional e-mail, password ≥ 4 chars stored in plain text locally,
  notifications flag). The app is fully usable without an account; only liking/favourites require one.
  Deleting the account also deletes that phone's favourites; signing out keeps them for the next sign-in.
- The card's second spec row (documents / renovation / series / furniture) is intentional — the things a buyer in KG
  asks first. (Mashinam's accident/customs/owners labels had no equivalent here, so nothing was removed.)
- Demo photos: 16 JPEGs in `public/media/` reused across the 50 listings (`utils/media.ts` builds the URL; native
  builds load them from the published site). Their provenance is not recorded in the repo — the owner should confirm
  they are licensed before launch. Never copy photos from house.kg / lalafo (real sellers' copyrighted photos).
- Feed order: unseen listings first (shuffled on every load/refresh), then already-seen ones with a "you've seen
  everything below" divider on the first seen card.

## Code map
- `app/(tabs)/index.tsx` feed (filters, pull-to-refresh, seen tracking, deep link, language switch) · `favorites.tsx` ·
  `sell.tsx` (admin contacts) · `profile.tsx` (edit details, notifications toggle, sign out, delete account)
- `components/ListingCard.tsx` full-screen card (gallery, video, seller row, price drop, specs, share) · `FilterBar.tsx` ·
  `CurrencySwitch.tsx` · `SignInSheet.tsx` (registration; exports `MIN_PASSWORD`) · `SeenDivider.tsx` · `SellerRow.tsx` ·
  `ActionButtons.tsx` (WhatsApp/call/share) · `FeedVideo(.web).tsx`
- `context/` Auth, Favorites, Language, Currency · `constants/` colors, config, i18n, storage · `hooks/` usePullToRefresh,
  useSeenListings · `services/listingService.ts` (data access + price ranges; swap for Supabase in phase 2) ·
  `utils/` format (price/area), title, time, media, shuffle · `types/listing.ts` (mirrors the planned Supabase table)
- `data/mockHouses.ts` 50 listings (13 apartments, 13 houses, 12 plots, 12 dachas) · `tools/listings/` helper scripts
  used when the demo catalogue was built

## Done log
- 2026-11-12 InstaHouse created from Mashinam with 50 Kyrgyzstan demo listings; USD/som price switch.
- 2026-11-13 Registration sheet with e-mail + password, Profile tab (edit name/phone/e-mail/password, notifications
  toggle, sign out, two-step delete account that also drops favourites), guest encouragement on Favourites and
  Profile, strings in RU/KG/TR. Verified with Playwright on the exported web build (33 checks: heart/double-tap while
  signed out open the sheet, like applied after registering and kept across reload, edits and the notifications flag
  persist, sign out keeps favourites, delete removes them, validation). `HANDOFF.md` added.

## In progress / blocked
- Prepared for the 2026-11-14 Mashinam port (handoff only; no feature work yet).

## Next (owner's roadmap, in priority order)
0. **Apply the 2026-11-14 Mashinam pass** — follow the "Incoming port" checklist above. This is the next task.
1. Real admin Telegram handle and e-mail in `constants/config.ts`.
2. Native-speaker review of the Kyrgyz strings in `constants/i18n.ts`.
3. Confirm the licence of the 16 demo photos in `public/media/` (or replace them with Wikimedia Commons / owner-shot
   photos with on-card credit, as Mashinam does); owner-shot vertical videos of real flats.
4. Phase 2: Supabase — SMS auth replacing the device account, `listings`/`favorites` tables, image/video storage with
   resized variants (CDN), push notifications for price drops on favourites, admin upload tool.
5. Personalised ranking from favourites/filters; "seen" + favourites synced across devices.
6. If the GitHub billing lock is lifted: switch Pages source to "GitHub Actions" so pushes to `main` auto-deploy.
