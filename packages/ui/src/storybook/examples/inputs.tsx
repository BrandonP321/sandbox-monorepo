import type { CSSProperties, ComponentProps } from "react";

import { Search } from "../../icons";
import { Input } from "../../components/primitives/Input/Input";

export type StorybookSearchInputProps = Omit<ComponentProps<typeof Input>, "iconLeft"> & {
  iconLeft?: ComponentProps<typeof Input>["iconLeft"];
  width?: CSSProperties["inlineSize"];
};

export function StorybookSearchInput({
  "aria-label": ariaLabel = "Search",
  iconLeft = Search,
  placeholder = "Search",
  width = "min(100%, 20rem)",
  ...props
}: StorybookSearchInputProps) {
  return (
    <div style={{ inlineSize: width }}>
      <Input
        {...props}
        aria-label={ariaLabel}
        iconLeft={iconLeft}
        placeholder={placeholder}
      />
    </div>
  );
}
