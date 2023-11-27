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

const Player = (type, gameboard) => {
  const moveLog = [];

  const makeMove = (move) => {
    // Format the input
    const fMove = `${move.charAt(0).toUpperCase()}${move.substring(1)}`;

    // Check the input against the possible moves on the gameboard's grid
    if (!checkMove(fMove, gameboard.grid)) {
      throw new InvalidMoveEntryError();
    }

    // If the move exists in the moveLog array, throw an error
    if (moveLog.find((el) => el === fMove)) {
      throw new RepeatAttackedError();
    }

    // Else, call attack method on gameboard and log move in moveLog
    gameboard.attack(fMove);
    moveLog.push(fMove);
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
