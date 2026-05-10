/*
 * Codex scratchpad instructions:
 *
 * - Use this file to brainstorm small Signal Tracker UI components we may add,
 *   not to recreate or regression-test the existing app UI.
 * - Do not feel bound to current UI patterns across the app. This is a place
 *   to explore directions that may imply large refactors if we decide the new
 *   direction is better.
 * - Bring in existing reusable UI components only when they do not constrain
 *   the concept being explored. For example, using an existing button is fine
 *   unless the point of the concept is to rethink button styling or behavior.
 * - Write as much custom styling as needed to express the idea. Concepts that
 *   graduate into reusable components will be refined, typed, tested, and
 *   aligned with the broader UI system later.
 * - Keep scratch components local to this file. Move code out only after we
 *   decide the concept should become part of the real product UI.
 */

import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Signal Tracker/Scratchpad",
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type Scheme = {
  accent: string;
  accentForeground: string;
  accentSoft: string;
  badge: string;
  badgeForeground: string;
  border: string;
  canvas: string;
  canvasBackground?: string;
  danger: string;
  dangerForeground: string;
  directContentSurfaceBorder?: string;
  directContentSurfaceShadow?: string;
  fit: string;
  frameShadow?: string;
  foreground: string;
  headerBackground?: string;
  headerBorder?: string;
  id: string;
  mainContentShadow?: string;
  muted: string;
  mutedForeground: string;
  name: string;
  primary: string;
  primaryForeground: string;
  shadow: string;
  sidebarBorder?: string;
  success: string;
  successForeground: string;
  surface: string;
  surfaceRaised: string;
  tradeoff: string;
  warning: string;
  warningForeground: string;
};

