import { Alert, Button } from "@/components/ui";

type TopicDetailsErrorStateProps = {
  errorMessage: string | undefined;
  onRetry: () => void;
};

// TODO: Have app catch uncaught errors and display error alert
function TopicDetailsErrorState({
  errorMessage,
  onRetry
}: TopicDetailsErrorStateProps) {
  return (
    <section className="py-5">
      <Alert
        actions={
          <Button onClick={onRetry} variant="outline">
            Retry
          </Button>
        }
        title="Topic could not be loaded."
        variant="danger"
      >
        {errorMessage ?? "Retry the request without leaving the page."}
      </Alert>
    </section>
  );
}

export { TopicDetailsErrorState };
