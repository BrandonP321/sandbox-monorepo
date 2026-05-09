import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMinBreakpoint } from "@repo/ui-base";

const meta = {
  title: "Storybook/Hooks/ResponsiveBreakpoints",
  parameters: {
    layout: "centered"
  }
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const breakpointLabels = ["sm", "md", "lg", "xl", "2xl"] as const;

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
    <section className="text-foreground w-72 text-sm">
      <h1 className="text-base font-semibold">useMinBreakpoint</h1>
      <p className="text-muted-foreground mt-1">
        Resize the Storybook viewport to verify which breakpoints currently
        match.
      </p>
      <dl className="mt-4 grid gap-2">
        {breakpointLabels.map((breakpoint) => (
          <div
            className="border-border grid grid-cols-[4rem_1fr] rounded-md border px-3 py-2"
            key={breakpoint}
          >
            <dt className="font-mono">{breakpoint}</dt>
            <dd>{breakpointMatches[breakpoint] ? "true" : "false"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
