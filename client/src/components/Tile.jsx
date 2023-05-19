import PropTypes from "prop-types";
import { getPieceSVG } from "./svg";
import { dropPiece, grabPiece } from "../game/pieceDragAndDrop";
import { useChessStore } from "../store";
import { useEffect, useState } from "react";
import {
    getAllPossibleActions,
    isValidAction,
    getValidActions,
} from "../game/actions";
import { getMoveNotation } from "../game/gameFunctions";
import { getPiece } from "../game/helpers";

const Tile = ({ tile }) => {
    const {
        turn,
        activePiece,
        setActivePiece,
        setActiveTile,
        activeTile,
        commitMove,
        setValidActions,
        validActions,
        minX,
        maxX,
        minY,
        maxY,
        board,
        wChecked,
        bChecked,
        canLongCastle,
        canShortCastle,
        currTurn,
        incrementTurn,
        moveHistory,
        openPawnPromoModal,
        setPromoMove,
        isPlaying
    } = useChessStore((state) => ({
        turn: state.turn,
        activePiece: state.activePiece,
        setActivePiece: state.setActivePiece,
        setActiveTile: state.setActiveTile,
        activeTile: state.activeTile,
        commitMove: state.commitMove,
        setValidActions: state.setValidActions,
        validActions: state.validActions,
        minX: state.minX,
        maxX: state.maxX,
        minY: state.minY,
        maxY: state.maxY,
        board: state.board,
        wChecked: state.wChecked,
        bChecked: state.bChecked,
        canLongCastle: state.canLongCastle,
        canShortCastle: state.canShortCastle,
        currTurn: state.currTurn,
        incrementTurn: state.incrementTurn,
        moveHistory: state.moveHistory,
        openPawnPromoModal: state.openPawnPromoModal,
        setPromoMove: state.setPromoMove,
        isPlaying: state.isPlaying,
    }));

    const { x, y, piece, pieceColor, isOccupied } = tile;

    const [checkedBorder, setCheckedBorder] = useState("");
    useEffect(() => {
        if (
            (wChecked && piece === "KING" && pieceColor === "W") ||
            (bChecked && piece === "KING" && pieceColor === "B")
        )
            setCheckedBorder("checked ");
        else setCheckedBorder("");
    }, [wChecked, bChecked, piece, pieceColor, currTurn]);

    // tile css valid move
    const [tileValidMove, setTileValidMove] = useState("");
    useEffect(() => {
        const currTileIsValidMove = validActions.validMoves.find(
            (m) => m.x === x && m.y === y
        );
        const currTileIsValidAttack = validActions.validAttacks.find(
            (a) => a.x === x && a.y === y
        );

        if (currTileIsValidMove) setTileValidMove("can-move");
        else if (currTileIsValidAttack) setTileValidMove("can-attack");
        else setTileValidMove("");
    }, [validActions, x, y, piece]);

    // tile color css class
    const [tileColor, setTileColor] = useState(null);
    useEffect(() => {
        let active = "";
        let color = "";
        if (activeTile && x === activeTile.x && y === activeTile.y)
            active = "active-";
        if (moveHistory.length > 0) {
            if (
                moveHistory[moveHistory.length - 1].newX === x &&
                moveHistory[moveHistory.length - 1].newY === y
            )
                active = "active-";
        }
        if ((x + y) % 2 === 0) color = "black";
        else color = "white";
        setTileColor(`${active}${color}-tile `);
    }, [moveHistory, activeTile, x, y]);

    // piece svg
    const [pieceSVG, setPieceSVG] = useState(null);
    useEffect(() => {
        if (isOccupied) setPieceSVG(getPieceSVG(`${pieceColor}_${piece}`));
    }, [piece, pieceColor, isOccupied]);

    const onClick = async (e) => {
        if (isPlaying) {
            if (activePiece == null) {
                // PICK UP PIECE
                if (pieceColor === currTurn) {
                    // 1. get all possible moves and attacks
                    // 2 keep only actions that unchecks the king
                    // default possible actions
                    let validActions = await getAllPossibleActions(
                        tile,
                        board,
                        canLongCastle,
                        canShortCastle
                    );
                    validActions = await getValidActions(
                        tile,
                        validActions,
                        board,
                        canLongCastle,
                        canShortCastle
                    );

                    setValidActions(validActions);
                    setActivePiece(e.target);
                    setActiveTile({ x, y });
                    grabPiece(e);
                }
            } else {
                // DROP PIECE
                const dropPos = await dropPiece(e, minX, maxX, minY, maxY);
                const capturedPiece = await getPiece(dropPos.x, dropPos.y, board);

                const moveNotation = await getMoveNotation(
                    x,
                    y,
                    dropPos.x,
                    dropPos.y,
                    piece,
                    pieceColor,
                    capturedPiece,
                    null,
                    board
                );

                let action = {
                    oldX: x,
                    oldY: y,
                    newX: dropPos.x,
                    newY: dropPos.y,
                    piece: piece,
                    pieceColor: pieceColor,
                    capturedPiece: capturedPiece,
                    moveNotation: moveNotation,
                    turn: turn,
                };

                const isAValidMove = await isValidAction(action, validActions);

                if (isAValidMove) {
                    //  pawn promotion
                    if (
                        action.piece === "PAWN" &&
                        (action.newY === 0 || action.newY === 7)
                    ) {
                        await setPromoMove(action);
                        await openPawnPromoModal();
                    } else {
                        // committing move will move the piece to new tile coordinates
                        await commitMove(action);

                        // must verify if curr player is in check so that it can be unchecked if the player makes a move
                        // const oppColor = currTurn === "W" ? "B" : "W";
                        // const checked = await isKingInCheck(
                        //     oppColor,
                        //     board,
                        //     canLongCastle,
                        //     canShortCastle
                        // );
                        // await setChecked(checked);


                        // increment turn does the following:
                        // 1. increases turn no.
                        // 2. logs move onto moveHistory
                        // 3. updates currTurn
                        // 4. checks if piece has been captured. Update captured if so
                        await incrementTurn(action);


                    }
                }
            }
        }
    };

    return (
        <div className={"tile " + checkedBorder + tileColor}>
            {tileValidMove.length > 0 && <div className={tileValidMove} />}
            {isOccupied && (
                <div
                    style={{ backgroundImage: `url(${pieceSVG})` }}
                    className="piece"
                    onClick={(e) =>
                        onClick(e).then(() => {
                            // reset flags if a piece was dropped
                            if (activePiece) {
                                setValidActions({ validMoves: [], validAttacks: [] });
                                setActivePiece(null);
                            }
                        })
                    }
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
