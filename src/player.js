import { InvalidMoveEntryError, RepeatAttackedError } from "./errors";

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

const Player = (type, gameboard) => {
  const moveLog = [];

  const makeMove = (input) => {
    let move;

    // Check for the type of player
    if (type === "human") {
      // Format the input
      move = `${input.charAt(0).toUpperCase()}${input.substring(1)}`;
    } else if (type === "computer") {
      move = randMove(gameboard.grid, moveLog);
    }

    // Check the input against the possible moves on the gameboard's grid
    if (!checkMove(move, gameboard.grid)) {
      throw new InvalidMoveEntryError();
    }

    // If the move exists in the moveLog array, throw an error
    if (moveLog.find((el) => el === move)) {
      throw new RepeatAttackedError();
    }

    // Else, call attack method on gameboard and log move in moveLog
    gameboard.attack(move);
    moveLog.push(move);
  };

  return {
    get type() {
      return type;
    },
    get moveLog() {
      return moveLog;
    },
    makeMove,
  };
};

export default Player;