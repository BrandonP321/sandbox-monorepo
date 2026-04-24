import type { ReactNode, Ref } from "react";

export type FormControlChildren<TRenderProps> = (
  props: TRenderProps
) => ReactNode;

export type FormControlRenderPropsBase<TElement extends HTMLElement> = {
  disabled: boolean;
  error?: string;
  id: string;
  name: string;
  onBlur: () => void;
  ref: Ref<TElement>;
};
