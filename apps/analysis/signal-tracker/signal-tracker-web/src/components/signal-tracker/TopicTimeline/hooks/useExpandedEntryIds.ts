import { useState } from "react";

function useExpandedEntryIds() {
  const [expandedEntryIds, setExpandedEntryIds] = useState<Set<string>>(
    () => new Set()
  );

  function setEntryExpanded(entryId: string, isExpanded: boolean) {
    setExpandedEntryIds((currentEntryIds) => {
      const nextEntryIds = new Set(currentEntryIds);

      if (isExpanded) {
        nextEntryIds.add(entryId);
      } else {
        nextEntryIds.delete(entryId);
      }

      return nextEntryIds;
    });
  }

  return { expandedEntryIds, setEntryExpanded };
}

export { useExpandedEntryIds };
