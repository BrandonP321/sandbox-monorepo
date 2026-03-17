import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowRight, Plus } from "../../../icons";
import { Button } from "./Button";

const meta = {
  title: "Primitives/Button",
  component: Button,
  args: {
    children: "Continue",
    size: "md",
    variant: "primary"
  },
  argTypes: {
    iconLeft: {
      control: false
    },
    iconRight: {
      control: false
    }
  }
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector("button");

    if (!(button instanceof HTMLButtonElement)) {
      throw new Error("Expected Button story to render a button element.");
    }

    const styles = window.getComputedStyle(button);

    if (styles.backgroundColor !== "rgb(89, 184, 248)") {
      throw new Error(
        `Expected primary button background to use the Analyst Core accent, received ${styles.backgroundColor}.`
      );
    }

    if (styles.color !== "rgb(6, 16, 24)") {
      throw new Error(
        `Expected primary button text to use the Analyst Core on-accent color, received ${styles.color}.`
      );
    }

    if (styles.borderColor !== "rgb(89, 184, 248)") {
      throw new Error(
        `Expected primary button border to use the Analyst Core accent border, received ${styles.borderColor}.`
      );
    }
  }
};

export const Secondary: Story = {
  args: {
    variant: "secondary"
  }
};

export const WithLeadingIcon: Story = {
  args: {
    iconLeft: Plus
  }
};

export const WithTrailingIcon: Story = {
  args: {
    iconRight: ArrowRight
  }
};

export const FullWidth: Story = {
  args: {
    fullWidth: true
  },
  parameters: {
    layout: "padded"
  }
};
