export const convertIndexToChessNotation = (index, playerColor) => {
  let rank = Math.floor(index / 8);
  const file = String.fromCharCode(97 + (index % 8));
  if (playerColor === "w") rank = 8 - rank;
  return file + rank;
};

export const convertChessNotationToIndex = (chessNotation, playerColor) => {
  const file = chessNotation.charCodeAt(0) - 97;
  let rank = 8 - parseInt(chessNotation.charAt(1), 10);
  if (playerColor === "w") rank = 8 - rank;
  return rank * 8 + file;
};
