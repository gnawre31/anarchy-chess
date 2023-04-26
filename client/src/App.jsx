import './App.css'
import Board from './components/Board'
import { useChessStore } from './store'



function App() {
  const newGame = useChessStore(state => state.newGame)
  const board = useChessStore(state => state.board)
  const startGame = () => {
    const game = {
      roomId: 123, gameId: 456, playerId: 789, playerColor: 'WHITE', opponentId: 1, board: board
    }
    // clearBoard()
    newGame(game)
  }

  return (
    <div>
      <button onClick={startGame}>New Game</button>
      <Board />
    </div>
  )
}

export default App
