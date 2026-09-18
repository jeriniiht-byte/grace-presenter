# Tauri Setup Instructions (M1)

The following dependencies and configurations have been prepared for Tauri integration:

## ✅ Completed Setup Steps

1. **Installed packages:**
   - `@tauri-apps/cli@^2.11`
   - `@tauri-apps/api@^2.11`
   - `zustand@^5` (state management)
   - `react-router-dom@^7` (routing)
   - `@fontsource/noto-sans*` (offline fonts)

2. **Updated `vite.config.ts`:**
   - Set dev server port to `1420` (Tauri convention)
   - Added `clearScreen: false` for better dev output
   - Configured watcher to ignore `src-tauri/` directory
   - Added `TAURI_` to environment variable prefix

3. **Updated `package.json` scripts:**
   - `npm run tauri` — run Tauri CLI
   - `npm run tauri:dev` — development server with Tauri
   - `npm run tauri:build` — production build with Tauri

4. **Updated `src/index.css`:**
   - Imported all Noto Sans font variants (English, Tamil, Malayalam)
   - Set base font family to "Noto Sans"

5. **Created type definitions:**
   - `src/types/slide.ts` — slide and service item types
   - `src/types/db.ts` — database table row types
   - `src/types/theme.ts` — theme configuration types

## 🚀 Next Steps: Complete Tauri Init

**On your dev machine (where Rust/Cargo is installed):**

```bash
cd "C:\Users\Admin\Documents\Grace Presenter"
npx tauri init
```

When prompted by `tauri init`, use these values:

| Prompt | Answer |
|--------|--------|
| What is your app name? | `grace-presenter` |
| What should the window title be? | `Grace Presenter` |
| Where are your web assets (relative to `/src-tauri/tauri.conf.json`)? | `../dist` |
| What is the URL of your dev server? | `http://localhost:1420` |
| What is your dev command? | `npm run dev` |
| What is your build command? | `npm run build` |

This will create:
```
src-tauri/
├── Cargo.toml
├── tauri.conf.json
├── src/
│   ├── main.rs
│   └── lib.rs
├── build.rs
└── icons/
```

## ✅ After `tauri init` Completes

Run this to verify the setup works:
```bash
npm run tauri:dev
```

This should:
1. Start the Vite dev server on port 1420
2. Compile the Rust code (will take a few minutes on first run)
3. Launch a native window showing the Grace Presenter placeholder UI

If you see any errors:
- **React 19 / Tauri compatibility issue?** Try: `npm install -D @vitejs/plugin-react-swc` and update `vite.config.ts` to use it instead of `@vitejs/plugin-react`
- **Rust toolchain issue?** Verify `rustup show` works and you have the WebView2 runtime installed

## 📝 Next Milestone (M2)

Once `tauri:dev` works, move to M2 to add SQLite plugin and database schema.

---

**Status:** ✅ M1 prep complete. Run `npx tauri init` to finalize.
