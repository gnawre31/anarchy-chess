export const getScoreInc = (capturedColor, capturedPiece) => {
  if (capturedPiece === null) return 0;
  let score = 0;
  if (capturedPiece === "PAWN") score = 1;
  if (capturedPiece === "ROOK") score = 5;
  if (capturedPiece === "KNIGHT") score = 3;
  if (capturedPiece === "BISHOP") score = 3;
  if (capturedPiece === "QUEEN") score = 9;
  if (capturedColor === "B") score *= -1;
  return score;
};
