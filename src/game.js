import Player from "./player";
import Gameboard from "./gameboard";
import Ship from "./ship";

const Game = () => {
  // Initialise, create gameboards for both players and create players of types human and computer
  const humanGameboard = Gameboard(Ship);
  const computerGameboard = Gameboard(Ship);
  const humanPlayer = Player(humanGameboard, "human");
  const computerPlayer = Player(computerGameboard, "computer");

  // Store players in a player object
  const players = { human: humanPlayer, computer: computerPlayer };

  // Set up phase
  const setUp = (humanShips) => {
    // Automatic placement for computer
    computerPlayer.placeShips();

    // Place ships on the
    humanShips.forEach((ship) => {
      humanPlayer.placeShips(ship.shipType, ship.start, ship.direction);
    });
  };

  return {
    players,
    setUp,
  };
};

export default Game;