const schemes = [
  {
    accent: "#d8e8f6",
    accentForeground: "#123d63",
    accentSoft: "#eef6fb",
    badge: "#e7edf4",
    badgeForeground: "#27465f",
    border: "#d4dde8",
    canvas: "#f5f8fb",
    danger: "#f6dfdc",
    dangerForeground: "#7a2d25",
    fit: "Serious, institutional, and analyst-oriented.",
    foreground: "#16202b",
    id: "civic-blue-slate",
    muted: "#eef2f6",
    mutedForeground: "#5a6878",
    name: "Civic Blue + Slate",
    primary: "#245f93",
    primaryForeground: "#ffffff",
    shadow: "rgba(36, 95, 147, 0.13)",
    success: "#dfeee7",
    successForeground: "#24513d",
    surface: "#ffffff",
    surfaceRaised: "#f9fbfd",
    tradeoff: "Low-risk, but may feel conventional if the canvas stays cool.",
    warning: "#f4e8c8",
    warningForeground: "#654b13"
  },
  {
    accent: "#d8ebe5",
    accentForeground: "#173f38",
    accentSoft: "#eef7f3",
    badge: "#e8dfd2",
    badgeForeground: "#4c4031",
    border: "#d9d0c2",
    canvas: "#f7f3ec",
    danger: "#f0dbd5",
    dangerForeground: "#743323",
    fit: "Calm research workspace with a warmer reading surface.",
    foreground: "#1f2a28",
    id: "deep-teal-warm-stone",
    muted: "#eee8df",
    mutedForeground: "#6b6257",
    name: "Deep Teal + Warm Stone",
    primary: "#245e55",
    primaryForeground: "#ffffff",
    shadow: "rgba(36, 94, 85, 0.14)",
    success: "#dbe9df",
    successForeground: "#2b5336",
    surface: "#fffdf8",
    surfaceRaised: "#faf7f0",
    tradeoff: "Distinct and durable, but should avoid wellness-app softness.",
    warning: "#f2e4c0",
    warningForeground: "#665018"
  },
  {
    accent: "#e5e5fb",
    accentForeground: "#332f73",
    accentSoft: "#f2f2fb",
    badge: "#e8ebf0",
    badgeForeground: "#343d4a",
    border: "#d7dae3",
    canvas: "#f5f6f9",
    danger: "#f0dce4",
    dangerForeground: "#762d4a",
    fit: "Sharper, modern, and precise without becoming bright.",
    foreground: "#191b22",
    id: "indigo-graphite",
    muted: "#eceff4",
    mutedForeground: "#5c6370",
    name: "Indigo + Graphite",
    primary: "#4a4f9a",
    primaryForeground: "#ffffff",
    shadow: "rgba(74, 79, 154, 0.14)",
    success: "#dfeadd",
    successForeground: "#33522e",
    surface: "#ffffff",
    surfaceRaised: "#fafaff",
    tradeoff: "Polished and technical, but can drift toward SaaS dashboard.",
    warning: "#f2e6c4",
    warningForeground: "#624b13"
  },
  {
    accent: "#dfeade",
    accentForeground: "#24462d",
    accentSoft: "#f0f6ef",
    badge: "#e7e0d2",
    badgeForeground: "#4b4434",
    border: "#d8d0c0",
    canvas: "#f8f5ee",
    danger: "#f1ddd6",
    dangerForeground: "#7a3323",
    fit: "Grounded archive feel with quiet evidence continuity cues.",
    foreground: "#1d241f",
    id: "forest-green-neutral-paper",
    muted: "#efeadf",
    mutedForeground: "#686151",
    name: "Forest Green + Neutral Paper",
    primary: "#355f3c",
    primaryForeground: "#ffffff",
    shadow: "rgba(53, 95, 60, 0.14)",
    success: "#dcebdd",
    successForeground: "#2e5632",
    surface: "#fffdf8",
    surfaceRaised: "#fbf8f0",
    tradeoff: "Grounded and readable, but should avoid finance-dashboard cues.",
    warning: "#f0e3bf",
    warningForeground: "#654e16"
  },
  {
    accent: "oklch(0.92 0.045 255)",
    accentForeground: "oklch(0.31 0.12 258)",
    accentSoft: "oklch(0.96 0.02 255)",
    badge: "oklch(0.94 0.018 250)",
    badgeForeground: "oklch(0.27 0.04 260)",
    border: "oklch(0.885 0.018 250)",
    canvas: "oklch(0.99 0.004 250)",
    danger: "oklch(0.91 0.05 25)",
    dangerForeground: "oklch(0.37 0.1 25)",
    fit: "Best default choice: credible public-affairs analysis workspace.",
    foreground: "oklch(0.22 0.035 260)",
    id: "civic-blue-cool-paper",
    muted: "oklch(0.955 0.012 250)",
    mutedForeground: "oklch(0.48 0.035 260)",
    name: "Civic Blue / Cool Paper",
    primary: "oklch(0.45 0.17 258)",
    primaryForeground: "oklch(0.99 0.004 250)",
    shadow: "oklch(0.45 0.17 258 / 0.14)",
    success: "oklch(0.91 0.04 155)",
    successForeground: "oklch(0.33 0.09 150)",
    surface: "oklch(0.975 0.006 250)",
    surfaceRaised: "oklch(0.985 0.004 250)",
    tradeoff: "Strong but restrained. Keep the blue out of large panels.",
    warning: "oklch(0.91 0.06 85)",
    warningForeground: "oklch(0.38 0.08 70)"
  },
  {
    accent: "oklch(0.91 0.045 185)",
    accentForeground: "oklch(0.27 0.09 190)",
    accentSoft: "oklch(0.955 0.025 185)",
    badge: "oklch(0.94 0.018 190)",
    badgeForeground: "oklch(0.26 0.04 205)",
    border: "oklch(0.885 0.018 195)",
    canvas: "oklch(0.99 0.005 180)",
    danger: "oklch(0.91 0.05 25)",
    dangerForeground: "oklch(0.37 0.1 25)",
    fit: "Focused research ledger with calm source and review workflows.",
    foreground: "oklch(0.22 0.03 220)",
    id: "deep-teal-white-ledger",
    muted: "oklch(0.955 0.012 190)",
    mutedForeground: "oklch(0.47 0.035 215)",
    name: "Deep Teal / White Ledger",
    primary: "oklch(0.43 0.13 190)",
    primaryForeground: "oklch(0.99 0.004 180)",
    shadow: "oklch(0.43 0.13 190 / 0.14)",
    success: "oklch(0.91 0.04 155)",
    successForeground: "oklch(0.31 0.08 150)",
    surface: "oklch(0.975 0.006 190)",
    surfaceRaised: "oklch(0.985 0.004 190)",
    tradeoff: "Less corporate than blue, but needs disciplined typography.",
    warning: "oklch(0.91 0.06 85)",
    warningForeground: "oklch(0.38 0.08 70)"
  },
  {
    accent: "oklch(0.925 0.045 282)",
    accentForeground: "oklch(0.32 0.13 282)",
    accentSoft: "oklch(0.96 0.025 282)",
    badge: "oklch(0.94 0.018 270)",
    badgeForeground: "oklch(0.27 0.045 275)",
    border: "oklch(0.885 0.018 270)",
    canvas: "oklch(0.99 0.004 270)",
    danger: "oklch(0.91 0.05 25)",
    dangerForeground: "oklch(0.37 0.1 25)",
    fit: "Modern, precise, and a little more distinctive than civic blue.",
    foreground: "oklch(0.21 0.035 270)",
    id: "indigo-slate-archive",
    muted: "oklch(0.955 0.012 270)",
    mutedForeground: "oklch(0.48 0.035 270)",
    name: "Indigo / Slate Archive",
    primary: "oklch(0.46 0.18 282)",
    primaryForeground: "oklch(0.99 0.004 270)",
    shadow: "oklch(0.46 0.18 282 / 0.14)",
    success: "oklch(0.91 0.04 155)",
    successForeground: "oklch(0.33 0.08 150)",
    surface: "oklch(0.975 0.006 270)",
    surfaceRaised: "oklch(0.985 0.004 270)",
    tradeoff: "Portfolio-polished, but can drift into generic SaaS.",
    warning: "oklch(0.91 0.06 85)",
    warningForeground: "oklch(0.38 0.08 70)"
  },
  {
    accent: "oklch(0.925 0.05 255)",
    accentForeground: "oklch(0.34 0.15 255)",
    accentSoft: "oklch(0.965 0.02 255)",
    badge: "oklch(0.945 0.008 255)",
    badgeForeground: "oklch(0.25 0.025 255)",
    border: "oklch(0.89 0.01 255)",
    canvas: "oklch(0.992 0.002 250)",
    danger: "oklch(0.91 0.045 25)",
    dangerForeground: "oklch(0.36 0.09 25)",
    fit: "Minimal, sharp, high-contrast UI with strategic accent moments.",
    foreground: "oklch(0.20 0.02 255)",
    id: "graphite-electric-blue-accent",
    muted: "oklch(0.955 0.007 255)",
    mutedForeground: "oklch(0.48 0.025 255)",
    name: "Graphite / Electric Blue Accent",
    primary: "oklch(0.52 0.20 255)",
    primaryForeground: "oklch(0.99 0.004 250)",
    shadow: "oklch(0.52 0.20 255 / 0.13)",
    success: "oklch(0.91 0.035 155)",
    successForeground: "oklch(0.31 0.075 150)",
    surface: "oklch(0.975 0.004 255)",
    surfaceRaised: "oklch(0.985 0.003 255)",
    tradeoff: "Cleanest option. Avoid making ordinary metadata blue.",
    warning: "oklch(0.915 0.055 85)",
    warningForeground: "oklch(0.37 0.075 70)"
  },
  {
    accent: "oklch(0.91 0.04 145)",
    accentForeground: "oklch(0.28 0.08 150)",
    accentSoft: "oklch(0.955 0.024 145)",
    badge: "oklch(0.94 0.018 105)",
    badgeForeground: "oklch(0.27 0.04 145)",
    border: "oklch(0.885 0.018 105)",
    canvas: "oklch(0.99 0.006 95)",
    danger: "oklch(0.91 0.05 25)",
    dangerForeground: "oklch(0.37 0.1 25)",
    fit: "Durable dossier/archive feel for long-form continuity work.",
    foreground: "oklch(0.22 0.03 145)",
    id: "forest-paper-dossier",
    muted: "oklch(0.955 0.012 105)",
    mutedForeground: "oklch(0.47 0.035 145)",
    name: "Forest / Paper Dossier",
    primary: "oklch(0.42 0.11 150)",
    primaryForeground: "oklch(0.99 0.004 95)",
    shadow: "oklch(0.42 0.11 150 / 0.14)",
    success: "oklch(0.91 0.04 145)",
    successForeground: "oklch(0.3 0.08 150)",
    surface: "oklch(0.976 0.007 100)",
    surfaceRaised: "oklch(0.986 0.004 100)",
    tradeoff: "Less techy and quietly distinctive. Keep green restrained.",
    warning: "oklch(0.91 0.06 85)",
    warningForeground: "oklch(0.38 0.08 70)"
  },
  {
    accent: "oklch(0.925 0.045 255)",
    accentForeground: "oklch(0.31 0.12 258)",
    accentSoft: "oklch(0.965 0.02 255)",
    badge: "oklch(0.945 0.016 250)",
    badgeForeground: "oklch(0.27 0.04 260)",
    border: "oklch(0.89 0.016 250)",
    canvas: "#e8eff9",
    danger: "oklch(0.91 0.05 25)",
    dangerForeground: "oklch(0.37 0.1 25)",
    directContentSurfaceBorder: "transparent",
    directContentSurfaceShadow: "none",
    fit: "Polished violet workspace frame with quiet white work surfaces.",
    frameShadow: "none",
    foreground: "oklch(0.22 0.035 260)",
    headerBackground: "transparent",
    headerBorder: "transparent",
    id: "light-gradient-civic-blue-accent",
    muted: "oklch(0.958 0.012 250)",
    mutedForeground: "oklch(0.48 0.035 260)",
    name: "Light Gradient Background / Civic Blue Accent",
    primary: "oklch(0.45 0.17 258)",
    primaryForeground: "oklch(0.99 0.004 250)",
    shadow: "oklch(0.45 0.17 258 / 0.14)",
    sidebarBorder: "transparent",
    success: "oklch(0.91 0.04 155)",
    successForeground: "oklch(0.33 0.09 150)",
    surface: "#ffffff",
    surfaceRaised: "#ffffff",
    tradeoff:
      "Use the strong canvas behind the shell only; keep work surfaces plain.",
    warning: "oklch(0.91 0.06 85)",
    warningForeground: "oklch(0.38 0.08 70)"
  },
  {
    accent: "#ece8ff",
    accentForeground: "#2b1199",
    accentSoft: "#f6f3ff",
    badge: "#eef3ff",
    badgeForeground: "#314268",
    border: "#dbe4f7",
    canvas: "#f3f7ff",
    danger: "#f8dddd",
    dangerForeground: "#7b2b2b",
    fit: "Cool paper workspace with a vivid strategic violet action color.",
    foreground: "#171b2d",
    id: "cool-paper-violet-accent",
    muted: "#edf3ff",
    mutedForeground: "#59677f",
    name: "Cool Paper / Violet Accent",
    primary: "#4318FF",
    primaryForeground: "#ffffff",
    shadow: "rgba(67, 24, 255, 0.13)",
    success: "#dceee9",
    successForeground: "#235346",
    surface: "#ffffff",
    surfaceRaised: "#fdfdff",
    tradeoff:
      "Feels crisp and modern. Keep #4318FF mostly to primary actions and active states.",
    warning: "#f4e7c4",
    warningForeground: "#684f13"
  }
] satisfies Scheme[];

