import type { CSSProperties, Key, ReactNode } from "react";
import type * as React from "react";

import { cn } from "@/lib/utils";

import { Button } from "../Button";

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

// TODO: Rebuild component to be more responsive
function AttributeEditor<TRow>({
  addButtonLabel = "Add new item",
  className,
  controlMinWidth = "20rem",
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
      className={cn("grid gap-4 [container-type:inline-size]", className)}
      data-slot="attribute-editor"
    >
      {rows.length > 0 ? (
        <div className="grid gap-3" data-slot="attribute-editor-rows">
          <div className="hidden gap-3 [@container(min-width:56rem)]:grid [@container(min-width:56rem)]:grid-cols-[minmax(0,1fr)_auto]">
            <div
              className="grid gap-3"
              data-slot="attribute-editor-header"
              style={controlGridStyle}
            >
              {rowDefinitions.map((definition, index) => (
                <div
                  className="text-sm font-medium"
                  data-slot="attribute-editor-header-cell"
                  key={index}
                >
                  {definition.label}
                </div>
              ))}
            </div>
            <Button
              aria-hidden="true"
              className="invisible w-fit"
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
                className="grid gap-3 border-b border-border pb-5 [@container(min-width:56rem)]:border-b-0 [@container(min-width:56rem)]:pb-0"
                data-slot="attribute-editor-row-group"
                key={getRowKey(row, index)}
              >
                <div className="grid gap-3 [@container(min-width:56rem)]:grid-cols-[minmax(0,1fr)_auto] [@container(min-width:56rem)]:items-start">
                  <div
                    className="grid gap-3"
                    data-slot="attribute-editor-row"
                    style={controlGridStyle}
                  >
                    {rowDefinitions.map((definition, definitionIndex) => (
                      <div
                        className="grid min-w-0 gap-2"
                        data-slot="attribute-editor-control"
                        key={definitionIndex}
                      >
                        <div
                          className="text-sm font-medium [@container(min-width:56rem)]:hidden"
                          data-slot="attribute-editor-row-label"
                        >
                          {definition.label}
                        </div>
                        {definition.control(context)}
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-fit justify-self-end"
                    onClick={() => onRemoveRow(row, index)}
                    type="button"
                    variant="outline"
                  >
                    {removeButtonLabel(row, index)}
                  </Button>
                </div>

                {details ? (
                  <div
                    className="min-w-0"
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
        className="w-fit"
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
