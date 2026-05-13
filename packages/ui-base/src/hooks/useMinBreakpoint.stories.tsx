import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { useMinBreakpoint } from "./useMinBreakpoint";

const meta = {
  title: "Hooks/useMinBreakpoint",
  parameters: {
    layout: "centered"
  }
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const breakpointLabels = ["sm", "md", "lg", "xl", "2xl"] as const;

const containerStyle = {
  color: "#1f2937",
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  fontSize: "0.875rem",
  width: "18rem"
} satisfies CSSProperties;

const descriptionStyle = {
  color: "#4b5563",
  margin: "0.25rem 0 0"
} satisfies CSSProperties;

const listStyle = {
  display: "grid",
  gap: "0.5rem",
  margin: "1rem 0 0"
} satisfies CSSProperties;

const rowStyle = {
  border: "1px solid #d1d5db",
  borderRadius: "0.375rem",
  display: "grid",
  gridTemplateColumns: "4rem 1fr",
  padding: "0.5rem 0.75rem"
} satisfies CSSProperties;

export const MinBreakpoints: Story = {
  render: () => <MinBreakpointStatus />
};

function MinBreakpointStatus() {
  const breakpointMatches = {
    sm: useMinBreakpoint("sm"),
    md: useMinBreakpoint("md"),
    lg: useMinBreakpoint("lg"),
    xl: useMinBreakpoint("xl"),
    "2xl": useMinBreakpoint("2xl")
  } satisfies Record<(typeof breakpointLabels)[number], boolean>;

  return (
    <section style={containerStyle}>
      <h1 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
        useMinBreakpoint
      </h1>
      <p style={descriptionStyle}>
        Resize the Storybook viewport to verify which breakpoints currently
        match.
      </p>
      <dl style={listStyle}>
        {breakpointLabels.map((breakpoint) => (
          <div key={breakpoint} style={rowStyle}>
            <dt
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
              }}
            >
              {breakpoint}
            </dt>
            <dd style={{ margin: 0 }}>
              {breakpointMatches[breakpoint] ? "true" : "false"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
