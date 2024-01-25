import { WordComplexSanitized } from "./types";

export const wordComplexSelector: Record<keyof WordComplexSanitized, boolean> =
  {
    createdAt: true,
    updatedAt: true,
    units: true,
    id: true,
    generatedSoundHash: true,
  };
