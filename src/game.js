import Player from "./player";
import Gameboard from "./gameboard";
import Ship from "./ship";
import { InvalidPlayerTypeError } from "./errors";

const Game = () => {
  // Initialise, create gameboards for both players and create players of types human and computer
  const humanGameboard = Gameboard(Ship);
  const computerGameboard = Gameboard(Ship);
  const humanPlayer = Player(humanGameboard, "human");
  const computerPlayer = Player(computerGameboard, "computer");
  let currentPlayer;

  // Store players in a player object
  const players = { human: humanPlayer, computer: computerPlayer };

  // Set up phase
  const setUp = (humanShips) => {
    // Automatic placement for computer
    computerPlayer.placeShips();

    // Place ships from the human player's selection on their respective gameboard
    humanShips.forEach((ship) => {
      humanPlayer.placeShips(ship.shipType, ship.start, ship.direction);
    });

    // Set the current player to human player
    currentPlayer = humanPlayer;
  };

  // Take turn method
  const takeTurn = (move) => {
    // Determine the opponent based on the current player
    const opponent =
      currentPlayer === humanPlayer ? computerPlayer : humanPlayer;

    // Call the makeMove method on the current player with the opponent's gameboard and store as move feedback
    const feedback = currentPlayer.makeMove(opponent.gameboard, move);

    // Switch the current player
    currentPlayer = opponent;

    // Return the feedback for the move
    return feedback;
  };

  return {
    get currentPlayer() {
      return currentPlayer;
    },
    players,
    setUp,
    takeTurn,
  };
};

export default Game;
