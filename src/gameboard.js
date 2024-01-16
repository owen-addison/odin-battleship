import {
  ShipTypeAllocationReachedError,
  OverlappingShipsError,
  ShipPlacementBoundaryError,
  RepeatAttackedError,
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
  const xLimit = grid.length; // This is the total number of columns (x)
  const yLimit = grid[0].length; // This is the total number of rows (y)

  const x = coords[0];
  const y = coords[1];

  // Check for valid start position on board
  if (x < 0 || x >= xLimit || y < 0 || y >= yLimit) {
    return false;
  }

  // Check right boundary for horizontal placement
  if (direction === "h" && x + shipLength > xLimit) {
    return false;
  }
  // Check bottom boundary for vertical placement
  if (direction === "v" && y + shipLength > yLimit) {
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
  const foundShip = Object.entries(shipPositions).find(
    ([_, existingShipPositions]) => existingShipPositions.includes(position),
  );

  return foundShip ? { hit: true, shipType: foundShip[0] } : { hit: false };
};

const Gameboard = (shipFactory) => {
  const ships = {};
  const shipPositions = {};
  const hitPositions = {};
  const attackLog = [[], []];

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
      // Add ship to ships object
      ships[type] = newShip;

      // Initialise hitPositions for this ship type as an empty array
      hitPositions[type] = [];
    } else {
      throw new ShipPlacementBoundaryError(
        `Invalid ship placement. Boundary error! Ship type: ${type}`,
      );
    }
  };

  // Register an attack and test for valid hit
  const attack = (position) => {
    let response;

    // Check for valid attack
    if (attackLog[0].includes(position) || attackLog[1].includes(position)) {
      // console.log(`Repeat attack: ${position}`);
      throw new RepeatAttackedError();
    }

    // Check for valid hit
    const checkResults = checkForHit(position, shipPositions);
    if (checkResults.hit) {
      // Register valid hit
      hitPositions[checkResults.shipType].push(position);
      ships[checkResults.shipType].hit();

      // Log the attack as a valid hit
      attackLog[0].push(position);
      response = { ...checkResults };
    } else {
      // console.log(`MISS!: ${position}`);
      // Log the attack as a miss
      attackLog[1].push(position);
      response = { ...checkResults };
    }

    return response;
  };

  const isShipSunk = (type) => ships[type].isSunk;

  const checkAllShipsSunk = () =>
    Object.entries(ships).every(([shipType, ship]) => ship.isSunk);

  // Function for reporting the number of ships left afloat
  const shipReport = () => {
    const floatingShips = Object.entries(ships)
      .filter(([shipType, ship]) => !ship.isSunk)
      .map(([shipType, _]) => shipType);

    return [floatingShips.length, floatingShips];
  };

  return {
    get grid() {
      return grid;
    },
    get ships() {
      return ships;
    },
    get attackLog() {
      return attackLog;
    },
    getShip: (shipType) => ships[shipType],
    getShipPositions: (shipType) => shipPositions[shipType],
    getHitPositions: (shipType) => hitPositions[shipType],
    placeShip,
    attack,
    isShipSunk,
    checkAllShipsSunk,
    shipReport,
  };
};

export default Gameboard;
