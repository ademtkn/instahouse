# InstaHouse — handoff / roadmap

> Bu dosya, projede çalışan her yapay zeka asistanı (Claude, Codex, …) ve insan için
> devir notudur. **Bir göreve başlamadan önce oku; görevi bitirince "Done log" ve
> "Next" bölümlerini güncelle.** Owner Türkçe yazar; kod ve commit mesajları İngilizce.

## What this is

Instagram/Reels-style vertical feed for real-estate listings (apartments, houses, dachas,
land, commercial) in Kyrgyzstan. Expo SDK 58 + Expo Router + TypeScript. Local-first
prototype: the web build (GitHub Pages) is an internal preview. The 2026-11-14 Mashinam
port is **applied** (brand, one-step phone auth, legal, structured admin form, 15 cities,
Android nav bar); a native Android release APK is built and tested on the owner's
Poco X3 Pro (Android 12). iOS is untested. Phase 2 = Supabase.

- Repo: https://github.com/ademtkn/instahouse (branch `main` = source, `gh-pages` = built site)
- Live: https://ademtkn.github.io/instahouse/ (base path `/instahouse`, lower-case)
- Sibling project: Mashinam (`../Mashinam`, same structure, used cars). The owner's standing
  rule: **every task given for one app must also be applied to the other** where it makes sense.
  InstaHouse was derived from Mashinam; when in doubt, look at how Mashinam did it.

## Native Android (built 2026-11-14)

`android/` is **generated** (CNG) and gitignored — never edit it by hand; change `app.json`
or config plugins and re-run prebuild.

```bash
npx expo prebuild --platform android --no-install     # generate android/ (only when missing)
npx expo run:android --device <adb-id>                # debug build + Metro
cd android && ANDROID_HOME=$HOME/Library/Android/sdk \
  ./gradlew app:assembleRelease -PreactNativeArchitectures=arm64-v8a
# -> android/app/build/outputs/apk/release/app-release.apk (34 MB, arm64)
```

- The release APK is signed with the generated **debug keystore**: local testing only, not
  store distribution. There is still no EAS project or `eas.json`.
- `expo-navigation-bar` paints the system bar navy (`NavigationBar.setStyle('dark')`,
  plugin `enforceContrast: false`); verified on the Poco in 3-button mode.
- The splash is the generated house mark on navy (`expo-splash-screen`, `imageWidth` 220).
- Native photo/video URLs still come from the **published site** (`utils/media.ts`), so a
  native build needs network and the live `media/` files.
- MIUI install: `adb install` fails with `INSTALL_FAILED_USER_RESTRICTED`. Workaround that
  worked: `adb push` the APK to `/sdcard/Download/`, open Downloads, tap the APK, **DEVAM**,
  then on the Play Protect screen choose **Uygulamayı yükleme** (install without scan). The
  first attempt ended with "Uygulama yüklenmedi"; re-opening the APK once installed it. The
  MIUI security scan may appear later with "Güvenlik testlerini geçti" and an **Aç** button.
- Emulator note: a headless Pixel_7 (API 34) AVD also ran the release APK. There
  `uiautomator dump` bounds were ~44 px **above** the screencap pixels — compare a dump
  against a screenshot before scripting taps. On the Poco the offset was ~0.

### Device check (Poco X3 Pro, Android 12, 2026-11-14)

Installed the standalone release APK and verified: feed with the real-estate spec rows
(documents / condition / series / furniture), USD↔som switch, 15-city modal (Бишкек
filter), one-step phone + demo WhatsApp code (name optional, no password/e-mail), profile
(account, notifications, legal links, no password field), `/legal/privacy` page with the
new real-estate text, the structured seller form (apartment 2 rooms, 58 m², 2019, 105
series, good condition, red book, furnished, Bishkek, 55 000 $ → "≈ 4 810 000 сом"
preview) and the WhatsApp hand-off (WhatsApp Business opened +996 502 001 903 with the
composed Russian message; it was not sent). The navy 3-button navigation bar and tab bar
are correct.

## Incoming port from Mashinam (2026-11-14) — APPLIED

The 10-item checklist was applied on 2026-11-14. Ported the patterns, not the car content:
`CurrencySwitch`/`CurrencyContext` (USD/som, `SOM_PER_USD`), the real-estate fields
(dealType, property type, rooms, area, sotka, floor, series, condition, documents,
furnished), `utils/title.ts`, the 50 demo listings and the 16 local photos were kept.
Reference commits (Mashinam): `ed233be` (app-first pass), `196994c` (960 px images),
`53f47a6` (Android nav bar/release), `b6254ca` (release image transition), `8e6d795`
(cleanup).

