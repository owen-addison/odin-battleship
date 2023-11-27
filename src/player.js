import { RepeatAttackedError } from "./errors";

const Player = (type, gameboard) => {
  const moveLog = [];

  const makeMove = (move) => {
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
