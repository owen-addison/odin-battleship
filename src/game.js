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
  let gameOverState = false;

  // Store players in a player object
  const players = { human: humanPlayer, computer: computerPlayer };

  // Set up phase
  const setUp = (humanShips) => {
    // Automatic placement for computer
    computerPlayer.placeShips();

    // Place ships from the human player's selection on their respective gameboard
    Object.entries(humanShips).forEach(([key, ship]) => {
      humanPlayer.placeShips(ship.shipType, ship.start, ship.direction);
    });

    // Set the current player to human player
    currentPlayer = humanPlayer;
  };

  // Game ending function
  const endGame = () => {
    gameOverState = true;
  };

  // Take turn method
  const takeTurn = (move) => {
    let feedback;

    // Determine the opponent based on the current player
    const opponent =
      currentPlayer === humanPlayer ? computerPlayer : humanPlayer;

    // Call the makeMove method on the current player with the opponent's gameboard and store as move feedback
    const result = currentPlayer.makeMove(opponent.gameboard, move);

    // If result is a hit, check whether the ship is sunk
    if (result.hit) {
      // Check whether the ship is sunk and add result as value to feedback object with key "isShipSunk"
      if (opponent.gameboard.isShipSunk(result.shipType)) {
        feedback = {
          ...result,
          isShipSunk: true,
          gameWon: opponent.gameboard.checkAllShipsSunk(),
        };
      } else {
        feedback = { ...result, isShipSunk: false };
      }
    } else if (!result.hit) {
      // Set feedback to just the result
      feedback = result;
    }

    // If game is won, end game
    if (feedback.gameWon) {
      endGame();
    }

    // Switch the current player
    currentPlayer = opponent;

    // Return the feedback for the move
    return feedback;
  };

  return {
    get currentPlayer() {
      return currentPlayer;
    },
    get gameOverState() {
      return gameOverState;
    },
    players,
    setUp,
    takeTurn,
  };
};

export default Game;
