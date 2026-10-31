# Building the Android app (Windows)

> **Status:** the Android project is generated, configured and validated (manifest/theme XML well-formed, web assets packaged,
> `cap sync` succeeds), but it was **not compiled** by me: the sandbox I worked in has no Android SDK and cannot reach
> `dl.google.com` / `services.gradle.org` / Maven. No APK or AAB exists yet. Follow the steps below on your PC.

## Verified toolchain (from the generated project + official docs)
| Item | Value |
|---|---|
| Capacitor | 8.x (`@capacitor/core`, `/android`, `/cli`, `/app`) |
| compileSdk / targetSdk | **36** (Google Play requires new apps and updates to target API 36 since 31 Aug 2026) |
| minSdk | 24 (Android 7.0, Capacitor 8 default; covers ~all active devices) |
| Android Gradle Plugin / Gradle | 8.13.0 / 8.14.3 (downloaded automatically by the wrapper) |
| JDK | 21 (bundled with Android Studio) |
| Android Studio | Otter 2025.2.1 or newer (Capacitor 8 requirement) |
Re-check the Play target-API rule at https://developer.android.com/google/play/requirements/target-sdk before each release: it moves every August.

## One-time setup
1. Install **Node 22+** and **Android Studio** (it installs the Android SDK; open *SDK Manager* and install *Android 16 (API 36)* platform + build-tools).
2. In the project folder: `npm install`
3. **Choose the application ID now.** Default `com.haziqjav.historicalchampions` (in `capacitor.config.ts` and `android/app/build.gradle`).
   It is **permanent** once uploaded to Google Play. If you change it, edit both files and move `MainActivity.java` into the matching package folder
   (or delete `android/` and run `npx cap add android`, then re-apply the customisations listed in docs/CHANGES.md).

## A. Debug APK (quick install on your phone)
```powershell
npm run android:debug
```
Output: `android\app\build\outputs\apk\debug\app-debug.apk`. Enable *Developer options → USB debugging*, then
`adb install -r android\app\build\outputs\apk\debug\app-debug.apk` (or copy the APK to the phone and open it).
Use this file **for testing only**.

## B. Signing key (do once, protect forever)
```powershell
& "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -genkeypair -v -keystore "$HOME\keys\historical-champions-upload.jks" -alias upload -keyalg RSA -keysize 2048 -validity 10000
```
* Choose strong passwords; write them in a password manager. **Back up the .jks in two places** (it is not in git; `.gitignore` blocks `*.jks`).
* Copy `android\keystore.properties.example` to `android\keystore.properties` and fill in the real path/passwords (this file is git-ignored).
  Alternatively set environment variables `HC_KEYSTORE_FILE`, `HC_KEYSTORE_PASSWORD`, `HC_KEY_ALIAS`, `HC_KEY_PASSWORD`.
* For Google Play, enrol in **Play App Signing** (default for new apps): Google holds the real app-signing key; this file is only your *upload key* and
  can be reset through Play support if lost. For APKs you distribute yourself, this key *is* the identity: if lost, users cannot update in place.

## C. Signed release APK (direct distribution)
```powershell
npm run android:release-apk
```
Output: `android\app\build\outputs\apk\release\app-release.apk` (signed only if `keystore.properties` exists; otherwise the build warns and the APK is unsigned/uninstallable).

## D. Signed Android App Bundle (the file you upload to Google Play)
```powershell
npm run android:bundle
```
Output: `android\app\build\outputs\bundle\release\app-release.aab`.

**Which file for what:** the `.aab` is what you upload to Play Console (Play generates optimised APKs per device). APKs are for testing/sideloading; Play does not accept
APKs for new apps. Before every upload increase `HC_VERSION_CODE` in `android\gradle.properties` (and set `HC_VERSION_NAME`).

## Android Studio route
`npm run cap:sync` then `npm run android:open`. *Build → Generate Signed App Bundle / APK…* works too (use the same keystore).

## Orientation, cutouts, back button (what is configured)
* `AndroidManifest.xml`: `screenOrientation="sensorLandscape"` (both landscape directions), `appCategory="game"`.
  On Android 16 (API 36) apps on **≥600 dp** screens (tablets, foldables unfolded, desktop windows) may have orientation locks ignored; Google's docs list **games (appCategory) as exempt**,
  and the web layout is built to survive an ignored lock anyway (combat pauses behind a "rotate" overlay in portrait and keeps its state). Verify on a real tablet/foldable; Android 17 behaviour is not verified.
* `MainActivity`: immersive mode (swipe to reveal bars), keep-screen-on, re-hide on focus. `values-v28/styles.xml`: draw into the notch on short edges.
* Safe areas: Capacitor 8 `SystemBars` exposes insets; `index.css` reads both `env(safe-area-inset-*)` and `--safe-area-inset-*`.
* Back button: in combat toggles pause; on menus goes back; on the main menu exits (`services/platform.ts`).
* Permissions: only `INTERNET` (optional AI chronicle). Remove it from the manifest if you ship without AI narration.
