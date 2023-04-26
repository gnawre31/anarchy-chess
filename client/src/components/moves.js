// check if x, y coordinate is a valid move
export const isValidMove = async (data, validMoves) => {
  const move = await validMoves.find(
    (m) => data.newX === m.x && data.newY === m.y
  );
  if (move) return true;
  return false;
};

// generates list of all valid x, y coordinates
export const getValidMoves = (
  tile,
  board,
  isChecked,
  canLongCastle,
  canShortCastle
) => {
  const { x, y, piece, pieceColor } = tile;
  const oppColor = pieceColor === "B" ? "W" : "B";

  switch (piece) {
    case "PAWN":
      return validPawnMoves(x, y, pieceColor, oppColor, board, isChecked);
    case "ROOK":
      return validRookMoves(
        x,
        y,
        pieceColor,
        oppColor,
        board,
        isChecked,
        canLongCastle,
        canShortCastle
      );
    case "KNIGHT":
      return validKnightMoves(x, y, pieceColor, oppColor, board, isChecked);
    case "BISHOP":
      return validBishopMoves(x, y, pieceColor, oppColor, board, isChecked);
    case "QUEEN":
      return validQueenMoves(x, y, pieceColor, oppColor, board, isChecked);
    case "KING":
      return validKingMoves(x, y, pieceColor, oppColor, board, isChecked);
    default:
      return [];
  }
};

const validPawnMoves = async (x, y, pieceColor, oppColor, board, isChecked) => {
  // only valid move is one that unchecks the king
  // WIP *****

  let validMoves = [];

  // y++ for white, y-- for black
  const yIncrement = pieceColor === "W" ? 1 : -1;

  // REGULAR PAWN MOVES ----------------------------------------------
  // pawn can move up to twice if it is on the starting row
  const startingRow = pieceColor === "W" ? 1 : 6;
  const distance = y === startingRow ? 2 : 1;

  for (let i = 0; i < distance; i += 1) {
    const newY = y + yIncrement * (i + 1);
    // 1. if out of bounds, break out of loop
    // 2. if occupied, break out of loop

    if (newY > 6 || newY < 1) break;

    const canMove = await isTileEmpty(x, newY, board);
    if (canMove) validMoves.push({ x: x, y: newY });
    // push coords into valid moves
    else break;
  }

  // ATTACKING PAWN MOVES ----------------------------------------------
  let xMoves = [];
  if (x !== 0) xMoves.push(-1);
  if (x !== 7) xMoves.push(1);
  const newY = y + yIncrement;

  xMoves.forEach(async (xIncrement) => {
    let newX = x + xIncrement;
    console.log(newX);

    const canAttack = await isTileOccupiedByOpp(newX, newY, oppColor, board);
    console.log(canAttack);

    if (canAttack) validMoves.push({ x: newX, y: newY });
  });

  // EN PASSANT MOVES --------------------------------------------------
  return validMoves;
};

const validRookMoves = async (
  x,
  y,
  pieceColor,
  oppColor,
  board,
  isChecked,
  canLongCastle,
  canShortCastle
) => {
  // CASTLING
  // WIP *****
  let validMoves = [];

  // x towards 0
  for (let i = x - 1; i > -1; i -= 1) {
    // checking for empty tiles
    const canMove = await isTileEmpty(i, y, board);
    if (canMove) validMoves.push({ x: i, y: y });
    else {
      // check if occupied tile is an opponent piece
      const canAttack = await isTileOccupiedByOpp(i, y, oppColor, board);
      if (canAttack) validMoves.push({ x: i, y: y });
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
      if (canAttack) validMoves.push({ x: i, y: y });
      break;
    }
  }

  // y towards 0
  for (let i = y - 1; i > -1; i -= 1) {
    // checking for empty tiles
    const canMove = await isTileEmpty(x, i, board);
    if (canMove) validMoves.push({ x: x, y: i });
    else {
      // check if occupied tile is an opponent piece
      const canAttack = await isTileOccupiedByOpp(x, i, oppColor, board);
      if (canAttack) validMoves.push({ x: x, y: i });
      break;
    }
  }

  // y towards 7
  for (let i = y + 1; i < 8; i += 1) {
    // checking for empty tiles
    const canMove = await isTileEmpty(x, i, board);

    if (canMove) validMoves.push({ x: x, y: i });
    else {
      // check if occupied tile is an opponent piece
      const canAttack = await isTileOccupiedByOpp(x, i, oppColor, board);
      if (canAttack) validMoves.push({ x: x, y: i });
      break;
    }
  }
  return validMoves;
};
const validKnightMoves = async (
  x,
  y,
  pieceColor,
  oppColor,
  board,
  isChecked
) => {
  let validMoves = [];
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
        if (canAttack) validMoves.push({ x: allMoves[i].x, y: allMoves[i].y });
      }
    }
  }
  return validMoves;
};
const validBishopMoves = async (
  x,
  y,
  pieceColor,
  oppColor,
  board,
  isChecked
) => {
  let validMoves = [];
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
      if (canAttack) validMoves.push({ x: newX, y: newY });
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
      if (canAttack) validMoves.push({ x: newX, y: newY });
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
      if (canAttack) validMoves.push({ x: newX, y: newY });
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
      if (canAttack) validMoves.push({ x: newX, y: newY });
      break;
    }
  }

  return validMoves;
};
const validQueenMoves = async (
  x,
  y,
  pieceColor,
  oppColor,
  board,
  isChecked
) => {
  let validMoves = [];
  const bishopMoves = await validBishopMoves(
    x,
    y,
    pieceColor,
    oppColor,
    board,
    isChecked
  );
  const rookMoves = await validRookMoves(
    x,
    y,
    pieceColor,
    oppColor,
    board,
    isChecked,
    false,
    false
  );
  bishopMoves.forEach((m) => validMoves.push(m));
  rookMoves.forEach((m) => validMoves.push(m));

  return validMoves;
};
const validKingMoves = async (x, y, pieceColor, oppColor, board, isChecked) => {
  let validMoves = [];
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
      if (canMove) validMoves.push({ x: allMoves[i].x, y: allMoves[i].y });
      else {
        // check if occupied tile is an opponent piece
        const canAttack = await isTileOccupiedByOpp(
          allMoves[i].x,
          allMoves[i].y,
          oppColor,
          board
        );
        if (canAttack) validMoves.push({ x: allMoves[i].x, y: allMoves[i].y });
      }
    }
  }

  return validMoves;
};

const isTileEmpty = async (x, y, board) => {
  const tile = await board.find((t) => t.x === x && t.y === y);
  return !tile.isOccupied;
};

const isTileOccupiedByOpp = async (x, y, oppColor, board) => {
  const tile = await board.find((t) => t.x === x && t.y === y);
  return tile.pieceColor === oppColor;
};
