import { Button } from "../components/ui";
import { prototypeFixtures } from "./prototypeFixtures";
import type { FixtureId } from "./rsvpTypes";

type DemoAccessProps = {
  onReset: () => void;
  onSelectFixture: (fixtureId: FixtureId) => void;
  selectedFixtureId: FixtureId;
};

function DemoAccess({
  onReset,
  onSelectFixture,
  selectedFixtureId
}: DemoAccessProps) {
  return (
    <section aria-labelledby="demo-access-title" className="demo-access">
      <div className="demo-access__heading">
        <div>
          <p className="demo-access__eyebrow">Prototype controls</p>
          <h2 className="demo-access__title" id="demo-access-title">
            Fictional household
          </h2>
        </div>
        <Button onClick={onReset} variant="quiet">
          Reset demo data
        </Button>
      </div>

      <p className="demo-access__description">
        Choose a synthetic scenario for testing. This is not a guest lookup or
        production sign-in.
      </p>

      <label className="demo-access__label" htmlFor="demo-household">
        Demo household
      </label>
      <select
        className="demo-access__select"
        id="demo-household"
        onChange={(event) =>
          onSelectFixture(event.currentTarget.value as FixtureId)
        }
        value={selectedFixtureId}
      >
        {prototypeFixtures.map((fixture) => (
          <option key={fixture.id} value={fixture.id}>
            {fixture.demoLabel}
          </option>
        ))}
      </select>
    </section>
  );
}

export { DemoAccess, type DemoAccessProps };
