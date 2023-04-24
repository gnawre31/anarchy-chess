export const grabPiece = (e, board) => {
  const activePiece = e.target;
  if (activePiece.classList.contains("piece") && board) {
    const x = e.clientX - 50;
    const y = e.clientY - 50;
    activePiece.style.position = "absolute";
    activePiece.style.left = `${x}px`;
    activePiece.style.top = `${y}px`;
    activePiece.style.height = "80px";
    activePiece.style.width = "80px";
  }
};

export const movePiece = (e, activePiece, board) => {
  if (activePiece) {
    const minX = board.offsetLeft - 15;
    const minY = board.offsetTop - 10;
    const maxX = board.offsetLeft + board.clientWidth - 70;
    const maxY = board.offsetTop + board.clientHeight - 75;
    const x = e.clientX - 50;
    const y = e.clientY - 50;
    activePiece.style.position = "absolute";

    //If x is smaller than minimum amount
    if (x < minX) {
      activePiece.style.left = `${minX}px`;
    }
    //If x is bigger than maximum amount
    else if (x > maxX) {
      activePiece.style.left = `${maxX}px`;
    }
    //If x is in the constraints
    else {
      activePiece.style.left = `${x}px`;
    }

    //If y is smaller than minimum amount
    if (y < minY) {
      activePiece.style.top = `${minY}px`;
    }
    //If y is bigger than maximum amount
    else if (y > maxY) {
      activePiece.style.top = `${maxY}px`;
    }
    //If y is in the constraints
    else {
      activePiece.style.top = `${y}px`;
    }
  }
};

export const dropPiece = (e, board) => {
  const activePiece = e.target;
  if (activePiece && board) {
    const x = Math.floor((e.clientX - board.offsetLeft) / 80);
    const y = Math.abs(Math.ceil((e.clientY - board.offsetTop - 600) / 80));

    console.log(x, y);
  }
};
