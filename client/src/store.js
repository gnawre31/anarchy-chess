import { create } from "zustand";
import { BLACK, FILES, RANKS } from "./types";
import newBoard from "./newBoard.json";

export const useChessStore = create((set) => ({
  board: [],
  roomId: null,
  gameId: null,
  isPlaying: false,
  playerId: null,
  playerColor: null,
  opponentId: null,
  playerPieces: [],
  opponentPieces: [],
  playerPiecesTaken: [],
  opponentPiecesTaken: [],
  playerScore: 0,
  opponentScore: 0,
  canCastle: false,
  turn: 0,
  newGame: (game) => {
    const { roomId, gameId, playerId, playerColor, opponentId } = game;

    let initBoard = [];

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
      roomId: roomId,
      gameId: gameId,
      isPlaying: true,
      playerId: playerId,
      playerColor: playerColor,
      opponentId: opponentId,
      canCastle: true,
    }));
  },
}));
