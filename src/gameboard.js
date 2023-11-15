const grid = [
  ["A1", "B1", "C1", "D1", "E1", "F1", "G1", "H1", "I1", "J1"],
  ["A2", "B2", "C2", "D2", "E2", "F2", "G2", "H2", "I2", "J2"],
  ["A3", "B3", "C3", "D3", "E3", "F3", "G3", "H3", "I3", "J3"],
  ["A4", "B4", "C4", "D4", "E4", "F4", "G4", "H4", "I4", "J4"],
  ["A5", "B5", "C5", "D5", "E5", "F5", "G5", "H5", "I5", "J5"],
  ["A6", "B6", "C6", "D6", "E6", "F6", "G6", "H6", "I6", "J6"],
  ["A7", "B7", "C7", "D7", "E7", "F7", "G7", "H7", "I7", "J7"],
  ["A8", "B8", "C8", "D8", "E8", "F8", "G8", "H8", "I8", "J8"],
  ["A9", "B9", "C9", "D9", "E9", "F9", "G9", "H9", "I9", "J9"],
  ["A10", "B10", "C10", "D10", "E10", "F10", "G10", "H10", "I10", "J10"],
];

const indexCalcs = (start) => {
  const rowLetter = start[0].toUpperCase();
  const colNumber = parseInt(start[1], 10);

  const rowIndex = rowLetter.charCodeAt(0) - "A".charCodeAt(0);
  const colIndex = colNumber - 1;

  return [rowIndex, colIndex];
};

const checkBoundaries = (shipLength, coords, direction) => {
  let validity = false;

  // Set row and col limits
  const rowLimit = grid.length;
  const colLimit = grid[0].length;

  // Check for valid start position on board
  if (coords[0] <= rowLimit && coords[1] <= colLimit) {
    validity = true;
  } else {
    validity = false;
  }

  // Check right boundary
  if (direction === "h" && coords[0] + shipLength <= rowLimit) {
    validity = true;
  } else if (direction === "h" && coords[0] + shipLength > rowLimit) {
    validity = false;
  }

  // Check bottom boundary
  if (direction === "v" && coords[1] + shipLength <= colLimit) {
    validity = true;
  } else if (direction === "v" && coords[1] + shipLength > colLimit) {
    validity = false;
  }

  return validity;
};

const calculateShipPositions = (shipLength, start, direction) => {
  const rowLetter = start[0].toUpperCase();
  const colNumber = parseInt(start[1], 10);

  const rowIndex = rowLetter.charCodeAt(0) - "A".charCodeAt(0);
  const colIndex = colNumber - 1;

  const positions = [];

  if (direction.toLowerCase() === "h") {
    for (let i = 0; i < shipLength; i++) {
      if (rowIndex && colIndex) {
        positions.push(grid[rowIndex][colIndex + i]);
      }
    }
  } else {
    for (let i = 0; i < shipLength; i++) {
      if (rowIndex && colIndex) {
        positions.push(grid[rowIndex + i][colIndex]);
      }
    }
  }

  return positions;
};

const Gameboard = (shipFactory) => {
  const ships = [];
  const shipPositions = {};

  const placeShip = (type, start, direction) => {
    const newShip = shipFactory(type);

    // Calculate start point coordinates based on start point grid key
    const coords = indexCalcs(start);

    // Check boundaries, if ok continue to next step
    if (checkBoundaries(newShip.shipLength, coords, direction)) {
      // Calculate and store positions for a new ship
      const positions = calculateShipPositions(
        newShip.shipLength,
        start,
        direction,
      );
      shipPositions[type] = positions;

      // Add ship to ships array
      ships.push(newShip);
    }
  };

  return {
    get grid() {
      return grid;
    },
    get ships() {
      return ships;
    },
    getShipPositions: (shipType) => shipPositions[shipType],
    placeShip,
  };
};

export default Gameboard;
