# browser-calc-extension

A Chrome Manifest V3 side panel calculator extension built with React + TypeScript + Vite.

## Scripts

- `pnpm dev` - watch build into `dist/` for extension development
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

## Package for Chrome Web Store

1. Run `pnpm --filter browser-calc-extension package`.
2. Upload `apps/browser/browser-calc/browser-calc-extension/browser-calc-extension.zip` to the Chrome Web Store.

The generated zip contains the built extension files with `manifest.json` at the root of the archive.
