import { isEdgeIdx } from "./boardUtils";
import { getPiece, isTileEmpty, isTileOccupiedByOpp } from "./helpers";

export const getPawnMoves = async (piece, pieceColor, oppColor, board, idx) => {
  const colorMod = pieceColor === "w" ? -1 : 1;
  let moves = [];

  // move up by 1
  let newIdx = idx + 8 * colorMod;
  if (newIdx >= 0 && newIdx <= 63) {
    if (board[newIdx] === null) {
      moves.push({
        piece: pieceColor + piece,
        capturedPiece: null,
        oldPos: idx,
        newPos: newIdx,
      });
    }
  }

  // move up by 2
  if (moves.length > 0) {
    newIdx += 8 * colorMod;
    const rank = Math.floor(idx / 8);
    if (rank === 1 || rank === 6) {
      if (board[newIdx] === null) {
        moves.push({
          piece: pieceColor + piece,
          capturedPiece: null,
          oldPos: idx,
          newPos: newIdx,
        });
      }
    }
  }

  // capture diagonally
  const idxIncrements = [7 * colorMod, 9 * colorMod];
  for await (const inc of idxIncrements) {
    const newIdx = idx + inc;

    if (newIdx < 0 || newIdx > 63) continue;
    if (board[newIdx] === null) continue;
    if (board[newIdx][0] === pieceColor) continue;
    // EN PASSANT TBD
    else
      moves.push({
        piece: pieceColor + piece,
        capturedPiece: board[newIdx],
        oldPos: idx,
        newPos: newIdx,
      });
  }

  return moves;
};

export const getSlidingPieceMoves = async (
  piece,
  pieceColor,
  oppColor,
  board,
  idx
) => {
  let moves = [];
  let idxIncrements;
  switch (piece) {
    case "r":
      idxIncrements = [-1, 8, 1, -8];
      break;
    case "b":
      idxIncrements = [-9, -7, 9, 7];
      break;
    case "q":
      idxIncrements = [-1, -7, 8, 9, 1, 7, -8, -9];
      break;
    default:
      idxIncrements = [];
  }

  for (const inc of idxIncrements) {
    let newIdx = idx;

    while (newIdx >= 0 && newIdx < 64) {
      newIdx += inc;

      // out of bounds
      if (newIdx > 63 || newIdx < 0) break;

      // tile is occupied by same color piece
      if (board[newIdx] && board[newIdx][0] === pieceColor) break;
      let move = {
        piece: pieceColor + piece,
        capturedPiece: null,
        oldPos: idx,
        newPos: newIdx,
      };
      if (board[newIdx] && board[newIdx][0] === oppColor) {
        move.capturedPiece = board[newIdx];
        moves.push(move);
        break;
      }

      moves.push(move);

      // reached the edge, stop loop
      if (isEdgeIdx(newIdx, inc)) break;
    }
  }

  return moves;
};

export const getJumpingPieceMoves = async (
  piece,
  pieceColor,
  oppColor,
  board,
  idx
) => {
  let moves = [];
  let idxIncrements;
  switch (piece) {
    case "n":
      idxIncrements = [-10, -17, -15, -6, 10, 17, 15, 6];
      break;
    case "k":
      idxIncrements = [-1, -7, 8, 9, 1, 7, -8, -9];
      break;
    default:
      idxIncrements = [];
  }

  for await (const inc of idxIncrements) {
    const newIdx = idx + inc;
    // out of bounds
    if (newIdx > 63 || newIdx < 0) continue;

    // tile is occupied by same color piece
    if (board[newIdx] && board[newIdx][0] === pieceColor) continue;

    let move = {
      piece: pieceColor + piece,
      capturedPiece: null,
      oldPos: idx,
      newPos: newIdx,
    };

    // possible capture
    if (board[newIdx] && board[newIdx][0] === oppColor) {
      move.capturedPiece = board[newIdx];
    }

    // determine possible indices
    const fileDifference = Math.abs((newIdx % 8) - (idx % 8));
    const rankDifference = Math.abs(
      Math.floor(newIdx / 8) - Math.floor(idx / 8)
    );

    if (fileDifference <= 2 && rankDifference <= 2) {
      if (
        (piece === "n" && fileDifference + rankDifference === 3) ||
        piece === "k"
      )
        moves.push(move);
    }
  }

  return moves;
};

