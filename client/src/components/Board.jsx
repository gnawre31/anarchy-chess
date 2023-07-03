import Tile from "./Tile";
import { useChessStore } from "../store";
import { useEffect, useRef } from "react";
import { movePiece } from "../game/pieceDragAndDrop";
import { isCheckMate, isKingInCheck } from "../game/check";
import { generateAllMoves } from "../game/actions";

const Board = () => {
  const board = useChessStore((state) => state.board);
  const setBoard = useChessStore(state => state.setBoard)
  const activePiece = useChessStore((state) => state.activePiece);
  const setBoardCoords = useChessStore(state => state.setBoardCoords)
  const setValidMoves = useChessStore(state => state.setValidMoves)

  const minX = useChessStore((state) => state.minX);
  const maxX = useChessStore((state) => state.maxX);
  const minY = useChessStore((state) => state.minY);
  const maxY = useChessStore((state) => state.maxY);

  const currTurn = useChessStore((state) => state.currTurn);
  const canLongCastle = useChessStore((state) => state.canLongCastle);
  const canShortCastle = useChessStore((state) => state.canShortCastle);
  const setChecked = useChessStore((state) => state.setChecked);
  const turn = useChessStore((state) => state.turn);
  const wChecked = useChessStore((state) => state.wChecked);
  const bChecked = useChessStore((state) => state.bChecked);
  const checkMate = useChessStore((state) => state.checkMate);




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


  // set wChecked and bChecked (boolean) values whenever a move is made
  // checked values are used for tile styling
  // useEffect(() => {
  //   isKingInCheck(currTurn, board, canLongCastle, canShortCastle).then(checked => {
  //     setChecked(checked)
  //     if (checked) {
  //       isCheckMate(wChecked, bChecked, board).then(isMated => {
  //         if (isMated) checkMate()
  //       })
  //     }
  //   }
  //   )

  // }, [wChecked, bChecked, currTurn, board, canLongCastle, canShortCastle, turn, setChecked, activePiece, checkMate])
  // useEffect(() => {
  //   console.log(currTurn)
  //   generateAllMoves(board, currTurn).then(allMoves => {
  //     console.log(allMoves)
  //     setValidMoves(allMoves)
  //   })
  // }, [board, currTurn, setValidMoves])



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
