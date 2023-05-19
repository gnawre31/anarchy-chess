
import { useEffect, useState } from 'react'
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

    const isPlaying = useChessStore(state => state.isPlaying)
    const winner = useChessStore(state => state.winner)



    const startGame = () => {
        const game = {
            roomId: 123, gameId: 456, playerId: 789, playerColor: 'WHITE', opponentId: 1, board: board
        }
        newGame(game)
    }

    const [winningMsg, setWinningMsg] = useState("")
    useEffect(() => {
        console.log("isPlaying", isPlaying)
        console.log("winner", winner)
        if (!isPlaying) {
            let winningColor = null
            switch (winner) {
                case "W":
                    winningColor = "White"
                    break;
                case "B":
                    winningColor = "Black"
                    break;
                default:
                    break;
            }
            if (winningColor) setWinningMsg(`Game over. ${winningColor} wins.`)
            else setWinningMsg("")
        } else setWinningMsg("")
    }, [isPlaying, winner]
    )

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
            <p>{winningMsg}</p>




        </div>
    )
}

export default GameDashBoard