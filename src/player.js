const Player = (type, gameboardFactory) => {
  const moveLog = [];

  return {
    get type() {
      return type;
    },
    get moveLog() {
      return moveLog;
    },
  };
};

export default Player;
