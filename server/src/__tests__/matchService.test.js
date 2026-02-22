import { calculateMatchScore } from "../services/matchService.js";

describe("calculateMatchScore", () => {
  test("adds 50 points for mutual skill match", () => {
    const current = {
      skillsOffered: ["React"],
      skillsWanted: ["DSA"],
      availability: [],
      location: "",
      updatedAt: new Date(),
    };
    const target = {
      skillsOffered: ["DSA"],
      skillsWanted: ["React"],
      availability: [],
      location: "",
      updatedAt: new Date(),
    };
    const { matchScore, reasons } = calculateMatchScore(current, target);
    expect(matchScore).toBeGreaterThanOrEqual(50);
    expect(reasons).toContain("Mutual skill match");
  });

  test("adds points for high rating", () => {
    const current = { skillsOffered: [], skillsWanted: ["React"], availability: [], location: "", updatedAt: new Date() };
    const target = { skillsOffered: ["React"], skillsWanted: [], availability: [], location: "", ratingAvg: 4.5, updatedAt: new Date() };
    const { matchScore, reasons } = calculateMatchScore(current, target);
    expect(matchScore).toBeGreaterThanOrEqual(45);
    expect(reasons.some((r) => r.includes("rating") || r.includes("Rating"))).toBe(true);
  });

  test("adds 20 for availability overlap", () => {
    const current = { skillsOffered: [], skillsWanted: ["React"], availability: ["weekdays"], location: "", updatedAt: new Date() };
    const target = { skillsOffered: ["React"], skillsWanted: [], availability: ["weekdays"], location: "", updatedAt: new Date() };
    const { matchScore, reasons } = calculateMatchScore(current, target);
    expect(reasons).toContain("Availability overlap");
    expect(matchScore).toBeGreaterThanOrEqual(20);
  });
});
