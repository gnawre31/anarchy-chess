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
    const movePiece = useChessStore(state => state.movePiece)
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
        if ((tile.x + tile.y) % 2 === 0) {
            if (activeTile && tile.x === activeTile.x && tile.y === activeTile.y) setTileColor("active-black-tile ")
            else setTileColor("black-tile ")
        } else {
            if (activeTile && tile.x === activeTile.x && tile.y === activeTile.y) setTileColor("active-white-tile ")
            else setTileColor("white-tile ")
        }
    }, [activeTile, tile.x, tile.y])

    // piece svg 
    const [pieceSVG, setPieceSVG] = useState(null)
    useEffect(() => {
        if (tile.isOccupied) setPieceSVG(getPieceSVG(tile.pieceColor + "_" + tile.piece))
    }, [tile.piece, tile.pieceColor, tile.isOccupied])




    const onClick = async (e) => {
        if (activePiece == null) {
            setActivePiece(e.target);
            setActiveTile({ x: tile.x, y: tile.y })
            grabPiece(e);
            const validMoves = await getValidMoves(tile, board, isChecked, canLongCastle, canShortCastle)
            setValidMoves(validMoves)

        } else {
            const dropPos = dropPiece(e, minX, maxX, minY, maxY);

            const data = {
                oldX: tile.x,
                oldY: tile.y,
                newX: dropPos.x,
                newY: dropPos.y,
                piece: tile.piece,
                pieceColor: tile.pieceColor
            }

            const isValid = await isValidMove(data, validMoves)
            if (isValid) {
                movePiece(data)
            }
            setValidMoves([])
            setActivePiece(null);
        }
    };



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
