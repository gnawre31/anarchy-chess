export const grabPiece = (e) => {
  const activePiece = e.target;
  if (activePiece.classList.contains("piece")) {
    const x = e.clientX - 50;
    const y = e.clientY - 50;
    activePiece.style.position = "absolute";
    activePiece.style.zIndex = "100";
    activePiece.style.left = `${x}px`;
    activePiece.style.top = `${y}px`;
    activePiece.style.height = "80px";
    activePiece.style.width = "80px";
  }
};

export const movePiece = (e, activePiece, minX, maxX, minY, maxY) => {
  const x = e.clientX - 50;
  const y = e.clientY - 50;
  activePiece.style.position = "absolute";

  //If x is smaller than minimum amount
  if (x < minX) {
    activePiece.style.left = `${minX}px`;
  }
  //If x is bigger than maximum amount
  else if (x > maxX - 75) {
    activePiece.style.left = `${maxX - 75}px`;
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
  else if (y > maxY - 75) {
    activePiece.style.top = `${maxY - 75}px`;
  }
  //If y is in the constraints
  else {
    activePiece.style.top = `${y}px`;
  }
};

export const dropPiece = async (e, minX, maxX, minY, maxY) => {
  const activePiece = e.target;
  const x = Math.floor(((e.clientX - minX) * 8) / (maxX - minX));
  const y = Math.floor(((e.clientY - minY) * 8) / (maxY - minY));
  const idx = y * 8 + x;
  activePiece.style.position = "relative";
  activePiece.style.removeProperty("top");
  activePiece.style.removeProperty("left");
  activePiece.style.removeProperty("height");
  activePiece.style.removeProperty("width");
  activePiece.style.removeProperty("zIndex");
  return idx;
};
