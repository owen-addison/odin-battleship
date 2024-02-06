import {
  InvalidPlayerTypeError,
  InvalidMoveEntryError,
  RepeatAttackedError,
  ShipPlacementBoundaryError,
  OverlappingShipsError,
} from "./errors";

const checkMove = (move, gbGrid) => {
  let valid = false;

  gbGrid.forEach((el) => {
    if (el.find((p) => p === move)) {
      valid = true;
    }
  });

  return valid;
};

const randMove = (grid, moveLog) => {
  // Flatten the grid into a single array of moves
  const allMoves = grid.flatMap((row) => row);

  // Filter out the moves that are already in the moveLog
  const possibleMoves = allMoves.filter((move) => !moveLog.includes(move));

  // Select a random move from the possible moves
  const randomMove =
    possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

  return randomMove;
};

const generateRandomStart = (size, direction, grid) => {
  const validStarts = [];

  if (direction === "h") {
    // For horizontal orientation, limit the columns
    for (let col = 0; col < grid.length - size + 1; col++) {
      for (let row = 0; row < grid[col].length; row++) {
        validStarts.push(grid[col][row]);
      }
    }
  } else {
    // For vertical orientation, limit the rows
    for (let row = 0; row < grid[0].length - size + 1; row++) {
      for (let col = 0; col < grid.length; col++) {
        validStarts.push(grid[col][row]);
      }
    }
  }

  // Randomly select a starting position
  const randomIndex = Math.floor(Math.random() * validStarts.length);
  return validStarts[randomIndex];
};

const autoPlacement = (gameboard) => {
  const shipTypes = [
    { type: "carrier", size: 5 },
    { type: "battleship", size: 4 },
    { type: "cruiser", size: 3 },
    { type: "submarine", size: 3 },
    { type: "destroyer", size: 2 },
  ];

  shipTypes.forEach((ship) => {
    let placed = false;
    while (!placed) {
      const direction = Math.random() < 0.5 ? "h" : "v";
      const start = generateRandomStart(ship.size, direction, gameboard.grid);

      try {
        gameboard.placeShip(ship.type, start, direction);
        placed = true;
      } catch (error) {
        if (
          !(error instanceof ShipPlacementBoundaryError) &&
          !(error instanceof OverlappingShipsError)
        ) {
          throw error; // Rethrow non-placement errors
        }
        // If placement fails, catch the error and try again
      }
    }
  });
};

const Player = (gameboard, type) => {
  const moveLog = [];

  const placeShips = (shipType, start, direction) => {
    if (type === "human") {
      gameboard.placeShip(shipType, start, direction);
    } else if (type === "computer") {
      autoPlacement(gameboard);
    } else {
      throw new InvalidPlayerTypeError(
        `Invalid player type. Valid player types: "human" & "computer". Entered: ${type}.`,
      );
    }
  };

  const makeMove = (oppGameboard, input) => {
    let move;

    // Check for the type of player
    if (type === "human") {
      // Format the input
      move = `${input.charAt(0).toUpperCase()}${input.substring(1)}`;
    } else if (type === "computer") {
      move = randMove(oppGameboard.grid, moveLog);
    } else {
      throw new InvalidPlayerTypeError(
        `Invalid player type. Valid player types: "human" & "computer". Entered: ${type}.`,
      );
    }

    // Check the input against the possible moves on the gameboard's grid
    if (!checkMove(move, oppGameboard.grid)) {
      throw new InvalidMoveEntryError(`Invalid move entry! Move: ${move}.`);
    }

    // If the move exists in the moveLog array, throw an error
    if (moveLog.find((el) => el === move)) {
      throw new RepeatAttackedError();
    }

    // Else, call attack method on gameboard and log move in moveLog
    const response = oppGameboard.attack(move);
    moveLog.push(move);
    // Return the response of the attack (object: { hit: false } for miss; { hit: true, shipType: string } for hit).
    return { player: type, ...response };
  };

  return {
    get type() {
      return type;
    },
    get gameboard() {
      return gameboard;
    },
    get moveLog() {
      return moveLog;
    },
    makeMove,
    placeShips,
  };
};

export default Player;
