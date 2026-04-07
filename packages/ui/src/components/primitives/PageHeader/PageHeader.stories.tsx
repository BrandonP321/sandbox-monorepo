import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowRight, Download, SlidersHorizontal } from "../../../icons";
import { StorybookSearchInput } from "@/storybook/examples/inputs";
import { Button } from "../Button/Button";
import { ButtonGroup } from "../ButtonGroup/ButtonGroup";
import { PageHeader } from "./PageHeader";

function Breadcrumbs() {
  return (
    <nav aria-label="Breadcrumb">
      <span>Workspace / Briefings / </span>
      <span aria-current="page">Quarterly review</span>
    </nav>
  );
}

function Actions() {
  return (
    <ButtonGroup aria-label="Page actions">
      <Button variant="secondary">Share</Button>
      <Button iconLeft={Download} variant="secondary">
        Export
      </Button>
      <Button iconRight={ArrowRight} variant="primary">
        Publish
      </Button>
    </ButtonGroup>
  );
}

function Tools() {
  return (
    <>
      <StorybookSearchInput
        aria-label="Search datasets and notes"
        placeholder="Search datasets and notes"
        width="min(100%, 18rem)"
      />
      <Button iconLeft={SlidersHorizontal} variant="secondary">
        Filters
      </Button>
    </>
  );
}

const meta = {
  title: "Primitives/PageHeader",
  component: PageHeader,
  parameters: {
    layout: "fullscreen"
  },
  args: {
    actions: <Actions />,
    breadcrumbs: <Breadcrumbs />,
    description:
      "Operational context and page-level controls for a dense analyst workspace.",
    eyebrow: "Quarterly briefing",
    title: "Port of Los Angeles",
    tools: <Tools />
  },
  argTypes: {
    actions: {
      control: false
    },
    breadcrumbs: {
      control: false
    },
    tools: {
      control: false
    }
  }
} satisfies Meta<typeof PageHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const IdentityOnly: Story = {
  args: {
    actions: undefined,
    breadcrumbs: undefined,
    description: "A page header can be very small when a view only needs identity.",
    eyebrow: undefined,
    tools: undefined
  }
};