Deliberate deviations:

- `utils/time.ts#daysAgo` was **kept**: unlike Mashinam, InstaHouse's demo data still uses it,
  so it is not dead code.
- The demo catalogue stays in the original 8 cities. The `City` union, `constants/cities.ts`,
  `label.city` and the new city filter/form cover all 15; no listings were invented.
- The Wikimedia 960 px thumbnail issue does not apply (local `public/media` files); only the
  `expo-image` transition was removed for the release-only invisible-photo bug.
- No iOS build was attempted.

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
and drive it with Playwright + Chrome. Playwright is **not** a project dependency; the
sibling `../EduMaps` has it:

```bash
NODE_PATH=../EduMaps/node_modules node /tmp/ih-test.js
# chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
# context({ ...devices['iPhone 13'] })
```

Gotchas:

- **Tabs render as `<a role="tab">`** on web (`getByRole('tab', { name: 'Профиль' })`); they do
  client-side navigation, so the click does not hit the python server's missing SPA fallback.
  Plain card buttons are `role="button"`; the heart's accessible name is `favorite`.
- The sign-in sheet is a `Modal`; its inputs are labelled by their visible text
  (`getByLabel('Номер телефона')`), the consent box is `role="checkbox"`.
- `LOCAL_AUTH_DEMO` shows "Демо-код: XXXXXX" in the sheet; read it and type it into the
  `Код из WhatsApp` field.
- `SEEN_AFTER_MS` is 3 s and `useSeenListings` debounces the write by 400 ms — wait ~4.5 s
  after a reload before reading `instahouse.seen.v1`.
- Pressing the active feed tab refetches and reshuffles the unseen pool even with a filter
  applied; a different card becomes active and gets added to the seen map.
- Legal pages are routes `/legal/privacy` and `/legal/terms` (opened from Profile). In-form
  legal links open `LegalSheet` instead so typed form data survives.
- `?home=<id>` pins a listing to the top — use it to screenshot a specific card.
- Never scroll the feed programmatically (`scrollTo`/`scrollTop`): Chrome's scroll-snap snaps
  back to card 0. Use slow touch drags via CDP `Input.dispatchTouchEvent`. Pull-to-refresh =
  drag down from the top.
- Far cards render as empty placeholders on web, so only ~3 cards exist in the DOM at a time.
- `Alert.alert` is a no-op on react-native-web; use in-app confirmations.
- Deferred actions run after sign-in must receive the user as an argument (closures captured
  before sign-in see `user = null`): `requireAuth((u) => …)` in `context/AuthContext.tsx`.
- Storage keys (`constants/storage.ts` + contexts): `instahouse.user.v1`,
  `instahouse.favorites.v1.<phone>`, `instahouse.lang.v1`, `instahouse.currency.v1`,
  `instahouse.seen.v1`.

## Conventions & product decisions

- Every seller phone number is the owner's test number **+996 502 00 19 03**; WhatsApp/Call
  really open `wa.me` / `tel:`. Keep it that way until real listings exist.
- **Accounts are one-step:** phone (+996) + WhatsApp OTP, name optional, no password and no
  e-mail in the form. `LOCAL_AUTH_DEMO = true` in `constants/config.ts` generates the code
  on-device and shows it in the sheet; replace it with a real provider (Supabase Auth + Send
  SMS Hook, or WhatsApp via Twilio Verify) before any public build, then set it to false.
  `AuthContext.User` no longer has `password`; legacy plaintext passwords are stripped from
  AsyncStorage on load.
- **Consent:** sign-in has a privacy/terms checkbox; the listing form has a separate consent
  for publishing the seller's phone/WhatsApp. `constants/legal.ts` is a product draft for
  placeholder company **X** and needs a Kyrgyz lawyer review (real company details, address,
  policy URL).
- UI languages: Russian (default), Kyrgyz, Turkish — `constants/i18n.ts`. Every new string
  goes into all three. The Kyrgyz strings were written by non-native speakers; the owner
  should review them.
- Prices are stored in USD; the header switch shows USD or som (`SOM_PER_USD` in
  constants/config.ts, NBKR rate of 12 Nov 2026, update by hand). Rent prices are per month.
- Listings expire **15 days** after `createdAt` (`LISTING_LIFETIME_DAYS`). Demo dates are
  relative to "now" and clamped ≤ 14 days.
- Only the admin posts listings: the "Подать" tab is a **structured form** that composes a
  Russian message and opens the admin WhatsApp; photos are attached in the chat. The service
  is free (no paid placement, commission or banners). `ADMIN_CONTACTS` Telegram and
  `admin@instahouse.kg` are placeholders.
