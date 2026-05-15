import type { Meta, StoryObj } from "@storybook/react-vite";

import { GithubButton } from "../GithubButton";
import { LinkedInButton } from "../LinkedInButton";
import { ResumeButton } from "../ResumeButton";
import { ActionsContainer } from "./ActionsContainer";

const meta = {
  title: "Components/ActionsContainer",
  component: ActionsContainer,
  args: {
    children: (
      <>
        <LinkedInButton />
        <GithubButton />
        <ResumeButton />
      </>
    )
  },
  parameters: {
    layout: "centered"
  },
  argTypes: {
    children: {
      control: false
    }
  }
} satisfies Meta<typeof ActionsContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export const Narrow = {
  decorators: [
    (Story) => (
      <div style={{ width: "18rem" }}>
        <Story />
      </div>
    )
  ]
} satisfies Story;
