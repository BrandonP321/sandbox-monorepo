import { ContentFrame, FormSection } from "./components/ui";

export default function App() {
  return (
    <main className="app-shell">
      <ContentFrame width="form">
        <FormSection
          aria-labelledby="scaffold-title"
          className="app-shell__surface"
        >
          <p className="app-shell__eyebrow">Frontend prototype scaffold</p>
          <h1 id="scaffold-title">Wedding website</h1>
          <p>The RSVP experience will be added in a future milestone.</p>
        </FormSection>
      </ContentFrame>
    </main>
  );
}
