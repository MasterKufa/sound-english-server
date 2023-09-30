export const wordComplexSelector = {
  createdAt: true,
  sourceWord: { select: { id: true, lang: true, text: true } },
  targetWord: { select: { id: true, lang: true, text: true } },
  id: true,
  generatedSoundHash: true,
};
