import B_PAWN_SVG from "../assets/b-pawn.svg";
import B_ROOK_SVG from "../assets/b-rook.svg";
import B_BISHOP_SVG from "../assets/b-bishop.svg";
import B_KNIGHT_SVG from "../assets/b-knight.svg";
import B_QUEEN_SVG from "../assets/b-queen.svg";
import B_KING_SVG from "../assets/b-king.svg";

import W_PAWN_SVG from "../assets/w-pawn.svg";
import W_ROOK_SVG from "../assets/w-rook.svg";
import W_BISHOP_SVG from "../assets/w-bishop.svg";
import W_KNIGHT_SVG from "../assets/w-knight.svg";
import W_QUEEN_SVG from "../assets/w-queen.svg";
import W_KING_SVG from "../assets/w-king.svg";

export const getPieceSVG = (piece) => {
  switch (piece) {
    case "bp":
      return B_PAWN_SVG;
    case "br":
      return B_ROOK_SVG;
    case "bb":
      return B_BISHOP_SVG;
    case "bn":
      return B_KNIGHT_SVG;
    case "bq":
      return B_QUEEN_SVG;
    case "bk":
      return B_KING_SVG;
    case "wp":
      return W_PAWN_SVG;
    case "wr":
      return W_ROOK_SVG;
    case "wb":
      return W_BISHOP_SVG;
    case "wn":
      return W_KNIGHT_SVG;
    case "wq":
      return W_QUEEN_SVG;
    case "wk":
      return W_KING_SVG;
  }
};