- Cities: 15 across Kyrgyzstan (`types/listing.ts`, `constants/cities.ts`); the feed has a city
  modal and defaults to "Весь Кыргызстан".
- Feed order: unseen listings first (shuffled on every load/refresh/tab press, even with
  filters), then already-seen ones in a stable order with the "you've seen everything below"
  divider on the first seen card. A card counts as seen after 3 s.
- Brand: navy `#0B1426` + amber `#FFB020`, rounded house mark with a door and a dashed plot
  line. Regenerate with `python3 tools/brand/generate_assets.py`. Bundle IDs are placeholders:
  `kg.instahouse.app`.
- Demo photos: 16 JPEGs in `public/media/` reused across the 50 listings (`utils/media.ts`
  builds the URL; native builds load them from the published site). Their provenance is not
  recorded — the owner must confirm the licence before launch. Never copy photos from
  house.kg / lalafo (real sellers' copyrighted photos).

## Code map

- `app/(tabs)/index.tsx` feed (filters, pull-to-refresh, seen tracking, deep link, language and
  currency switch) · `favorites.tsx` · `sell.tsx` (structured admin WhatsApp listing form) ·
  `profile.tsx` (edit details, notifications, legal links, sign out, delete account)
- `app/legal/privacy.tsx`, `app/legal/terms.tsx` · `app/_layout.tsx` (providers, tablet frame,
  Android nav bar)
- `components/ListingCard.tsx` full-screen card (gallery, video, seller row, price drop, specs,
  share) · `FilterBar.tsx` (deal type, property type, city modal, price, rooms) ·
  `CurrencySwitch.tsx` · `SignInSheet.tsx` (phone + WhatsApp OTP demo) · `LegalSheet.tsx` ·
  `LegalScreen.tsx` · `LegalDocumentView.tsx` · `ConsentCheck.tsx` · `SeenDivider.tsx` ·
  `SellerRow.tsx` · `ActionButtons.tsx` (WhatsApp/call/share) · `FeedVideo(.web).tsx`
- `constants/` colors, config (`LOCAL_AUTH_DEMO`, `LISTING_LIFETIME_DAYS`, `SOM_PER_USD`,
  `ADMIN_CONTACTS`), i18n (RU/KY/TR + labels), cities, legal, storage
- `context/` Auth, Favorites, Language, Currency · `hooks/` usePullToRefresh, useSeenListings ·
  `services/listingService.ts` (data access + price ranges; swap for Supabase in phase 2) ·
  `utils/` format (price/area/sotka/phone), title, time, media, shuffle, phone,
  navigationBar(.android).ts · `types/listing.ts` (mirrors the planned Supabase table)
- `data/mockHouses.ts` 50 listings (13 apartments, 13 houses, 12 plots, 12 dachas) ·
  `tools/brand/generate_assets.py` (icon/splash) · `tools/listings/` helper scripts

## Done log

- 2026-11-12 InstaHouse created from Mashinam with 50 Kyrgyzstan demo listings; USD/som price switch.
- 2026-11-13 Registration sheet with e-mail + password, Profile tab (edit name/phone/e-mail/password,
  notifications toggle, sign out, two-step delete account that also drops favourites), guest
  encouragement on Favourites and Profile, strings in RU/KG/TR. Verified with Playwright on the
  exported web build (33 checks). `HANDOFF.md` added.
- 2026-11-14 **Applied the full Mashinam 2026-11-14 port** (all 10 checklist items):
  - Brand/native: navy house-mark icon + adaptive/monochrome layers + splash + favicon generated
    by `tools/brand/generate_assets.py`; `kg.instahouse.app`, versionCode/buildNumber 1, navy
    adaptive background, `expo-splash-screen` and `expo-navigation-bar` plugins; `expo run:android`
    scripts.
  - One-step account: phone (+996) + WhatsApp OTP demo, optional name, no password/e-mail,
    `utils/phone.ts`, consent checkbox, `LOCAL_AUTH_DEMO`; legacy plaintext passwords purged,
    `AuthContext.User` drops `password`; Profile no longer edits a password.
  - Legal: `constants/legal.ts` rewritten for real estate (sale/rent, property data, public
    seller phone, Kyrgyz personal-data law, company X) in RU/KY/TR, plus `LegalSheet`,
    `LegalScreen`, `LegalDocumentView`, `ConsentCheck` and `/legal/privacy|terms`; linked from
    Profile, sign-in and the seller form.
  - Structured seller form: deal type, property type, rooms, area, sotka, floor/total floors,
    year, series, condition, documents, furniture, city/district, USD price with som preview,
    seller type, phone (prefilled), photo guide, public-phone consent, Russian message preview
    and WhatsApp hand-off.
  - 15 Kyrgyzstan cities in the `City` union, `constants/cities.ts`, `label.city` and a city
    modal in `FilterBar` (sale/rent, property type, rooms, price and currency chips preserved).
  - Feed reshuffles unseen listings on every pull/tab press even with filters; seen threshold
    3 s. Removed `expo-image`'s `transition` from the card photo.
  - Android: `expo-navigation-bar` 58.0.4 + `NavigationBar.setStyle('dark')` + plugin
    `enforceContrast: false`, `utils/navigationBar(.android).ts`, centred 560 px tablet frame.
  - Cleanup: removed `DemoContactModal`/`DEMO_MODE`, `isDefaultFilters`, `orange`, the unused
    Wikimedia thumbnail helper; audited i18n keys (no unused) and StyleSheet keys (none
    unused); all 16 media files referenced.
- 2026-11-14 Verified: `npx tsc --noEmit` and `npx expo lint` pass; 48/48 Playwright checks on
  the exported web build (feed, no-password sign-in, demo OTP, stored user without password,
  like applied, profile, privacy/terms content without car terms, notifications flag, 15-city
  modal + filter, seller form USD/som preview + WhatsApp URL payload, TR strings, 3 s seen
  threshold, reshuffle on tab press with a filter, no console errors). Built the standalone
  arm64 release APK and tested it on the Poco X3 Pro: feed/spec rows, USD↔som, city modal,
  OTP sign-in, profile + legal pages, structured form preview and WhatsApp hand-off, navy
  3-button nav bar. `dist/` exported with `EXPO_BASE_URL=/instahouse` (16 media files).
- 2026-11-14 **Published** `gh-pages 61b2ccd` from `main 498922e` and verified live:
  https://ademtkn.github.io/instahouse/ serves `entry-42d2165af5afc4e7f6281d6a301b19c2.js`;
  a live Playwright pass confirmed the feed, the sign-in sheet, the legal sheet opened from
  the consent link, the `/legal/privacy` deep link (404.html fallback) and no console errors.

## In progress / blocked

- **Real WhatsApp OTP** is not implemented. `LOCAL_AUTH_DEMO=true` is on-device only; set it to
  false and wire Supabase Auth + a provider before any public build.
- **Legal review:** `constants/legal.ts` is a product draft for placeholder company **X**;
  needs a Kyrgyz lawyer/native review, real company details, a real contact address and a
  privacy-policy URL for the stores.
- **Native build:** a standalone **release** APK (34 MB, arm64) is built and tested on a
  Poco X3 Pro (Android 12); it is signed with the debug keystore, so it is local-testing only.
  The debug APK was not reinstalled in this pass. iOS is untested. No EAS project/`eas.json`.
- **`expo-system-ui`:** not installed, so the declarative dark `userInterfaceStyle` is not
  applied on Android. The app is visually dark anyway; add it before relying on system
  dark-mode APIs.
- **Tablet:** the feed is a centred 560 px column on native tablets; a 2–3 column grid is still
  deferred.
- **Demo supply:** 50 demo listings, all pointing at the test number; the 16 demo photos have
  unconfirmed provenance; real admin listings and owner-shot vertical photos are needed before
  store submission.
- **Admin contacts:** `ADMIN_CONTACTS.telegram` and `admin@instahouse.kg` are placeholders.
- **Analytics/Sentry/Supabase/push** are not installed.
- The GitHub Actions Pages workflow is still blocked by the account billing lock; publishing
  stays manual.

## Next (owner's roadmap, in priority order)

1. Real admin Telegram handle and e-mail in `constants/config.ts`.
2. Native-speaker review of the Kyrgyz strings and the Kyrgyz legal text.
3. Confirm the licence of the 16 demo photos in `public/media/` (or replace them with
   Wikimedia Commons / owner-shot photos with on-card credit, as Mashinam does); owner-shot
   vertical videos of real flats.
4. Real WhatsApp OTP (Supabase Auth + Send SMS Hook or Twilio Verify), then
   `LOCAL_AUTH_DEMO=false`.
5. Seed real listings through the admin WhatsApp form; then Supabase (listings/favourites,
   image/video storage with resized variants, push for price drops, admin upload tool).
6. Tablet 2–3 column grid, analytics/Sentry, store submission (real bundle IDs/domain).
7. If the GitHub billing lock is lifted: switch Pages source to "GitHub Actions" so pushes to
   `main` auto-deploy.
