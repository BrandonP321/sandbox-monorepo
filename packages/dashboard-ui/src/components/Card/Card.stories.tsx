import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "../Badge";
import { Button } from "../Button";
import { Card, CardContent, CardFooter, CardHeader } from "./Card";

const meta = {
  title: "UI/Card",
  component: Card
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <h3 className="text-base font-semibold">Card heading</h3>
        <p className="text-muted-foreground text-sm">
          Short supporting text for a compact surface.
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          Card content stays generic and only provides spacing, border, and
          surface treatment.
        </p>
      </CardContent>
    </Card>
  )
};

export const WithFooter: Story = {
  render: () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold">Review surface</h3>
          <Badge variant="secondary">Draft</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Footer content can hold compact actions without defining product
          behavior.
        </p>
      </CardContent>
      <CardFooter>
        <Button size="sm">Confirm</Button>
        <Button size="sm" variant="outline">
          Cancel
        </Button>
      </CardFooter>
    </Card>
  )
};

export const CustomSpacing: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader className="p-3">
        <h3 className="text-sm font-semibold">Dense card</h3>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <p className="text-muted-foreground text-sm">
          Caller classes can tighten spacing when a compact layout needs it.
        </p>
      </CardContent>
    </Card>
  )
};
