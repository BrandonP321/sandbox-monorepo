/*
 * Codex scratchpad instructions:
 *
 * - Use this file to brainstorm small Signal Tracker UI components we may add,
 *   not to recreate or regression-test the existing app UI.
 * - Do not feel bound to current UI patterns across the app. This is a place
 *   to explore directions that may imply large refactors if we decide the new
 *   direction is better.
 * - Bring in existing reusable UI components only when they do not constrain
 *   the concept being explored. For example, using an existing button is fine
 *   unless the point of the concept is to rethink button styling or behavior.
 * - Write as much custom styling as needed to express the idea. Concepts that
 *   graduate into reusable components will be refined, typed, tested, and
 *   aligned with the broader UI system later.
 * - Keep scratch components local to this file. Move code out only after we
 *   decide the concept should become part of the real product UI.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { useState } from "react";

const meta = {
  title: "Signal Tracker/Scratchpad",
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const SourceAttachmentAlternatives: Story = {
  render: () => <SourceAttachmentAlternativesStory />
};

export const InlineSourceChips: Story = {
  render: () => (
    <ScratchpadPage>
      <InlineSourceChipConcept />
    </ScratchpadPage>
  )
};

export const PasteReviewTray: Story = {
  render: () => (
    <ScratchpadPage>
      <PasteReviewTrayConcept />
    </ScratchpadPage>
  )
};

export const SourceUrlRows: Story = {
  render: () => (
    <ScratchpadPage>
      <SourceUrlRowsConcept />
    </ScratchpadPage>
  )
};

type SourceMock = {
  id: string;
  date: string;
  domain: string;
  note: string;
  status: "attached" | "captured" | "needs review";
  title: string;
  url: string;
};

const sourceMocks = [
  {
    id: "source-1",
    date: "May 6, 2026",
    domain: "agency.example",
    note: "Direct source for the event date and named participants.",
    status: "attached",
    title: "Agency situation report",
    url: "https://agency.example/situation-report"
  },
  {
    id: "source-2",
    date: "May 5, 2026",
    domain: "analysis.example",
    note: "Helpful background, but it should be treated as contextual.",
    status: "captured",
    title: "Field brief on mediator travel",
    url: "https://analysis.example/field-brief"
  },
  {
    id: "source-3",
    date: "Unknown date",
    domain: "wire.example",
    note: "Title was captured, but published date and author still need review.",
    status: "needs review",
    title: "Live updates: regional talks",
    url: "https://wire.example/live"
  }
] satisfies SourceMock[];

function SourceAttachmentAlternativesStory() {
  return (
    <ScratchpadPage>
      <div className="grid gap-6 xl:grid-cols-3">
        <InlineSourceChipConcept />
        <PasteReviewTrayConcept />
        <SourceUrlRowsConcept />
      </div>
    </ScratchpadPage>
  );
}

function ScratchpadPage({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f5f1e8] px-5 py-7 text-[#20242c]">
      <div className="mx-auto grid max-w-7xl gap-5">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#746b5e] uppercase">
            Source URL concepts
          </p>
          <h1 className="mt-2 text-3xl font-semibold">
            Compact ways to attach sources to an entry
          </h1>
        </header>
        {children}
      </div>
    </main>
  );
}

function InlineSourceChipConcept() {
  const [selectedSourceId, setSelectedSourceId] = useState(sourceMocks[0].id);
  const selectedSource = sourceMocks.find(
    (source) => source.id === selectedSourceId
  );

  return (
    <section className="rounded-[1.4rem] border border-[#d8cebd] bg-[#fffdf8] p-5 shadow-[0_20px_55px_rgba(43,37,27,0.10)]">
      <ConceptHeader
        kicker="Version A"
        summary="Keep one URL entry line, then turn attached sources into dense chips with a one-click detail peek."
        title="Inline source chips"
      />

      <div className="mt-5 grid gap-3">
        <label className="text-sm font-semibold" htmlFor="chip-source-url">
          Source URL
        </label>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <input
            className="h-11 min-w-0 rounded-full border border-[#c8b99f] bg-[#fbf6ec] px-4 text-sm outline-none ring-[#415d65]/20 placeholder:text-[#8a806e] focus:border-[#415d65] focus:ring-4"
            id="chip-source-url"
            placeholder="https://example.com/source"
            type="url"
          />
          <button className="h-11 rounded-full bg-[#273c43] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(39,60,67,0.24)]">
            Add source
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {sourceMocks.map((source) => (
          <button
            className={`grid max-w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-full border px-3 py-2 text-left text-sm transition ${
              selectedSourceId === source.id
                ? "border-[#315f55] bg-[#dfeee5] text-[#1c4038]"
                : "border-[#ddd2bf] bg-[#fbf7ef] text-[#51493b]"
            }`}
            key={source.id}
            onClick={() => setSelectedSourceId(source.id)}
          >
            <SourceMark domain={source.domain} />
            <span className="min-w-0 truncate font-medium">
              {source.domain}
            </span>
            <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs">
              {source.status}
            </span>
          </button>
        ))}
      </div>

      {selectedSource ? (
        <div className="mt-4 rounded-[1rem] border border-[#d8cebd] bg-[#f8f2e7] p-4">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {selectedSource.title}
              </p>
              <p className="mt-1 truncate text-xs text-[#746b5e]">
                {selectedSource.domain} / {selectedSource.date}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-full border border-[#c8b99f] px-3 py-1.5 text-xs font-semibold">
                Details
              </button>
              <button className="rounded-full border border-[#e0b4a2] px-3 py-1.5 text-xs font-semibold text-[#8b321f]">
                Remove
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#51493b]">
            {selectedSource.note}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function PasteReviewTrayConcept() {
  const [selectedSourceId, setSelectedSourceId] = useState(sourceMocks[2].id);
  const selectedSource = sourceMocks.find(
    (source) => source.id === selectedSourceId
  );

  return (
    <section className="rounded-[1.4rem] border border-[#ccd4d7] bg-[#fbfdff] p-5 shadow-[0_20px_55px_rgba(28,44,52,0.10)]">
      <ConceptHeader
        kicker="Version B"
        summary="Make source capture paste-first: the user drops URLs or source notes into one tray, then quickly reviews extracted candidates."
        title="Paste review tray"
      />

      <div className="mt-5 rounded-[1.1rem] border border-dashed border-[#8fa4aa] bg-[#eef6f7] p-4">
        <label
          className="text-sm font-semibold text-[#243f46]"
          htmlFor="source-tray"
        >
          Paste URLs or notes
        </label>
        <textarea
          className="mt-3 min-h-28 w-full resize-none rounded-[0.9rem] border border-[#bdd0d5] bg-white px-4 py-3 text-sm leading-6 outline-none ring-[#52747c]/20 placeholder:text-[#789098] focus:border-[#52747c] focus:ring-4"
          id="source-tray"
          placeholder="Paste source URLs, copied notes, or a paragraph with links. URLs become reviewable source candidates."
          value={
            "https://agency.example/situation-report\nhttps://wire.example/live"
          }
          readOnly
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-medium text-[#5c747b]">
            2 URLs detected / 1 needs review before attach
          </p>
          <button className="rounded-full bg-[#244a54] px-4 py-2 text-sm font-semibold text-white">
            Attach reviewed sources
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="grid gap-2">
          {sourceMocks.map((source) => (
            <button
              className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[0.95rem] border px-3 py-3 text-left ${
                selectedSourceId === source.id
                  ? "border-[#4e7780] bg-[#e5f2f4]"
                  : "border-[#d4e0e3] bg-white"
              }`}
              key={source.id}
              onClick={() => setSelectedSourceId(source.id)}
            >
              <SourceMark domain={source.domain} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">
                  {source.title}
                </span>
                <span className="mt-1 block truncate text-xs text-[#637b82]">
                  {source.url}
                </span>
              </span>
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  source.status === "needs review"
                    ? "bg-[#fff0c7] text-[#72530f]"
                    : "bg-[#dbefe8] text-[#285243]"
                }`}
              >
                {source.status}
              </span>
            </button>
          ))}
        </div>

        <aside className="rounded-[1rem] border border-[#d4e0e3] bg-white p-4">
          <p className="text-xs font-semibold tracking-[0.14em] text-[#637b82] uppercase">
            Quick inspect
          </p>
          {selectedSource ? (
            <div className="mt-3 grid gap-3">
              <div>
                <p className="text-sm font-semibold">{selectedSource.title}</p>
                <p className="mt-1 text-xs text-[#637b82]">
                  {selectedSource.domain}
                </p>
              </div>
              <p className="text-sm leading-6 text-[#394c52]">
                {selectedSource.note}
              </p>
              <div className="flex flex-wrap gap-2">
                <button className="rounded-full border border-[#b9cbd0] px-3 py-1.5 text-xs font-semibold">
                  Mark attached
                </button>
                <button className="rounded-full border border-[#e1bdad] px-3 py-1.5 text-xs font-semibold text-[#8a321d]">
                  Discard
                </button>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

type SourceUrlRow = {
  domain?: string;
  id: string;
  title?: string;
  url: string;
};

const initialSourceUrlRows = [
  {
    domain: "agency.example",
    id: "url-row-1",
    title:
      "Agency situation report confirms mediator schedule and delegation list",
    url: "https://agency.example/situation-report"
  },
  {
    domain: "analysis.example",
    id: "url-row-2",
    title: "Field brief on mediator travel",
    url: "https://analysis.example/field-brief"
  },
  {
    domain: "wire.example",
    id: "url-row-3",
    title: "Live updates: regional talks continue after overnight pause",
    url: "https://wire.example/live"
  }
] satisfies SourceUrlRow[];

function SourceUrlRowsConcept() {
  const [nextRowNumber, setNextRowNumber] = useState(
    initialSourceUrlRows.length + 1
  );
  const [rows, setRows] = useState<SourceUrlRow[]>(initialSourceUrlRows);

  function addRowAfter(rowId: string) {
    const nextRow = {
      id: `url-row-${nextRowNumber}`,
      url: ""
    } satisfies SourceUrlRow;

    setRows((currentRows) => {
      const rowIndex = currentRows.findIndex((row) => row.id === rowId);

      if (rowIndex === -1) {
        return [...currentRows, nextRow];
      }

      return [
        ...currentRows.slice(0, rowIndex + 1),
        nextRow,
        ...currentRows.slice(rowIndex + 1)
      ];
    });
    setNextRowNumber((currentNumber) => currentNumber + 1);
  }

  function removeRow(rowId: string) {
    setRows((currentRows) => currentRows.filter((row) => row.id !== rowId));
  }

  function updateRowUrl(rowId: string, url: string) {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              domain: row.domain ?? getUrlDomain(url),
              title: row.title ?? getFallbackSourceTitle(url),
              url
            }
          : row
      )
    );
  }

  return (
    <section className="rounded-[1.4rem] border border-[#d6cfde] bg-[#fffcff] p-5 shadow-[0_20px_55px_rgba(42,34,54,0.10)]">
      <ConceptHeader
        kicker="Version C"
        summary="Make every URL an editable row. The source preview stays tiny: favicon plus a single-line title below the field."
        title="Source URL rows"
      />

      <div className="mt-5 grid gap-3">
        {rows.map((row, index) => (
          <SourceUrlInputRow
            index={index}
            key={row.id}
            onAddRowAfter={() => addRowAfter(row.id)}
            onRemove={() => removeRow(row.id)}
            onUrlChange={(url) => updateRowUrl(row.id, url)}
            row={row}
          />
        ))}
      </div>
    </section>
  );
}

function SourceUrlInputRow({
  index,
  onAddRowAfter,
  onRemove,
  onUrlChange,
  row
}: {
  index: number;
  onAddRowAfter: () => void;
  onRemove: () => void;
  onUrlChange: (url: string) => void;
  row: SourceUrlRow;
}) {
  return (
    <div className="rounded-[1rem] border border-[#ddd5e8] bg-[#faf7ff] p-3">
      <div className="grid grid-cols-[minmax(0,1fr)_2.5rem_2.5rem] gap-2">
        <label className="sr-only" htmlFor={row.id}>
          Source URL {index + 1}
        </label>
        <input
          className="h-10 min-w-0 rounded-[0.8rem] border border-[#cfc2df] bg-white px-3 text-sm outline-none ring-[#69507b]/20 placeholder:text-[#8b7b98] focus:border-[#69507b] focus:ring-4"
          id={row.id}
          onChange={(event) => onUrlChange(event.currentTarget.value)}
          placeholder="https://example.com/source"
          type="url"
          value={row.url}
        />
        <button
          aria-label={`Add source URL row after row ${index + 1}`}
          className="flex size-10 items-center justify-center rounded-[0.8rem] bg-[#604875] text-lg font-semibold text-white shadow-[0_10px_22px_rgba(96,72,117,0.22)]"
          onClick={onAddRowAfter}
        >
          +
        </button>
        <button
          aria-label={`Remove source URL row ${index + 1}`}
          className="flex size-10 items-center justify-center rounded-[0.8rem] border border-[#e2bfce] bg-[#fff5f8] text-lg font-semibold text-[#8b284d]"
          onClick={onRemove}
        >
          x
        </button>
      </div>

      <div className="mt-2">
        <SourcePreviewChip row={row} />
      </div>
    </div>
  );
}

function SourcePreviewChip({ row }: { row: SourceUrlRow }) {
  if (!row.url.trim()) {
    return (
      <div className="inline-flex max-w-full rounded-full border border-dashed border-[#cfc2df] px-3 py-1.5 text-xs font-medium text-[#8b7b98]">
        Source preview appears after a URL is entered.
      </div>
    );
  }

  const domain = row.domain ?? getUrlDomain(row.url) ?? "source";
  const title = row.title ?? getFallbackSourceTitle(row.url);

  return (
    <button className="grid max-w-full grid-cols-[1rem_minmax(0,1fr)] items-center gap-2 rounded-full border border-[#d3c8df] bg-white px-3 py-1.5 text-left shadow-[0_8px_18px_rgba(55,40,72,0.07)]">
      <img
        alt=""
        className="size-4 rounded-sm"
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      />
      <span className="min-w-0 truncate text-xs font-semibold text-[#463556]">
        {title}
      </span>
    </button>
  );
}

function getUrlDomain(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

function getFallbackSourceTitle(url: string) {
  return getUrlDomain(url) ?? "Source title will appear here";
}

function ConceptHeader({
  kicker,
  summary,
  title
}: {
  kicker: string;
  summary: string;
  title: string;
}) {
  return (
    <header>
      <p className="text-xs font-semibold tracking-[0.16em] text-[#746b5e] uppercase">
        {kicker}
      </p>
      <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#62594b]">{summary}</p>
    </header>
  );
}

function SourceMark({ domain }: { domain: string }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#263b42] text-xs font-semibold text-white">
      {domain.slice(0, 1).toUpperCase()}
    </span>
  );
}
