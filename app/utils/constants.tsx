import type { Rank } from "./types";
export const RANKS: Rank[] = [
  { min: 0, max: 799, name: "Newbie", color: "text-gray-400" },
  { min: 800, max: 999, name: "Pupil", color: "text-green-500" },
  { min: 1000, max: 1199, name: "Specialist", color: "text-cyan-400" },
  { min: 1200, max: 1399, name: "Expert", color: "text-blue-500" },
  { min: 1400, max: 1599, name: "Candidate Master", color: "text-purple-500" },
  { min: 1600, max: 1899, name: "Master", color: "text-orange-400" },
  {
    min: 1900,
    max: 2199,
    name: "International Master",
    color: "text-orange-600",
  },
  { min: 2200, max: Infinity, name: "Grandmaster", color: "text-red-500" },
];
