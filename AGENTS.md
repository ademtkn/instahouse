This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Handoff file (owner's rule)

`HANDOFF.md` at the repo root is the shared roadmap for every assistant (Claude, Codex, …) and human working here.
**Read it before starting any task. When a task ends — or when you have to stop early (usage limit, error) —
update its "Done log", "In progress / blocked" and "Next" sections** so the next assistant can continue exactly
where you stopped. Never record untested work as done.


## Current reference (2026-11-14)

The 2026-11-14 Mashinam port is **applied** — read `HANDOFF.md` for the current state and
the "Incoming port … — APPLIED" section for what was ported and what was deliberately kept
(`CurrencySwitch`/`CurrencyContext`, the real-estate fields, the 16 local demo photos).
The patterns, not the car content, were ported: one-step phone + WhatsApp OTP demo
(`LOCAL_AUTH_DEMO`), rewritten real-estate legal texts (company X), a structured admin
listing form, 15 Kyrgyzstan cities, the 3 s seen threshold / reshuffle on refresh, the
`expo-navigation-bar` fix and the tablet frame. The sibling rule still holds: changes that
make sense for Mashinam should be mirrored there (and vice versa).
Reference commits (Mashinam): `ed233be`, `196994c`, `53f47a6`, `b6254ca`, `8e6d795`.
