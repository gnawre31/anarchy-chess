import { create } from "zustand";
import { BLACK, FILES, RANKS, WHITE } from "./types";
import newBoard from "./newBoard.json";

export const useChessStore = create((set) => ({
  board: [],
  roomId: null,
  gameId: null,
  isPlaying: false,
  playerId: null,
  playerColor: null,
  opponentId: null,
  capturedWPieces: [
    { piece: "PAWN", count: [] },
    { piece: "KNIGHT", count: [] },
    { piece: "BISHOP", count: [] },
    { piece: "ROOK", count: [] },
    { piece: "QUEEN", count: [] },
  ],
  capturedBPieces: [
    { piece: "PAWN", count: [] },
    { piece: "KNIGHT", count: [] },
    { piece: "BISHOP", count: [] },
    { piece: "ROOK", count: [] },
    { piece: "QUEEN", count: [] },
  ],
  score: 0,
  canLongCastle: false,
  canShortCastle: false,
  isChecked: false,
  turn: 0,
  currTurn: "W",
  moveHistory: [],

  // board set up
  setBoard: () => {
    let initBoard = [];
    const playerColor = WHITE;

    const yStart = playerColor === BLACK ? RANKS.length - 1 : 0;
    const yEnd = playerColor === BLACK ? -1 : RANKS.length;
    const yStep = playerColor === BLACK ? -1 : 1;

    const xStart = playerColor === BLACK ? 0 : FILES.length - 1;
    const xEnd = playerColor === BLACK ? FILES.length : -1;
    const xStep = playerColor === BLACK ? 1 : -1;

    for (let x = xStart; x !== xEnd; x += xStep) {
      for (let y = yStart; y !== yEnd; y += yStep) {
        initBoard.push(newBoard.board[x][y]);
      }
    }

    set(() => ({
      board: initBoard,
      isPlaying: false,
      playerColor: playerColor,
      canCastle: false,
    }));
  },

  // board positions
  minX: 0,
  maxX: 0,
  minY: 0,
  maxY: 0,
  activePiece: null,
  activeTile: null,
  setActiveTile: (activeTile) => {
    set(() => ({
      activeTile: activeTile,
    }));
  },
  setActivePiece: (activePiece) => {
    set(() => ({
      activePiece: activePiece,
    }));
  },
  setBoardCoords: (boardCoords) => {
    set(() => ({
      minX: boardCoords.minX,
      maxX: boardCoords.maxX,
      minY: boardCoords.minY,
      maxY: boardCoords.maxY,
    }));
  },

  validMoves: [],
  setValidMoves: (validMoves) => {
    set(() => ({
      validMoves: validMoves,
    }));
  },

  // game functions
  // INCREMENT TURN
  incrementTurn: (move) => {
    const capturedColor = move.capturedPiece.pieceColor === "W" ? "W" : "B";
    const capturedPiece = move.capturedPiece.piece;
    const scoreInc = getScoreInc(capturedColor, capturedPiece);
    set((state) => ({
      turn: state.turn + 1,
      currTurn: state.currTurn === "W" ? "B" : "W",
      moveHistory: [...state.moveHistory, move],
      score: state.score + scoreInc,
      capturedBPieces:
        capturedColor === "B"
          ? state.capturedBPieces.map((p) => {
              if (p.piece === capturedPiece) {
                return { piece: p.piece, count: [...p.count, true] };
              } else return p;
            })
          : state.capturedBPieces,
      capturedWPieces:
        capturedColor === "W"
          ? state.capturedWPieces.map((p) => {
              if (p.piece === capturedPiece) {
                return { piece: p.piece, count: [...p.count, true] };
              } else return p;
            })
          : state.capturedWPieces,
    }));
  },

  // MOVE PIECE
  commitMove: (p) => {
    const { oldX, oldY, newX, newY, piece, pieceColor } = p;
    set((state) => ({
      board: state.board.map((t) => {
        if (t.x === oldX && t.y === oldY) {
          return {
            isOccupied: false,
            piece: null,
            pieceColor: null,
            pos: t.pos,
            x: t.x,
            y: t.y,
          };
        } else if (t.x === newX && t.y === newY) {
          return {
            isOccupied: true,
            piece: piece,
            pieceColor: pieceColor,
            pos: t.pos,
            x: t.x,
            y: t.y,
          };
        } else return t;
      }),
    }));
  },

  // RESET GAME
  newGame: async (game) => {
    const { roomId, gameId, playerId, playerColor, opponentId } = game;

    set((state) => ({
      board: state.board.map((t) => {
        let p = {
          isOccupied: false,
          piece: null,
          pieceColor: null,
          pos: t.pos,
          x: t.x,
          y: t.y,
        };
        // empty tiles
        if (t.y > 1 && t.y < 6) {
          return p;
        }

        // set isOccupied
        p.isOccupied = true;

        // set color
        if (t.y < 2) p.pieceColor = "W";
        else p.pieceColor = "B";

        // pawns
        if (t.y === 1 || t.y === 6) p.piece = "PAWN";
        // other pieces
        if (t.y === 0 || t.y === 7) {
          if (t.x === 0 || t.x === 7) p.piece = "ROOK";
          else if (t.x === 1 || t.x === 6) p.piece = "KNIGHT";
          else if (t.x === 2 || t.x === 5) p.piece = "BISHOP";
          else if (t.x === 3) p.piece = "QUEEN";
          else p.piece = "KING";
        }

        return p;
      }),
      roomId: roomId,
      gameId: gameId,
      isPlaying: true,
      playerId: playerId,
      playerColor: playerColor,
      opponentId: opponentId,
      canLongCastle: true,
      canShortCastle: true,
      capturedWPieces: [
        { piece: "PAWN", count: [] },
        { piece: "ROOK", count: [] },
        { piece: "KNIGHT", count: [] },
        { piece: "BISHOP", count: [] },
        { piece: "QUEEN", count: [] },
      ],
      capturedBPieces: [
        { piece: "PAWN", count: [] },
        { piece: "ROOK", count: [] },
        { piece: "KNIGHT", count: [] },
        { piece: "BISHOP", count: [] },
        { piece: "QUEEN", count: [] },
      ],
    }));
  },
}));

const getScoreInc = (capturedColor, capturedPiece) => {
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
