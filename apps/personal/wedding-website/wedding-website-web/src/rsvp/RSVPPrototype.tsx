import { Button, ContentFrame, FormSection } from "../components/ui";
import { DemoAccess } from "./DemoAccess";
import { getPrototypeFixture } from "./prototypeFixtures";
import type { FixtureId, RsvpPrototypeState } from "./rsvpTypes";

type RSVPPrototypeProps = {
  onBack: () => void;
  onReset: () => void;
  onSelectFixture: (fixtureId: FixtureId) => void;
  state: RsvpPrototypeState;
};

const stageTitles = {
  attendance: "Household attendance",
  details: "Additional details",
  review: "Review your RSVP",
  confirmation: "RSVP confirmation",
  landing: "Welcome"
} as const;

function RSVPPrototype({
  onBack,
  onReset,
  onSelectFixture,
  state
}: RSVPPrototypeProps) {
  const household = getPrototypeFixture(state.selectedFixtureId);

  return (
    <main className="prototype-page">
      <ContentFrame className="prototype-page__frame">
        <DemoAccess
          onReset={onReset}
          onSelectFixture={onSelectFixture}
          selectedFixtureId={state.selectedFixtureId}
        />

        <FormSection className="prototype-placeholder">
          <p className="prototype-placeholder__eyebrow">
            {household.householdName}
          </p>
          <h1 className="prototype-placeholder__title">
            {stageTitles[state.currentStage]}
          </h1>
          <p className="prototype-placeholder__description">
            The RSVP state foundation is ready. Final form controls for this
            stage will be added in the next prototype step.
          </p>

          <h2 className="prototype-placeholder__invitees-title">
            Invited guests
          </h2>
          <ul className="prototype-placeholder__invitees">
            {household.invitees.map((invitee) => (
              <li key={invitee.id}>{invitee.name}</li>
            ))}
          </ul>

          <div className="prototype-placeholder__actions">
            <Button onClick={onBack} variant="quiet">
              Back
            </Button>
          </div>
        </FormSection>
      </ContentFrame>
    </main>
  );
}

export { RSVPPrototype, type RSVPPrototypeProps };
