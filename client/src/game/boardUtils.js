export const newBoardFEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const isEdgeIdx = (idx, inc) => {
  let edgeIdx = [];
  switch (inc) {
    case -8:
      edgeIdx = [0, 1, 2, 3, 4, 5, 6, 7];
      break;
    case 8:
      edgeIdx = [56, 57, 58, 59, 60, 61, 62, 63];
      break;
    case 1:
      edgeIdx = [7, 15, 23, 31, 39, 47, 55, 63];
      break;
    case -1:
      edgeIdx = [0, 8, 16, 24, 32, 40, 48, 56];
      break;
    default:
      edgeIdx = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 16, 24, 32, 40, 48, 56, 57, 58, 59, 60, 61,
        62, 63, 55, 47, 39, 31, 23, 15,
      ];
      break;
  }

  return edgeIdx.includes(idx);
};

export const outsideEdgeOfBoard = (pos, newPos, inc) => {
  let min, max;
  if (inc > 0) min = pos;
  else max = pos;

  switch (inc) {
    case -1:
      min = pos - (pos % 8);
      break;
    case 1:
      max = Math.ceil(pos / 8) * 8 - 1;
      break;
    case -8:
      min = pos % 8;
      break;
    case 8:
      max = 64 - (pos % 8);
      break;
    case -7:
      {
        let p = pos;
        while (p % 8 !== 0 && p > 0) {
          p -= 8;
        }
        min = p;
      }
      break;
    case -9:
      {
        let p = pos;
        while (p % 8 !== 7 && p < 64) {
          p += 8;
        }
        max = p;
      }
      break;
    case 9:
      {
        let p = pos;
        while (p % 8 !== 7 && p < 64) {
          p += 8;
        }
        max = p;
      }
      break;
    case 7:
      break;

    default:
      return false;
  }

  return newPos > max || newPos < min;
};

export const flipBoard = async (board) => {
  let newBoard = new Array(64).fill(null);

  for (let i = 0; i < board.length; i++) {
    if (board[i] == null) continue;
    // put piece into flipped position
    const newPos = getFlippedPos(i);
    console.log(i, board[i], newPos);
    newBoard[newPos] = board[i];
  }
  // return board;
  return newBoard;
};

const getFlippedPos = (oldPos) => {
  return oldPos + 56 - Math.floor(oldPos / 8) * 16;
};
