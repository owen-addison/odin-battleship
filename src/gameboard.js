import {
  ShipTypeAllocationReachedError,
  OverlappingShipsError,
  ShipPlacementBoundaryError,
} from "./errors";

const grid = [
  ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10"],
  ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10"],
  ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10"],
  ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"],
  ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10"],
  ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10"],
  ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10"],
  ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10"],
  ["I1", "I2", "I3", "I4", "I5", "I6", "I7", "I8", "I9", "I10"],
  ["J1", "J2", "J3", "J4", "J5", "J6", "J7", "J8", "J9", "J10"],
];

const indexCalcs = (start) => {
  const colLetter = start[0].toUpperCase(); // This is the column
  const rowNumber = parseInt(start.slice(1), 10); // This is the row

  const colIndex = colLetter.charCodeAt(0) - "A".charCodeAt(0); // Column index based on letter
  const rowIndex = rowNumber - 1; // Row index based on number

  return [colIndex, rowIndex]; // Return [row, column]
};

const checkType = (ship, shipPositions) => {
  // Iterate through the shipPositions object
  Object.keys(shipPositions).forEach((existingShipType) => {
    if (existingShipType === ship) {
      throw new ShipTypeAllocationReachedError();
    }
  });
};

const checkBoundaries = (shipLength, coords, direction) => {
  // Set row and col limits
  const rowLimit = grid.length - 1;
  const colLimit = grid[0].length - 1;

  // Check for valid start position on board
  if (coords[0] > rowLimit || coords[1] > colLimit) {
    return false;
  }

  // Check right and bottom boundaries for horizontal placement
  if (
    coords[1] + shipLength - 1 > colLimit ||
    coords[0] + shipLength - 1 > rowLimit
  ) {
    return false;
  }

  // If none of the invalid conditions are met, return true
  return true;
};

const calculateShipPositions = (shipLength, coords, direction) => {
  const colIndex = coords[0]; // This is the column index
  const rowIndex = coords[1]; // This is the row index

  const positions = [];

  if (direction.toLowerCase() === "h") {
    // Horizontal placement: increment the column index
    for (let i = 0; i < shipLength; i++) {
      positions.push(grid[colIndex + i][rowIndex]);
    }
  } else {
    // Vertical placement: increment the row index
    for (let i = 0; i < shipLength; i++) {
      positions.push(grid[colIndex][rowIndex + i]);
    }
  }

  return positions;
};

const checkForOverlap = (positions, shipPositions) => {
  Object.entries(shipPositions).forEach(([shipType, existingShipPositions]) => {
    if (
      positions.some((position) => existingShipPositions.includes(position))
    ) {
      throw new OverlappingShipsError(
        `Overlap detected with ship type ${shipType}`,
      );
    }
  });
};

const checkForHit = (position, shipPositions) => {
  Object.entries(shipPositions).forEach(([shipType, existingShipPositions]) => {
    // If position exists in shipPositions, return a true value with the shipType
    if (position.some((p) => existingShipPositions.includes(p))) {
      return [true, shipType];
    }

    // If no matching position found return a false value
    return [false];
  });
};

const Gameboard = (shipFactory) => {
  const ships = [];
  const shipPositions = {};
  const hitPositions = {};

  const placeShip = (type, start, direction) => {
    const newShip = shipFactory(type);

    // Check the ship type against existing types
    checkType(type, shipPositions);

    // Calculate start point coordinates based on start point grid key
    const coords = indexCalcs(start);

    // Check boundaries, if ok continue to next step
    if (checkBoundaries(newShip.shipLength, coords, direction)) {
      // Calculate and store positions for a new ship
      const positions = calculateShipPositions(
        newShip.shipLength,
        coords,
        direction,
      );

      // Check for overlap before placing the ship
      checkForOverlap(positions, shipPositions);

      // If no overlap, proceed to place ship
      shipPositions[type] = positions;
      // Add ship to ships array
      ships.push(newShip);
    } else {
      throw new ShipPlacementBoundaryError();
    }
  };

  // Register an attack and test for valid hit
  const attack = (position) => {
    // Check for valid hit
    const checkResults = checkForHit(position, shipPositions);
    // If first element of checkResults array is true then register valid hit
    if (checkResults[0]) {
      // If true, register valid hit by adding hit position to hitPositions object with the ship type
      hitPositions[checkResults[1]] = position;
      // Return true as feedback
      return true;
    }

    // Else, return false as feedback
    return false;
  };

  return {
    get grid() {
      return grid;
    },
    get ships() {
      return ships;
    },
    getShipPositions: (shipType) => shipPositions[shipType],
    getHitPositions: (shipType) => hitPositions[shipType],
    placeShip,
    attack,
  };
};

export default Gameboard;
