import { create } from "zustand";
import { BLACK, FILES, RANKS, WHITE } from "./types";
import newBoard from "./newBoard.json";
import { getScoreInc } from "./game/gameFunctions";
import { generateAllMoves } from "./game/actions";
import { flipBoard, newBoardFEN } from "./game/boardUtils";

export const useChessStore = create((set) => ({
  board: [],
  validMoves: [],
  roomId: null,
  gameId: null,
  isPlaying: false,
  playerId: null,
  playerColor: null,
  opponentId: null,
  capturedWPieces: [
    { piece: "p", count: [] },
    { piece: "n", count: [] },
    { piece: "b", count: [] },
    { piece: "r", count: [] },
    { piece: "q", count: [] },
  ],
  capturedBPieces: [
    { piece: "p", count: [] },
    { piece: "n", count: [] },
    { piece: "b", count: [] },
    { piece: "r", count: [] },
    { piece: "q", count: [] },
  ],
  score: 0,
  canLongCastle: false,
  canShortCastle: false,
  checked: false,
  turn: 0,
  currTurn: "w",
  wChecked: false,
  bChecked: false,
  moveHistory: [],
  winner: null,

  // board set up
  setBoard: () => {
    // let initBoard = [];
    let initBoard = new Array(64).fill(null);
    const playerColor = WHITE;

    // const yStart = playerColor === BLACK ? RANKS.length - 1 : 0;
    // const yEnd = playerColor === BLACK ? -1 : RANKS.length;
    // const yStep = playerColor === BLACK ? -1 : 1;

    // const xStart = playerColor === BLACK ? 0 : FILES.length - 1;
    // const xEnd = playerColor === BLACK ? FILES.length : -1;
    // const xStep = playerColor === BLACK ? 1 : -1;

    // for (let x = xStart; x !== xEnd; x += xStep) {
    //   for (let y = yStart; y !== yEnd; y += yStep) {
    //     initBoard.push(newBoard.board[x][y]);
    //   }
    // }

    set(() => ({
      board: initBoard,
      isPlaying: false,
      playerColor: playerColor,
    }));
  },

  // board positions
  minX: 0,
  maxX: 0,
  minY: 0,
  maxY: 0,
  activePiece: null,
  activeTile: null,
  setActiveTile: (activeTile) =>
    set(() => ({
      activeTile: activeTile,
    })),

  setActivePiece: (activePiece) =>
    set(() => ({
      activePiece: activePiece,
    })),

  setBoardCoords: (boardCoords) =>
    set(() => ({
      minX: boardCoords.minX,
      maxX: boardCoords.maxX,
      minY: boardCoords.minY,
      maxY: boardCoords.maxY,
    })),

  // game functions

  // set state to checked/uncheck
  // this is true when a king piece is checked by another piece
  // and false when the king is not in check
  setChecked: (checked) =>
    set((state) => ({
      wChecked: state.currTurn === "w" ? checked : state.wChecked,
      bChecked: state.currTurn === "b" ? checked : state.bChecked,
    })),

  // store list of valid moves for active piece
  setValidMoves: (validMoves) =>
    set(() => ({
      validMoves: validMoves,
    })),

  // PROMOTE PAWN
  promotePawn: ({ x, y, piece }) => {
    set((state) => ({
      board: state.board.map((t) => {
        if (t.x === x && t.y === y) {
          return {
            ...t,
            piece: piece,
          };
        }
      }),
    }));
  },

  pawnPromoModal: false,
  openPawnPromoModal: () => set(() => ({ pawnPromoModal: true })),
  closePawnPromoModal: () => set(() => ({ pawnPromoModal: false })),

  promoMove: null,
  setPromoMove: (move) => set(() => ({ promoMove: move })),

  // INCREMENT TURN
  incrementTurn: async (move) => {
    const { capturedPiece } = move;
    let scoreInc = 0;
    let capturedColor, capturedPieceType;
    if (capturedPiece) {
      capturedColor = capturedPiece[0];
      capturedPieceType = capturedPiece[1];
      scoreInc = getScoreInc(capturedColor, capturedPieceType);
    }

    set((state) => ({
      turn: state.turn + 1,
      currTurn: state.currTurn === "w" ? "b" : "w",
      moveHistory: [...state.moveHistory, move],
      score: state.score + scoreInc,
      capturedBPieces:
        capturedColor === "b"
          ? state.capturedBPieces.map((p) => {
              if (p.piece === capturedPieceType) {
                return { piece: p.piece, count: [...p.count, true] };
              } else return p;
            })
          : state.capturedBPieces,
      capturedWPieces:
        capturedColor === "w"
          ? state.capturedWPieces.map((p) => {
              if (p.piece === capturedPieceType) {
                return { piece: p.piece, count: [...p.count, true] };
              } else return p;
            })
          : state.capturedWPieces,
    }));
  },

  // MOVE PIECE
  commitMove: async (move, board) => {
    const { oldPos, newPos, piece, pieceColor } = move;
    const newBoard = await board.map((tile, idx) => {
      if (oldPos === idx) return null;
      if (newPos === idx) return pieceColor + piece;
      return tile;
    });

    const nextColor = pieceColor === "w" ? "b" : "w";
    const validMoves = await generateAllMoves(newBoard, nextColor);

    // // check
    // const nextTurnValidMoves = await generateAllMoves(newBoard, pieceColor);
    // const isKingInCheck = nextTurnValidMoves.filter(
    //   (move) => move.capturedPiece !== null && move.capturedPiece.includes("k")
    // );
    // if (isKingInCheck.length > 0) console.log("check");

    set(() => ({
      board: newBoard,
      validMoves: validMoves,
    }));
  },

  checkMate: () =>
    set((state) => ({
      moveHistory: state.moveHistory.map((m, i) => {
        if (i === state.moveHistory.length - 1) {
          const newNotation = m.moveNotation.slice(0, -1) + "#";
          return {
            ...m,
            moveNotation: newNotation,
          };
        } else return m;
      }),
      isPlaying: false,
      winner: state.wChecked ? "B" : "W",
    })),
  // Update chess notation of final move when player is checkmated

  // RESET GAME
  newGame: async (game) => {
    const { roomId, gameId, playerId, playerColor, opponentId } = game;
    const ranks = ["1", "2", "3", "4", "5", "6", "7", "8"];
    const fenBoard = newBoardFEN.split(" ")[0];
    let file = 0;
    let rank = 7;
    let board = new Array(64).fill(null);
    for (const char of fenBoard) {
      if (char === "/") {
        file = 0;
        rank -= 1;
      } else if (ranks.includes(char)) {
        file += ranks.indexOf(char) + 1;
      } else {
        // lowercase = black piece
        // uppercase = white piece
        const lowerCaseChar = char.toLowerCase();
        let piece = null;
        if (char === lowerCaseChar) piece = "b" + lowerCaseChar;
        else piece = "w" + lowerCaseChar;
        board[rank * 8 + file] = piece;
        file += 1;
      }
    }
    if (playerColor === "w") {
      board = await flipBoard(board);
    }
    // const flippedBoard = board.slice().reverse();
    // const flippedPositions = board.map((tile, idx) => {
    //   const row = Math.floor(idx / 8);
    //   const col = idx % 8;
    //   const flippedRow = 7 - row;
    //   const flippedCol = 7 - col;
    //   return flippedRow * 8 + flippedCol;
    // });

    // for (let i = 0; i < 64; i++) {
    //   board[flippedPositions[i]] = flippedBoard[i];
    // }
    // console.log(flippedPositions);

    // get all valid actions for white

    const allMoves = await generateAllMoves(board, "w");

    set(() => ({
      // board: state.board.map((t) => {
      //   let p = {
      //     isOccupied: false,
      //     piece: null,
      //     pieceColor: null,
      //     pos: t.pos,
      //     x: t.x,
      //     y: t.y,
      //   };
      //   // empty tiles
      //   if (t.y > 1 && t.y < 6) {
      //     return p;
      //   }

      //   // set isOccupied
      //   p.isOccupied = true;

      //   // set color
      //   if (t.y < 2) p.pieceColor = "W";
      //   else p.pieceColor = "B";

      //   // // pawns
      //   if (t.y === 1 || t.y === 6) p.piece = "PAWN";
      //   // other pieces
      //   if (t.y === 0 || t.y === 7) {
      //     if (t.x === 0 || t.x === 7) p.piece = "ROOK";
      //     else if (t.x === 1 || t.x === 6) p.piece = "KNIGHT";
      //     else if (t.x === 2 || t.x === 5) p.piece = "BISHOP";
      //     else if (t.x === 3) p.piece = "QUEEN";
      //     else p.piece = "KING";
      //   }

      //   return p;
      // }),
      validMoves: allMoves,
      board: board,
      roomId: roomId,
      gameId: gameId,
      isPlaying: true,
      playerId: playerId,
      playerColor: playerColor,
      opponentId: opponentId,
      canLongCastle: true,
      canShortCastle: true,
      moveHistory: [],
      turn: 0,
      currTurn: "w",
      score: 0,
      activePiece: null,
      capturedWPieces: [
        { piece: "p", count: [] },
        { piece: "r", count: [] },
        { piece: "n", count: [] },
        { piece: "b", count: [] },
        { piece: "q", count: [] },
      ],
      capturedBPieces: [
        { piece: "p", count: [] },
        { piece: "r", count: [] },
        { piece: "n", count: [] },
        { piece: "b", count: [] },
        { piece: "q", count: [] },
      ],
    }));
  },
}));
