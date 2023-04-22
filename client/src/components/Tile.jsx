import PropTypes from 'prop-types';
import { getPieceSVG } from './svg';


const Tile = ({ tile }) => {
    const tileColor = (tile.x + tile.y) % 2 === 0 ? "black-tile" : "white-tile"
    const piece = tile.isOccupied ? tile.pieceColor + "_" + tile.piece : null
    const pieceSVG = piece ? getPieceSVG(piece) : null
    return (
        <div className={"tile " + tileColor} >
            {pieceSVG && <div style={{ backgroundImage: `url(${pieceSVG})` }} className='piece' />}
        </div>
    )
}

Tile.propTypes = {
    tile: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        pos: PropTypes.string.isRequired,
        piece: PropTypes.string,
        pieceColor: PropTypes.string,
        isOccupied: PropTypes.bool.isRequired
    })
}

export default Tile