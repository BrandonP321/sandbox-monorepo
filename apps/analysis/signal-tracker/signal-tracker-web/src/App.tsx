// TODO: Remove these imports once final UI is being built
import { Button } from "@/components/ui/Button";
import { default as TempApp } from "./backendTestScaffold/App";
import "./backendTestScaffold/index.css";

export default function App() {
  return (
    <main>
      <section className="border-border bg-background text-foreground flex items-center justify-between gap-4 border-b px-6 py-4">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            UI foundation
          </p>
          <p className="text-sm">
            Tailwind CSS and the local shadcn-style Button are wired in.
          </p>
        </div>
        <Button>Verify Button</Button>
      </section>
      <TempApp />
    </main>
  );
}
