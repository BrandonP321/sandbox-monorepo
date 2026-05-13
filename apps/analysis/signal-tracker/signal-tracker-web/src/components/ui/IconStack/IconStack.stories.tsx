import { Building2, FileText, Globe2, Landmark } from "lucide-react";
import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { NumberInput } from "@repo/dashboard-ui";
import { IconStack } from "./IconStack";

const meta = {
  title: "UI/IconStack",
  component: IconStack,
  args: {
    items: [
      {
        icon: <Globe2 aria-hidden="true" className="size-3.5" />
      },
      {
        icon: <Landmark aria-hidden="true" className="size-3.5" />
      },
      {
        icon: <Building2 aria-hidden="true" className="size-3.5" />
      }
    ]
  }
} satisfies Meta<typeof IconStack>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithOverflow: Story = {
  args: {
    items: [
      {
        icon: <Globe2 aria-hidden="true" className="size-3.5" />
      },
      {
        icon: <Landmark aria-hidden="true" className="size-3.5" />
      },
      {
        icon: <Building2 aria-hidden="true" className="size-3.5" />
      },
      {
        icon: <FileText aria-hidden="true" className="size-3.5" />
      }
    ]
  }
};

export const CustomLimit: Story = {
  render: () => <CustomLimitExample />
};

function CustomLimitExample() {
  const [maxVisible, setMaxVisible] = useState(2);
  const [totalItems, setTotalItems] = useState(12);
  const items = useMemo(() => createIconItems(totalItems), [totalItems]);

  return (
    <div className="grid w-full max-w-sm gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium">
          Visible icons
          <NumberInput
            min={0}
            onChange={(event) =>
              setMaxVisible(parseNumberInput(event.currentTarget.value))
            }
            value={maxVisible}
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Total items
          <NumberInput
            min={0}
            onChange={(event) =>
              setTotalItems(parseNumberInput(event.currentTarget.value))
            }
            value={totalItems}
          />
        </label>
      </div>
      <div className="border-border/80 bg-card flex min-h-16 items-center rounded-lg border p-4 shadow-xs">
        <IconStack items={items} maxVisible={maxVisible} />
      </div>
    </div>
  );
}

function createIconItems(totalItems: number) {
  return Array.from({ length: totalItems }, (_, index) => ({
    icon: getIcon(index)
  }));
}

function getIcon(index: number) {
  const iconClassName = "size-3.5";
  const icons = [
    <Globe2 aria-hidden="true" className={iconClassName} key="globe" />,
    <Landmark aria-hidden="true" className={iconClassName} key="landmark" />,
    <Building2 aria-hidden="true" className={iconClassName} key="building" />,
    <FileText aria-hidden="true" className={iconClassName} key="file" />
  ];

  return icons[index % icons.length];
}

function parseNumberInput(value: string) {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue)) {
    return 0;
  }

  return Math.max(parsedValue, 0);
}