const newlyRequestedSchemes = schemes.slice(4);

export const ColorSchemeComparison: Story = {
  render: () => <ColorSchemePage schemesToShow={schemes} />
};

export const NewColorSchemeComparison: Story = {
  render: () => <ColorSchemePage schemesToShow={newlyRequestedSchemes} />
};

export const CivicBlueSlate: Story = {
  render: () => <ColorSchemePage schemesToShow={[schemes[0]]} />
};

export const DeepTealWarmStone: Story = {
  render: () => <ColorSchemePage schemesToShow={[schemes[1]]} />
};

export const IndigoGraphite: Story = {
  render: () => <ColorSchemePage schemesToShow={[schemes[2]]} />
};

export const ForestGreenNeutralPaper: Story = {
  render: () => <ColorSchemePage schemesToShow={[schemes[3]]} />
};

export const CivicBlueCoolPaper: Story = {
  render: () => <ColorSchemePage schemesToShow={[schemes[4]]} />
};

export const DeepTealWhiteLedger: Story = {
  render: () => <ColorSchemePage schemesToShow={[schemes[5]]} />
};

export const IndigoSlateArchive: Story = {
  render: () => <ColorSchemePage schemesToShow={[schemes[6]]} />
};

export const GraphiteElectricBlueAccent: Story = {
  render: () => <ColorSchemePage schemesToShow={[schemes[7]]} />
};

