import { getAllPossibleActions, getValidActions } from "./actions";

export const isKingInCheck = async (
  pieceColor,
  board,
  canLongCastle,
  canShortCastle
) => {
  let checked = false;
  const oppColor = pieceColor === "W" ? "B" : "W";
  const attPieces = await board.filter((t) => t.pieceColor === oppColor);

  // 1. get list of all opponent pieces
  // 2. iterate through list of pieces
  // 3. get valid attacks of each piece
  // 4. check if valid attacks contain a king attack
  // 5. if king is part of attack, then the curr player is in check

  for await (const p of attPieces) {
    const validActions = await getAllPossibleActions(
      p,
      board,
      canShortCastle,
      canLongCastle
    );
    for await (const a of validActions.validAttacks) {
      if (a.piece === "KING") {
        checked = true;
        break;
      }
    }
  }

  return checked;
};

export const isCheckMate = async (wChecked, bChecked, board) => {
  let playersInCheck = [];
  if (wChecked) playersInCheck.push("W");
  if (bChecked) playersInCheck.push("B");

  for (const c of playersInCheck) {
    const defPieces = await board.filter((t) => t.pieceColor === c);
    for await (const p of defPieces) {
      const possibleActions = await getAllPossibleActions(
        p,
        board,
        false,
        false
      );
      const validActions = await getValidActions(
        p,
        possibleActions,
        board,
        false,
        false
      );
      if (
        validActions.validMoves.length > 0 ||
        validActions.validAttacks.length > 0
      )
        return false;
    }
  }
  if (playersInCheck.length > 0) {
    return true;
  }
  return false;
};
