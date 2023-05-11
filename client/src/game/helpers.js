import { getAllPossibleActions } from "./actions";

export const getTempBoard = async (
  oldX,
  oldY,
  newX,
  newY,
  piece,
  pieceColor,
  board,
  promotedTo
) => {
  return await board.map((t) => {
    if (t.x === oldX && t.y === oldY) {
      return {
        ...t,
        piece: null,
        pieceColor: null,
        isOccupied: false,
      };
    }
    if (t.x === newX && t.y === newY) {
      // pawn promo?
      return {
        ...t,
        piece: promotedTo == null ? piece : promotedTo,
        pieceColor: pieceColor,
        isOccupied: true,
      };
    } else return t;
  });
};

export const isTileEmpty = async (x, y, board) => {
  const tile = await board.find((t) => t.x === x && t.y === y);
  return !tile.isOccupied;
};

export const isTileOccupiedByOpp = async (x, y, oppColor, board) => {
  const tile = await board.find((t) => t.x === x && t.y === y);
  return tile.pieceColor === oppColor;
};

export const multiplePiecesCanMoveToSameSpot = async (
  oldX,
  oldY,
  newX,
  newY,
  piece,
  pieceColor,
  board
) => {
  let otherEligiblePieces = [];
  const otherPieces = await board.filter(
    (t) =>
      t.piece === piece &&
      t.pieceColor === pieceColor &&
      ((t.x !== oldX) ^ (t.y !== oldY) || (t.x !== oldX && t.y !== oldY))
  );
  if (otherPieces.length > 0) {
    for await (const p of otherPieces) {
      const actions = await getAllPossibleActions(p, board, false, false);
      const sameMove = await actions.validMoves.find(
        (m) => m.x === newX && m.y === newY
      );
      const sameAttack = await actions.validMoves.find(
        (m) => m.x === newX && m.y === newY
      );
      if (sameMove != null || sameAttack != null) otherEligiblePieces.push(p);
    }
  }

  return otherEligiblePieces;
};

// return piece that is captured
export const getPiece = async (x, y, board) => {
  const t = await board.find((t) => t.x === x && t.y === y);
  return { piece: t.piece, pieceColor: t.pieceColor };
};
