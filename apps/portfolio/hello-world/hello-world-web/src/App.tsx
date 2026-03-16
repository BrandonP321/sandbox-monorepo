import upperFirst from "lodash/upperFirst";

import {
  Box,
  Button,
  Container,
  PageTitle,
  Paper,
  QueryStatus,
  Stack,
} from "@repo/ui";

import { useGetHelloQuery } from "./services/helloApi";

export default function App() {
  const { data, isError, isLoading, isSuccess } = useGetHelloQuery();
  const message = data?.message ? upperFirst(data.message) : "";

  return (
    <Box
      component="main"
      style={{
        minHeight: "100vh",
        padding: "12vh 0 4rem"
      }}
    >
      <Container size={720} px="lg">
        <Paper shadow="xl" radius="xl" p="xl">
          <Stack gap="md">
            <PageTitle>Hello World (frontend)</PageTitle>
            <Button>Click me</Button>
            <QueryStatus
              isLoading={isLoading}
              isError={isError}
              isSuccess={isSuccess}
              loadingMessage="Loading backend message..."
              errorMessage="Backend says: unable to reach the API."
              successMessage={`Backend says: ${message}`}
            />
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
