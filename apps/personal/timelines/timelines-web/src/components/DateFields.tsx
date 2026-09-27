import type { HistoricalDate } from "../model";

export function DateFields({
  label,
  date,
  onChange
}: {
  label: string;
  date: HistoricalDate;
  onChange: (value: HistoricalDate) => void;
}) {
  return (
    <fieldset className="date-fields">
      <legend>{label}</legend>
      <label>
        Year
        <input
          required
          type="number"
          min="1"
          max="9999"
          value={date.year || ""}
          onChange={(event) =>
            onChange({ ...date, year: Number(event.target.value) })
          }
        />
      </label>
      <label>
        Era
        <select
          value={date.era}
          onChange={(event) =>
            onChange({
              ...date,
              era: event.target.value === "BCE" ? "BCE" : "CE"
            })
          }
        >
          <option>CE</option>
          <option>BCE</option>
        </select>
      </label>
      <label>
        Month
        <input
          aria-label={`${label} month (optional)`}
          placeholder="—"
          type="number"
          min="1"
          max="12"
          value={date.month ?? ""}
          onChange={(event) =>
            onChange({
              ...date,
              month: event.target.value
                ? Number(event.target.value)
                : undefined,
              day: event.target.value ? date.day : undefined
            })
          }
        />
      </label>
      <label>
        Day
        <input
          aria-label={`${label} day (optional)`}
          placeholder="—"
          type="number"
          min="1"
          max="31"
          value={date.day ?? ""}
          onChange={(event) =>
            onChange({
              ...date,
              day: event.target.value ? Number(event.target.value) : undefined
            })
          }
        />
      </label>
    </fieldset>
  );
}
