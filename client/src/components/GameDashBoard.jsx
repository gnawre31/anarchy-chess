
import { useChessStore } from '../store'
import CapturedPieces from './CapturedPieces'
import PawnPromoModal from './PawnPromoModal'

const GameDashBoard = () => {
    const newGame = useChessStore(state => state.newGame)
    const board = useChessStore(state => state.board)
    const currTurn = useChessStore(state => state.currTurn)
    const turn = useChessStore(state => state.turn)
    const capturedBPieces = useChessStore(state => state.capturedBPieces)
    const capturedWPieces = useChessStore(state => state.capturedWPieces)

    const pawnPromoModal = useChessStore(state => state.pawnPromoModal)
    const moveHistory = useChessStore(state => state.moveHistory)

    const startGame = () => {
        const game = {
            roomId: 123, gameId: 456, playerId: 789, playerColor: 'WHITE', opponentId: 1, board: board
        }
        newGame(game)
    }
    return (
        <div>
            <button onClick={startGame}>New Game</button>
            <p>Current player: <b>{currTurn === "W" ? "White" : "Black"}</b></p>
            <p>Turn: {turn}</p>
            <p>White:</p>
            <CapturedPieces pieces={capturedBPieces} color="B" />
            <p>Black:</p>
            <CapturedPieces pieces={capturedWPieces} color="W" />
            <PawnPromoModal pawnPromoModal={pawnPromoModal} />
            <div style={{ display: "flex" }}>
                <div style={{ marginRight: "24px" }}>
                    {moveHistory.filter(m => m.turn % 2 === 0).map((h, i) => <div key={i}>{h.moveNotation}</div>)}
                </div>
                <div>
                    {moveHistory.filter(m => m.turn % 2 !== 0).map((h, i) => <div key={i}>{h.moveNotation}</div>)}
                </div>
            </div>




        </div>
    )
}

export default GameDashBoard