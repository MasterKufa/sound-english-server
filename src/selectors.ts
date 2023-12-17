import { WordComplexSanitized } from "./types";

export const wordComplexSelector: Record<keyof WordComplexSanitized, boolean> =
  {
    createdAt: true,
    units: true,
    id: true,
    generatedSoundHash: true,
  };
