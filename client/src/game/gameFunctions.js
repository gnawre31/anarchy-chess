// import { isKingInCheck } from "./check";
import { getTempBoard, multiplePiecesCanMoveToSameSpot } from "./helpers";

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

export const getMoveNotation = async (
  oldX,
  oldY,
  newX,
  newY,
  piece,
  pieceColor,
  capturedPiece,
  promotedTo,
  board
) => {
  /*
    CHESS NOTATION: piece + original position + capture + new position + pawn promotion + check/checkmate
    eg. Rxf8, e5, Qxa5#, Ke2, h8=Q+, exd4 Nde6
  
    exception - castling
    Short castle: "O-O"
    Long castle: "O-O-O"
    
    PIECE:
    pawn: ""
    rook: "R"
    knight: "N"
    bishop: "B"
    queen: "Q"
    king: "K"
  
    CAPTURE:
    a piece is captured: "x"
    no capture: ""
  
    POSITION:
    position: fileRank (eg. a1, f5, e4)
  
    CHECK/CHECKMATE:
    no check ""
    check: "+"
    checkmate: "#"
  
    */
  let pieceNotation = "";
  let oldPosNotation = "";
  let captureNotation = "";
  let newPosNotation = "";
  let pawnPromoNotation = "";
  let checkNotation = "";
  const oldTile = await board.find((t) => t.x === oldX && t.y === oldY);
  const newTile = await board.find((t) => t.x === newX && t.y === newY);

  // PIECE
  switch (piece) {
    case "ROOK":
      pieceNotation = "R";
      break;
    case "KNIGHT":
      pieceNotation = "N";
      break;
    case "BISHOP":
      pieceNotation = "B";
      break;
    case "QUEEN":
      pieceNotation = "Q";
      break;
    case "KING":
      pieceNotation = "K";
      break;
    default:
      break;
  }

  // ORIGINAL POSITION - only if there are multiple pieces of the same type that can move to the same spot
  const samePieces = await multiplePiecesCanMoveToSameSpot(
    oldX,
    oldY,
    newX,
    newY,
    piece,
    pieceColor,
    board
  );
  let sameX = false;
  let sameY = false;
  if (samePieces.length > 0) {
    for await (const p of samePieces) {
      if (oldX === p.x) sameX = true;
      if (oldY === p.y) sameY = true;
    }
    if (sameX && sameY) oldPosNotation = oldTile.pos;
    else if (sameX) oldPosNotation = oldTile.pos[1];
    else oldPosNotation = oldTile.pos[0];
  }

  // CAPTURE
  if (capturedPiece.piece) {
    // PAWN CAPTURE
    if (piece === "PAWN") oldPosNotation = oldTile.pos[0];

    captureNotation = "x";
  }

  // NEW POSITION
  newPosNotation = newTile.pos;

  // PAWN PROMOTION
  if (promotedTo != null) {
    switch (promotedTo) {
      case "ROOK":
        pawnPromoNotation = "=R";
        break;
      case "KNIGHT":
        pawnPromoNotation = "=N";
        break;
      case "BISHOP":
        pawnPromoNotation = "=B";
        break;
      case "QUEEN":
        pawnPromoNotation = "=Q";
        break;
      default:
        break;
    }
  }

  // CHECK
  const oppColor = pieceColor === "W" ? "B" : "W";
  const newBoard = await getTempBoard(
    oldX,
    oldY,
    newX,
    newY,
    piece,
    pieceColor,
    board,
    promotedTo
  );
  const inCheck = await isKingInCheck(oppColor, newBoard, false, false);
  if (inCheck) checkNotation = "+";

  // TODO
  // CHECKMATE
  // CASTLING

  const moveNotation =
    pieceNotation +
    oldPosNotation +
    captureNotation +
    newPosNotation +
    pawnPromoNotation +
    checkNotation;
  return moveNotation;
};
