import type { CSSProperties, Key, ReactNode } from "react";
import type * as React from "react";

import { cn } from "@repo/dashboard-ui";

import { Button } from "@repo/dashboard-ui";

type AttributeEditorNativeProps = Pick<
  React.ComponentProps<"div">,
  "aria-label" | "className"
>;

type AttributeEditorRowContext<TRow> = {
  index: number;
  row: TRow;
};

type AttributeEditorRow<TRow> = {
  control: (context: AttributeEditorRowContext<TRow>) => ReactNode;
  label: ReactNode;
};

type AttributeEditorProps<TRow> = AttributeEditorNativeProps & {
  addButtonLabel?: string;
  controlMinWidth?: string;
  getRowKey: (row: TRow, index: number) => Key;
  onAddRow: () => void;
  onRemoveRow: (row: TRow, index: number) => void;
  removeButtonLabel?: (row: TRow, index: number) => string;
  renderRowDetails?: (context: AttributeEditorRowContext<TRow>) => ReactNode;
  rowDefinitions: readonly AttributeEditorRow<TRow>[];
  rows: readonly TRow[];
};

const ATTRIBUTE_EDITOR_DEFAULT_CONTROL_MIN_WIDTH = "20rem";

// The wide container query gives the default three-column editor room for
// controls and row actions before promoting labels into the header row.
const attributeEditorClassNames = {
  addButton: "w-fit",
  control: "grid min-w-0 gap-2",
  details: "min-w-0",
  header:
    "hidden gap-3 [@container(min-width:56rem)]:grid [@container(min-width:56rem)]:grid-cols-[minmax(0,1fr)_auto]",
  headerCell: "text-muted-foreground text-xs font-medium",
  headerControls: "grid gap-3",
  removeButton: "w-fit justify-self-end",
  root: "grid gap-4 [container-type:inline-size]",
  row: "grid gap-3 [@container(min-width:56rem)]:grid-cols-[minmax(0,1fr)_auto] [@container(min-width:56rem)]:items-start",
  rowControls: "grid gap-3",
  rowGroup:
    "bg-card border-border/80 grid gap-3 rounded-lg border p-3 shadow-xs",
  rowLabel:
    "text-muted-foreground text-xs font-medium [@container(min-width:56rem)]:hidden",
  rows: "grid gap-3",
  spacerButton: "invisible w-fit"
} satisfies Record<string, string>;

function AttributeEditor<TRow>({
  addButtonLabel = "Add new item",
  className,
  controlMinWidth = ATTRIBUTE_EDITOR_DEFAULT_CONTROL_MIN_WIDTH,
  getRowKey,
  onAddRow,
  onRemoveRow,
  removeButtonLabel = () => "Remove",
  renderRowDetails,
  rowDefinitions,
  rows,
  ...editorProps
}: AttributeEditorProps<TRow>) {
  const controlGridStyle = {
    gridTemplateColumns: `repeat(auto-fit, minmax(min(${controlMinWidth}, 100%), 1fr))`
  } satisfies CSSProperties;

  return (
    <div
      {...editorProps}
      className={cn(attributeEditorClassNames.root, className)}
      data-slot="attribute-editor"
    >
      {rows.length > 0 ? (
        <div
          className={attributeEditorClassNames.rows}
          data-slot="attribute-editor-rows"
        >
          <div className={attributeEditorClassNames.header}>
            <div
              className={attributeEditorClassNames.headerControls}
              data-slot="attribute-editor-header"
              style={controlGridStyle}
            >
              {rowDefinitions.map((definition, index) => (
                <div
                  className={attributeEditorClassNames.headerCell}
                  data-slot="attribute-editor-header-cell"
                  key={index}
                >
                  {definition.label}
                </div>
              ))}
            </div>
            <Button
              aria-hidden="true"
              className={attributeEditorClassNames.spacerButton}
              disabled
              type="button"
              variant="outline"
            >
              Remove
            </Button>
          </div>

          {rows.map((row, index) => {
            const context = { index, row };
            const details = renderRowDetails?.(context);

            return (
              <div
                className={attributeEditorClassNames.rowGroup}
                data-slot="attribute-editor-row-group"
                key={getRowKey(row, index)}
              >
                <div className={attributeEditorClassNames.row}>
                  <div
                    className={attributeEditorClassNames.rowControls}
                    data-slot="attribute-editor-row"
                    style={controlGridStyle}
                  >
                    {rowDefinitions.map((definition, definitionIndex) => (
                      <div
                        className={attributeEditorClassNames.control}
                        data-slot="attribute-editor-control"
                        key={definitionIndex}
                      >
                        <div
                          className={attributeEditorClassNames.rowLabel}
                          data-slot="attribute-editor-row-label"
                        >
                          {definition.label}
                        </div>
                        {definition.control(context)}
                      </div>
                    ))}
                  </div>
                  <Button
                    className={attributeEditorClassNames.removeButton}
                    onClick={() => onRemoveRow(row, index)}
                    type="button"
                    variant="outline"
                  >
                    {removeButtonLabel(row, index)}
                  </Button>
                </div>

                {details ? (
                  <div
                    className={attributeEditorClassNames.details}
                    data-slot="attribute-editor-row-details"
                  >
                    {details}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      <Button
        className={attributeEditorClassNames.addButton}
        onClick={onAddRow}
        type="button"
        variant="outline"
      >
        {addButtonLabel}
      </Button>
    </div>
  );
}

export {
  AttributeEditor,
  type AttributeEditorRow,
  type AttributeEditorRowContext,
  type AttributeEditorProps
};
