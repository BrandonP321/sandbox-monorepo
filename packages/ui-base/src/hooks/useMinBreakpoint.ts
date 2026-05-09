import { useMediaQuery } from "./useMediaQuery";

const minBreakpointQueries = {
  // No Tailwind breakpoint overrides are currently defined in this repo; these
  // values mirror Tailwind's default min-width breakpoint scale.
  sm: "(min-width: 40rem)",
  md: "(min-width: 48rem)",
  lg: "(min-width: 64rem)",
  xl: "(min-width: 80rem)",
  "2xl": "(min-width: 96rem)"
} as const;

export function useMinBreakpoint(
  breakpoint: keyof typeof minBreakpointQueries,
  options?: { ssrMatch?: boolean }
): boolean {
  return useMediaQuery(minBreakpointQueries[breakpoint], options);
}
