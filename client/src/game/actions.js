import { isKingInCheck } from "./check";
import { getPiece, getTempBoard } from "./helpers";
import {
  validBishopMoves,
  validKingMoves,
  validKnightMoves,
  validPawnMoves,
  validQueenMoves,
  validRookMoves,
} from "./pieceRules";

// generates list of all valid x, y coordinates
export const getAllPossibleActions = async (
  tile,
  board,
  canLongCastle,
  canShortCastle
) => {
  const { x, y, piece, pieceColor } = tile;
  const oppColor = pieceColor === "B" ? "W" : "B";

  switch (piece) {
    case "PAWN":
      return await validPawnMoves(x, y, pieceColor, oppColor, board);
    case "ROOK":
      return await validRookMoves(
        x,
        y,
        pieceColor,
        oppColor,
        board,
        canLongCastle,
        canShortCastle
      );
    case "KNIGHT":
      return await validKnightMoves(x, y, pieceColor, oppColor, board);
    case "BISHOP":
      return await validBishopMoves(x, y, pieceColor, oppColor, board);
    case "QUEEN":
      return await validQueenMoves(x, y, pieceColor, oppColor, board);
    case "KING":
      return await validKingMoves(x, y, pieceColor, oppColor, board);
    default:
      return { validMoves: [], validAttacks: [] };
  }
};

// ensure that possible actions do not put the king in check
// or keep the king in check if it is checked
export const getValidActions = async (
  tile,
  possibleActions,
  board,
  canLongCastle,
  canShortCastle
) => {
  let verifiedPossibleActions = { validMoves: [], validAttacks: [] };
  // 1. iterate through all valid moves and attacks
  // 2. update board with those moves and attacks
  // 3. verify if the king is still in check with updated board
  // 4. if king is no longer in check, then append to verifiedPossibleActions

  for (const m of possibleActions.validMoves) {
    // 1. update new tile with piece
    // 2. remove piece from old tile
    const newBoard = await getTempBoard(
      tile.x,
      tile.y,
      m.x,
      m.y,
      tile.piece,
      tile.pieceColor,
      board
    );

    const isChecked = await isKingInCheck(
      tile.pieceColor,
      newBoard,
      canLongCastle,
      canShortCastle
    );
    if (!isChecked) verifiedPossibleActions.validMoves.push({ x: m.x, y: m.y });
  }
  for (const a of possibleActions.validAttacks) {
    // 1. update new tile with piece
    // 2. remove piece from old tile
    const newBoard = await getTempBoard(
      tile.x,
      tile.y,
      a.x,
      a.y,
      tile.piece,
      tile.pieceColor,
      board
    );
    const isChecked = await isKingInCheck(
      tile.pieceColor,
      newBoard,
      canLongCastle,
      canShortCastle
    );
    const pieceToCapture = await getPiece(a.x, a.y, board);
    if (!isChecked)
      verifiedPossibleActions.validAttacks.push({
        x: a.x,
        y: a.y,
        piece: pieceToCapture.piece,
        pieceColor: pieceToCapture.pieceColor,
      });
  }

  return verifiedPossibleActions;
};

// check if x, y coordinate is a valid move
export const isValidAction = async (proposedAction, validMoves) => {
  // combine moves and attacks into 1 array
  // check if newX and newY are in array
  // if not, then it is not a valid action
  const { newX, newY } = proposedAction;
  const actions = await Object.values(validMoves).reduce(
    (acc, arr) => acc.concat(arr),
    []
  );
  const action = await actions.find((m) => m.x === newX && m.y === newY);
  if (action) return true;
  return false;
};
