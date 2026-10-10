import { describe, expect, it } from "vitest";
import { positionBetween } from "./ordering";
import { toCsv } from "./csv";

describe("positionBetween", () => {
  it("handles an empty column", () => expect(positionBetween()).toBe(1024));
  it("puts a card first", () => expect(positionBetween(undefined, 10)).toBe(5));
  it("puts a card last", () => expect(positionBetween(10)).toBe(1034));
  it("puts a card in the middle", () => expect(positionBetween(10, 20)).toBe(15));
});

describe("toCsv", () => {
  it("escapes commas, quotes and newlines", () => {
    const row = { company: 'Acme, "Inc"', role: "Dev", status: "APPLIED", location: null, salary: null, url: null, appliedAt: new Date("2026-01-02"), notes: "a\nb" };
    expect(toCsv([row]).split("\n").slice(1).join("\n")).toBe('"Acme, ""Inc""",Dev,APPLIED,,,,2026-01-02,"a\nb"');
  });
});
