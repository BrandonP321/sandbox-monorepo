import type { Meta, StoryObj } from "@storybook/react-vite";

import { Download } from "../../../icons";
import { Button } from "../Button/Button";
import { ButtonGroup } from "../ButtonGroup/ButtonGroup";
import { Container } from "./Container";

const contentStyle = {
  display: "grid",
  gap: "var(--space-stack-md)"
} as const;

const mediaStyle = {
  minBlockSize: "100%",
  background:
    "linear-gradient(135deg, var(--color-bg-surface-sunken), var(--color-bg-canvas))"
} as const;

const frameStyle = {
  padding: "var(--space-4)",
  background: "var(--color-bg-canvas)"
} as const;

const meta = {
  title: "Primitives/Container",
  component: Container,
  parameters: {
    layout: "fullscreen"
  },
  args: {
    header: "Regional briefing",
    children: (
      <div style={contentStyle}>
        <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
          Group related dashboard content inside one bordered surface.
        </p>
        <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
          Keep the API small: header, footer, optional media, and padding control.
        </p>
      </div>
    )
  },
  argTypes: {
    children: {
      control: false
    },
    footer: {
      control: false
    },
    header: {
      control: false
    },
    media: {
      control: false
    }
  },
  render: (args) => (
    <div style={frameStyle}>
      <Container {...args} />
    </div>
  )
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithFooter: Story = {
  args: {
    footer: (
      <ButtonGroup>
        <Button variant="secondary">Dismiss</Button>
        <Button iconLeft={Download}>Export</Button>
      </ButtonGroup>
    )
  }
};

export const WithMedia: Story = {
  args: {
    header: "Port operations",
    media: {
      content: <div style={{ ...mediaStyle, minBlockSize: "14rem" }} />,
      height: "14rem"
    }
  }
};

export const SideMediaFitHeight: Story = {
  render: () => (
    <div
      style={{
        ...frameStyle,
        blockSize: "26rem"
      }}
    >
      <Container
        fitHeight
        footer="Updated 3 minutes ago"
        header="Network health"
        media={{
          content: <div style={mediaStyle} />,
          position: "side",
          width: "18rem"
        }}
      >
        <div style={contentStyle}>
          <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
            Use fit-height when adjacent containers should align to the tallest panel.
          </p>
          <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
            The content area owns overflow while the outer frame stays stable.
          </p>
          <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
            Side media is useful for diagrams, previews, and contextual imagery.
          </p>
        </div>
      </Container>
    </div>
  )
};

export const FullBleedContent: Story = {
  args: {
    disableContentPaddings: true,
    header: "Traffic map",
    children: <div style={{ ...mediaStyle, minBlockSize: "18rem" }} />
  }
};
