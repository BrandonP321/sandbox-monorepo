import {
  INTERNAL_DEFAULT_PROJECT_ANNOTATIONS,
  setProjectAnnotations
} from "@storybook/react";
import "@storybook/addon-vitest/internal/setup-file";

import preview from "./preview";

setProjectAnnotations([INTERNAL_DEFAULT_PROJECT_ANNOTATIONS, preview]);
