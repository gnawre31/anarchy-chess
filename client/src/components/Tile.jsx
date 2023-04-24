import PropTypes from "prop-types";
import { getPieceSVG } from "./svg";
import { dropPiece, grabPiece } from "./pieceDragAndDrop";

const Tile = ({ tile, chessboardRef, activePiece, setActivePiece }) => {

    const onClick = (e) => {
        if (activePiece == null) {
            setActivePiece(e.target);
            grabPiece(e, chessboardRef.current);
        } else {
            dropPiece(e, chessboardRef.current);
            setActivePiece(null);
        }
    };

    const tileColor = (tile.x + tile.y) % 2 === 0 ? "black-tile" : "white-tile";
    const piece = tile.isOccupied ? tile.pieceColor + "_" + tile.piece : null;
    const pieceSVG = piece ? getPieceSVG(piece) : null;
    return (
        <div className={"tile " + tileColor} ref={chessboardRef}>
            {pieceSVG && (
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
    chessboardRef: PropTypes.shape({
        current: PropTypes.object,
    }),
    activePiece: PropTypes.object,
    setActivePiece: PropTypes.func
};

export default Tile;
