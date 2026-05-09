import { useListTopicsQuery } from "@/api";
import { useDebouncedValue } from "@repo/ui-base";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

const topicsListSchema = z.object({
  query: z.string().optional()
});

type TopicsListFormValues = z.infer<typeof topicsListSchema>;

const searchDebounceMs = 500;

function useListTopicsPageTopics() {
  const { watch } = useFormContext<TopicsListFormValues>();
  const query = watch("query") ?? "";

  const debouncedQuery = useDebouncedValue(query.trim(), searchDebounceMs);
  const normalizedQuery = debouncedQuery || undefined;

  const { data, errorMessage, isError, isLoading, refetch } =
    useListTopicsQuery({
      query: normalizedQuery
    });
  const topics = data?.topics ?? [];
  const hasQuery = normalizedQuery !== undefined;

  return {
    topics,
    errorMessage,
    hasQuery,
    isError,
    isLoading,
    refetchTopics: refetch
  };
}

export { useListTopicsPageTopics, topicsListSchema, type TopicsListFormValues };