export const validPawnMoves = async (x, y, pieceColor, oppColor, board) => {
  // only valid move is one that unchecks the king
  // WIP *****

  let validMoves = [];
  let validAttacks = [];

  // y++ for white, y-- for black
  const yIncrement = (await pieceColor) === "W" ? 1 : -1;

  // REGULAR PAWN MOVES ----------------------------------------------
  // pawn can move up to twice if it is on the starting row
  const startingRow = pieceColor === "W" ? 1 : 6;
  const distance = y === startingRow ? 2 : 1;

  for (let i = 0; i < distance; i += 1) {
    const newY = y + yIncrement * (i + 1);
    // 1. if out of bounds, break out of loop
    // 2. if occupied, break out of loop

    if (newY > 7 || newY < 0) break;

    const canMove = await isTileEmpty(x, newY, board);
    if (canMove) validMoves.push({ x: x, y: newY });
    // push coords into valid moves
    else break;
  }

  // ATTACKING PAWN MOVES ----------------------------------------------
  let xMoves = [];
  if (x > 0) xMoves.push(x - 1);
  if (x < 7) xMoves.push(x + 1);
  const newY = y + yIncrement;

  // no attack possible if y is out of bounds
  if (newY >= 0 && newY <= 7) {
    for await (const newX of xMoves) {
      const canAttack = await isTileOccupiedByOpp(newX, newY, oppColor, board);
      if (canAttack) {
        const oppPiece = await getPiece(newX, newY, board);
        validAttacks.push({
          x: newX,
          y: newY,
          piece: oppPiece.piece,
          pieceColor: oppColor,
        });
      }
    }
  }

  // EN PASSANT MOVES --------------------------------------------------
  return {
    validMoves,
    validAttacks,
  };
};

