import Tile from "./Tile";
import { useChessStore } from "../store";
import { useRef, useState } from "react";
import { movePiece } from "./pieceDragAndDrop";

const Board = () => {
  const board = useChessStore((state) => state.board);
  const isPlaying = useChessStore((state) => state.isPlaying);

  const [activePiece, setActivePiece] = useState(null);

  const chessboardRef = useRef(null);

  const onMove = (e) => {
    if (activePiece != null) {
      movePiece(e, activePiece, chessboardRef.current);
    }
  };

  if (isPlaying) {
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
            chessboardRef={chessboardRef}
            activePiece={activePiece}
            setActivePiece={setActivePiece}
          />
        ))}
      </div>
    );
  }
};

export default Board;
