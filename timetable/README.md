# 📅 Anora's Timetable App

A personal Android app for Anora (8th grade, 13 yo) to manage her weekly study schedule.

## Features
- **Today view** — see today's schedule at a glance, day switcher at top
- **Weekly view** — full 4-week scrollable timetable grid
- **Homework blocks** — tap any white block to assign a subject (Math, English, Biology, Spanish, Social Studies)
- **Check off done** — long-press any homework block to mark it complete ✅
- **Export** — download the week as a CSV (opens in Excel / Google Sheets)
- **Saves progress** — all subjects and checkmarks persist between sessions

## Fixed Schedule Built In
| Time | Day | Activity |
|------|-----|----------|
| 8:00 AM – 3:00 PM | Mon–Fri | School |
| 7:30 PM | Thursday | College Crest Program |
| 7:30 PM | Friday | Guitar Class |
| 7:30 PM | Saturday | Guitar Class |
| Afternoon | Saturday & Sunday | Swimming |

---

## How to Build the APK

### Prerequisites
Install these on your computer:

1. **Node.js** (v18+) — https://nodejs.org
2. **Expo CLI** — `npm install -g expo-cli`
3. **EAS CLI** — `npm install -g eas-cli`
4. **Expo account** — create free at https://expo.dev (needed to build APK in cloud)

---

### Step 1 — Install dependencies
```bash
cd anora-timetable
npm install
```

### Step 2 — Log in to Expo
```bash
eas login
# Enter your expo.dev email & password
```

### Step 3 — Configure the project
```bash
eas build:configure
# Choose: Android
# This links your project to Expo's build servers
```

### Step 4 — Build the APK
```bash
eas build -p android --profile preview
```
This uploads the code to Expo's cloud build servers and compiles it.
Takes ~5–10 minutes. When done, you'll get a **download link for the APK**.

### Step 5 — Install on Android
1. Download the `.apk` file to your phone
2. On Android: **Settings → Security → Install unknown apps** → enable for your browser/files app
3. Tap the downloaded `.apk` to install
4. Open **Anora's Timetable** from your app drawer ✅

---

## Alternative: Run on Phone Without Building (Expo Go)

If you just want to test it quickly without building an APK:

1. Install **Expo Go** app on Anora's Android phone (free on Play Store)
2. On your computer, run:
   ```bash
   cd anora-timetable
   npm install
   npx expo start
   ```
3. Scan the QR code with Expo Go on the phone
4. App runs instantly — no APK needed!

> Note: Expo Go requires the phone and computer to be on the same WiFi.

---

## Project Structure
```
anora-timetable/
├── App.js                        # Entry point, tab navigation
├── app.json                      # Expo config
├── eas.json                      # Build profiles (APK vs AAB)
├── babel.config.js
├── package.json
└── src/
    ├── data/
    │   └── schedule.js           # All schedule data, time slots, fixed blocks
    ├── screens/
    │   ├── TodayScreen.js        # Today's daily view
    │   └── WeekScreen.js         # Full weekly grid + export
    └── utils/
        ├── storage.js            # AsyncStorage persistence
        └── export.js             # CSV export via expo-sharing
```

## Customizing the Schedule

To change fixed activities, edit `src/data/schedule.js`:

```js
// Add/remove fixed blocks (key = "dayIndex-slotIndex", day 0=Mon, 6=Sun)
export const FIXED_BLOCKS = {
  '3-20': { type: BLOCK_TYPES.COLLEGE, label: 'College Crest Program' },
  // Add more here...
};
```

To add more subjects, edit the `SUBJECTS` array in the same file.

---

## Tech Stack
- **React Native** — cross-platform mobile framework
- **Expo** — build tooling & native APIs
- **React Navigation** — tab navigation
- **AsyncStorage** — local data persistence
- **expo-sharing** — CSV export
