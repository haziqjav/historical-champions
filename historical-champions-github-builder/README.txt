HISTORICAL CHAMPIONS — GITHUB ACTIONS DEBUG APK BUILDER

This workflow builds the existing Capacitor Android project on a GitHub-hosted Ubuntu runner. Android Studio is NOT needed on your Windows PC.

INSTALL THIS WORKFLOW
1. Extract this ZIP.
2. Copy the .github folder into the ROOT of the Claude-generated Historical Champions project (the same folder that contains package.json and the android folder).
3. Confirm that the project root contains:
   - package.json
   - package-lock.json
   - android/gradlew
   - android/app/build.gradle or android/app/build.gradle.kts
   - .github/workflows/android-debug.yml
4. Confirm package.json has the script "android:debug" (Claude's instructions said it does).
5. Do NOT commit .env.local, real API keys, keystore files, keystore.properties, local.properties, or node_modules.
6. Push the updated project to a PUBLIC GitHub repository. Standard GitHub-hosted Actions runners are free for public repositories under GitHub's current policy.
7. On GitHub, open the repository > Actions > "Build Historical Champions Android APK" > Run workflow.
8. Open the completed workflow run. Download the artifact named "historical-champions-debug-apk".
9. Extract it. The APK inside is app-debug.apk. Transfer it to your Android phone and install it for testing.

IMPORTANT
- This creates a DEBUG APK for testing. It is not the final signed Play Store release.
- For a stable shareable release APK and Play Store AAB, create and securely keep a release signing key, then configure the project's keystore.properties/GitHub Secrets workflow. Do not upload a keystore or password to a public repository.
- The workflow expects the Android project and npm scripts from the Claude-generated ZIP. It will not work with the original pre-Capacitor source-only project.
- If the project does not contain package-lock.json, run npm install locally and commit the generated package-lock.json before running this workflow.
