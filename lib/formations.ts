export interface FormationSlot {
  id: string;
  label: string;
  positionKeys: string[];
  x: number; // 0 (left) to 1 (right)
  y: number; // 0 (attack end) to 1 (GK end)
}

export interface Formation {
  id: string;
  name: string;
  slots: FormationSlot[];
}

export const FORMATIONS: Formation[] = [
  {
    id: "433",
    name: "4-3-3",
    slots: [
      { id: "gk",  label: "POR", positionKeys: ["POR"],                        x: 0.50, y: 0.93 },
      { id: "rb",  label: "LD",  positionKeys: ["DF-D","CR-D"],                x: 0.82, y: 0.75 },
      { id: "cb1", label: "DC",  positionKeys: ["DF-C"],                       x: 0.62, y: 0.75 },
      { id: "cb2", label: "DC",  positionKeys: ["DF-C"],                       x: 0.38, y: 0.75 },
      { id: "lb",  label: "LI",  positionKeys: ["DF-I","CR-I"],                x: 0.18, y: 0.75 },
      { id: "mcd1",label: "MCD", positionKeys: ["MC"],                         x: 0.65, y: 0.60 },
      { id: "mcd2",label: "MCD", positionKeys: ["MC"],                         x: 0.35, y: 0.60 },
      { id: "mp",  label: "MP",  positionKeys: ["MP-C","ME-C","ME-D","ME-I"],  x: 0.50, y: 0.42 },
      { id: "rw",  label: "EXT", positionKeys: ["MP-D","MP-I"],                x: 0.83, y: 0.26 },
      { id: "st",  label: "DL",  positionKeys: ["DL-C"],                       x: 0.50, y: 0.18 },
      { id: "lw",  label: "EXT", positionKeys: ["MP-I","MP-D"],                x: 0.17, y: 0.26 },
    ],
  },
  {
    id: "442",
    name: "4-4-2",
    slots: [
      { id: "gk",  label: "POR", positionKeys: ["POR"],           x: 0.50, y: 0.93 },
      { id: "rb",  label: "LD",  positionKeys: ["DF-D","CR-D"],   x: 0.82, y: 0.75 },
      { id: "cb1", label: "DC",  positionKeys: ["DF-C"],          x: 0.62, y: 0.75 },
      { id: "cb2", label: "DC",  positionKeys: ["DF-C"],          x: 0.38, y: 0.75 },
      { id: "lb",  label: "LI",  positionKeys: ["DF-I","CR-I"],   x: 0.18, y: 0.75 },
      { id: "rm",  label: "EXT", positionKeys: ["MP-D","ME-D"],   x: 0.83, y: 0.55 },
      { id: "cm1", label: "MC",  positionKeys: ["MC","ME-C"],     x: 0.62, y: 0.55 },
      { id: "cm2", label: "MC",  positionKeys: ["MC","ME-C"],     x: 0.38, y: 0.55 },
      { id: "lm",  label: "EXT", positionKeys: ["MP-I","ME-I"],   x: 0.17, y: 0.55 },
      { id: "st1", label: "DL",  positionKeys: ["DL-C"],          x: 0.62, y: 0.20 },
      { id: "st2", label: "DL",  positionKeys: ["DL-C"],          x: 0.38, y: 0.20 },
    ],
  },
  {
    id: "4231",
    name: "4-2-3-1",
    slots: [
      { id: "gk",  label: "POR", positionKeys: ["POR"],                       x: 0.50, y: 0.93 },
      { id: "rb",  label: "LD",  positionKeys: ["DF-D","CR-D"],               x: 0.82, y: 0.76 },
      { id: "cb1", label: "DC",  positionKeys: ["DF-C"],                      x: 0.62, y: 0.76 },
      { id: "cb2", label: "DC",  positionKeys: ["DF-C"],                      x: 0.38, y: 0.76 },
      { id: "lb",  label: "LI",  positionKeys: ["DF-I","CR-I"],               x: 0.18, y: 0.76 },
      { id: "dm1", label: "MCD", positionKeys: ["MC"],                        x: 0.62, y: 0.60 },
      { id: "dm2", label: "MCD", positionKeys: ["MC"],                        x: 0.38, y: 0.60 },
      { id: "rw",  label: "EXT", positionKeys: ["MP-D","MP-I","ME-D"],        x: 0.83, y: 0.38 },
      { id: "cam", label: "MP",  positionKeys: ["MP-C","ME-C"],               x: 0.50, y: 0.38 },
      { id: "lw",  label: "EXT", positionKeys: ["MP-I","MP-D","ME-I"],        x: 0.17, y: 0.38 },
      { id: "st",  label: "DL",  positionKeys: ["DL-C"],                      x: 0.50, y: 0.18 },
    ],
  },
  {
    id: "352",
    name: "3-5-2",
    slots: [
      { id: "gk",  label: "POR", positionKeys: ["POR"],               x: 0.50, y: 0.93 },
      { id: "cb1", label: "DC",  positionKeys: ["DF-C"],              x: 0.70, y: 0.76 },
      { id: "cb2", label: "DC",  positionKeys: ["DF-C"],              x: 0.50, y: 0.76 },
      { id: "cb3", label: "DC",  positionKeys: ["DF-C"],              x: 0.30, y: 0.76 },
      { id: "rwb", label: "CAD", positionKeys: ["CR-D","DF-D"],       x: 0.90, y: 0.57 },
      { id: "cm1", label: "MC",  positionKeys: ["MC"],                 x: 0.65, y: 0.57 },
      { id: "cm2", label: "MC",  positionKeys: ["MC"],                x: 0.50, y: 0.57 },
      { id: "cm3", label: "MC",  positionKeys: ["MC"],                x: 0.35, y: 0.57 },
      { id: "lwb", label: "CAI", positionKeys: ["CR-I","DF-I"],       x: 0.10, y: 0.57 },
      { id: "st1", label: "DL",  positionKeys: ["DL-C"],              x: 0.62, y: 0.20 },
      { id: "st2", label: "DL",  positionKeys: ["DL-C"],              x: 0.38, y: 0.20 },
    ],
  },
  {
    id: "4141",
    name: "4-1-4-1",
    slots: [
      { id: "gk",  label: "POR", positionKeys: ["POR"],                       x: 0.50, y: 0.93 },
      { id: "rb",  label: "LD",  positionKeys: ["DF-D","CR-D"],               x: 0.82, y: 0.76 },
      { id: "cb1", label: "DC",  positionKeys: ["DF-C"],                      x: 0.62, y: 0.76 },
      { id: "cb2", label: "DC",  positionKeys: ["DF-C"],                      x: 0.38, y: 0.76 },
      { id: "lb",  label: "LI",  positionKeys: ["DF-I","CR-I"],               x: 0.18, y: 0.76 },
      { id: "dm",  label: "MCD", positionKeys: ["MC"],                        x: 0.50, y: 0.62 },
      { id: "rm",  label: "EXT", positionKeys: ["MP-D","ME-D"],               x: 0.83, y: 0.44 },
      { id: "cm1", label: "MC",  positionKeys: ["MC","ME-C"],                 x: 0.62, y: 0.44 },
      { id: "cm2", label: "MC",  positionKeys: ["MC","ME-C"],                 x: 0.38, y: 0.44 },
      { id: "lm",  label: "EXT", positionKeys: ["MP-I","ME-I"],               x: 0.17, y: 0.44 },
      { id: "st",  label: "DL",  positionKeys: ["DL-C"],                      x: 0.50, y: 0.18 },
    ],
  },
  {
    id: "41212",
    name: "4-1-2-1-2",
    slots: [
      { id: "gk",  label: "POR", positionKeys: ["POR"],             x: 0.50, y: 0.93 },
      { id: "rb",  label: "LD",  positionKeys: ["DF-D","CR-D"],     x: 0.82, y: 0.76 },
      { id: "cb1", label: "DC",  positionKeys: ["DF-C"],            x: 0.62, y: 0.76 },
      { id: "cb2", label: "DC",  positionKeys: ["DF-C"],            x: 0.38, y: 0.76 },
      { id: "lb",  label: "LI",  positionKeys: ["DF-I","CR-I"],     x: 0.18, y: 0.76 },
      { id: "dm",  label: "MCD", positionKeys: ["MC"],              x: 0.50, y: 0.63 },
      { id: "cm1", label: "MC",  positionKeys: ["MC","ME-C"],       x: 0.68, y: 0.50 },
      { id: "cm2", label: "MC",  positionKeys: ["MC","ME-C"],       x: 0.32, y: 0.50 },
      { id: "cam", label: "MP",  positionKeys: ["MP-C","ME-C"],     x: 0.50, y: 0.37 },
      { id: "st1", label: "DL",  positionKeys: ["DL-C"],            x: 0.65, y: 0.20 },
      { id: "st2", label: "DL",  positionKeys: ["DL-C"],            x: 0.35, y: 0.20 },
    ],
  },
];
