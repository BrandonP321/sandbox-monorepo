import { useState } from "react";
import {
  canInclude,
  resolveSources,
  type EntryType,
  type Fixture,
  type Timeline
} from "../model";
import { Sheet } from "./Sheet";

export function SourcesPanel({
  fixture,
  timeline,
  onChange,
  onClose
}: {
  fixture: Fixture;
  timeline: Timeline;
  onChange: (includes: string[]) => void;
  onClose: () => void;
}) {
  const resolved = resolveSources(fixture.timelines, timeline.id);
  return (
    <Sheet title="Compose this timeline" onClose={onClose}>
      <p className="prose">
        Include live sources in <strong>{timeline.title}</strong>. Changes made
        in a source appear everywhere it is included.
      </p>
      <div className="notice">
        Repeated sources appear once. Removing an inclusion keeps its original
        entries.
      </div>
      <div className="choice-list">
        {fixture.timelines
          .filter((source) => source.id !== timeline.id)
          .map((source) => {
            const checked = timeline.includes.includes(source.id);
            const cycle = !canInclude(
              fixture.timelines,
              timeline.id,
              source.id
            );
            return (
              <label key={source.id} className="source-choice">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={cycle}
                  onChange={() =>
                    onChange(
                      checked
                        ? timeline.includes.filter((id) => id !== source.id)
                        : [...timeline.includes, source.id]
                    )
                  }
                />
                <span>
                  <strong>
                    <i style={{ background: source.color }} />
                    {source.title}
                  </strong>
                  <small>
                    {cycle
                      ? "Unavailable: would create a circular reference"
                      : !checked && resolved.includes(source.id)
                        ? "Already included through a nested source"
                        : source.includes.length
                          ? `Includes ${source.includes.map((id) => fixture.timelines.find((item) => item.id === id)?.title).join(", ")}`
                          : "Independent source"}
                  </small>
                </span>
              </label>
            );
          })}
      </div>
      <p className="field-hint">
        {resolved.length} unique timelines including this one. Shared-view
        source access is selected separately.
      </p>
    </Sheet>
  );
}

export function TypesPanel({
  fixture,
  onChange,
  onClose
}: {
  fixture: Fixture;
  onChange: (types: EntryType[]) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<EntryType>();
  return (
    <Sheet title="Your type library" onClose={onClose}>
      <p className="prose">
        One reusable library across every timeline. Renaming a type updates its
        label everywhere; source ownership stays the same.
      </p>
      <div className="type-library">
        {fixture.types.map((type) => (
          <div key={type.id}>
            <span className="type-swatch" style={{ background: type.color }} />
            <span>
              <strong>{type.name}</strong>
              <small>
                {
                  fixture.entries.filter((entry) => entry.typeId === type.id)
                    .length
                }{" "}
                entries across the workspace
              </small>
            </span>
            <button
              onClick={() => {
                setEditing(type);
                setName(type.name);
                setError("");
              }}
            >
              Rename<span className="sr-only"> {type.name}</span>
            </button>
          </div>
        ))}
      </div>
      <form
        className="editor-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          if (
            fixture.types.some(
              (type) =>
                type.id !== editing?.id &&
                type.name.toLowerCase() === name.trim().toLowerCase()
            )
          ) {
            setError("A type with that name already exists.");
            return;
          }
          onChange(
            editing
              ? fixture.types.map((type) =>
                  type.id === editing.id ? { ...type, name: name.trim() } : type
                )
              : [
                  ...fixture.types,
                  {
                    id: crypto.randomUUID(),
                    name: name.trim(),
                    color: "#655380"
                  }
                ]
          );
          setName("");
          setEditing(undefined);
          setError("");
        }}
      >
        <label>
          {editing ? "Rename type" : "New type name"}
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="form-actions">
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(undefined);
                setName("");
              }}
            >
              Cancel
            </button>
          )}
          <button className="primary">
            {editing ? "Save type name" : "Add type"}
          </button>
        </div>
      </form>
    </Sheet>
  );
}

export function SharePanel({
  sources,
  allowed,
  onChange,
  onPreview,
  onClose
}: {
  sources: Timeline[];
  allowed: string[];
  onChange: (ids: string[]) => void;
  onPreview: () => void;
  onClose: () => void;
}) {
  return (
    <Sheet title="Preview a shared view" onClose={onClose}>
      <div className="notice">
        <strong>Only the sources you select</strong>
        <p>
          Included sources stay live. Newly added nested sources remain private
          until explicitly selected here. Filters do not grant access.
        </p>
      </div>
      <div className="choice-list">
        {sources.map((source) => (
          <label className="source-choice" key={source.id}>
            <input
              type="checkbox"
              checked={allowed.includes(source.id)}
              onChange={() =>
                onChange(
                  allowed.includes(source.id)
                    ? allowed.filter((id) => id !== source.id)
                    : [...allowed, source.id]
                )
              }
            />
            <span>
              <strong>{source.title}</strong>
              <small>
                {allowed.includes(source.id)
                  ? "Visible in the shared preview"
                  : "Private · excluded from the preview"}
              </small>
            </span>
          </label>
        ))}
      </div>
      <p className="field-hint">
        Local preview only. No public link is created. Private Google Docs links
        retain their own permissions.
      </p>
      <button className="primary" onClick={onPreview}>
        Open read-only preview
      </button>
    </Sheet>
  );
}
