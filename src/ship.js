// import { grid } from "./gameboard";

const Ship = (type) => {
  const setLength = () => {
    switch (type) {
      case "carrier":
        return 5;
      case "battleship":
        return 4;
      case "cruiser":
      case "submarine":
        return 3;
      default:
        return 2;
    }
  };

  const shipLength = setLength();

  let hits = 0;

  // const rowLetter = anchorPoint[0].toUpperCase();
  // const colNumber = parseInt(anchorPoint[1], 10);

  // const rowIndex = rowLetter.charCodeAt(0) - "A".charCodeAt(0);
  // const colIndex = colNumber - 1;

  // const shipPositions = [];

  // if (orientation.toLowerCase() === "h") {
  //   for (let i = 0; i < shipLength; i++) {
  //     shipPositions.push(grid[rowIndex][colIndex + i]);
  //   }
  // } else {
  //   for (let i = 0; i < shipLength; i++) {
  //     shipPositions.push(grid[rowIndex + i][colIndex]);
  //   }
  // }

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
    // get positions() {
    //   return shipPositions;
    // },
    hit,
    isSunk,
  };
};

export default Ship;