export const ForestPaperDossier: Story = {
  render: () => <ColorSchemePage schemesToShow={[schemes[8]]} />
};

export const LightGradientCivicBlueAccent: Story = {
  render: () => <ColorSchemePage schemesToShow={[schemes[9]]} />
};

export const CoolPaperVioletAccent: Story = {
  render: () => <ColorSchemePage schemesToShow={[schemes[10]]} />
};

function ColorSchemePage({
  schemesToShow
}: {
  schemesToShow: readonly Scheme[];
}) {
  return (
    <main className="min-h-screen bg-[#f4f5f7] px-4 py-6 text-[#18202a] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5">
        <header className="grid gap-2">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#657183] uppercase">
            Signal Tracker color exploration
          </p>
          <h1 className="max-w-3xl text-2xl font-semibold tracking-normal sm:text-3xl">
            Palette directions for the modernized analyst workspace
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-[#526071]">
            These are scratchpad-only approximations of the recommended
            light-theme directions. They are not wired to theme tokens yet.
          </p>
        </header>

        <div className="grid gap-5 min-[90rem]:grid-cols-2">
          {schemesToShow.map((scheme) => (
            <SchemePreview key={scheme.id} scheme={scheme} />
          ))}
        </div>
      </div>
    </main>
  );
}

function SchemePreview({ scheme }: { scheme: Scheme }) {
  return (
    <section
      className="overflow-hidden rounded-2xl border shadow-xl"
      style={schemeFrameStyle(scheme)}
    >
      <div className="grid lg:grid-cols-[13.5rem_minmax(0,1fr)]">
        <aside
          className="border-b p-4 lg:border-r lg:border-b-0"
          style={schemeSidebarStyle(scheme)}
        >
          <div className="flex items-center gap-2">
            <span
              className="flex size-8 items-center justify-center rounded-lg text-sm font-semibold"
              style={{
                backgroundColor: scheme.primary,
                color: scheme.primaryForeground
              }}
            >
              ST
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Signal Tracker</p>
              <p
                className="truncate text-xs"
                style={{ color: scheme.mutedForeground }}
              >
                Continuity workspace
              </p>
            </div>
          </div>

          <nav className="mt-5 grid gap-1" aria-label={`${scheme.name} routes`}>
            <PreviewNavItem active label="Current topic" scheme={scheme} />
            <PreviewNavItem label="Timeline" scheme={scheme} />
            <PreviewNavItem label="Evidence" scheme={scheme} />
            <PreviewNavItem label="Review queue" scheme={scheme} />
          </nav>
        </aside>

        <div className="min-w-0" style={schemeCanvasStyle(scheme)}>
          <header
            className="flex min-w-0 items-center justify-between gap-3 border-b px-5 py-4"
            style={{
              backgroundColor: scheme.headerBackground ?? scheme.surface,
              borderColor: scheme.headerBorder ?? scheme.border,
              color: scheme.foreground
            }}
          >
            <div className="min-w-0">
              <p
                className="text-xs leading-4 font-semibold tracking-[0.14em] uppercase"
                style={{ color: scheme.mutedForeground }}
              >
                {scheme.name}
              </p>
              <h2 className="truncate text-lg font-semibold">
                Regional mediation track
              </h2>
            </div>
            <button
              className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold shadow-sm"
              style={{
                backgroundColor: scheme.primary,
                color: scheme.primaryForeground
              }}
              type="button"
            >
              Add entry
            </button>
          </header>

          <div
            className="grid gap-4 p-5"
            style={schemeMainContentStyle(scheme)}
          >
            <div className="grid gap-4">
              <article
                className="rounded-xl border p-4 shadow-sm"
                style={schemeCardStyle(scheme, "directContent")}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className="text-xs font-semibold tracking-[0.14em] uppercase"
                      style={{ color: scheme.mutedForeground }}
                    >
                      Current assessment
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">
                      Negotiations remain active, but sequencing is unstable.
                    </h3>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: scheme.warning,
                      color: scheme.warningForeground
                    }}
                  >
                    Watch
                  </span>
                </div>

                <p
                  className="mt-3 text-sm leading-6"
                  style={{ color: scheme.mutedForeground }}
                >
                  Public commitments still point toward continued talks. The
                  risk is a schedule slip if security guarantees are not
                  confirmed before the next delegation window.
                </p>

                <div className="mt-4 grid gap-2">
                  <PreviewTimelineRow
                    badge="Event"
                    scheme={scheme}
                    text="Delegation confirms arrival window for follow-up talks."
                  />
                  <PreviewTimelineRow
                    badge="Assessment"
                    scheme={scheme}
                    text="Mediator language shifts from planning to contingency."
                  />
                </div>
              </article>

              <aside
                className="rounded-xl border p-4 shadow-sm"
                style={schemeCardStyle(scheme, "directContent")}
              >
                <p
                  className="text-xs font-semibold tracking-[0.14em] uppercase"
                  style={{ color: scheme.mutedForeground }}
                >
                  Evidence state
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <PreviewStatusPill
                    label="3 cited entries"
                    scheme={scheme}
                    tone="success"
                  />
                  <PreviewStatusPill
                    label="1 needs source"
                    scheme={scheme}
                    tone="warning"
                  />
                  <PreviewStatusPill
                    label="1 stale citation"
                    scheme={scheme}
                    tone="danger"
                  />
                  <PreviewStatusPill
                    label="0 conflicts flagged"
                    scheme={scheme}
                    tone="neutral"
                  />
                </div>
              </aside>
            </div>

            <div
              className="rounded-xl border p-3"
              style={schemeDirectContentSurfaceStyle(scheme, "raised")}
            >
              <div className="grid gap-2">
                {[
                  "agency.example confirms the updated travel window.",
                  "wire.example reports continued mediator shuttle talks.",
                  "briefing.example adds context on security guarantees."
                ].map((source) => (
                  <div
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border px-3 py-2"
                    key={source}
                    style={{
                      backgroundColor: scheme.surface,
                      borderColor: scheme.border
                    }}
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: scheme.primary }}
                    />
                    <p className="truncate text-sm font-medium">{source}</p>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{
                        backgroundColor: scheme.badge,
                        color: scheme.badgeForeground
                      }}
                    >
                      source
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer
        className="grid gap-2 border-t px-5 py-4"
        style={{
          backgroundColor: scheme.surface,
          borderColor: scheme.border
        }}
      >
        <p className="text-sm font-semibold">{scheme.fit}</p>
        <p
          className="text-sm leading-6"
          style={{ color: scheme.mutedForeground }}
        >
          {scheme.tradeoff}
        </p>
      </footer>
    </section>
  );
}

