import PropTypes from "prop-types";
import { getPieceSVG } from "./svg";
import { dropPiece, grabPiece } from "../game/pieceDragAndDrop";
import { useChessStore } from "../store";
import { useEffect, useState } from "react";
// import {
//     generateAllMoves,
//     isValidAction,
//     getValidActions,
// } from "../game/actions";
// import { getMoveNotation } from "../game/gameFunctions";
// import { getPiece } from "../game/helpers";
// import { convertIndexToChessNotation } from "../game/tileUtils";

const Tile = ({ tile, idx }) => {
    const {
        turn,
        activePiece,
        setActivePiece,
        setActiveTile,
        activeTile,
        commitMove,
        setValidMoves,
        validMoves,
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
        setValidMoves: state.setValidMoves,
        validMoves: state.validMoves,
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

    const pieceColor = tile ? tile[0] : null
    const piece = tile ? tile[1] : null



    const [checkedBorder, setCheckedBorder] = useState("");
    useEffect(() => {
        if (wChecked && tile === "wk" || bChecked && tile === "bk")
            setCheckedBorder("checked ");
        else setCheckedBorder("");
    }, [wChecked, bChecked, tile, currTurn]);

    // tile css valid move
    const [tileValidMove, setTileValidMove] = useState("");
    useEffect(() => {
        if (activePiece) {
            const movesForActivePiece = validMoves.filter(
                (move) => move.oldPos === activeTile
            );
            const currTileIsValidMove = movesForActivePiece.find(move => move.newPos === idx)
            if (currTileIsValidMove) {
                if (currTileIsValidMove.capturedPiece) setTileValidMove("can-attack");
                else setTileValidMove("can-move");
            }

            else setTileValidMove("");

        } else setTileValidMove("");



    }, [activePiece, activeTile, validMoves, piece, idx]);

    // tile color css class
    const [tileColor, setTileColor] = useState(null);
    useEffect(() => {
        let active = "";
        let color = "";
        if (activeTile && activeTile === idx)
            active = "active-";
        // if (moveHistory.length > 0) {
        //     if (
        //         moveHistory[moveHistory.length - 1].newX === x &&
        //         moveHistory[moveHistory.length - 1].newY === y
        //     )
        //         active = "active-";
        // }
        const file = idx % 8
        const rank = Math.floor(idx / 8)
        if ((file + rank) % 2 === 0) color = "black";
        else color = "white";
        setTileColor(`${active}${color}-tile `);
    }, [moveHistory, activeTile, idx]);

    // piece svg
    const [pieceSVG, setPieceSVG] = useState(null);
    useEffect(() => {
        // console.log(tile)
        if (tile) setPieceSVG(getPieceSVG(`${tile}`));
    }, [piece, pieceColor, tile]);

    const onClick = async (e) => {
        if (isPlaying) {
            if (activePiece == null) {
                // PICK UP PIECE
                if (pieceColor === currTurn) {
                    // 1. get all possible moves and attacks
                    // 2 keep only actions that unchecks the king
                    // default possible actions
                    // let validActions = await generateAllMoves(
                    //     tile,
                    //     board,
                    //     canLongCastle,
                    //     canShortCastle
                    // );
                    // validActions = await getValidActions(
                    //     tile,
                    //     validActions,
                    //     board,
                    //     canLongCastle,
                    //     canShortCastle
                    // );

                    // setValidActions(validActions);
                    setActivePiece(e.target);
                    setActiveTile(idx);
                    grabPiece(e);
                }
            } else {
                // DROP PIECE
                const dropPos = await dropPiece(e, minX, maxX, minY, maxY);
                // const capturedPiece = await getPiece(dropPos.x, dropPos.y, board);
                const capturedPiece = null

                const isValidMove = await validMoves.find(move => move.oldPos === activeTile && move.newPos === dropPos)

                // const moveNotation = await getMoveNotation(
                //     x,
                //     y,
                //     dropPos.x,
                //     dropPos.y,
                //     piece,
                //     pieceColor,
                //     capturedPiece,
                //     null,
                //     board
                // );
                if (isValidMove) {
                    let move = {
                        oldPos: idx,
                        newPos: dropPos,
                        piece: piece,
                        pieceColor: pieceColor,
                        capturedPiece: capturedPiece,
                        // moveNotation: moveNotation,
                        // turn: turn,
                    };
                    // pawn promotion

                    if (move.piece === 'p' && Math.floor(move.newPos / 8) === 0) {
                        await setPromoMove(move)
                        await openPawnPromoModal()

                    } else {
                        await commitMove(move, board)
                        await incrementTurn(move)
                    }



                }



                // const isAValidMove = await isValidAction(action, validActions);

                // if (isAValidMove) {
                //     //  pawn promotion
                //     if (
                //         action.piece === "PAWN" &&
                //         (action.newY === 0 || action.newY === 7)
                //     ) {
                //         await setPromoMove(action);
                //         await openPawnPromoModal();
                //     } else {
                //         // committing move will move the piece to new tile coordinates
                //         await commitMove(action);

                //         // must verify if curr player is in check so that it can be unchecked if the player makes a move
                //         // const oppColor = currTurn === "W" ? "B" : "W";
                //         // const checked = await isKingInCheck(
                //         //     oppColor,
                //         //     board,
                //         //     canLongCastle,
                //         //     canShortCastle
                //         // );
                //         // await setChecked(checked);


                //         // increment turn does the following:
                //         // 1. increases turn no.
                //         // 2. logs move onto moveHistory
                //         // 3. updates currTurn
                //         // 4. checks if piece has been captured. Update captured if so
                //         await incrementTurn(action);


                //     }
                // }
            }
        }
    };


    return (
        <div className={"tile " + checkedBorder + tileColor} onClick={() => console.log(idx)}>
            {tileValidMove.length > 0 && <div className={tileValidMove} />}
            {tile && (
                <div
                    style={{ backgroundImage: `url(${pieceSVG})` }}
                    className="piece"
                    onClick={(e) =>
                        onClick(e).then(() => {
                            // reset flags if a piece was dropped
                            if (activePiece) {
                                // setValidActions({ validMoves: [], validAttacks: [] });
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
    tile: PropTypes.string,
    idx: PropTypes.number.isRequired,
};

export default Tile;
