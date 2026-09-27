import type { Entry, Fixture, Timeline } from "./model";

const types = [
  { id: "politics", name: "Politics & law", color: "#47624d" },
  { id: "conflict", name: "Conflict", color: "#a1452f" },
  { id: "ideas", name: "Ideas & culture", color: "#655380" },
  { id: "society", name: "Society", color: "#316779" }
];
const timelines: Timeline[] = [
  {
    id: "america",
    title: "The making of a nation",
    description:
      "An interconnected view of American history, from independence to Reconstruction.",
    color: "#47624d",
    includes: ["founding", "democracy", "reform"]
  },
  {
    id: "founding",
    title: "Founding a republic",
    description: "Independence, institutions, and their contradictions.",
    color: "#49674c",
    includes: []
  },
  {
    id: "democracy",
    title: "A contested democracy",
    description: "Civil war and the unfinished work of citizenship.",
    color: "#a54f38",
    includes: ["reform"]
  },
  {
    id: "reform",
    title: "Voices of reform",
    description: "Abolition, rights, and movements for change.",
    color: "#696085",
    includes: []
  },
  {
    id: "long-view",
    title: "The very long view",
    description:
      "Sparse dates, uncertain origins, and the crossing from BCE to CE.",
    color: "#316779",
    includes: []
  },
  {
    id: "empty",
    title: "An unwritten chapter",
    description: "A blank timeline, ready for a first entry.",
    color: "#776545",
    includes: []
  }
];

function event(
  id: string,
  sourceId: string,
  title: string,
  year: number,
  typeId: string,
  overrides: Partial<Entry> = {}
): Entry {
  return {
    id,
    sourceId,
    title,
    typeId,
    start: { year, era: "CE" },
    shape: "point",
    qualifier: "exact",
    description:
      "An illustrative study note in a synthetic prototype. Verify the historical account and add references before using it for research.",
    reference: "Synthetic study fixture · not a cited historical account",
    ...overrides
  };
}

const entries: Entry[] = [
  event("stamp", "founding", "The Stamp Act", 1765, "politics"),
  event("revolution", "founding", "The American Revolution", 1775, "conflict", {
    shape: "period",
    end: { year: 1783, era: "CE" }
  }),
  event(
    "declaration",
    "founding",
    "A declaration of independence",
    1776,
    "politics",
    {
      start: { year: 1776, month: 7, day: 4, era: "CE" },
      imageUrl: "https://example.invalid/archive-image.jpg",
      imageAlt: "A manuscript of the Declaration of Independence",
      imageCaption: "Example of an unavailable linked archive image."
    }
  ),
  event(
    "constitution",
    "founding",
    "Writing the Constitution",
    1787,
    "politics"
  ),
  event("rights", "founding", "The Bill of Rights", 1791, "politics"),
  event("cotton", "founding", "Cotton reshapes the economy", 1800, "society", {
    qualifier: "approximate"
  }),
  event("missouri", "democracy", "The Missouri Compromise", 1820, "politics"),
  event("removal", "democracy", "The Indian Removal Act", 1830, "politics"),
  event("war", "democracy", "The Civil War", 1861, "conflict", {
    shape: "period",
    end: { year: 1865, era: "CE" }
  }),
  event(
    "emancipation",
    "democracy",
    "Emancipation Proclamation",
    1863,
    "politics",
    { start: { year: 1863, month: 1, day: 1, era: "CE" } }
  ),
  event("reconstruction", "democracy", "Reconstruction", 1865, "politics", {
    shape: "period",
    end: { year: 1877, era: "CE" }
  }),
  event("citizenship", "democracy", "Citizenship redefined", 1868, "politics"),
  event(
    "liberator",
    "reform",
    "The Liberator begins publication",
    1831,
    "ideas"
  ),
  event("seneca", "reform", "Seneca Falls Convention", 1848, "society"),
  event(
    "network",
    "reform",
    "An abolitionist network emerges",
    1825,
    "society",
    { shape: "range", end: { year: 1835, era: "CE" } }
  ),
  event("organizing", "reform", "Early organizing recorded", 1830, "society", {
    qualifier: "before"
  }),
  event(
    "education",
    "reform",
    "New educational associations",
    1865,
    "society",
    { qualifier: "after" }
  ),
  event("ancient", "long-view", "Early written records", 3200, "ideas", {
    start: { year: 3200, era: "BCE" },
    qualifier: "approximate"
  }),
  event("republic", "long-view", "An ancient republic", 509, "politics", {
    start: { year: 509, era: "BCE" }
  }),
  event("era", "long-view", "Across the era boundary", 1, "ideas", {
    start: { year: 1, era: "BCE" },
    end: { year: 1, era: "CE" },
    shape: "period"
  }),
  event("printing", "long-view", "The spread of movable type", 1450, "ideas", {
    qualifier: "approximate"
  }),
  event("today", "long-view", "A modern archive", 2020, "ideas")
];
for (let index = 0; index < 24; index++) {
  entries.push(
    event(
      `dense-${index}`,
      "democracy",
      `Reconstruction archive note ${String(index + 1).padStart(2, "0")}`,
      1865,
      index % 2 ? "politics" : "society",
      { start: { year: 1865, month: 12, day: 6, era: "CE" } }
    )
  );
}

export function createFixture(stress = false): Fixture {
  if (!stress) return structuredClone({ timelines, entries, types });
  const sources = Array.from(
    { length: 20 },
    (_, index): Timeline => ({
      id: `source-${index}`,
      title: `Archive ${String(index + 1).padStart(2, "0")}`,
      description: "Synthetic scale fixture",
      color: types[index % types.length].color,
      includes: index === 0 ? ["source-1"] : []
    })
  );
  return {
    types: structuredClone(types),
    timelines: [
      {
        id: "scale",
        title: "Ten thousand connections",
        description:
          "10,000 synthetic entries · 20 sources · repeated inclusion · dense and sparse dates",
        color: "#47624d",
        includes: sources.map((source) => source.id)
      },
      ...sources
    ],
    entries: Array.from({ length: 10000 }, (_, index) =>
      event(
        `scale-${index}`,
        `source-${index % 20}`,
        `Archive observation ${index + 1}`,
        index % 4 === 0 ? 1865 : 1600 + (index % 401),
        types[index % 4].id,
        index % 19 === 0
          ? { shape: "period", end: { year: 2020, era: "CE" } }
          : {}
      )
    )
  };
}
