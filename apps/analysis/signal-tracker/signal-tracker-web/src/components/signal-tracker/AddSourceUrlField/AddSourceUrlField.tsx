import type { ClipboardEvent } from "react";
import { useEffect, useId, useRef, useState } from "react";

import type { EvidenceRecord } from "@repo/signal-tracker-shared";

import { useCaptureEvidenceUrlMutation } from "@/api";
import { getApiErrorMessage } from "@/api/apiError";
import { Button, TextInput } from "@/components/ui";

import { CapturedSourcePreview } from "./components/CapturedSourcePreview";
import {
  filterNewSourceUrls,
  getAcceptedSourceUrls,
  normalizeSourceUrl
} from "./lib/source-url";

type SourceUrlItem =
  | {
      id: string;
      status: "capturing";
      url: string;
    }
  | {
      id: string;
      record: EvidenceRecord;
      status: "captured";
      url: string;
    }
  | {
      errorMessage: string;
      id: string;
      status: "failed";
      url: string;
    };

type AddSourceUrlFieldProps = {
  onCapturedRecordsChange?: (records: EvidenceRecord[]) => void;
};
// TODO: Perform a deep review of this component to look for better implementation method and/or composition
function AddSourceUrlField({
  onCapturedRecordsChange
}: AddSourceUrlFieldProps) {
  const inputId = useId();
  const validationId = `${inputId}-validation`;
  const itemId = useRef(0);
  const [captureEvidenceUrl] = useCaptureEvidenceUrlMutation();
  const [items, setItems] = useState<SourceUrlItem[]>([]);
  const [sourceUrlInput, setSourceUrlInput] = useState("");
  const [validationMessage, setValidationMessage] = useState<string>();

  useEffect(() => {
    onCapturedRecordsChange?.(getCapturedRecords(items));
  }, [items, onCapturedRecordsChange]);

  function handleAddSourceUrl() {
    addSourceUrls(sourceUrlInput);
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pastedText = event.clipboardData.getData("text");
    const acceptedUrls = getAcceptedSourceUrls(pastedText);

    if (acceptedUrls.length === 0) {
      return;
    }

    event.preventDefault();
    addAcceptedSourceUrls(acceptedUrls);
  }

  function addSourceUrls(input: string) {
    const acceptedUrls = getAcceptedSourceUrls(input);

    if (acceptedUrls.length === 0) {
      setValidationMessage(
        input.trim()
          ? "Enter a valid http or https source URL."
          : "Enter a source URL."
      );
      return;
    }

    addAcceptedSourceUrls(acceptedUrls);
  }

  function addAcceptedSourceUrls(acceptedUrls: string[]) {
    const newUrls = filterNewSourceUrls(acceptedUrls, getItemUrls(items));

    if (newUrls.length === 0) {
      setValidationMessage("That source URL is already added.");
      setSourceUrlInput("");
      return;
    }

    setValidationMessage(undefined);
    setSourceUrlInput("");

    const nextItems = newUrls.map(createCapturingItem);
    setItems((currentItems) => [...currentItems, ...nextItems]);

    nextItems.forEach((item) => {
      void captureSourceUrl(item);
    });
  }

  async function captureSourceUrl(
    item: Extract<SourceUrlItem, { status: "capturing" }>
  ) {
    try {
      const record = await captureEvidenceUrl({ url: item.url }).unwrap();

      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? {
                id: item.id,
                record,
                status: "captured",
                url: item.url
              }
            : currentItem
        )
      );
    } catch (error) {
      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? {
                errorMessage: getApiErrorMessage(
                  error,
                  "Source URL could not be captured."
                ),
                id: item.id,
                status: "failed",
                url: item.url
              }
            : currentItem
        )
      );
    }
  }

  function retrySourceUrl(item: Extract<SourceUrlItem, { status: "failed" }>) {
    const retryItem = {
      id: item.id,
      status: "capturing",
      url: item.url
    } as const;

    setItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem.id === item.id ? retryItem : currentItem
      )
    );
    void captureSourceUrl(retryItem);
  }

  function removeSourceUrl(itemIdToRemove: string) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemIdToRemove)
    );
  }

  function createCapturingItem(
    url: string
  ): Extract<SourceUrlItem, { status: "capturing" }> {
    itemId.current += 1;

    return {
      id: `source-url-${itemId.current}`,
      status: "capturing",
      url
    };
  }

  return (
    <section
      aria-labelledby={`${inputId}-heading`}
      className="border-border grid gap-3 border-t pt-4"
    >
      <div>
        <h3 id={`${inputId}-heading`} className="text-sm font-semibold">
          Sources
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Paste source URLs for this entry.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <label className="sr-only" htmlFor={inputId}>
            Add source URL
          </label>
          <TextInput
            aria-describedby={validationMessage ? validationId : undefined}
            aria-invalid={validationMessage ? true : undefined}
            id={inputId}
            onChange={(event) => setSourceUrlInput(event.currentTarget.value)}
            onPaste={handlePaste}
            placeholder="https://example.com/source"
            type="url"
            value={sourceUrlInput}
          />
        </div>
        <Button onClick={handleAddSourceUrl} type="button" variant="outline">
          Add source URL
        </Button>
      </div>

      {validationMessage ? (
        <p className="text-danger text-sm" id={validationId} role="alert">
          {validationMessage}
        </p>
      ) : null}

      {items.length > 0 ? (
        <div aria-label="Added source URLs" className="grid gap-2">
          {items.map((item) => (
            <CapturedSourcePreview
              errorMessage={
                item.status === "failed" ? item.errorMessage : undefined
              }
              key={item.id}
              onRemove={() => removeSourceUrl(item.id)}
              onRetry={
                item.status === "failed"
                  ? () => retrySourceUrl(item)
                  : undefined
              }
              record={item.status === "captured" ? item.record : undefined}
              status={item.status}
              url={item.url}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function getCapturedRecords(items: SourceUrlItem[]) {
  return items.flatMap((item) =>
    item.status === "captured" ? [item.record] : []
  );
}

function getItemUrls(items: SourceUrlItem[]) {
  return items.map((item) => normalizeSourceUrl(item.url));
}

export { AddSourceUrlField, type AddSourceUrlFieldProps };
