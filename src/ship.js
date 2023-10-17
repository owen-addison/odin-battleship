const positionsGrid = [
  ["A1", "B1", "C1", "D1"],
  ["A2", "B2", "C2", "D2"],
  ["A3", "B3", "C3", "D3"],
  ["A4", "B4", "C4", "D4"],
];

const Ship = (shipLength = 2, anchorPoint = "A1", orientation = "h") => {
  let hits = 0;

  const rowLetter = anchorPoint[0].toUpperCase();
  const colNumber = parseInt(anchorPoint[1], 10);

  const rowIndex = rowLetter.charCodeAt(0) - "A".charCodeAt(0);
  const colIndex = colNumber - 1;

  const shipPositions = [];

  if (orientation.toLowerCase() === "h") {
    for (let i = 0; i < shipLength; i++) {
      shipPositions.push(positionsGrid[rowIndex][colIndex + i]);
    }
  } else {
    for (let i = 0; i < shipLength; i++) {
      shipPositions.push(positionsGrid[rowIndex + i][colIndex]);
    }
  }

  const hit = () => {
    if (hits < shipLength) {
      hits += 1;
    }
  };

  const isSunk = () => hits === shipLength;

  return {
    get shipLength() {
      return shipLength;
    },
    get hits() {
      return hits;
    },
    get positions() {
      return shipPositions;
    },
    hit,
    isSunk,
  };
};

export default Ship;
