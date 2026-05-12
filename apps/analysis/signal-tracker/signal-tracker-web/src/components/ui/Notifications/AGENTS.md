# AGENTS.md - notification primitives

Also follow `../AGENTS.md` for UI primitive boundaries, visual verification, and app-shell ownership.

## Notification Model

- Use one notification context chain rather than page-by-page API error parsing. RTK Query wrappers should emit user-facing notifications, and UI provider placement decides where those messages render.
- The root `AppShell` provider is the page-level notification sink. It should use `mode="multiple"` and render `NotificationFlashbar`, because the flashbar is the only Signal Tracker surface that should show multiple notifications at once.
- Nested providers should normally use single-message behavior. Use `ErrorNotificationProvider` for form/local error boundaries so new errors replace previous errors instead of stacking.
- Providers with `acceptedTypes` should pass unsupported notification types upward. This lets form-local error providers catch errors while success/info/warning messages continue to the root flashbar.

## Rendering Surfaces

- Use `NotificationFlashbar` only for root or page-level notification display. Product shells may constrain its width through `AppShell` props, but should not create a second root flashbar.
- Use `NotificationAlerts` for local inline display, especially forms and dialog bodies. It intentionally renders only the latest notification from the nearest provider.
- Keep `Flashbar` generic and product-agnostic. Product-specific notification copy belongs in RTK Query hook notification options, not in the primitive renderer.

## Clearing Behavior

- `clearNotifications` clears only the nearest provider returned by `useNotifications()`. Do not add parent-clearing behavior for local form retries.
- The app-local `Form` clears nearest-provider notifications on submit. This clears stale form-local API errors while leaving root flashbar messages untouched.
- If a form-related RTK Query hook is called outside the `<Form>` component, lift the app-local `FormProvider` or a thin product-specific provider wrapper above the hook owner so automatic errors are still caught by the form-local provider.
