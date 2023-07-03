import { isKingInCheck } from "./check";
import { getPiece } from "./helpers";
import {
  getJumpingPieceMoves,
  getPawnMoves,
  getSlidingPieceMoves,
  validBishopMoves,
  validKingMoves,
  validKnightMoves,
  validPawnMoves,
  validQueenMoves,
  validRookMoves,
} from "./pieceRules";

const getTempBoard = async (board, oldPos, newPos, piece, pieceColor) => {
  return await board.map((tile, idx) => {
    if (idx === oldPos) return null;
    if (idx === newPos) return pieceColor + piece;
    return tile;
  });
};

const getIdxOfAllPieces = async (board, color) => {
  return await board
    .map((tile, idx) => {
      if (tile && tile[0] === color) return idx;
    })
    .filter((idx) => idx);
};

const validateMoves = async (allMoves, board, currTurn) => {
  let kingInCheck = false;
  let validMoves = [];
  for await (const move of allMoves) {
    const pieceType = move.piece[1];
    const pieceColor = move.piece[0];
    // check if making the move results in a check on own king
    const newBoard = await getTempBoard(
      board,
      move.oldPos,
      move.newPos,
      pieceType,
      pieceColor
    );

    // opponent's turn
    const oppColor = currTurn === "w" ? "b" : "w";
    const oppIdxOfAllPieces = await getIdxOfAllPieces(newBoard, oppColor);

    for await (const oppIdx of oppIdxOfAllPieces) {
      if (kingInCheck) break;
      const pieceColor = newBoard[oppIdx][0];
      const piece = newBoard[oppIdx][1];
      const moves = await getMoves(
        piece,
        pieceColor,
        oppIdx,
        newBoard,
        false,
        false
      );

      const kingUnderAtt = await isKingUnderAtt(moves);
      if (kingUnderAtt) {
        kingInCheck = true;
        break;
      }
    }

    if (!kingInCheck) validMoves.push(move);
    kingInCheck = false;
  }
  return validMoves;
};

const isKingUnderAtt = async (moves) => {
  for await (const move of moves) {
    if (move.capturedPiece && move.capturedPiece.includes("k")) return true;
  }
  return false;
};

export const generateAllMoves = async (board, currTurn) => {
  // get all possible moves
  // keep only valid moves (does not check the king)
  let allMoves = [];
  let idxOfAllPieces = await getIdxOfAllPieces(board, currTurn);

  for await (const idx of idxOfAllPieces) {
    const pieceColor = board[idx][0];
    const piece = board[idx][1];
    const moves = await getMoves(piece, pieceColor, idx, board, false, false);
    if (moves.length > 0) {
      allMoves.push.apply(allMoves, moves);
    }
  }

  const validMoves = await validateMoves(allMoves, board, currTurn);

  return validMoves;
};
// generates list of all valid x, y coordinates
export const getMoves = async (
  piece,
  pieceColor,
  idx,
  board,
  canLongCastle,
  canShortCastle
) => {
  const oppColor = pieceColor === "w" ? "b" : "w";

  switch (piece) {
    case "p":
      return await getPawnMoves(piece, pieceColor, oppColor, board, idx);
    case "r":
    case "b":
    case "q":
      return await getSlidingPieceMoves(
        piece,
        pieceColor,
        oppColor,
        board,
        idx
      );
    case "k":
    case "n":
      return await getJumpingPieceMoves(
        piece,
        pieceColor,
        oppColor,
        board,
        idx
      );

    // case "PAWN":
    //   return await validPawnMoves(x, y, pieceColor, oppColor, board);
    // case "ROOK":
    //   return await validRookMoves(
    //     x,
    //     y,
    //     pieceColor,
    //     oppColor,
    //     board,
    //     canLongCastle,
    //     canShortCastle
    //   );
    // case "KNIGHT":
    //   return await validKnightMoves(x, y, pieceColor, oppColor, board);
    // case "BISHOP":
    //   return await validBishopMoves(x, y, pieceColor, oppColor, board);
    // case "QUEEN":
    //   return await validQueenMoves(x, y, pieceColor, oppColor, board);
    // case "KING":
    //   return await validKingMoves(x, y, pieceColor, oppColor, board);
    default:
      return [];
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
