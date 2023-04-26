import Tile from "./Tile";
import { useChessStore } from "../store";
import { useEffect, useRef } from "react";
import { movePiece } from "./pieceDragAndDrop";

const Board = () => {
  const board = useChessStore((state) => state.board);
  const setBoard = useChessStore(state => state.setBoard)
  // const isPlaying = useChessStore((state) => state.isPlaying);
  const activePiece = useChessStore((state) => state.activePiece);
  const setBoardCoords = useChessStore(state => state.setBoardCoords)

  const minX = useChessStore((state) => state.minX);
  const maxX = useChessStore((state) => state.maxX);
  const minY = useChessStore((state) => state.minY);
  const maxY = useChessStore((state) => state.maxY);


  const chessboardRef = useRef(null);

  const onMove = (e) => {
    if (activePiece != null) {
      movePiece(e, activePiece, minX, maxX, minY, maxY);
    }
  };

  useEffect(() => {

    // set up board and tiles on load
    setBoard()

    // set max and min x/y coordinates
    const chessboardRect = document.getElementById('chessboard').getBoundingClientRect();
    const boardCoords = {
      minX: chessboardRect.left,
      maxX: chessboardRect.right,
      minY: chessboardRect.top,
      maxY: chessboardRect.bottom
    }
    setBoardCoords(boardCoords)
  }, [])




  return (
    <div
      id="chessboard"
      className="unselectable"
      ref={chessboardRef}
      onMouseMove={(e) => onMove(e)}
    >
      {board.map((tile) => (
        <Tile
          key={tile.x + ", " + tile.y}
          tile={tile}
        />
      ))}
    </div>
  );

};

export default Board;
