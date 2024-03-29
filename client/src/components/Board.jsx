import Tile from "./Tile";
import { useChessStore } from "../store";
import { useEffect, useRef } from "react";
import { movePiece } from "../game/pieceDragAndDrop";

const Board = () => {
  const board = useChessStore((state) => state.board);
  const setBoard = useChessStore(state => state.setBoard)
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
  }, [setBoard, setBoardCoords])



  return (
    <div
      id="chessboard"
      className="unselectable"
      ref={chessboardRef}
      onMouseMove={(e) => onMove(e)}
    >
      {board.map((tile, idx) => (
        <Tile
          key={idx}
          tile={tile}
          idx={idx}
        />
      ))}
    </div>
  );

};

export default Board;
