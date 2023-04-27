import PropTypes from "prop-types";
import { getPieceSVG } from "./svg";
import { dropPiece, grabPiece } from "./pieceDragAndDrop";
import { useChessStore } from "../store";
import { useEffect, useState } from "react";
import { getValidMoves, isValidMove } from "./moves";

const Tile = ({ tile }) => {

    const activePiece = useChessStore(state => state.activePiece)
    const setActivePiece = useChessStore(state => state.setActivePiece)
    const setActiveTile = useChessStore(state => state.setActiveTile)
    const activeTile = useChessStore(state => state.activeTile)
    const commitMove = useChessStore(state => state.commitMove)
    const setValidMoves = useChessStore(state => state.setValidMoves)
    const validMoves = useChessStore(state => state.validMoves)
    const minX = useChessStore(state => state.minX)
    const maxX = useChessStore(state => state.maxX)
    const minY = useChessStore(state => state.minY)
    const maxY = useChessStore(state => state.maxY)
    const board = useChessStore(state => state.board)
    const isChecked = useChessStore(state => state.isChecked)
    const canLongCastle = useChessStore(state => state.canLongCastle)
    const canShortCastle = useChessStore(state => state.canShortCastle)
    const currTurn = useChessStore(state => state.currTurn)
    const incrementTurn = useChessStore(state => state.incrementTurn)
    const moveHistory = useChessStore(state => state.moveHistory)





    // tile css valid move 
    const [tileValidMove, setTileValidMove] = useState("")
    useEffect(() => {
        const currTileIsValidMove = validMoves.find(m => m.x === tile.x && m.y === tile.y)
        if (currTileIsValidMove) {
            if (tile.piece !== null) setTileValidMove("can-attack")
            else setTileValidMove("can-move")
        } else setTileValidMove("")
    }, [validMoves, tile.x, tile.y, tile.piece])


    // tile color css class
    const [tileColor, setTileColor] = useState(null)

    useEffect(() => {
        let active = ""
        let color = ""
        if (activeTile && tile.x === activeTile.x && tile.y === activeTile.y) active = "active-"
        if (moveHistory.length > 0) {
            if (moveHistory[moveHistory.length - 1].newX === tile.x && moveHistory[moveHistory.length - 1].newY === tile.y) active = "active-"
        }
        if ((tile.x + tile.y) % 2 === 0) color = "black"
        else color = "white"
        setTileColor(`${active}${color}-tile `)
    }, [moveHistory, activeTile, tile.x, tile.y])

    // piece svg 
    const [pieceSVG, setPieceSVG] = useState(null)
    useEffect(() => {
        if (tile.isOccupied) setPieceSVG(getPieceSVG(tile.pieceColor + "_" + tile.piece))
    }, [tile.piece, tile.pieceColor, tile.isOccupied])




    const onClick = async (e) => {
        if (activePiece == null) {
            if (tile.pieceColor === currTurn) {
                setActivePiece(e.target);
                setActiveTile({ x: tile.x, y: tile.y })
                grabPiece(e);
                const validMoves = await getValidMoves(tile, board, isChecked, canLongCastle, canShortCastle)
                setValidMoves(validMoves)
            }


        } else {
            const dropPos = await dropPiece(e, minX, maxX, minY, maxY);
            const capturedPiece = await getCapturedPiece(dropPos.x, dropPos.y)

            let move = {
                oldX: tile.x,
                oldY: tile.y,
                newX: dropPos.x,
                newY: dropPos.y,
                piece: tile.piece,
                pieceColor: tile.pieceColor,
                capturedPiece: capturedPiece
            }

            const isValid = await isValidMove(move, validMoves)
            if (isValid) {
                // committing move will move the piece to new tile coordinates
                await commitMove(move)

                // increment turn does the following:
                // 1. increases turn no.
                // 2. logs move onto moveHistory
                // 3. updates currTurn 
                // 4. checks if piece has been captured. Update captured if so
                await incrementTurn(move)
            }
            setValidMoves([])
            setActivePiece(null);
        }
    };

    const getCapturedPiece = async (x, y) => {
        const t = await board.find(t => t.x === x && t.y === y)
        return { piece: t.piece, pieceColor: t.pieceColor }
    }


    return (
        <div className={"tile " + tileColor}>
            {tileValidMove.length > 0 && <div className={tileValidMove} />}
            {tile.isOccupied && (
                <div
                    style={{ backgroundImage: `url(${pieceSVG})` }}
                    className="piece"
                    onClick={(e) => onClick(e)}
                />
            )}
        </div>
    );
};

Tile.propTypes = {
    tile: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        pos: PropTypes.string.isRequired,
        piece: PropTypes.string,
        pieceColor: PropTypes.string,
        isOccupied: PropTypes.bool.isRequired,
    }),
};

export default Tile;
