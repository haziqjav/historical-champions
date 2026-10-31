// Cross-platform Gradle launcher: uses gradlew.bat on Windows, ./gradlew elsewhere.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const task = process.argv[2];
if (!task) { console.error('usage: node scripts/gradle.mjs <gradle task>'); process.exit(2); }
const dir = join(process.cwd(), 'android');
if (!existsSync(dir)) { console.error('android/ folder missing. Run: npx cap add android'); process.exit(2); }
const win = process.platform === 'win32';
const cmd = win ? 'gradlew.bat' : './gradlew';
const r = spawnSync(cmd, [task], { cwd: dir, stdio: 'inherit', shell: win });
if (r.status === 0) {
  console.log('\nBuild OK. Outputs:');
  console.log('  debug APK      : android/app/build/outputs/apk/debug/app-debug.apk');
  console.log('  release APK    : android/app/build/outputs/apk/release/app-release.apk');
  console.log('  release bundle : android/app/build/outputs/bundle/release/app-release.aab');
}
process.exit(r.status ?? 1);
