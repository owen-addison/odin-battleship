const Player = (type, gameboard) => {
  const moveLog = [];

  const makeMove = (move) => {
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
