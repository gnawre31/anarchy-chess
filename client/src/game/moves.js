const isTileEmpty = async (x, y, board) => {
  const tile = await board.find((t) => t.x === x && t.y === y);
  return !tile.isOccupied;
};

const isTileOccupiedByOpp = async (x, y, oppColor, board) => {
  const tile = await board.find((t) => t.x === x && t.y === y);
  return tile.pieceColor === oppColor;
};

// return piece that is captured
export const getPiece = async (x, y, board) => {
  const t = await board.find((t) => t.x === x && t.y === y);
  return { piece: t.piece, pieceColor: t.pieceColor };
};

// check if x, y coordinate is a valid move
export const isValidMove = async (data, validMoves) => {
  const moves = await Object.values(validMoves).reduce(
    (acc, arr) => acc.concat(arr),
    []
  );
  const move = await moves.find((m) => m.x === data.newX && m.y === data.newY);
  if (move) return true;
  return false;
};
// generates list of all valid x, y coordinates
export const getValidMoves = async (
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
      return [];
  }
};

const validPawnMoves = async (x, y, pieceColor, oppColor, board) => {
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

const validRookMoves = async (
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
const validKnightMoves = async (x, y, pieceColor, oppColor, board) => {
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
const validBishopMoves = async (x, y, pieceColor, oppColor, board) => {
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
const validQueenMoves = async (x, y, pieceColor, oppColor, board) => {
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
const validKingMoves = async (x, y, pieceColor, oppColor, board) => {
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

export const getValidMovesWhenChecked = async (
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
    const newBoard = await board.map((t) => {
      if (t.x === tile.x && t.y === tile.y) {
        return {
          ...t,
          piece: null,
          pieceColor: null,
          isOccupied: false,
        };
      }
      if (t.x === m.x && t.y === m.y) {
        return {
          ...t,
          piece: tile.piece,
          pieceColor: tile.pieceColor,
          isOccupied: true,
        };
      } else return t;
    });

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
    const newBoard = await board.map((t) => {
      if (t.x === tile.x && t.y === tile.y) {
        return {
          ...t,
          piece: null,
          pieceColor: null,
          isOccupied: false,
        };
      }
      if (t.x === a.x && t.y === a.y) {
        return {
          ...t,
          piece: tile.piece,
          pieceColor: tile.pieceColor,
          isOccupied: true,
        };
      }
      return t;
    });
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
    const validActions = await getValidMoves(
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
