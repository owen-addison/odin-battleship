import Player from "./player";
import Gameboard from "./gameboard";

const Game = () => {
  // Initialise, create gameboards for both players and create players of types human and computer
  const humanGameboard = Gameboard();
  const computerGameboard = Gameboard();
  const humanPlayer = Player(humanGameboard, "human");
  const computerPlayer = Player(computerGameboard, "computer");

  // Store players in a player object
  const players = { human: humanPlayer, computer: computerPlayer };

  return {
    players,
  };
};

export default Game;
