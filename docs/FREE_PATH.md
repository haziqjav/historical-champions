# Free path: APK + friends + Play Store (no money)

## 1. Friends can play TODAY (free, no APK)
1. Push this project to your GitHub repo (`main` branch).
2. Repo **Settings -> Pages -> Source: GitHub Actions**. The "Deploy web game" workflow publishes it.
3. Send friends `https://haziqjav.github.io/historical-champions/` (your username/repo). Open in Chrome on the phone -> menu -> **Add to Home screen**.
(`http://192.168.100.150:3000` only works on your own Wi-Fi while your PC runs it.)

## 2. Get the APK with NO Android Studio (free)
1. Repo **Actions -> Build Android -> Run workflow** (about 5-10 min).
2. Open the finished run -> **Artifacts -> historical-champions-debug-apk** -> unzip -> `app-debug.apk`.
3. Send the APK to friends (WhatsApp/Drive). They enable "Install unknown apps" and tap it.
   This debug APK is for testing/sharing only, not for the Play Store.

## 3. Play Store: the honest answer
* **There is no legitimate way to publish on Google Play for free.** Google charges a **one-time US$25** developer registration fee (not monthly). I know of no student waiver, and I will not suggest tricks around it.
* The AAB build in this project is ready for the day you pay it. Until then, the free options below reach real users.

## 4. Free stores/channels you can use now
| Option | Cost | Notes |
|---|---|---|
| GitHub Releases / Pages | free | Share APK link + web link |
| itch.io | free | Upload APK/web build, good for indie games |
| Amazon Appstore | free dev account (check current terms) | Accepts APKs |
| Huawei AppGallery / Samsung Galaxy Store | free registration (check terms) | Smaller audiences |
| Google Play | $25 once | Needs AAB, privacy policy, and possibly a closed test with testers first (check current Play rule) |

## 5. When you can pay $25
Create a keystore (docs/ANDROID_BUILD.md), add GitHub secrets `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`
(base64: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\upload.jks"))`), run **Build Android**, download the `.aab`, upload to Play Console.
Do the licence checks in docs/RELEASE_CHECKLIST.md first (music/sfx provenance).
