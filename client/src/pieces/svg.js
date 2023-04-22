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
    case "B_PAWN":
      return B_PAWN_SVG;
    case "B_ROOK":
      return B_ROOK_SVG;
    case "B_BISHOP":
      return B_BISHOP_SVG;
    case "B_KNIGHT":
      return B_KNIGHT_SVG;
    case "B_QUEEN":
      return B_QUEEN_SVG;
    case "B_KING":
      return B_KING_SVG;
    case "W_PAWN":
      return W_PAWN_SVG;
    case "W_ROOK":
      return W_ROOK_SVG;
    case "W_BISHOP":
      return W_BISHOP_SVG;
    case "W_KNIGHT":
      return W_KNIGHT_SVG;
    case "W_QUEEN":
      return W_QUEEN_SVG;
    case "W_KING":
      return W_KING_SVG;
  }
};
