# browser-calc-extension

A Chrome Manifest V3 side panel calculator extension built with React + TypeScript + Vite.

## Scripts

- `pnpm dev` - watch build into `dist/` for extension development
- `pnpm dev:ext` - watch build into `dist/` and update the side panel reload marker for auto-refresh
- `pnpm build` - production build
- `pnpm package` - build `dist/` and create `browser-calc-extension.zip` for Chrome Web Store upload
- `pnpm lint` - lint source files
- `pnpm typecheck` - run TypeScript checks for app and config
- `pnpm test` - run unit tests

## Load in Chrome

1. Run `pnpm --filter browser-calc-extension build`.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select `apps/browser/browser-calc/browser-calc-extension/dist`.
6. Click the extension action button to open the side panel.

## Dev Workflow

1. Run `pnpm --filter browser-calc-extension dev:ext`.
2. Load the unpacked extension from `apps/browser/browser-calc/browser-calc-extension/dist` if it is not already loaded.
3. Open the side panel and leave it open while you work.
4. Save a side panel file and wait for the watch build to finish.

In development watch builds, the extension emits a reload marker into `dist/`. The side panel polls that marker and reloads only its own page when the marker changes, so the panel stays open and the extension itself is not reloaded.

## Limitations

- This only reloads the side panel page. Changes to `manifest.json`, the background service worker, permissions, or other extension-level wiring still require a manual extension reload.
- The reload loop is polling-based rather than full HMR. It is designed for stable iteration on the side panel UI, not state-preserving hot updates.

## Package for Chrome Web Store

1. Run `pnpm --filter browser-calc-extension package`.
2. Upload `apps/browser/browser-calc/browser-calc-extension/browser-calc-extension.zip` to the Chrome Web Store.

The generated zip contains the built extension files with `manifest.json` at the root of the archive.
