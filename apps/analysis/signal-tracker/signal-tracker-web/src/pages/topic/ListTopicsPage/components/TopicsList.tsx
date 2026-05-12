import {
  Alert,
  Button,
  ContentHeader,
  FormProvider,
  FormTextInput,
  LoadingState
} from "@/components/ui";
import {
  type TopicsListFormValues,
  topicsListSchema,
  useListTopicsPageTopics
} from "../hooks/useListTopicsPageTopics";
import { TopicListItem } from "./TopicListItem";
import { TopicsListEmptyState } from "./TopicsListEmptyState";

function TopicsListContent() {
  const { topics, errorMessage, hasQuery, isError, isLoading, refetchTopics } =
    useListTopicsPageTopics();

  return (
    <section className="py-5">
      <ContentHeader
        actions={
          <FormTextInput<TopicsListFormValues>
            name="query"
            label="Search topics"
            placeholder="Filter by title or framing question"
          />
        }
        description="Titles, framing questions, and compact scope notes only."
        headingLevel={2}
        title="Active topics"
      />

      <div className="mt-4">
        {isLoading ? <LoadingState label="Loading active topics" /> : null}

        {!isLoading && isError ? (
          <Alert
            actions={
              <Button onClick={refetchTopics} variant="outline">
                Retry
              </Button>
            }
            title="Topics could not be loaded."
            variant="danger"
          >
            {errorMessage ?? "Retry the request without leaving the page."}
          </Alert>
        ) : null}

        {!isLoading && !isError && topics.length === 0 ? (
          <TopicsListEmptyState hasQuery={hasQuery} />
        ) : null}

        {!isLoading && !isError && topics.length > 0 ? (
          <ul
            className="m-0 grid list-none gap-3 p-0"
            aria-label="Active topics"
          >
            {topics.map((topic) => (
              <TopicListItem key={topic.id} topic={topic} />
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function TopicsList() {
  return (
    <FormProvider defaultValues={{ query: "" }} schema={topicsListSchema}>
      <TopicsListContent />
    </FormProvider>
  );
}

export { TopicsList };