export const validRookMoves = async (
  x,
  y,
  pieceColor,
  oppColor,
  board,
  canLongCastle,
  canShortCastle
) => {
  // CASTLING
  // WIP *****
  let validMoves = [];
  let validAttacks = [];

  // x towards 0
  for (let i = x - 1; i > -1; i -= 1) {
    // checking for empty tiles
    const canMove = await isTileEmpty(i, y, board);
    if (canMove) validMoves.push({ x: i, y: y });
    else {
      // check if occupied tile is an opponent piece
      const canAttack = await isTileOccupiedByOpp(i, y, oppColor, board);
      if (canAttack) {
        const oppPiece = await getPiece(i, y, board);
        validAttacks.push({
          x: i,
          y: y,
          piece: oppPiece.piece,
          pieceColor: oppColor,
        });
      }
      break;
    }
  }

  // x towards 7
  for (let i = x + 1; i < 8; i += 1) {
    // checking for empty tiles
    const canMove = await isTileEmpty(i, y, board);
    if (canMove) validMoves.push({ x: i, y: y });
    else {
      // check if occupied tile is an opponent piece
      const canAttack = await isTileOccupiedByOpp(i, y, oppColor, board);
      if (canAttack) {
        const oppPiece = await getPiece(i, y, board);
        validAttacks.push({
          x: i,
          y: y,
          piece: oppPiece.piece,
          pieceColor: oppColor,
        });
      }
      break;
    }
  }

  // y towards 0
  for (let j = y - 1; j > -1; j -= 1) {
    // checking for empty tiles
    const canMove = await isTileEmpty(x, j, board);
    if (canMove) validMoves.push({ x: x, y: j });
    else {
      // check if occupied tile is an opponent piece
      const canAttack = await isTileOccupiedByOpp(x, j, oppColor, board);
      if (canAttack) {
        const oppPiece = await getPiece(x, j, board);
        validAttacks.push({
          x: x,
          y: j,
          piece: oppPiece.piece,
          pieceColor: oppColor,
        });
      }
      break;
    }
  }

  // y towards 7
  for (let j = y + 1; j < 8; j += 1) {
    // checking for empty tiles
    const canMove = await isTileEmpty(x, j, board);

    if (canMove) validMoves.push({ x: x, y: j });
    else {
      // check if occupied tile is an opponent piece
      const canAttack = await isTileOccupiedByOpp(x, j, oppColor, board);
      if (canAttack) {
        const oppPiece = await getPiece(x, j, board);
        validAttacks.push({
          x: x,
          y: j,
          piece: oppPiece.piece,
          pieceColor: oppColor,
        });
      }
      break;
    }
  }
  return { validMoves, validAttacks };
};
export const validKnightMoves = async (x, y, pieceColor, oppColor, board) => {
  let validMoves = [];
  let validAttacks = [];
  const allMoves = [
    { x: x - 2, y: y - 1 },
    { x: x - 1, y: y - 2 },
    { x: x - 2, y: y + 1 },
    { x: x - 1, y: y + 2 },
    { x: x + 2, y: y - 1 },
    { x: x + 1, y: y - 2 },
    { x: x + 2, y: y + 1 },
    { x: x + 1, y: y + 2 },
  ];
  for (let i = 0; i < allMoves.length; i += 1) {
    if (
      allMoves[i].x > 7 ||
      allMoves[i].x < 0 ||
      allMoves[i].y > 7 ||
      allMoves[i].y < 0
    ) {
      continue;
    } else {
      // checking for empty tiles
      const canMove = await isTileEmpty(allMoves[i].x, allMoves[i].y, board);
      if (canMove) validMoves.push({ x: allMoves[i].x, y: allMoves[i].y });
      else {
        // check if occupied tile is an opponent piece
        const canAttack = await isTileOccupiedByOpp(
          allMoves[i].x,
          allMoves[i].y,
          oppColor,
          board
        );
        if (canAttack) {
          const oppPiece = await getPiece(allMoves[i].x, allMoves[i].y, board);
          validAttacks.push({
            x: allMoves[i].x,
            y: allMoves[i].y,
            piece: oppPiece.piece,
            pieceColor: pieceColor,
          });
        }
      }
    }
  }
  return { validMoves, validAttacks };
};
export const validBishopMoves = async (x, y, pieceColor, oppColor, board) => {
  let validMoves = [];
  let validAttacks = [];
  let newX;
  let newY;

  // towards 0,0
  newX = x;
  newY = y;
  while (newX > 0 && newY > 0) {
    newX -= 1;
    newY -= 1;
    // checking for empty tiles
    const canMove = await isTileEmpty(newX, newY, board);
    if (canMove) validMoves.push({ x: newX, y: newY });
    else {
      // check if occupied tile is an opponent piece
      const canAttack = await isTileOccupiedByOpp(newX, newY, oppColor, board);
      if (canAttack) {
        const oppPiece = await getPiece(newX, newY, board);
        validAttacks.push({
          x: newX,
          y: newY,
          piece: oppPiece.piece,
          pieceColor: pieceColor,
        });
      }
      break;
    }
  }
  // towards 0,7
  newX = x;
  newY = y;
  while (newX > 0 && newY < 7) {
    newX -= 1;
    newY += 1;
    // checking for empty tiles
    const canMove = await isTileEmpty(newX, newY, board);
    if (canMove) validMoves.push({ x: newX, y: newY });
    else {
      // check if occupied tile is an opponent piece
      const canAttack = await isTileOccupiedByOpp(newX, newY, oppColor, board);
      if (canAttack) {
        const oppPiece = await getPiece(newX, newY, board);
        validAttacks.push({
          x: newX,
          y: newY,
          piece: oppPiece.piece,
          pieceColor: pieceColor,
        });
      }
      break;
    }
  }
  // towards 7,7
  newX = x;
  newY = y;
  while (newX < 7 && newY < 7) {
    newX += 1;
    newY += 1;
    // checking for empty tiles
    const canMove = await isTileEmpty(newX, newY, board);
    if (canMove) validMoves.push({ x: newX, y: newY });
    else {
      // check if occupied tile is an opponent piece
      const canAttack = await isTileOccupiedByOpp(newX, newY, oppColor, board);
      if (canAttack) {
        const oppPiece = await getPiece(newX, newY, board);
        validAttacks.push({
          x: newX,
          y: newY,
          piece: oppPiece.piece,
          pieceColor: pieceColor,
        });
      }
      break;
    }
  }
  // towards 7,0
  newX = x;
  newY = y;
  while (newX < 7 && newY > 0) {
    newX += 1;
    newY -= 1;
    // checking for empty tiles
    const canMove = await isTileEmpty(newX, newY, board);
    if (canMove) validMoves.push({ x: newX, y: newY });
    else {
      // check if occupied tile is an opponent piece
      const canAttack = await isTileOccupiedByOpp(newX, newY, oppColor, board);
      if (canAttack) {
        const oppPiece = await getPiece(newX, newY, board);
        validAttacks.push({
          x: newX,
          y: newY,
          piece: oppPiece.piece,
          pieceColor: pieceColor,
        });
      }
      break;
    }
  }

  return { validMoves, validAttacks };
};
export const validQueenMoves = async (x, y, pieceColor, oppColor, board) => {
  let validMoves = [];
  let validAttacks = [];
  const bishopMoves = await validBishopMoves(x, y, pieceColor, oppColor, board);
  const rookMoves = await validRookMoves(
    x,
    y,
    pieceColor,
    oppColor,
    board,
    false,
    false
  );

  for (const m of bishopMoves.validMoves) validMoves.push(m);
  for (const m of rookMoves.validMoves) validMoves.push(m);
  for (const a of bishopMoves.validAttacks) validAttacks.push(a);
  for (const a of rookMoves.validAttacks) validAttacks.push(a);

  return { validMoves, validAttacks };
};
export const validKingMoves = async (x, y, pieceColor, oppColor, board) => {
  let validMoves = [];
  let validAttacks = [];
  const allMoves = [
    { x: x, y: y - 1 },
    { x: x, y: y + 1 },
    { x: x - 1, y: y - 1 },
    { x: x - 1, y: y },
    { x: x - 1, y: y + 1 },
    { x: x + 1, y: y - 1 },
    { x: x + 1, y: y },
    { x: x + 1, y: y + 1 },
  ];
  for (let i = 0; i < allMoves.length; i += 1) {
    if (
      allMoves[i].x > 7 ||
      allMoves[i].x < 0 ||
      allMoves[i].y > 7 ||
      allMoves[i].y < 0
    ) {
      continue;
    } else {
      // checking for empty tiles
      const canMove = await isTileEmpty(allMoves[i].x, allMoves[i].y, board);
      if (canMove) {
        // if king moves to new position, will it be in check?
        validMoves.push({ x: allMoves[i].x, y: allMoves[i].y });
      } else {
        // check if occupied tile is an opponent piece
        const canAttack = await isTileOccupiedByOpp(
          allMoves[i].x,
          allMoves[i].y,
          oppColor,
          board
        );
        if (canAttack) {
          const oppPiece = await getPiece(allMoves[i].x, allMoves[i].y, board);
          validAttacks.push({
            x: allMoves[i].x,
            y: allMoves[i].y,
            piece: oppPiece.piece,
            pieceColor: pieceColor,
          });
        }
      }
    }
  }

  return { validMoves, validAttacks };
};
