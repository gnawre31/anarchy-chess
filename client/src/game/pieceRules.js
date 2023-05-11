import { getPiece, isTileEmpty, isTileOccupiedByOpp } from "./helpers";

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