function PreviewNavItem({
  active = false,
  label,
  scheme
}: {
  active?: boolean;
  label: string;
  scheme: Scheme;
}) {
  return (
    <div
      className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
      style={{
        backgroundColor: active ? scheme.accent : "transparent",
        color: active ? scheme.accentForeground : scheme.mutedForeground
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{
          backgroundColor: active ? scheme.primary : scheme.border
        }}
      />
      <span className="truncate">{label}</span>
    </div>
  );
}

function PreviewTimelineRow({
  badge,
  scheme,
  text
}: {
  badge: string;
  scheme: Scheme;
  text: string;
}) {
  return (
    <div
      className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-lg border px-3 py-2"
      style={{
        backgroundColor: scheme.surfaceRaised,
        borderColor: scheme.border
      }}
    >
      <span
        className="h-fit rounded-full px-2 py-0.5 text-xs font-semibold"
        style={{
          backgroundColor: scheme.accentSoft,
          color: scheme.accentForeground
        }}
      >
        {badge}
      </span>
      <p className="min-w-0 text-sm leading-5">{text}</p>
    </div>
  );
}

function PreviewStatusPill({
  label,
  scheme,
  tone
}: {
  label: string;
  scheme: Scheme;
  tone: "danger" | "neutral" | "success" | "warning";
}) {
  const toneStyles =
    tone === "success"
      ? {
          backgroundColor: scheme.success,
          color: scheme.successForeground
        }
      : tone === "warning"
        ? {
            backgroundColor: scheme.warning,
            color: scheme.warningForeground
          }
        : tone === "danger"
          ? {
              backgroundColor: scheme.danger,
              color: scheme.dangerForeground
            }
          : {
              backgroundColor: scheme.badge,
              color: scheme.badgeForeground
            };

  return (
    <div
      className="rounded-full px-3 py-2 text-sm font-semibold"
      style={toneStyles}
    >
      {label}
    </div>
  );
}

function schemeFrameStyle(scheme: Scheme): CSSProperties {
  return {
    background: scheme.canvasBackground ?? scheme.canvas,
    borderColor: scheme.border,
    boxShadow: scheme.frameShadow ?? `0 18px 42px ${scheme.shadow}`,
    color: scheme.foreground
  };
}

function schemeCanvasStyle(scheme: Scheme): CSSProperties {
  return {
    background: scheme.canvasBackground ?? scheme.canvas
  };
}

function schemeSidebarStyle(scheme: Scheme): CSSProperties {
  return {
    backgroundColor: scheme.surfaceRaised,
    borderColor: scheme.sidebarBorder ?? scheme.border
  };
}

function schemeMainContentStyle(scheme: Scheme): CSSProperties {
  return {
    boxShadow: scheme.mainContentShadow
  };
}

function schemeCardStyle(
  scheme: Scheme,
  surface: "default" | "directContent" = "default"
): CSSProperties {
  if (surface === "directContent") {
    return schemeDirectContentSurfaceStyle(scheme);
  }

  return {
    backgroundColor: scheme.surface,
    borderColor: scheme.border
  };
}

function schemeDirectContentSurfaceStyle(
  scheme: Scheme,
  surface: "default" | "raised" = "default"
): CSSProperties {
  return {
    backgroundColor:
      surface === "raised" ? scheme.surfaceRaised : scheme.surface,
    borderColor: scheme.directContentSurfaceBorder ?? scheme.border,
    ...(scheme.directContentSurfaceShadow
      ? { boxShadow: scheme.directContentSurfaceShadow }
      : {})
  };
}
