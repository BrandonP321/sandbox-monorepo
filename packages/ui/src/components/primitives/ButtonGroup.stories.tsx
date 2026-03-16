import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowRight, Plus } from "../../icons";
import { Button } from "./Button";
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

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector('[role="group"]');

    if (!(group instanceof HTMLDivElement)) {
      throw new Error("Expected ButtonGroup story to render a group container.");
    }

    const buttons = group.querySelectorAll("button");

    if (buttons.length !== 3) {
      throw new Error(`Expected 3 buttons in the default ButtonGroup story, received ${buttons.length}.`);
    }

    const [firstButton, secondButton, thirdButton] = buttons;

    const groupStyles = window.getComputedStyle(group);
    const firstStyles = window.getComputedStyle(firstButton);
    const secondStyles = window.getComputedStyle(secondButton);
    const thirdStyles = window.getComputedStyle(thirdButton);

    if (groupStyles.gap !== "0px") {
      throw new Error(`Expected no gap between grouped buttons, received gap ${groupStyles.gap}.`);
    }

    if (firstStyles.borderTopRightRadius !== "0px" || firstStyles.borderBottomRightRadius !== "0px") {
      throw new Error("Expected the first grouped button to have squared trailing corners.");
    }

    if (
      secondStyles.borderTopLeftRadius !== "0px" ||
      secondStyles.borderBottomLeftRadius !== "0px" ||
      secondStyles.borderTopRightRadius !== "0px" ||
      secondStyles.borderBottomRightRadius !== "0px"
    ) {
      throw new Error("Expected the middle grouped button to have squared internal corners.");
    }

    if (thirdStyles.borderTopLeftRadius !== "0px" || thirdStyles.borderBottomLeftRadius !== "0px") {
      throw new Error("Expected the last grouped button to have squared leading corners.");
    }
  }
};

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
