import { useState } from "react";
import { validateEntry } from "../dates";
import type { Entry, EntryType } from "../model";
import { DateFields } from "./DateFields";
export function EntryEditor({
  entry,
  sourceTitle,
  types,
  onSave,
  onCancel
}: {
  entry: Entry;
  sourceTitle: string;
  types: EntryType[];
  onSave: (entry: Entry) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(entry);
  const [error, setError] = useState<string>();
  return (
    <form
      className="editor-form"
      onSubmit={(event) => {
        event.preventDefault();
        const message = validateEntry(draft);
        if (message) {
          setError(message);
          return;
        }
        onSave({ ...draft, title: draft.title.trim() });
      }}
    >
      <div className="notice">
        Saving updates <strong>{sourceTitle}</strong> and its linked views.
        Dates change only through these fields.
      </div>
      <label>
        Title
        <input
          required
          value={draft.title}
          onChange={(event) =>
            setDraft({ ...draft, title: event.target.value })
          }
        />
      </label>
      <label>
        Entry type
        <select
          value={draft.typeId}
          onChange={(event) =>
            setDraft({ ...draft, typeId: event.target.value })
          }
        >
          {types.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Date meaning
        <select
          value={draft.shape}
          onChange={(event) => {
            const shape = event.target.value as Entry["shape"];
            setDraft({
              ...draft,
              shape,
              qualifier: "exact",
              end: shape === "point" ? undefined : (draft.end ?? draft.start)
            });
          }}
        >
          <option value="point">Point event</option>
          <option value="period">Period — lasted throughout</option>
          <option value="range">
            Uncertain occurrence — somewhere between
          </option>
        </select>
      </label>
      <DateFields
        label="Start date"
        date={draft.start}
        onChange={(start) => setDraft({ ...draft, start })}
      />
      {draft.shape !== "point" && (
        <DateFields
          label="End date"
          date={draft.end ?? draft.start}
          onChange={(end) => setDraft({ ...draft, end })}
        />
      )}
      {draft.shape === "point" && (
        <label>
          Date certainty
          <select
            value={draft.qualifier}
            onChange={(event) =>
              setDraft({
                ...draft,
                qualifier: event.target.value as Entry["qualifier"]
              })
            }
          >
            <option value="exact">
              As recorded (at the entered precision)
            </option>
            <option value="approximate">Approximate / circa</option>
            <option value="before">Before this date</option>
            <option value="after">After this date</option>
          </select>
        </label>
      )}
      <p className="field-hint">
        Leave month and day blank for year precision. There is no year zero.
      </p>
      <label>
        Description
        <textarea
          rows={4}
          value={draft.description}
          onChange={(event) =>
            setDraft({ ...draft, description: event.target.value })
          }
        />
      </label>
      <label>
        References or source links
        <textarea
          rows={2}
          value={draft.reference}
          onChange={(event) =>
            setDraft({ ...draft, reference: event.target.value })
          }
        />
      </label>
      <label>
        Image URL
        <input
          type="url"
          value={draft.imageUrl ?? ""}
          onChange={(event) =>
            setDraft({ ...draft, imageUrl: event.target.value })
          }
        />
      </label>
      <label>
        Image alternative text
        <input
          value={draft.imageAlt ?? ""}
          onChange={(event) =>
            setDraft({ ...draft, imageAlt: event.target.value })
          }
        />
      </label>
      <label>
        Image caption
        <input
          value={draft.imageCaption ?? ""}
          onChange={(event) =>
            setDraft({ ...draft, imageCaption: event.target.value })
          }
        />
      </label>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="form-actions">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="primary" type="submit">
          Save entry
        </button>
      </div>
    </form>
  );
}
