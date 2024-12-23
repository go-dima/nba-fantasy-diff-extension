export const calculateDiff = (
  topScore: number,
  currentScore: number
): number => {
  return topScore - currentScore;
};

export const formatNumber = (num: number): string => {
  return num > 0 ? num.toFixed(1) : "-";
};
