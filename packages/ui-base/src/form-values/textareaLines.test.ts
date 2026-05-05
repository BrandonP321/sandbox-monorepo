import { describe, expect, it } from "vitest";

import { splitTextareaLines } from "./textareaLines";

describe("splitTextareaLines", () => {
  it("trims lines and removes blank lines", () => {
    expect(
      splitTextareaLines(" first line \n\n second line \r\n third ")
    ).toEqual(["first line", "second line", "third"]);
  });
});
