import PropTypes from "prop-types";
import { getPieceSVG } from "./svg";
import { useChessStore } from "../store";

const CapturedPieces = ({ pieces, color }) => {
    const score = useChessStore(state => state.score)

    return (
        <div style={{ display: "flex" }}>
            {pieces.map((p, idx) => {
                // only display captured pieces when there are 1 or more 
                if (p.count) {
                    // adjust css if there are multiple of the same captured pieces 
                    return (
                        <div key={idx}>
                            {p.count.map((c, idx) => {
                                const url = getPieceSVG(color + "_" + p.piece)
                                return (<img key={idx} src={url} width="20px" height="20px"
                                    style={idx > 0 ? { marginLeft: "-10px" } : {}}
                                />)
                            })}
                        </div>
                    )
                }
            }
            )}
            {color === "B" && score < 0 && <p style={{ marginLeft: "5px" }}>+{Math.abs(score)}</p>}
            {color === "W" && score > 0 && <p style={{ marginLeft: "5px" }}>+{Math.abs(score)}</p>}
        </div>
    )
}
CapturedPieces.propTypes = {
    pieces: PropTypes.array,
    color: PropTypes.string,
};

export default CapturedPieces