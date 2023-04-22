
import Tile from './Tile'
import { useChessStore } from '../store';

const Board = () => {


  const board = useChessStore(state => state.board);
  const isPlaying = useChessStore(state => state.isPlaying)

  if (isPlaying) {
    return (
      <div id="chessboard">
        {board.map(tile => <Tile key={tile.pos} tile={tile} />)}
      </div>
    )
  }

}

export default Board