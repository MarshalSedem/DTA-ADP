# AgriTrust — farmer app

Expo (SDK 58) app for farmers. It talks to the AgriTrust API (the FastAPI backend in
`DTA-ADP-DASHBOARD/backend`) and follows `style-guide.md` with a mint primary colour and full
light, dark and system themes — the same tokens as the web dashboard.

## Run it with the backend

1. Start the API so phones on your Wi-Fi can reach it:

   ```bash
   cd ../DTA-ADP-DASHBOARD/backend
   uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. Start the app: `npx expo start`. In development the app calls
   `http://<the computer running Expo>:8000/api` automatically. To use another server, copy
   `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL`, then reload the app.

3. Sign in with a demo farmer: phone `0244000001` (Ama K.) or `0244000002` (Kojo A.), password
   `agritrust123`. Staff accounts are refused — they use the web dashboard.

Use HTTPS for any non-local deployment; the dev setup uses plain HTTP on your local network.

## How it is wired

- `src/services/api-client.ts` — base URL, bearer token (SecureStore on phones, localStorage on
  web), API error messages, and authenticated image sources for `expo-image`.
- `src/services/farmer-api.ts` — every farmer endpoint, mapped to the types in `src/types/farmer.ts`.
- `src/state/session.tsx` — sign-in state; `src/app/_layout.tsx` guards routes with
  `Stack.Protected`. Signed-in screens live in `src/app/(app)/`, whose layout loads the farmer's
  data once (`src/state/farmer-store.tsx`). Pull to refresh on Home and Human Review re-fetches,
  e.g. to pick up an extension officer's decision.
- `src/theme/index.tsx` — Light / Dark / System (Profile → Appearance). The choice is saved on the
  device and also applied to native UI such as the keyboard. Palettes are in
  `src/constants/theme.ts`; components build styles with `useStyles(createStyles)`.

---

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **src/app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **example** directory and create a blank **src/app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
