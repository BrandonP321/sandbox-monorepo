import type { ReactNode } from "react";
import { Alert, Group, Loader, Text } from "@mantine/core";

type QueryStatusProps = {
  isLoading?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
  loadingMessage?: ReactNode;
  errorMessage?: ReactNode;
  successMessage?: ReactNode;
  errorTitle?: string;
};

export function QueryStatus({
  isLoading,
  isError,
  isSuccess,
  loadingMessage = "Loading...",
  errorMessage = "Something went wrong.",
  successMessage,
  errorTitle = "Error"
}: QueryStatusProps) {
  if (isLoading) {
    return (
      <Group gap="sm">
        <Loader size="sm" />
        <Text c="dimmed">{loadingMessage}</Text>
      </Group>
    );
  }

  if (isError) {
    return (
      <Alert color="red" variant="light" title={errorTitle}>
        {errorMessage}
      </Alert>
    );
  }

  if (isSuccess && successMessage) {
    return <Text>{successMessage}</Text>;
  }

  return null;
}
