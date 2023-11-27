const Player = (type, gameboardFactory) => {
  const moveLog = [];

  return {
    get type() {
      return type;
    },
  };
};

export default Player;
