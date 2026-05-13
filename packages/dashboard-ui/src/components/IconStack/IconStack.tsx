import { useId, type ReactNode } from "react";

import { cn } from "../../lib/utils";

type IconStackItem = {
  icon: ReactNode;
};

type IconStackProps = {
  items: IconStackItem[];
  className?: string;
  maxVisible?: number;
};

function IconStack({ className, items, maxVisible = 3 }: IconStackProps) {
  const stackId = useId();
  const visibleItems = items.slice(0, maxVisible);
  const hiddenCount = items.length - visibleItems.length;

  return (
    <span className={cn("inline-flex items-center", className)}>
      {visibleItems.map((item, index) => (
        <span
          className={cn(
            "bg-card text-muted-foreground border-background inline-flex size-5 items-center justify-center overflow-hidden rounded-full border shadow-xs",
            index > 0 ? "-ml-1.5" : undefined
          )}
          key={`${stackId}-${index}`}
        >
          {item.icon}
        </span>
      ))}
      {hiddenCount > 0 ? (
        <span className="bg-secondary text-secondary-foreground border-background -ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full border px-1 text-[0.625rem] font-medium shadow-xs">
          +{hiddenCount}
        </span>
      ) : null}
    </span>
  );
}

export { IconStack, type IconStackItem, type IconStackProps };
