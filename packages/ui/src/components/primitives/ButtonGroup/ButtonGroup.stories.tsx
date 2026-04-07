import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowRight, Plus } from "../../../icons";
import { Button } from "../Button/Button";
import { ButtonGroup } from "./ButtonGroup";

const meta = {
  title: "Primitives/ButtonGroup",
  component: ButtonGroup,
  args: {
    "aria-label": "Example button group",
    orientation: "horizontal"
  },
  argTypes: {
    children: {
      control: false
    }
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="secondary">Back</Button>
      <Button iconLeft={Plus}>Add item</Button>
      <Button iconRight={ArrowRight} variant="secondary">
        Next
      </Button>
    </ButtonGroup>
  )
} satisfies Meta<typeof ButtonGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Vertical: Story = {
  args: {
    orientation: "vertical"
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
