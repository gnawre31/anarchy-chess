import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import { useChessStore } from "../store";
import { getPieceSVG } from "./svg";
import { getMoveNotation } from "../game/gameFunctions";

const PawnPromoModal = ({ pawnPromoModal }) => {
    const closePawnPromoModal = useChessStore(
        (state) => state.closePawnPromoModal
    );
    const currTurn = useChessStore((state) => state.currTurn);
    const promoMove = useChessStore((state) => state.promoMove);
    const setPromoMove = useChessStore((state) => state.setPromoMove);
    const commitMove = useChessStore((state) => state.commitMove);
    const incrementTurn = useChessStore((state) => state.incrementTurn);
    const board = useChessStore((state) => state.board);

    const pieces = ["KNIGHT", "BISHOP", "ROOK", "QUEEN"];

    const closeModal = async () => {
        await setPromoMove(null);
        closePawnPromoModal();
    };

    const promotePawn = async (piece) => {
        const { oldX, oldY, newX, newY, pieceColor, capturedPiece } = promoMove
        const moveNotation = await getMoveNotation(oldX, oldY, newX, newY, "PAWN", pieceColor, capturedPiece, piece, board)

        await commitMove({ ...promoMove, piece: piece, moveNotation: moveNotation });
        await incrementTurn({ ...promoMove, piece: piece, moveNotation: moveNotation });
        closeModal();
    };
    return ReactDOM.createPortal(
        <>
            {pawnPromoModal ? (
                <div onClick={closeModal} className="modal-container">
                    <div onClick={(e) => e.stopPropagation()} className="modal">
                        {pieces.map((p, idx) => {
                            const svgURL = getPieceSVG(currTurn + "_" + p);
                            return (
                                <div
                                    key={idx}
                                    style={{ backgroundImage: `url(${svgURL})` }}
                                    className="piece-promo"
                                    id={p}
                                    onClick={(e) => promotePawn(e.target.id)}
                                />
                            );
                        })}
                    </div>
                </div>
            ) : null}
        </>,
        document.getElementById("modal")
    );
};
PawnPromoModal.propTypes = {
    pawnPromoModal: PropTypes.bool.isRequired,
};
export default PawnPromoModal;
