import './App.css'
import Board from './components/Board'
import { useChessStore } from './store'



function App() {
  const newGame = useChessStore(state => state.newGame)
  const startGame = () => {
    const game = {
      roomId: 123, gameId: 456, playerId: 789, playerColor: 'WHITE', opponentId: 1
    }
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
