import { helloWorldGetHelloResponseSchema } from "@repo/hello-world-shared";
import { responses } from "@repo/api-core";

export function getHello() {
  const payload = helloWorldGetHelloResponseSchema.parse({
    message: "Hello World (backend)"
  });
  return responses.ok(payload);
}
